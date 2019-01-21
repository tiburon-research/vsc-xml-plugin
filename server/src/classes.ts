'use strict'

import * as server from 'vscode-languageserver';
import { KeyedCollection, CurrentTag, Language, getPreviousText, TibMethods, SurveyNodes, Encoding, TibMethod, SurveyNode } from 'tib-api';
import { getDiagnosticElements } from './diagnostic';
import { ItemSnippets, QuestionTypes } from 'tib-api/lib/constants';
import * as AutoCompleteArray from './autoComplete';



export function sendDiagnostic(connection: server.Connection, document: server.TextDocument, settings: KeyedCollection<any>)
{
	getDiagnosticElements(document, settings).then(diagnostics =>
	{
		let clientDiagnostic: server.PublishDiagnosticsParams = {
			diagnostics,
			uri: document.uri
		};
		connection.sendDiagnostics(clientDiagnostic);
	})
}


export function getCompletions(connection: server.Connection, tag: CurrentTag, document: server.TextDocument, position: server.Position, surveyData: ISurveyDataData)
{
	let items: server.CompletionItem[] = [];
	items = items.concat(AutoCompletes.getXMLSnippets(tag, document, position, surveyData));
	return items;
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
		//if (addBracket && (this.Kind == "Function" || this.Kind == "Method")) item.insertText = new server.SnippetString(this.Name + "($0)");
		let mds: server.MarkedString = { language: 'xml', value: '' };
		if (this.Description) mds.value = this.Description;
		else if (this.Documentation) mds.value = this.Documentation;
		item.documentation = mds.value;
		if (sortString) item.sortText = sortString;
		if (this.Detail) item.detail = this.Detail;
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
	return ci;
}



//#region --------------------------- функции для получения элементов

export interface ISurveyDataData
{
	/** Список методов */
	Methods: TibMethods;
	/** Список Id */
	CurrentNodes: SurveyNodes;
	/** Список MixId (подставляется в значениях атрибутов) */
	MixIds: string[];
}

/** Класс для работы с {{Elements}} в строках */
class ElementExtractor
{

	constructor(data: ISurveyDataData)
	{
		this.Data = data;
	}

	/** Заменяет {{Elements}} на строку для Snippet */
	get(input: string): string
	{
		let res = new KeyedCollection<string[]>();
		let match = input.matchAll(/{{(\w+)}}/);
		if (!match || match.length == 0) return input;
		match.forEach(element =>
		{
			if (!!this._ElementFunctions[element[1]] && !res.Contains(element[1]))
			{
				res.AddPair(element[1], this._ElementFunctions[element[1]]());
			}
		});
		let resultStr = input;
		let i = 1;
		res.forEach((key, value) =>
		{
			resultStr = resultStr.replace(new RegExp("{{" + key + "}}", "g"), "${" + i + "|" + value.join(",") + "|}");
			i++;
		});
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

	private getAllPages(): string[]
	{
		return this.Data.CurrentNodes.GetIds('Page');
	}

	private getAllLists(): string[]
	{
		return this.Data.CurrentNodes.GetIds('List');
	}

	private getAllQuestions(): string[]
	{
		return this.Data.CurrentNodes.GetIds('Question');
	}

	private getQuestionTypes(): string[]
	{
		return QuestionTypes;
	}

	private getAllMixIds(): string[]
	{
		return this.Data.MixIds;
	}


	private Data: ISurveyDataData;
}



//#endregion



//#region --------------------------- Автозавершения

namespace AutoCompletes
{
	export function getXMLSnippets(tag: CurrentTag, document: server.TextDocument, position: server.Position, surveyData: ISurveyDataData)
	{
		let completionItems: server.CompletionItem[] = [];
		if (tag && tag.GetLaguage() == Language.XML)
		{
			let text = getPreviousText(document, position, true);

			// XML Features
			if (tag.OpenTagIsClosed && text.match(/\b_\w*$/))
			{
				return AutoCompleteArray.XMLFeatures.map(x => snippetToCompletitionItem(x));
			}

			let curOpenMatch = text.match(/<(\w+)$/);
			if (!curOpenMatch) return;
			let opening = curOpenMatch[1].toLocaleLowerCase();

			//Item Snippet
			if ("item".indexOf(opening) > -1)
			{
				let parent;
				for (let key in ItemSnippets)
					if (!!tag.Parents.find(x => x.Name == key))
					{
						parent = key;
						break;
					}
				if (!parent || !ItemSnippets[parent]) parent = "List";
				let extractor = new ElementExtractor(surveyData);
				let res = extractor.get(ItemSnippets[parent]);
				if (res)
				{
					let ci = server.CompletionItem.create("Item");
					ci.kind = server.CompletionItemKind.Snippet;
					ci.detail = "Структура Item для " + parent;
					ci.insertText = res;
					//ci.additionalTextEdits = [vscode.TextEdit.replace(range, "")];
					completionItems.push(ci);
				}
			}
			// Answer Snippet
			else if ("answer".indexOf(opening) > -1)
			{
				let ci = server.CompletionItem.create("Answer");
				ci.kind = server.CompletionItemKind.Snippet;
				let ciS = server.CompletionItem.create("AnswerShort");
				ciS.kind = server.CompletionItemKind.Snippet;

				let iterator = "1";
				let text = "$2";

				if (tag.LastParent && tag.LastParent.Name == "Repeat")
				{
					let source = tag.LastParent.getRepeatSource();
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
		}
		return completionItems;
	}
}

/*
function autoComplete()
{
	// XML Snippets
	vscode.languages.registerCompletionItemProvider('tib', {
		provideCompletionItems(document, position, token, context)
		{
			let completionItems = [];
			let tag = getCurrentTag(document, position);
			if (tag && tag.GetLaguage() == Language.XML)
			{
				let text = getPreviousText(document, position, true);

				// XML Features
				if (tag.OpenTagIsClosed && text.match(/\b_\w*$/))
				{
					return AutoCompleteArray.XMLFeatures.map(x => snippetToCompletitionItem(x));
				}

				let curOpenMatch = text.match(/<(\w+)$/);
				if (!curOpenMatch) return;
				let opening = curOpenMatch[1].toLocaleLowerCase();

				//Item Snippet
				if ("item".indexOf(opening) > -1)
				{
					let parent;
					for (let key in ItemSnippets)
						if (!!tag.Parents.find(x => x.Name == key))
						{
							parent = key;
							break;
						}
					if (!parent || !ItemSnippets[parent]) parent = "List";
					let res = new vscode.SnippetString(extractElements(ItemSnippets[parent]));
					if (res)
					{
						let ci = new vscode.CompletionItem("Item", vscode.CompletionItemKind.Snippet);
						ci.detail = "Структура Item для " + parent;
						ci.insertText = res;
						//ci.additionalTextEdits = [vscode.TextEdit.replace(range, "")];
						completionItems.push(ci);
					}
				}
				// Answer Snippet
				else if ("answer".indexOf(opening) > -1)
				{
					let ci = new vscode.CompletionItem("Answer", vscode.CompletionItemKind.Snippet);
					let ciS = new vscode.CompletionItem("AnswerShort", vscode.CompletionItemKind.Snippet);

					let iterator = "1";
					let text = "$2";

					if (tag.LastParent && tag.LastParent.Name == "Repeat")
					{
						let source = tag.LastParent.getRepeatSource();
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
					ci.insertText = new vscode.SnippetString("Answer Id=\"${1:" + iterator + "}\"><Text>${2:" + text + "}</Text></Answer>");
					completionItems.push(ci);
					// краткий вариант
					ciS.insertText = new vscode.SnippetString("Answer Id=\"${1:" + iterator + "}\"/>");
					completionItems.push(ciS);
				}
			}
			return completionItems;
		},
		resolveCompletionItem(item, token)
		{
			return item;
		}
	});

	//Attributes
	vscode.languages.registerCompletionItemProvider('tib', {
		provideCompletionItems(document, position, token, context)
		{
			let completionItems = [];
			let tag = getCurrentTag(document, position);
			if (!!tag && tag.GetLaguage() == Language.XML && !tag.OpenTagIsClosed && !tag.InString() && AutoCompleteArray.Attributes[tag.Id])
			{
				let existAttrs = tag.AttributeNames();
				let textAfter = document.getText().slice(document.offsetAt(position));
				let attrs = textAfter.match(RegExpPatterns.RestAttributes);
				let nameOnly = !!textAfter.match(/^=["']/);
				let nexAttrs: string[] = [];
				if (!!attrs) nexAttrs = CurrentTag.GetAttributesArray(attrs[0]).Keys();
				AutoCompleteArray.Attributes[tag.Id].filter(x => nexAttrs.indexOf(x.Name) + existAttrs.indexOf(x.Name) < -1).forEach(element =>
				{
					let attr = new TibAttribute(element);
					let ci = attr.ToCompletionItem(function (query)
					{
						return safeValsEval(query);
					}, nameOnly);
					completionItems.push(ci);
				});
			}
			return completionItems;
		},
		resolveCompletionItem(item, token)
		{
			return item;
		}
	}, " ");

	//Functions, Variables, Enums, Classes, Custom Methods, C# Snippets, Types, node Ids
	vscode.languages.registerCompletionItemProvider('tib', {
		provideCompletionItems(document, position, token, context)
		{
			let completionItems: vscode.CompletionItem[] = [];
			let tag = getCurrentTag(document, position);
			if (!tag) return;

			let curLine = getPreviousText(document, position, true);
			let mt = curLine.match(/(#|\$)?\w*$/);
			let lang = tag.GetLaguage();
			if (!mt) return;
			if (lang != Language.CSharp && mt[1] != "$") return;

			//пропускаем объявления
			if (Parse.isMethodDefinition(curLine)) return;

			let str = getCurrentLineText(document, position).substr(position.character);
			if (mt[1] == "$")
			{
				// добавляем snippet для $repeat
				let ci = new vscode.CompletionItem("repeat", vscode.CompletionItemKind.Snippet);
				ci.detail = "Строчный repeat";
				ci.insertText = new vscode.SnippetString("repeat(${1|" + getAllLists().join(',') + "|}){${2:@ID}[${3:,}]}");
				completionItems.push(ci);
				// добавляем snippet для $place
				ci = new vscode.CompletionItem("place", vscode.CompletionItemKind.Snippet);
				ci.detail = "Указатель на вложенный вопрос";
				ci.insertText = new vscode.SnippetString("place(${1|" + getAllQuestions().join(',') + "|})");
				completionItems.push(ci);
				// добавляем стандартные константы
				if (lang == Language.CSharp && !tag.CSSingle()) XMLEmbeddings.forEach(x =>
				{
					ci = new vscode.CompletionItem(x.Name, vscode.CompletionItemKind.Constant);
					if (!!x.Type) ci.detail = x.Type;
					ci.documentation = x.Title;
					completionItems.push(ci);
				});
			}

			let customMethods = Methods.CompletionArray();
			if (customMethods && !tag.InCSString()) completionItems = completionItems.concat(customMethods); //Custom Methods

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

			if (!tag.CSSingle() && !curLine.match(/\w+\.\w*$/))
			{
				if (!tag.InCSString())
				{
					let ar: TibAutoCompleteItem[] = TibAutoCompleteList.Item("Function").concat(TibAutoCompleteList.Item("Variable"), TibAutoCompleteList.Item("Enum"), TibAutoCompleteList.Item("Class"), TibAutoCompleteList.Item("Type"), TibAutoCompleteList.Item("Struct"));
					let adBracket = !str.match(/\w*\(/);
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
									completionItems = completionItems.concat(CurrentNodes.CompletitionItems("List"));
									break;

								case matchResults.Page:
									completionItems = completionItems.concat(CurrentNodes.CompletitionItems("Page"));
									break;

								case matchResults.Question:
									completionItems = completionItems.concat(CurrentNodes.CompletitionItems("Question"));
									break;

								default:
									break;
							}
						}
						else // всё подряд
						{
							_NodeStoreNames.forEach(name =>
							{
								completionItems = completionItems.concat(CurrentNodes.CompletitionItems(name));
							});
						}
					}
				}
			}
			return completionItems;
		},
		resolveCompletionItem(item, token)
		{
			return item;
		}
	}, "\"", "", "$", "#");

	//Properties, Methods, EnumMembers, Linq
	vscode.languages.registerCompletionItemProvider('tib', {
		provideCompletionItems(document, position, token, context)
		{
			let completionItems = [];
			let tag = getCurrentTag(document, position);
			if (!!tag && tag.GetLaguage() == Language.CSharp && !tag.InCSString() && !tag.CSSingle())
			{
				let lastLine = getPreviousText(document, position, true);
				let ar: TibAutoCompleteItem[] = TibAutoCompleteList.Item("Property").concat(TibAutoCompleteList.Item("Method"), TibAutoCompleteList.Item("EnumMember"));
				let str = getCurrentLineText(document, position).substr(position.character);
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
					if (m && (!element.ParentTag || element.ParentTag == tag.Name)) completionItems.push(element.ToCompletionItem(needClose, "__" + element.Name));
				});
				// добавляем Linq
				if (lastLine.match(/\.\w*$/) && (!parent || ClassTypes.indexOf(parent) == -1) && _useLinq)
				{
					let linqAr = TibAutoCompleteList.Item("Method").filter(x => x.Parent == "Enumerable").map(x => x.ToCompletionItem(needClose, "zzz" + x.Name));
					completionItems = completionItems.concat(linqAr);
				}
			}
			return completionItems;
		},
		resolveCompletionItem(item, token)
		{
			return item;
		}
	}, ".");

	//Значения атрибутов
	vscode.languages.registerCompletionItemProvider('tib', {
		provideCompletionItems(document, position, token, context)
		{
			let completionItems = [];
			let tag = getCurrentTag(document, position);
			if (!tag || tag.OpenTagIsClosed) return;
			let text = getPreviousText(document, position, true);
			//let needClose = !getCurrentLineText(document, position).substr(position.character).match(/^[\w@]*['"]/);

			let curAttr = text.match(/(\w+)=(["'])(:?\w*)$/);
			if (!curAttr) return;

			let atrs: TibAttribute[] = AutoCompleteArray.Attributes[tag.Id];
			if (!atrs) return;

			let attr = atrs.find(function (e, i)
			{
				return e.Name == curAttr[1];
			});
			if (!attr) return;


			let attrT = new TibAttribute(attr);
			let vals = attrT.ValueCompletitions(function (query)
			{
				return safeValsEval(query);
			});
			vals.forEach(v =>
			{
				let ci = new vscode.CompletionItem(v, vscode.CompletionItemKind.Enum);
				ci.insertText = v;
				completionItems.push(ci);
			});
			return completionItems;
		},
		resolveCompletionItem(item, token)
		{
			return item;
		}
	}, ":", "");
}

*/


/** Подсказки при вводе параметров функции */
/*
function helper()
{
	vscode.languages.registerSignatureHelpProvider('tib', {
		provideSignatureHelp(document, position, token)
		{
			let tag = getCurrentTag(document, position);
			if (!tag || tag.GetLaguage() != Language.CSharp) return;
			let sign = new vscode.SignatureHelp();
			let lastLine = getPreviousText(document, position, true);
			//пропускаем объявления
			if (Parse.isMethodDefinition(lastLine)) return;
			let ar = TibAutoCompleteList.Item("Function").concat(TibAutoCompleteList.Item("Method"));
			let mtch = lastLine.match(/((^)|(.*\b))(\w+)\([^\(\)]*$/);
			if (!mtch || mtch.length < 4) return sign;
			let reg = mtch[1].match(/(\w+)\.$/);
			let parent = !!reg ? reg[1] : null;
			ar.forEach(element =>
			{
				if (element.Name == mtch[4] && (element.Kind == vscode.CompletionItemKind[vscode.CompletionItemKind.Function] || !!parent && element.Parent == parent))
				{
					if (element.Overloads.length == 0) sign.signatures.push(element.ToSignatureInformation());
					else element.Overloads.forEach(el =>
					{
						sign.signatures.push(el.ToSignatureInformation());
					});
				}
			});
			// Custom Methods
			Methods.SignatureArray(mtch[4]).forEach(element =>
			{
				sign.signatures.push(element);
			});
			sign.activeSignature = 0;
			return sign;
		}
	}, "(", ",");
}
*/


/** подсказки при наведении */
/*
function hoverDocs()
{
	vscode.languages.registerHoverProvider('tib', {
		provideHover(document, position, token)
		{
			let res = [];
			let range = document.getWordRangeAtPosition(position);
			if (!range) return;
			let tag = getCurrentTag(document, range.end);
			if (!tag) return;
			if (tag.GetLaguage() != Language.CSharp) return;
			let text = document.getText(range);
			let parent = null;
			let lastText = getPreviousText(document, position);
			let reg = lastText.match(/(\w+)\.\w*$/);
			if (!!reg)
			{
				parent = reg[1];
			}
			// надо проверить родителя: если нашёлся static, то только его, иначе всё подходящее
			let suit = CodeAutoCompleteArray.filter(x => x.Name == text);
			let staticParens = CodeAutoCompleteArray.filter(x => x.Kind == vscode.CompletionItemKind[vscode.CompletionItemKind.Class]).map(x => x.Name);
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
				{*/
					//let doc = "/* " + suit[i].Description + " */\n" + suit[i].Documentation;
/*res.push({ language: "csharp", value: doc });
}
else
{
if (suit[i].Documentation) res.push({ language: "csharp", value: suit[i].Documentation });
if (suit[i].Description) res.push(suit[i].Description);
}
}
let customMethods = Methods.HoverArray(text);
if (customMethods) res = res.concat(customMethods);
if (res.length == 0) return;
return new vscode.Hover(res, range);
}
});
}*/


//#endregion







