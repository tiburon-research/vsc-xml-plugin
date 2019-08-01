'use strict';
// РАБОТА С XML-ЭЛЕМЕНТАМИ SURVEY




import * as server from 'vscode-languageserver';
import * as Encoding from './encoding'
import { KeyedCollection, pathExists, uriFromName } from './customs';


export interface ISurveyData
{
	/** Список методов */
	Methods: TibMethods;
	/** Список Id */
	CurrentNodes: SurveyNodes;
	/** Список MixId (подставляется в значениях атрибутов) */
	MixIds: string[];
	/** Список путей Include */
	Includes: string[]
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
	Includes: string[]

	/** Очистка */
	public Clear()
	{
	    this.Methods = new TibMethods();
	    this.CurrentNodes = new SurveyNodes();
	    this.MixIds = [];
	    this.Includes = [];
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
	constructor(type: string, id: string, pos: server.Position, fileName: string)
	{
	    this.Id = id;
	    this.Type = type;
	    this.Position = pos;
	    this.FileName = fileName;
	    this.Uri = fileName;
	    this.IconKind = this.GetKind(type);
	}

	public Id: string = "";
	public Type: string = "";
	public Position: server.Position;
	public FileName: string;
	public IconKind: server.CompletionItemKind;

	private Uri: string;

	GetLocation(): server.Location
	{
	    return server.Location.create(this.Uri, server.Range.create(this.Position, this.Position));
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


/** Возвращает список public-методов из `<Methods>` */
export async function getDocumentMethods(document: server.TextDocument): Promise<TibMethods>
{
	let res = new TibMethods();
	let text = document.getText();
	text = Encoding.clearXMLComments(text);
	let mtd = text.matchAll(/(<Methods)([^>]*>)([\s\S]*)(<\/Methods)/);
	if (mtd.length == 0)
	{
	    return res;
	}
	let reg = new RegExp(/((public)|(private)|(protected))(((\s*static)|(\s*readonly))*)?\s+([\w<>\[\],\s]+)\s+((\w+)\s*(\([^)]*\))?)/);
	let groups = {
	    Full: 0,
	    Modificator: 1,
	    Properties: 5,
	    Type: 9,
	    FullName: 10,
	    Name: 11,
	    Parameters: 12
	};
	mtd.forEach(element =>
	{
	    let str = element[3];
	    str = Encoding.clearCSComments(str);
	    let m = str.matchAll(reg);
	    m.forEach(met => 
	    {
	        if (met[groups.FullName])
	        {
	            let start = text.indexOf(met[groups.Full]);
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
export async function getDocumentNodeIds(document: server.TextDocument, NodeStoreNames: string[]): Promise<SurveyNodes>
{
	let nNames = NodeStoreNames;
	let txt = document.getText();
	txt = Encoding.clearXMLComments(txt);
	let reg = new RegExp("<((" + nNames.join(")|(") + "))[^>]*\\sId=(\"|')([^\"']+)(\"|')");
	let idIndex = nNames.length + 3;
	let nodes = new SurveyNodes();
	let res = txt.matchAll(reg);
	res.forEach(element => 
	{
	    let pos = document.positionAt(txt.indexOf(element[0]));
	    let item = new SurveyNode(element[1], element[idIndex], pos, document.uri);
	    nodes.Add(item);
	});
	// дополнительно
	nodes.Add(new SurveyNode("Page", "pre_data", null, document.uri));
	nodes.Add(new SurveyNode("Question", "pre_data", null, document.uri));
	nodes.Add(new SurveyNode("Question", "pre_sex", null, document.uri));
	nodes.Add(new SurveyNode("Question", "pre_age", null, document.uri));
	nodes.Add(new SurveyNode("Page", "debug", null, document.uri));
	nodes.Add(new SurveyNode("Question", "debug", null, document.uri));
	return nodes;
}

/** Возвращает список MixId */
export async function getMixIds(document: server.TextDocument): Promise<string[]>
{
	let res: string[] = [];
	let txt = document.getText();
	txt = Encoding.clearXMLComments(txt);
	let matches = txt.matchAll(/MixId=('|")((?!:)(\w+))(\1)/);
	let matchesStore = txt.matchAll(/<Question[^>]+Store=('|")(\w+?)(\1)[^>]*>/);
	let mixIdsStore: string[] = [];
	matchesStore.forEach(element =>
	{
	    let idmt = element[0].match(/\sId=("|')(.+?)\1/);
	    if (!idmt) return;
	    mixIdsStore.push(":" + idmt[2]);
	});
	if (!!matches) res = res.concat(matches.map(x => x[2]));
	if (!!matchesStore) res = res.concat(mixIdsStore);
	return res.distinct();
}


/** Получает URI ко всем <Include> */
export function getIncludePaths(text: string): string[]
{
	let res: string[] = [];
	let reg = /<Include[\s\S]*?FileName=(("[^"]+")|('[^']+'))/;
	let txt = text;
	txt = Encoding.clearXMLComments(txt);
	res = txt.matchAll(reg).map(x => x[1].replace(/(^["'"])|(['"]$)/g, '')).filter(x => pathExists(x)).map(x => uriFromName(x));
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