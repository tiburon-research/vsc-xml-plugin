'use strict'

import * as server from 'vscode-languageserver';
import { KeyedCollection, CurrentTag, Language, getPreviousText, comparePositions, IServerDocument, Parse, getCurrentLineText, getWordAtPosition, getWordRangeAtPosition, translatePosition, applyConstants, Encoding, pathExists, uriFromName, KeyValuePair, SimpleTag } from 'tib-api';
import { ISurveyData, TibAttribute, TextEdits } from 'tib-api/lib/surveyData';
import { ItemSnippets, QuestionTypes, RegExpPatterns, XMLEmbeddings, _NodeStoreNames, PreDefinedConstants } from 'tib-api/lib/constants';
import * as AutoCompleteArray from './autoComplete';
import { logError, consoleLog } from './server';


/** Возвращает все автозавершения для текущего места */
export function getCompletions(tag: CurrentTag, document: server.TextDocument, position: server.Position, surveyData: ISurveyData, tibAutoCompleteList: KeyedCollection<TibAutoCompleteItem[]>, settings: KeyedCollection<any>, classTypes: string[], char: string)
{
	let TibAC = new TibAutoCompletes(tag, document, position, surveyData, tibAutoCompleteList, settings, classTypes, char);
	return TibAC.getAll();
}



export class TibAutoCompleteItem 
{
	Name: string;
	/** тип объекта (string из vscode.CompletionItemKind) */
	Kind: keyof typeof server.CompletionItemKind;
	/** краткое описание (появляется в редакторе в той же строчке) */
	Detail: string = "";
	/** подробное описание (появляется при клике на i (зависит от настроек)) */
	Description: string = "";
	/** кусок кода, сигнатура (показывается при наведении) */
	Documentation: string = "";
	/** Родитель (объект) */
	Parent: string = "";
	Overloads: TibAutoCompleteItem[] = []; // массив перегрузок
	/** Тег, в котором должно работать */
	ParentTag: string = "";
	Deprecated = false;

	constructor(obj: Object)
	{
		for (let key in obj)
			this[key] = obj[key];
	}

	ToCompletionItem(addBracket: boolean = false, sortString?: string)
	{
		let kind: keyof typeof server.CompletionItemKind = this.Kind;
		let item = server.CompletionItem.create(this.Name);
		item.kind = server.CompletionItemKind[kind];
		if (addBracket && (this.Kind == "Function" || this.Kind == "Method"))
		{
			item.insertText = this.Name + "($0)";
			item.insertTextFormat = server.InsertTextFormat.Snippet;
		}
		let mds: server.MarkedString = { language: 'xml', value: '' };
		if (this.Description) mds.value = this.Description;
		else if (this.Documentation) mds.value = this.Documentation;
		item.documentation = mds.value;
		if (sortString) item.sortText = sortString;
		if (this.Detail) item.detail = this.Detail;
		item.deprecated = this.Deprecated;
		return item;

	}

	ToSignatureInformation()
	{
		return server.SignatureInformation.create(this.Documentation, this.Description);
	}
}




/** Для преобразований Snippet -> CompletitionItem */
class SnippetObject
{
	prefix: string;
	body: string;
	description: string;

	constructor(obj: Object)
	{
		for (let key in obj)
		{
			if (key == "body" && typeof obj[key] != "string")
				this[key] = obj[key].join("\n");
			else
				this[key] = obj[key];
		}
	}
}



/** преобразует стандартый Snippet в CompletionItem */
function snippetToCompletitionItem(obj: Object): server.CompletionItem
{
	let snip = new SnippetObject(obj);
	let ci = server.CompletionItem.create(snip.prefix);
	ci.kind = server.CompletionItemKind.Snippet;
	ci.detail = snip.description;
	ci.insertText = snip.body;
	ci.insertTextFormat = server.InsertTextFormat.Snippet;
	return ci;
}


export class DocumentBuffer
{
	public document: server.TextDocument;

	constructor(data: IServerDocument)
	{
		this._uri = data.uri;
		this.createDocument(data.version, data.content);
	}

	public update(version: number, contentChanges: server.TextDocumentContentChangeEvent[]): server.TextDocument
	{
		let content = this.applyChangesToContent(contentChanges);
		this.createDocument(version, content);
		return this.document;
	}


	public setDocument(document: server.TextDocument): void
	{
		this.document = document;
	}


	private applyChangesToContent(contentChanges: server.TextDocumentContentChangeEvent[]): string
	{
		let res = this.document.getText();
		try
		{
			contentChanges.sort((c1, c2) => { return comparePositions(this.document, c2.range.start, c1.range.start); }).forEach(change =>
			{
				let from = this.document.offsetAt(change.range.start);
				let to = this.document.offsetAt(change.range.end);
				let prev = res.slice(0, from);
				let post = res.slice(to);
				res = prev + change.text + post;
			});
		} catch (error)
		{
			logError('Ошибка применения изменений к документу', true, error);
		}
		return res;
	}

	private createDocument(version: number, content: string)
	{
		try
		{
			this.document = server.TextDocument.create(this._uri, 'tib', version, content);
		} catch (error)
		{
			logError('Ошибка создания нового документа', true, error);
		}
	}

	private _uri: string
}

export class ServerDocumentStore
{
	private _docs = new KeyedCollection<DocumentBuffer>();

	/** Возвращает server.TextDocument по uri */
	public get(uri: string): server.TextDocument
	{
		let buffer = this._docs.Item(uri);
		if (!buffer) return;
		return buffer.document;
	}

	/** Добавляет или заменяет документ в коллекцию */
	public add(data: IServerDocument): server.TextDocument
	{
		let buffer = new DocumentBuffer(data);
		this._docs.AddPair(data.uri, buffer);
		return buffer.document;
	}

	/** Полностью заменяет документ */
	public set(data: IServerDocument)
	{
		return this.add(data);
	}

	/** Обновляет документ в коллекции на основе `contentChanges` */
	public update(uri: string, version: number, contentChanges: server.TextDocumentContentChangeEvent[]): server.TextDocument
	{
		let doc = this._docs.Item(uri);
		doc.update(version, contentChanges);
		return doc.document;
	}

	/** Удаляет документ из колекции */
	public remove(uri: string): void
	{
		this._docs.Remove(uri);
	}

}



/** Класс для работы с {{Elements}} в строках */
class ElementExtractor
{

	constructor(data: ISurveyData)
	{
		this.Data = data;
	}

	/** Заменяет {{Elements}} на строку для Snippet */
	get(input: string): string
	{
		let resultStr = input;

		try
		{
			let res = new KeyedCollection<string[]>();
			let match = input.matchAll(/{{(\w+)}}/);
			if (!match || match.length == 0) return input;
			let parent = this._ElementFunctions;
			match.forEach(element =>
			{
				if (!!parent[element[1]] && !res.ContainsKey(element[1]))
				{
					res.AddPair(element[1], parent[element[1]].call(this)); // почему-то при вызове GeAll* this'ом считается _ElementFunctions
				}
			});
			let i = 1;
			res.ForEach((key, value) =>
			{
				resultStr = resultStr.replace(new RegExp("{{" + key + "}}", "g"), "${" + i + "|" + value.join(",") + "|}");
				i++;
			});
		}
		catch (error)
		{
			logError('Ошибка получения элементов', false, error);
		}

		return resultStr;
	}


	/** Соответствие {{Elements}} и функции для получения */
	private _ElementFunctions = {
		Questions: this.getAllQuestions,
		QuestionTypes: this.getQuestionTypes,
		Pages: this.getAllPages,
		Lists: this.getAllLists,
		MixIds: this.getAllMixIds
	};

	public getAllPages(): string[]
	{
		return this.Data.CurrentNodes.GetIds('Page');
	}

	public getAllLists(): string[]
	{
		return this.Data.CurrentNodes.GetIds('List');
	}

	public getAllQuestions(): string[]
	{
		return this.Data.CurrentNodes.GetIds('Question');
	}

	public getQuestionTypes(): string[]
	{
		return QuestionTypes;
	}

	public getAllMixIds(): string[]
	{
		return this.Data.MixIds;
	}


	private Data: ISurveyData;
}




//#region --------------------------- Подготовка данных для стандартных событий клиента


/** Автозавершения */
export class TibAutoCompletes
{

	private tag: CurrentTag;
	private document: server.TextDocument;
	private position: server.Position;
	private surveyData: ISurveyData;
	private char: string;
	private tibAutoCompleteList: KeyedCollection<TibAutoCompleteItem[]>;
	private settings: KeyedCollection<any>;
	private classTypes: string[];
	private extractor: ElementExtractor;


	constructor(tag: CurrentTag, document: server.TextDocument, position: server.Position, surveyData: ISurveyData, tibAutoCompleteList: KeyedCollection<TibAutoCompleteItem[]>, settings: KeyedCollection<any>, classTypes: string[], char: string)
	{
		this.tag = tag;
		this.document = document;
		this.position = position;
		this.surveyData = surveyData;
		this.char = char;
		this.tibAutoCompleteList = tibAutoCompleteList;
		this.settings = settings;
		this.classTypes = classTypes;

		this.extractor = new ElementExtractor(surveyData);
	}

	/** Все автозавершения */
	public getAll(): server.CompletionItem[]
	{
		let res: server.CompletionItem[] = [];
		let allF: (() => server.CompletionItem[])[] = [
			this.getXMLSnippets,
			this.getXMLAttrs,
			this.getAttrValues,
			this.getMainCS,
			this.getCSMethods,
			this.getConstants
		];
		let parent = this;
		allF.forEach(f =>
		{
			res = res.concat(f.apply(parent));
		});
		return res;
	}

	/** XML Features */
	private getXMLSnippets(): server.CompletionItem[]
	{
		let completionItems: server.CompletionItem[] = [];

		try
		{
			if (this.tag && this.tag.GetLaguage() == Language.XML)
			{
				let text = getPreviousText(this.document, this.position, true);

				// XML Features
				if (this.tag.OpenTagIsClosed && text.match(/\b_\w*$/))
				{
					let snippets = AutoCompleteArray.XMLFeatures.map(x => snippetToCompletitionItem(x));
					// добавляем snippet для ранжирования
					let rangeSnippet = snippetToCompletitionItem(AutoCompleteArray.RangeQuestion.QuestionSnippet);
					rangeSnippet.additionalTextEdits = [
						TextEdits.insertInMethods(this.document, AutoCompleteArray.RangeQuestion.Methods),
						TextEdits.insertInConstants(this.document, AutoCompleteArray.RangeQuestion.Constant)
					];
					snippets.push(rangeSnippet);
					return snippets;
				}

				let curOpenMatch = text.match(/<(\w+)$/);
				if (!curOpenMatch) return completionItems;
				let opening = curOpenMatch[1].toLocaleLowerCase();

				//Item Snippet
				if ("item".startsWith(opening))
				{
					let parent: string;
					for (let key in ItemSnippets)
						if (!!this.tag.Parents.find(x => x.Name == key))
						{
							parent = key;
							break;
						}
					if (!parent || !ItemSnippets[parent]) parent = "List";
					let extractor = new ElementExtractor(this.surveyData);
					let res = extractor.get(ItemSnippets[parent]);
					if (res)
					{
						let ci = server.CompletionItem.create("Item");
						ci.kind = server.CompletionItemKind.Snippet;
						ci.detail = "Структура Item для " + parent;
						ci.insertText = res;
						ci.insertTextFormat = server.InsertTextFormat.Snippet;
						//ci.additionalTextEdits = [vscode.TextEdit.replace(range, "")];
						completionItems.push(ci);
					}
				}
				// Answer Snippet
				else if ("answer".startsWith(opening))
				{
					let ci = server.CompletionItem.create("Answer");
					ci.kind = server.CompletionItemKind.Snippet;
					ci.insertTextFormat = server.InsertTextFormat.Snippet;
					let ciS = server.CompletionItem.create("AnswerShort");
					ciS.kind = server.CompletionItemKind.Snippet;
					ciS.insertTextFormat = server.InsertTextFormat.Snippet;

					let iterator = "1";
					let text = "$2";

					if (this.tag.LastParent && this.tag.LastParent.Name == "Repeat")
					{
						let source = this.tag.LastParent.getRepeatSource();
						ci.detail = "Полная структура Answer в Repeat по " + source;
						ciS.detail = "Краткая структура Answer в Repeat по " + source;
						iterator = source == "List" ? "@ID" : "@Itera";
						text = source == "List" ? "@Text" : "@Itera";
					}
					else
					{
						ci.detail = "Полная структура Answer";
						ciS.detail = "Краткая структура Answer";
					}
					// полный вариант
					ci.insertText = "Answer Id=\"${1:" + iterator + "}\"><Text>${2:" + text + "}</Text></Answer>";
					completionItems.push(ci);
					// краткий вариант
					ciS.insertText = "Answer Id=\"${1:" + iterator + "}\"/>";
					completionItems.push(ciS);
				}
				// Repeat Snippet
				else if ("repeat".startsWith(opening))
				{
					let lastParent: SimpleTag = null;
					let validParents = this.tag.Parents.filter(x => x.Name != "Repeat");
					if (validParents.length > 0) lastParent = validParents.last();
					let repeatTypes = ['List', 'Length', 'Range'];

					repeatTypes.forEach(type =>
					{
						let ci = server.CompletionItem.create(`Repeat (${type})`);
						ci.kind = server.CompletionItemKind.Snippet;
						ci.insertTextFormat = server.InsertTextFormat.Snippet;
						let body: string = '';
						let textEdit = null;

						switch (lastParent.Name)
						{
							case 'Page':
								body = '!-- <Block Items="$repeat($1){$2[,]}" MixId="$2Mix"/> -->\n<Repeat {{init}}>\n\t<Question Id="\${2:Q1}_{{iterator}}">\n\t\t<Header>$3</Header>\n\t\t$0\n\t</Question>\n</Repeat>';
								break;

							case 'Question':
								body = 'Repeat {{init}}>\n\t<Answer Id="{{iterator}}"><Text>{{textIterator}}</Text></Answer>\n</Repeat>';
								break;

							default:
								body = 'Repeat {{init}}>\n\n\n</Repeat>';
								break;
						}

						ci.insertText = this._createRepeatSnippetBody(type, body);
						ci.documentation = 'Повтор по ' + type;
						completionItems.push(ci);
					});
				}
			}
		}
		catch (error)
		{
			logError('Ошибка получения XML Features Autocomplete', false, error);
		}
		return completionItems;
	}

	/** атрибуты */
	private getXMLAttrs(): server.CompletionItem[]
	{
		let completionItems: server.CompletionItem[] = [];

		try
		{
			let text = getPreviousText(this.document, this.position, true);
			if (!(this.char == ' ' || !!text.match(/\w+$/))) return completionItems;
			if (!!this.tag && this.tag.GetLaguage() == Language.XML && !this.tag.OpenTagIsClosed && !this.tag.InString() && AutoCompleteArray.Attributes[this.tag.Id])
			{
				let existAttrs = this.tag.AttributeNames();
				let textAfter = this.document.getText().slice(this.document.offsetAt(this.position));
				let attrs = textAfter.match(RegExpPatterns.RestAttributes);
				let nameOnly = !!textAfter.match(/^=["']/);
				let nexAttrs: string[] = [];
				if (!!attrs) nexAttrs = CurrentTag.GetAttributesArray(attrs[0]).Keys;
				let parent = this;
				AutoCompleteArray.Attributes[this.tag.Id].filter((x: { Name: string; }) => nexAttrs.indexOf(x.Name) + existAttrs.indexOf(x.Name) < -1).forEach((element: Object) =>
				{
					let attr = new TibAttribute(element);
					let ci = attr.ToCompletionItem(function (query)
					{
						return parent.extractor[query]();
					}, nameOnly);
					completionItems.push(ci);
				});
			}
		} catch (error)
		{
			logError('Ошибка получения XML Attrs Autocomplete', false, error);
		}

		return completionItems;
	}

	/** Значения атрибутов */
	private getAttrValues(): server.CompletionItem[]
	{
		let completionItems: server.CompletionItem[] = [];

		try
		{
			if (!this.tag || this.tag.OpenTagIsClosed) return completionItems;
			let text = getPreviousText(this.document, this.position, true);
			//let needClose = !getCurrentLineText(document, position).substr(position.character).match(/^[\w@]*['"]/);

			let curAttr = text.match(/(\w+)=(["'])(:?\w*)$/);
			if (!curAttr) return completionItems;

			let atrs: TibAttribute[] = AutoCompleteArray.Attributes[this.tag.Id];
			if (!atrs) return completionItems;

			let attr = atrs.find(function (e, i)
			{
				return e.Name == curAttr[1];
			});
			if (!attr) return completionItems;


			let attrT = new TibAttribute(attr);
			let patent = this;
			let vals = attrT.ValueCompletitions(function (query)
			{
				return patent.extractor[query]();
			});
			vals.forEach(v =>
			{
				let ci = server.CompletionItem.create(v);
				ci.insertText = v;
				ci.kind = server.CompletionItemKind.Enum;
				completionItems.push(ci);
			});
		} catch (error)
		{
			logError('Ошибка получения XML AttrValues Autocomplete', false, error);
		}

		return completionItems;
	}

	/** Functions, Variables, Enums, Classes, Custom Methods, C# Snippets, Types, node Ids */
	private getMainCS(): server.CompletionItem[]
	{
		let completionItems: server.CompletionItem[] = [];

		try
		{
			if (!this.tag || this.char == ' ' || this.char == '.') return completionItems;

			let curLine = getPreviousText(this.document, this.position, true);
			let mt = curLine.match(/(#|\$)?\w*$/);
			let lang = this.tag.GetLaguage();
			if (!mt) return;
			if (lang != Language.CSharp && mt[1] != "$") return completionItems;

			//пропускаем объявления
			if (Parse.isMethodDefinition(curLine)) return completionItems;

			let str = getCurrentLineText(this.document, this.position).substr(this.position.character);
			if (mt[1] == "$")
			{
				let extractor = new ElementExtractor(this.surveyData);
				// добавляем snippet для $repeat
				let ci = server.CompletionItem.create("repeat");
				ci.detail = "Строчный repeat";
				ci.kind = server.CompletionItemKind.Snippet;
				ci.insertTextFormat = server.InsertTextFormat.Snippet;
				ci.insertText = "repeat(${1|" + extractor.getAllLists().join(',') + "|}){${2:@ID}[${3:,}]}";
				completionItems.push(ci);
				// добавляем snippet для $place
				ci = server.CompletionItem.create("place");
				ci.detail = "Указатель на вложенный вопрос";
				ci.kind = server.CompletionItemKind.Snippet;
				ci.insertTextFormat = server.InsertTextFormat.Snippet;
				ci.insertText = "place(${1|" + extractor.getAllQuestions().join(',') + "|})";
				completionItems.push(ci);
				// добавляем стандартные константы
				if (lang == Language.CSharp && !this.tag.CSSingle()) XMLEmbeddings.forEach(x =>
				{
					ci = server.CompletionItem.create(x.Name);
					ci.kind = server.CompletionItemKind.Constant;
					if (!!x.Type) ci.detail = x.Type;
					ci.documentation = x.Title;
					completionItems.push(ci);
				});
			}

			let customMethods = this.surveyData.Methods.CompletionArray();
			if (customMethods && !this.tag.InCSString()) completionItems = completionItems.concat(customMethods); //Custom Methods

			// если начинается с $, то больше ничего не надо
			if (mt[1] == "$") return completionItems;

			//C# Featrues
			if (mt[1] == "#")
			{
				AutoCompleteArray.CSFeatures.forEach(element =>
				{
					completionItems.push(snippetToCompletitionItem(element));
				});
			}

			if (!this.tag.CSSingle() && !curLine.match(/\w+\.\w*$/))
			{
				if (!this.tag.InCSString())
				{
					let ar: TibAutoCompleteItem[] = this.tibAutoCompleteList.Item("Function").concat(this.tibAutoCompleteList.Item("Variable"), this.tibAutoCompleteList.Item("Enum"), this.tibAutoCompleteList.Item("Class"), this.tibAutoCompleteList.Item("Type"), this.tibAutoCompleteList.Item("Struct"));
					let adBracket = !str.match(/^\w*\(/);
					ar.forEach(element =>
					{
						if (element) completionItems.push(element.ToCompletionItem(adBracket));
					});
					//C# Snippets
					AutoCompleteArray.CSSnippets.forEach(element =>
					{
						completionItems.push(snippetToCompletitionItem(element));
					});
				}
				else //node Ids
				{
					let qt = curLine.lastIndexOf('"');
					if (qt > -1) // от недоверия к tag.InCSString()
					{
						let stuff = curLine.substr(0, qt);
						let match = stuff.match(/((CurrentSurvey\.Lists\[)|(Page\s*=)|(Question\s*=))\s*$/);
						const matchResults =
						{
							List: 2,
							Page: 3,
							Question: 4
						};
						if (!!match)
						{
							let resultMatch = match.findIndex((val, index) => { return index > 1 && !!val; });
							switch (resultMatch)
							{
								case matchResults.List:
									completionItems = completionItems.concat(this.surveyData.CurrentNodes.CompletitionItems("List"));
									break;

								case matchResults.Page:
									completionItems = completionItems.concat(this.surveyData.CurrentNodes.CompletitionItems("Page"));
									break;

								case matchResults.Question:
									completionItems = completionItems.concat(this.surveyData.CurrentNodes.CompletitionItems("Question"));
									break;

								default:
									break;
							}
						}
						else // всё подряд
						{
							_NodeStoreNames.forEach(name =>
							{
								completionItems = completionItems.concat(this.surveyData.CurrentNodes.CompletitionItems(name));
							});
						}
					}
				}
			}
		} catch (error)
		{
			logError('Ошибка получения Main C# Autocomplete', false, error);
		}

		return completionItems;
	}

	/** Properties, Methods, EnumMembers, Linq */
	private getCSMethods(): server.CompletionItem[]
	{
		let completionItems: server.CompletionItem[] = [];

		try
		{
			if (this.char != '.' || !!this.tag && this.tag.GetLaguage() == Language.CSharp && !this.tag.InCSString() && !this.tag.CSSingle())
			{
				let lastLine = getPreviousText(this.document, this.position, true);
				let ar: TibAutoCompleteItem[] = this.tibAutoCompleteList.Item("Property").concat(this.tibAutoCompleteList.Item("Method"), this.tibAutoCompleteList.Item("EnumMember"));
				let str = getCurrentLineText(this.document, this.position).substr(this.position.character);
				let needClose = !str.match(/\w*\(/);
				let mt = lastLine.match(/(\w+)\.w*$/);
				let parent: string;
				if (!!mt && !!mt[1]) parent = mt[1];
				ar.forEach(element =>
				{
					let m = false;
					if (element.Parent)
					{
						let reg = new RegExp(element.Parent + "\\.\\w*$");
						m = !!lastLine.match(reg);
					}
					if (m && (!element.ParentTag || element.ParentTag == this.tag.Name)) completionItems.push(element.ToCompletionItem(needClose, "__" + element.Name));
				});
				// добавляем Linq
				if (lastLine.match(/\.\w*$/) && (!parent || this.classTypes.indexOf(parent) == -1) && !!this.settings.Item('useLinq'))
				{
					let linqAr = this.tibAutoCompleteList.Item("Method").filter(x => x.Parent == "Enumerable").map(x => x.ToCompletionItem(needClose, "zzz" + x.Name));
					completionItems = completionItems.concat(linqAr);
				}
			}
		} catch (error)
		{
			logError('Ошибка получения C# Fields Autocomplete', false, error);
		}
		return completionItems;
	}

	private getConstants(): server.CompletionItem[]
	{
		let completionItems: server.CompletionItem[] = [];
		let wordRange = getWordRangeAtPosition(this.document, this.position);
		let word = this.document.getText(wordRange);
		let prevSymbol = this.document.getText(server.Range.create(translatePosition(this.document, wordRange.start, -1), wordRange.start));

		if (prevSymbol == "@")
		{
			let consts = this.surveyData.ConstantItems.Select((key, value) => new KeyValuePair(value.Id, value.Content));
			consts.AddRange(KeyedCollection.FromObject(PreDefinedConstants));
			let suitable = !!word ? consts.Filter((key, value) => key.contains(word)) : consts;
			if (suitable.Count > 0) completionItems = completionItems.concat(suitable.ToArray((key, value) =>
			{
				let ci = server.CompletionItem.create(key);
				ci.insertText = key;
				ci.kind = server.CompletionItemKind.Constant;
				ci.documentation = value;
				return ci;
			}))
		}

		return completionItems;
	}

	private _createRepeatSnippetBody(type: string, body: string): string
	{
		let res = body;
		let init = "$1";
		if (type == 'List')
		{
			let extractor = new ElementExtractor(this.surveyData);
			init = `\${1|${extractor.getAllLists().join(',')}|}`;
		}
		res = res.replace(/\{\{iterator\}\}/g, type == 'List' ? '@ID' : '@Itera');
		res = res.replace(/\{\{textIterator\}\}/g, type == 'List' ? '@Text' : '@Itera');
		res = res.replace(/\{\{init\}\}/g, type + `="${init}"`);
		return res;
	}

}


/** Подсказки при вводе */
export function getSignatureHelpers(tag: CurrentTag, document: server.TextDocument, position: server.Position, surveyData: ISurveyData, tibAutoCompleteList: KeyedCollection<TibAutoCompleteItem[]>): server.SignatureInformation[]
{
	let sign: server.SignatureInformation[] = [];

	try
	{
		if (!tag || tag.GetLaguage() != Language.CSharp) return sign;
		let lastLine = getPreviousText(document, position, true);
		//пропускаем объявления
		if (Parse.isMethodDefinition(lastLine)) return sign;
		let ar = tibAutoCompleteList.Item("Function").concat(tibAutoCompleteList.Item("Method"));
		let mtch = lastLine.match(/((^)|(.*\b))(\w+)\([^\(\)]*$/);
		if (!mtch || mtch.length < 4) return sign;
		let reg = mtch[1].match(/(\w+)\.$/);
		let parent = !!reg ? reg[1] : null;
		ar = ar.filter(x => x.Name == mtch[4]);
		ar.forEach(element =>
		{
			if (element.Kind == "Function" || !!parent && element.Parent == parent)
			{
				if (element.Overloads.length == 0) sign.push(element.ToSignatureInformation());
				else element.Overloads.forEach(el =>
				{
					sign.push(el.ToSignatureInformation());
				});
			}
		});
		// Custom Methods
		surveyData.Methods.SignatureArray(mtch[4]).forEach(element =>
		{
			sign.push(element);
		});
	} catch (error)
	{
		logError('Ошибка получения SignatureHelpers', false, error);
	}

	return sign;
}


export interface LanguageString
{
	language: string;
	value: string
};


/** Подсказки при наведении */
export function getHovers(tag: CurrentTag, document: server.TextDocument, position: server.Position, surveyData: ISurveyData, codeAutoCompleteArray: TibAutoCompleteItem[]): LanguageString[]
{
	let res: LanguageString[] = [];

	let testVar = undefined;

	try
	{
		let range = getWordRangeAtPosition(document, position);
		let text = document.getText(range);
		let prevSymbol = document.getText(server.Range.create(translatePosition(document, range.start, -1), range.start));
		let startsAsConstant = prevSymbol == "@";
		if (startsAsConstant)
		{
			let constantValue: string = null;
			let constant = surveyData.ConstantItems.Find((key, value) => key == text);
			if (!constant) constantValue = PreDefinedConstants[text];
			else constantValue = constant.Value.Content;
			if (!!constantValue)
			{
				res.push({ language: 'plaintext', value: constantValue });
			}
		}
		testVar = 10;
		if (!text || !tag || tag.GetLaguage() != Language.CSharp) return res;
		let parent = null;
		let lastText = getPreviousText(document, position);
		if (!lastText) throw "пустой lastText";
		let reg = lastText.match(/(\w+)\.\w*$/);
		if (!!reg)
		{
			parent = reg[1];
		}
		// надо проверить родителя: если нашёлся static, то только его, иначе всё подходящее
		let suit = codeAutoCompleteArray.filter(x => x.Name == text);
		let staticParens = codeAutoCompleteArray.filter(x => x.Kind == 'Class').map(x => x.Name);
		if (staticParens.contains(parent))
		{
			suit = suit.filter(x =>
			{
				return x.Name == text && (x.Parent == parent);
			});
		}

		for (let i = 0; i < suit.length; i++)
		{
			if (suit[i].Documentation && suit[i].Description)
			{
				let doc = "/* " + suit[i].Description + " */\n" + suit[i].Documentation;
				res.push({ language: "csharp", value: doc });
			}
			else
			{
				if (suit[i].Documentation) res.push({ language: "csharp", value: suit[i].Documentation });
				if (suit[i].Description) res.push({ language: "csharp", value: suit[i].Description });
			}
		}
		let customMethods = surveyData.Methods.HoverArray(text);
		if (customMethods) res = res.concat(customMethods);
	} catch (error)
	{
		if (!testVar) logError('Ошибка в getWordAtPosition', false, error);
		else logError('Ошибка получения Hovers', false, error);
	}
	return res;
}


/** Подсветка элементов */
export class TibDocumentHighLights
{
	private tag: CurrentTag;
	private document: server.TextDocument;
	private position: server.Position;

	constructor(tag: CurrentTag, document: server.TextDocument, position: server.Position)
	{
		this.tag = tag;
		this.document = document;
		this.position = position;
	}

	/** Все подсвечивающиеся */
	public getAll(): server.DocumentHighlight[]
	{
		let res: server.DocumentHighlight[] = [];
		let allF: (() => server.DocumentHighlight[])[] = [
			this.getTagsHighlights,
			this.getBlockHighlights
		];
		let parent = this;
		allF.forEach(f =>
		{
			res = res.concat(f.apply(parent));
		});
		return res;
	}

	/** Подсветка парных тегов */
	public getTagsHighlights(): server.DocumentHighlight[]
	{
		let res: server.DocumentHighlight[] = [];

		try
		{
			let text = getPreviousText(this.document, this.position);
			if (!this.tag) return res;
			let curRange = getWordRangeAtPosition(this.document, this.position);
			let word = this.document.getText(curRange);
			if (word == "CDATA") return res;
			if (this.tag.GetLaguage() == Language.CSharp && word != 'c#') return res; // такой костыль потому что при нахождении на [/c#] хз что там дальше и tag.CSMode == true
			let fullText = this.document.getText();
			let after = getCurrentLineText(this.document, this.position).substr(this.position.character);
			let mt = text.match(/(((\[)|(<))\/?)\w*$/);

			if (!mt) return res;
			let ind = -1;
			let range: server.Range;

			switch (mt[1])
			{
				case "<":
					{
						// открывающийся
						let endpos = this.document.positionAt(fullText.indexOf(">", text.length) + 1);
						curRange = server.Range.create(translatePosition(this.document, curRange.start, -1), endpos);
						res.push(server.DocumentHighlight.create(curRange));

						// закрывающийся
						if (!after.match(/^[^>]*\/>/) && !Parse.isSelfClosedTag(word))
						{
							range = findCloseTag("<", word, ">", this.document, this.position);
							if (range) res.push(server.DocumentHighlight.create(range));
						}
						break;
					}
				case "[":
					{
						// открывающийся
						let endpos = this.document.positionAt(fullText.indexOf("]", text.length) + 1);
						curRange = server.Range.create(translatePosition(this.document, curRange.start, -1), endpos);
						res.push(server.DocumentHighlight.create(curRange));

						// закрывающийся
						if (!after.match(/^[^\]]*\/\]/) && !Parse.isSelfClosedTag(word))
						{
							range = findCloseTag("[", word, "]", this.document, this.position);
							if (range) res.push(server.DocumentHighlight.create(range));
						}
						break;
					}
				case "</":
					{
						// закрывающийся
						let endpos = this.document.positionAt(fullText.indexOf(">", text.length) + 1);
						curRange = server.Range.create(translatePosition(this.document, curRange.start, -2), endpos);
						res.push(server.DocumentHighlight.create(curRange));

						// открывающийся
						range = findOpenTag("<", word, ">", this.document, this.position);
						if (range) res.push(server.DocumentHighlight.create(range));
						break;
					}
				case "[/":
					{
						// закрывающийся
						let endpos = this.document.positionAt(fullText.indexOf("]", text.length) + 1);
						curRange = server.Range.create(translatePosition(this.document, curRange.start, -2), endpos);
						res.push(server.DocumentHighlight.create(curRange));

						// открывающийся
						range = findOpenTag("[", word, "]", this.document, this.position);
						if (range) res.push(server.DocumentHighlight.create(range));
						break;
					}
			}
		} catch (error)
		{
			logError('Ошибка получения Tags Highlights', false, error);
		}

		return res;
	}

	public getBlockHighlights(): server.DocumentHighlight[]
	{
		let res: server.DocumentHighlight[] = [];
		try
		{
			let lineText = getCurrentLineText(this.document, this.position);
			let reg = lineText.match(/<!--#(end)?block.*-->/);
			if (!reg) return res;
			if (reg.index > this.position.character || reg.index + reg[0].length < this.position.character) return res;
			let nextRange: server.Range;

			let prevRange = server.Range.create(
				server.Position.create(0, 0),
				server.Position.create(this.position.line, 0)
			);
			let prevText = this.document.getText(prevRange);

			if (!!reg[1])
			{
				let allBlocks = prevText.matchAll(/<!--#block.*-->/);
				if (!allBlocks || allBlocks.length == 0) return res;

				let match = allBlocks.last();
				nextRange = server.Range.create(
					this.document.positionAt(match.index),
					this.document.positionAt(match.index + match[0].length)
				);
			}
			else
			{
				let offset = prevText.length;
				let after = this.document.getText().slice(offset);
				let match = after.match(/<!--#endblock-->/);
				if (!match) return res;

				nextRange = server.Range.create(
					this.document.positionAt(offset + match.index),
					this.document.positionAt(offset + match.index + match[0].length)
				);
			}

			let thisRange = server.Range.create(
				server.Position.create(this.position.line, reg.index),
				server.Position.create(this.position.line, reg.index + reg[0].length)
			);

			res.push(server.DocumentHighlight.create(thisRange));
			res.push(server.DocumentHighlight.create(nextRange));
		} catch (error)
		{
			logError('Ошибка получения Blocks Highlights', false, error);
		}

		return res;
	}
}


/** Переход к определению */
export function getDefinition(tag: CurrentTag, document: server.TextDocument, position: server.Position, surveyData: ISurveyData): server.Location
{
	let res: server.Location;

	try
	{
		let range = getWordRangeAtPosition(document, position);
		let word = document.getText(range);
		let prevSymbol = document.getText(server.Range.create(translatePosition(document, range.start, -1), range.start));

		if (!tag) return res;

		let startsAsConstant = prevSymbol == "@";

		if (startsAsConstant)
		{// для начала считаем это константой
			let constant = surveyData.ConstantItems.Find((key, value) => key == word);
			if (!!constant) return constant.Value.GetLocation();
		}

		if (tag.GetLaguage() == Language.CSharp && !tag.InCSString()) // C#
		{
			if (surveyData.Methods.ContainsKey(word)) res = surveyData.Methods.Item(word).GetLocation();
		}
		else // XML узлы
		{
			if (startsAsConstant) return res; // если начинается с @ и не в C#, то считаем это отсутствующей константой
			if (tag.Name == "Include")
			{
				let attrs = tag.GetAllAttributes(document);
				let fileName = attrs.Item("FileName");
				if (!!fileName)
				{
					fileName = applyConstants(fileName);
					let nullPosition = server.Position.create(0, 0);
					res = server.Location.create(uriFromName(fileName), server.Range.create(nullPosition, nullPosition));
				}
			}

			let enabledNodes = ["Page", "List", "Question"];
			enabledNodes.forEach(element =>
			{
				let item = surveyData.CurrentNodes.GetItem(word, element);
				if (!!item)
				{
					res = item.GetLocation();
					return;
				}
			});
		}
	} catch (error)
	{
		logError('Ошибка получения определения', true, error);
	}

	return res;
}

//#endregion



/** Возвращает `null`, если тег не закрыт или SelfClosed */
function findCloseTag(opBracket: string, tagName: string, clBracket: string, document: server.TextDocument, position: server.Position): server.Range
{
	try
	{
		let fullText = document.getText();
		let prevText = getPreviousText(document, position);
		let res = Parse.findCloseTag(opBracket, tagName, clBracket, prevText, fullText);
		if (!res || !res.Range) return null;
		let startPos = document.positionAt(res.Range.From);
		let endPos = document.positionAt(res.Range.To + 1);
		return server.Range.create(startPos, endPos);
	} catch (error)
	{
		logError("Ошибка выделения закрывающегося тега", false, error);
	}
	return null;
}


function findOpenTag(opBracket: string, tagName: string, clBracket: string, document: server.TextDocument, position: server.Position): server.Range
{
	try
	{
		let prevText = getPreviousText(document, position);
		let res = Parse.findOpenTag(opBracket, tagName, clBracket, prevText);
		if (!res) return null;
		let startPos = document.positionAt(res.Range.From);
		let endPos = document.positionAt(res.Range.To + 1);
		return server.Range.create(startPos, endPos);
	} catch (error)
	{
		logError("Ошибка выделения открывающегося тега", false, error);
	}
	return null;
}
