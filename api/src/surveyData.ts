'use strict';
// РАБОТА С XML-ЭЛЕМЕНТАМИ SURVEY



import * as server from 'vscode-languageserver';
import * as Encoding from './encoding'
import * as Parse from './parsing';
import { KeyedCollection, uriFromName } from './customs';
import { CurrentTag } from '.';
import * as xmlDoc from 'xmldoc';


export interface ISurveyData
{
	/** Список методов */
	Methods: TibMethods;
	/** Список Id */
	CurrentNodes: SurveyNodes;
	/** Список MixId (подставляется в значениях атрибутов) */
	MixIds: string[];
	/** Список путей Include */
	Includes: string[];
	/** Константы */
	ConstantItems: KeyedCollection<SurveyNode>;
	/** Список ExportLabel по родителям */
	ExportLabels: ExportLabel[];
}


export class SurveyData implements ISurveyData
{
	/** Список методов */
	Methods: TibMethods;
	/** Список Id */
	CurrentNodes: SurveyNodes;
	/** Список MixId (подставляется в значениях атрибутов) */
	MixIds: string[];
	/** Список путей Include */
	Includes: string[];
	/** Константы */
	ConstantItems: KeyedCollection<SurveyNode>;
	/** Список ExportLabel по родителям */
	ExportLabels: ExportLabel[];

	/** Очистка */
	public Clear()
	{
		this.Methods = new TibMethods();
		this.CurrentNodes = new SurveyNodes();
		this.MixIds = [];
		this.Includes = [];
		this.ConstantItems = new KeyedCollection<SurveyNode>();
		this.ExportLabels = [];
	}
}

export class TibMethod
{
	public Name: string = "";
	public Signature: string = "";
	public IsFunction: boolean;
	public Type: string;
	public FileName: String;

	private Uri: string;
	private Location: server.Range;

	constructor(name: string, sign: string, location: server.Range, fileName: string, isFunction: boolean = false, type: string = "")
	{
		this.Name = name;
		this.Signature = sign;
		this.Location = location;
		this.Type = type;
		this.FileName = fileName;
		this.Uri = fileName;
		this.IsFunction = isFunction;
	}

	public GetLocation(): server.Location
	{
		return server.Location.create(this.Uri, this.Location)
	}

	public GetLocationLink(): server.LocationLink
	{
		return server.LocationLink.create(this.Uri, this.Location, this.Location);
	}

	ToCompletionItem()
	{
		let item = server.CompletionItem.create(this.Name);
		item.kind = server.CompletionItemKind.Function;
		item.insertTextFormat = server.InsertTextFormat.Snippet;
		if (this.IsFunction) item.insertText = this.Name + "($0)";
		let mds: server.MarkedString = { language: 'XML', value: '' };
		mds.value = this.Signature;
		if (this.Type) item.detail = this.Type;
		item.documentation = mds.value;
		item.sortText = '___' + this.Name;
		return item;
	}

	ToHoverItem()
	{
		return { language: "csharp", value: this.Signature };
	}

	ToSignatureInformation()
	{
		return server.SignatureInformation.create(this.Name, this.Signature);
	}
}


export class TibMethods extends KeyedCollection<TibMethod>
{
	constructor(collection?: KeyedCollection<TibMethod>)
	{
		super();
		if (!!collection)
			collection.ForEach((key, value) =>
			{
				this.Add(value);
			})
	}

	public Add(item: TibMethod)
	{
		if (!this.ContainsKey(item.Name)) this.AddPair(item.Name, item);
	}

	CompletionArray(): server.CompletionItem[]
	{
		return this.Values.map(function (e)
		{
			return e.ToCompletionItem();
		}).filter(x => !!x);;
	}

	HoverArray(word: string): any[]
	{
		return this.Values.map(function (e)
		{
			if (e.Name == word) return e.ToHoverItem();
		}).filter(x => !!x);
	}

	SignatureArray(word: string)
	{
		return this.Values.map(function (e)
		{
			if (e.Name == word) return e.ToSignatureInformation();
		}).filter(x => !!x);
	}

	Filter(filter: (key: string, value: TibMethod) => boolean): TibMethods
	{
		return new TibMethods(super.Filter(filter));
	}
}


/** Информация об XML узле */
export class SurveyNode
{
	constructor(type: string, id: string, pos: server.Position, document: server.TextDocument, preparedFullDocumentXml: string)
	{
		this._document = document;
		this._safeText = preparedFullDocumentXml;
		this.Id = id;
		this.Type = type;
		this.Position = pos;
		this.FileName = document.uri;
		this.Uri = document.uri;
		this.IconKind = this.GetKind(type);
	}

	public Id: string = "";
	/** Тэг */
	public Type: string = "";
	/** Начало */
	public Position: server.Position;
	public FileName: string;
	public IconKind: server.CompletionItemKind;
	/** Содержимое */
	public Content?: string;

	private Uri: string;
	private _document: server.TextDocument;
	private _safeText: string;

	/** Location начала тега */
	GetLocation(): server.Location
	{
		return server.Location.create(this.Uri, server.Range.create(this.Position, this.Position));
	}

	GetLocationLink(): server.LocationLink
	{
		if (!this.Position) return null;
		let startPosition = this.Position;
		let endPosition = startPosition;
		let fromIndex = this._document.offsetAt(startPosition);
		let lastIndex = this._safeText.indexOf("</" + this.Type, fromIndex);
		if (lastIndex > -1)
		{
			lastIndex = this._safeText.indexOf(">" + this.Type, lastIndex);
			if (lastIndex > -1) endPosition = this._document.positionAt(lastIndex);
		}
		const range = server.Range.create(startPosition, endPosition);
		return server.LocationLink.create(this.Uri, range, range);
	}

	/** Чтобы иконки отличались */
	private GetKind(nodeName: string): server.CompletionItemKind
	{
		switch (nodeName)
		{
			case "Page":
				return server.CompletionItemKind.File;

			case "Question":
				return server.CompletionItemKind.EnumMember;

			case "List":
				return server.CompletionItemKind.Unit;

			case "Quota":
				return server.CompletionItemKind.Event;

			default:
				break;
		}
	}
}


export class SurveyNodes extends KeyedCollection<SurveyNode[]>
{
	constructor()
	{
		super();
	}

	/** Добавляет в нужный элемент */
	Add(item: SurveyNode)
	{
		if (!this.ContainsKey(item.Type))
			this.AddPair(item.Type, [item]);
		else if (this.Item(item.Type).findIndex(x => x.Id == item.Id)) this.Item(item.Type).push(item);
	}


	/** Добавляет к нужным элементам, не заменяя */
	AddRange(range: KeyedCollection<SurveyNode[]>): void
	{
		range.ForEach((key, value) =>
		{
			if (!this.ContainsKey(key))
				this.AddPair(key, value);
			else this.UpdateValue(key, x => x.concat(value));
		})
	}

	GetIds(type: string): string[]
	{
		let res = [];
		if (this.ContainsKey(type)) res = this.Item(type).map(e => e.Id);
		return res;
	}

	GetItem(id: string, type?: string): SurveyNode
	{
		let nodes = this.Item(type);
		if (!nodes) return null;
		let res: SurveyNode;
		if (!!nodes)
		{
			for (let i = 0; i < nodes.length; i++)
			{
				if (nodes[i].Id == id)
				{
					res = nodes[i];
					break;
				}
			};
		}

		return res;
	}

	Clear(names?: string[])
	{
		if (!names) super.Clear();
		else
			names.forEach(element =>
			{
				this.Values[element] = [];
			});
	}

	CompletitionItems(name: string, closeQt: string = ""): server.CompletionItem[]
	{
		let res: server.CompletionItem[] = [];
		if (!this.Item(name)) return res;
		this.Item(name).forEach(element =>
		{
			let ci = server.CompletionItem.create(element.Id);
			ci.kind = server.CompletionItemKind.Enum;
			ci.detail = name;
			ci.insertText = element.Id + closeQt;
			ci.kind = element.IconKind;
			ci.sortText = name + ci.insertText;
			res.push(ci);
		});
		return res;
	}

	/** Фильтрует элементы */
	FilterNodes(filter: (node: SurveyNode) => boolean): SurveyNodes
	{
		let res = new SurveyNodes();
		this.ForEach((key, value) =>
		{
			let nodes = value.filter(x => filter(x));
			if (nodes.length) res.AddPair(key, nodes);
		})
		return res;
	}

}


interface ExportLabelParent
{
	TagName: string;
	Start: server.Position;
}

export class ExportLabel
{
	/** Диапазон атрибута целиком */
	Range: server.Range;
	/** Значение атрибута */
	Value: string;

	constructor(range: server.Range, value: string)
	{
		this.Range = range;
		this.Value = value;
	}
}


/** Возвращает список public-методов из `<Methods>` */
export async function getDocumentMethods(document: server.TextDocument, xml: xmlDoc.XmlDocument): Promise<TibMethods>
{
	let res = new TibMethods();
	let mtd = xml.children.filter(x => x.type == 'element' && x.name == 'Methods') as xmlDoc.XmlElement[];
	if (mtd.length == 0) return res;
	const reg = new RegExp(/((public)|(private)|(protected))(((\s*static)|(\s*readonly))*)?\s+([\w<>\[\],\s]+)\s+((\w+)\s*(\([^)]*\))?)/);
	const groups = {
		Full: 0,
		Modificator: 1,
		Properties: 5,
		Type: 9,
		FullName: 10,
		Name: 11,
		Parameters: 12
	};
	const text = document.getText();
	mtd.forEach(element =>
	{
		let str = Parse.getXmlElementFullContent(element);
		str = Encoding.clearCSComments(str);
		let m = str.matchAllGroups(reg);
		m.forEach(met => 
		{
			if (met[groups.FullName])
			{
				let start = element.position + str.indexOf(met[groups.Full]);
				let isFunc = !!met[groups.Parameters];
				let end = text.indexOf(isFunc ? ")" : ";", start) + 1;
				let positionFrom = document.positionAt(start);
				let positionTo = document.positionAt(end);
				let rng = server.Range.create(positionFrom, positionTo);
				res.Add(new TibMethod(met[groups.Name], met[groups.Full].trim().replace(/\s{2,}/g, " "), rng, document.uri, isFunc, met[groups.Type]));
			}
		});
	});
	return res;
}

/** Возвращает список тегов `NodeStoreNames` с Id */
export async function getDocumentNodeIds(document: server.TextDocument, xml: xmlDoc.XmlDocument): Promise<SurveyNodes>
{
	let nNames = ["Page", "Quota", "List"];
	let nodes = new SurveyNodes();
	let res = Parse.getNestedElements(xml.children.filter(x => x.type == 'element') as xmlDoc.XmlElement[], nNames, 0);

	let pages = res.filter(x => x.name == 'Page');
	let questions = pages.map(x => Parse.getNestedElements(x.children.filter(c => c.type == 'element') as xmlDoc.XmlElement[], ['Question'], x.position));
	questions.forEach(x => x.forEach(q => res.push(q)));

	let text = CurrentTag.PrepareXML(document.getText());
	res.forEach(element => 
	{
		const pos = document.positionAt(element.tagStart);
		let item = new SurveyNode(element.name, element.attrs['Id'], pos, document, text);
		nodes.Add(item);
	});
	return nodes;
}

/** Возвращает список MixId */
export async function getMixIds(document: server.TextDocument, xml: xmlDoc.XmlDocument): Promise<string[]>
{
	let res: string[] = [];
	let tagsToSearch = ['Page', 'Question', 'Block', 'Repeat'];
	let parentElements = xml.children.filter(x => x.type == 'element' && tagsToSearch.contains(x.name)) as xmlDoc.XmlElement[];
	let mixIds = parentElements.map(x => x.attr['MixId']).filter(x => !!x);
	let storeIds = parentElements.filter(x => x.name == 'Question' && !!x.attr['Store']).map(x => ':' + x.attr['Id']);
	return [...storeIds, ...mixIds].distinct();
}

/** Возвращает список констант */
export async function getConstants(document: server.TextDocument, xml: xmlDoc.XmlDocument): Promise<KeyedCollection<SurveyNode>>
{
	let res = new KeyedCollection<SurveyNode>();
	let constTags = xml.children.filter(x => x.type == 'element' && x.name == 'Constants') as xmlDoc.XmlElement[];
	let items = constTags.flatMap(x => Parse.getNestedElements([x], ['Item'], x.position));
	let text = CurrentTag.PrepareXML(document.getText());
	items.forEach(item =>
	{
		let id = item.attrs['Id'];
		let constant = new SurveyNode("ConstantItem", id, document.positionAt(item.position), document, text);
		let value = item.content;
		if (!value) value = item.attrs['Value'];
		if (!!value) constant.Content = value;
		res.AddPair(id, constant);
	});
	return res;
}

/** Получает URI ко всем <Include> */
export function getIncludePaths(xml: xmlDoc.XmlDocument): string[]
{
	return Parse.getNestedElements(xml.children.filter(x => x.type == 'element') as xmlDoc.XmlElement[], ['Include'], 0)
		.map(x => x.attrs['FileName'])
		.filter(x => !!x)
		.map(uriFromName);
}


/** Возвращает список ExportLabel */
export async function getExportLabels(document: server.TextDocument): Promise<ExportLabel[]>
{
	let res: ExportLabel[] = [];
	let txt = document.getText();
	txt = Encoding.clearXMLComments(txt);
	txt = Encoding.clearCSContents(txt);
	let exportLabels = txt.findAll(/\sExportLabel=(('[^']*')|("[^"]*"))/);
	exportLabels.forEach(match =>
	{
		let from = document.positionAt(match.Index + 1);
		let to = document.positionAt(match.Index + match.Result[0].length);
		let range = server.Range.create(from, to);
		let value = match.Result[1].slice(1, match.Result[1].length - 1);
		let result = new ExportLabel(range, value);
		res.push(result);
	});
	return res;
}


export class TibAttribute
{
	Name: string = "";
	Type: string = "";
	/** значение по умолчанию (если не задано) */
	Default = null;
	/** Значение, подставляемое автоматически при вставке атрибута */
	Auto: string;
	AllowCode: boolean = false;
	/** краткое описание (появляется в редакторе в той же строчке) */
	Detail: string = "";
	/** подробное описание (появляется при клике на i (зависит от настроек)) */
	Description: string = "";
	/** кусок кода, сигнатура (показывается при наведении) */
	Documentation: string = "";
	/** Значения, которые подставляются в AutoComplete */
	Values: Array<string> = [];
	/** код функции, вызываемый потом в callback, чтобы вернуть string[] для Snippet */
	Result: string;
	Deprecated = false;

	constructor(obj: Object)
	{
		for (let key in obj)
			this[key] = obj[key];
	}

	/** `nameOnly` - не подставлять значения */
	ToCompletionItem(callback: (query: string) => string[], nameOnly = false): server.CompletionItem
	{
		let item = server.CompletionItem.create(this.Name);
		let snip = this.Name;
		if (!nameOnly)
		{
			snip += '="';
			let valAr: string[];
			let auto = this.AutoValue();
			if (!auto)
			{
				valAr = this.ValueCompletitions(callback);
				if (valAr.length > 0) snip += "${1|" + valAr.join(",") + "|}";
				else snip += "$1";
			}
			else snip += auto;
			snip += '"';
		}
		item.insertText = snip;
		item.insertTextFormat = server.InsertTextFormat.Snippet;
		item.detail = (this.Detail ? this.Detail : this.Name) + (this.Type ? (" (" + this.Type + ")") : "");
		let doc = "";
		if (this.Default) doc += "Значение по умолчанию: `" + this.Default + "`";
		doc += "\nПоддержка кодовых вставок: `" + (this.AllowCode ? "да" : "нет") + "`";
		item.documentation = {
			kind: server.MarkupKind.Markdown,
			value: doc
		};
		item.deprecated = this.Deprecated;
		return item;
	}

	ValueCompletitions(callback: (query: string) => string[]): string[]
	{
		if (this.Values && this.Values.length) return this.Values;
		else if (!!this.Result) return callback(this.Result);
		return [];
	}

	AutoValue(): string
	{
		if (this.Auto) return this.Auto;
		if (this.Type == "Boolean")
		{
			if (!!this.Default) return this.Default == "true" ? "false" : "true";
			return "true";
		}
		return null;
	}
}


/** Генерация TextEdit */
export namespace TextEdits
{
	/** Возвращает TextEdit для добавления в Methods */
	export function insertInMethods(document: server.TextDocument, str: string): server.TextEdit
	{
		return insertIntoTagOrCreateNew(document, 'Methods', str, true);
	}

	/** Возвращает TextEdit для добавления в Constants */
	export function insertInConstants(document: server.TextDocument, str: string): server.TextEdit
	{
		return insertIntoTagOrCreateNew(document, 'Constants', str, false);
	}

	/** Добавляет `str` к <`tagName`>. Если не найден, то создаётся новый в конец скрипта. */
	function insertIntoTagOrCreateNew(document: server.TextDocument, tagName: string, str: string, insertCDATA = false): server.TextEdit
	{
		let text = Encoding.clearXMLComments(document.getText());
		let tagStart = text.lastIndexOf('<' + tagName);
		str = '\n' + str;
		if (tagStart < 0)
		{// добавляем сначала тег
			let innerText = str + '\n';
			if (insertCDATA) innerText = '<![CDATA[' + str + ']]>';
			str = `\t<${tagName}>${innerText}\t</${tagName}>\n`;
			tagStart = text.lastIndexOf('</Survey');
			if (tagStart < 0) tagStart = text.length;
		}
		else
		{
			tagStart = text.indexOf('\n', tagStart);
		}
		let position = document.positionAt(tagStart);
		return server.TextEdit.insert(position, str);
	}
}
