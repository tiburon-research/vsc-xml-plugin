'use strict';

import * as vscode from 'vscode';
import * as XML from './documentFunctions'

// -------------------- классы


export const _AllowCodeTags = "(Filter)|(Redirect)|(Validate)|(Methods)"; // XML теги, которые могут содержать c#

export enum Language { XML, CSharp, CSS, JS, PlainTetx };

export class KeyedCollection<T>
{
    protected items: { [index: string]: T } = {};
    private count: number = 0;

    constructor()
    {

    }

    public Contains(key: string): boolean
    {
        return this.items.hasOwnProperty(key);
    }

    public Count(): number
    {
        return this.count;
    }

    public AddPair(key: string, value: T)
    {
        if (!this.items.hasOwnProperty(key))
            this.count++;

        this.items[key] = value;
    }

    public Remove(key: string): T
    {
        var val = this.items[key];
        delete this.items[key];
        this.count--;
        return val;
    }

    public Item(key: string): T
    {
        return this.items[key];
    }

    public Keys(): string[]
    {
        var keySet: string[] = [];

        for (var prop in this.items)
        {
            if (this.items.hasOwnProperty(prop))
            {
                keySet.push(prop);
            }
        }

        return keySet;
    }

    public Values(): T[]
    {
        var values: T[] = [];

        for (var prop in this.items)
        {
            if (this.items.hasOwnProperty(prop))
            {
                values.push(this.items[prop]);
            }
        }

        return values;
    }

    public Clear(): void
    {
        this.items = {};
        this.count = 0;
    }

    public forEach(callback)
    {
        for (var key in this.items)
            callback(key, this.Item(key));
    }
}


/*
    для классов TibAutoCompleteItem и TibAttribute:
    Detail - краткое описание (появляется в редакторе в той же строчке)
    Description - подробное описание (появляется при клике на i (зависит от настроек))
    Documentation - кусок кода, сигнатура (показывается при наведении)
*/

export class TibAutoCompleteItem 
{
    Name: string;
    Kind;
    Detail: string = "";
    Description: string = "";
    Documentation: string = "";
    Parent: string = "";
    Overloads = [];
    ParentTag: string = "";

    constructor(obj: Object)
    {
        for (let key in obj)
            this[key] = obj[key];
    }

    ToCompletionItem(addBracket: boolean = false)
    {
        var kind: keyof typeof vscode.CompletionItemKind = this.Kind;
        var item = new vscode.CompletionItem(this.Name, vscode.CompletionItemKind[kind]);
        if (addBracket && (this.Kind == "Function" || this.Kind == "Method")) item.insertText = new vscode.SnippetString(this.Name + "($1)");
        if (this.Name == "GetInstance") console.log(item.insertText);
        var mds = new vscode.MarkdownString();
        if (this.Description) mds.value = this.Description;
        else mds.value = this.Documentation;
        item.documentation = mds;
        item.detail = this.Detail;
        return item;
    }

    ToSignatureInformation()
    {
        return new vscode.SignatureInformation(this.Documentation, new vscode.MarkdownString(this.Description));
    }
}


export class TibAttribute
{
    Name: string = "";
    Type: string = "";
    Default = null; // значение по умолчанию (если не задано)
    Auto = ""; // значение, подставляемое автоматически при вставке атрибута
    AllowCode: boolean = false;
    Detail: string = "";
    Description: string = "";
    Documentation: string = "";
    Values: Array<string> = [];
    Result: ""; // callback: string[]

    constructor(obj: Object)
    {
        for (let key in obj)
            this[key] = obj[key];
    }

    ToCompletionItem(callback): vscode.CompletionItem
    {
        var item = new vscode.CompletionItem(this.Name, vscode.CompletionItemKind.Property);
        var snip = this.Name + '="';
        var valAr: string[];
        var auto = this.AutoValue();
        if (!auto)
        {
            valAr = this.ValueCompletitions(callback);
            if (valAr.length > 0) snip += "${1|" + valAr.join(",") + "|}";
            else snip += "$1";
        }
        else snip += auto;
        snip += '"';
        var res = new vscode.SnippetString(snip);
        item.insertText = res;
        item.detail = (this.Detail ? this.Detail : this.Name) + (this.Type ? (" (" + this.Type + ")") : "");
        var doc = "";
        if (this.Default) doc += "Значение по умолчанию: `" + this.Default + "`";
        doc += "\nПоддержка кадовых вставок: `" + (this.AllowCode ? "да" : "нет") + "`";
        item.documentation = new vscode.MarkdownString(doc);
        return item;
    }

    ValueCompletitions(callback): string[]
    {
        var vals = "";
        if (this.Values && this.Values.length) vals = JSON.stringify(this.Values);
        else if (!!this.Result) vals = this.Result;
        var res: string[] = callback(vals);
        if (!res) res = [];
        return res;
    }

    AutoValue()
    {
        if (this.Auto) return this.Auto;
        if (this.Type == "Boolean") return "true";
    }
}


export class TibMethod
{
    Name: string = "";
    Signature: string = "";
    Location: vscode.Range;
    Uri: vscode.Uri;
    IsFunction: boolean;

    constructor(name: string, sign: string, location: vscode.Range, uri: vscode.Uri, isFunction: boolean = false, fullString: string = "")
    {
        this.Name = name;
        this.Signature = sign;
        this.Location = location;
        this.Uri = uri;
        this.IsFunction = isFunction;
    }

    public GetLocation(): vscode.Location
    {
        return new vscode.Location(this.Uri, this.Location)
    }

    ToCompletionItem()
    {
        var item = new vscode.CompletionItem(this.Name, vscode.CompletionItemKind.Function);
        if (this.IsFunction) item.insertText = new vscode.SnippetString(this.Name + "($1)");
        var mds = new vscode.MarkdownString();
        mds.value = this.Signature;
        item.documentation = mds;
        return item;
    }

    ToHoverItem()
    {
        return { language: "csharp", value: this.Signature };
    }
}


export class TibMethods extends KeyedCollection<TibMethod>
{
    constructor()
    {
        super();
    }

    public Add(item: TibMethod)
    {
        if (!this.Contains(item.Name)) this.AddPair(item.Name, item);
    }

    CompletionArray(): vscode.CompletionItem[]
    {
        return this.Values().map(function (e)
        {
            return e.ToCompletionItem();
        });
    }

    HoverArray(word: string): any[]
    {
        return this.Values().map(function (e)
        {
            if (e.Name == word) return e.ToHoverItem();
        });
    }
}


export class InlineAttribute
{
    Name: string = "";
    Value: string = "";
    Text: string = "";

    constructor(name: string, value)
    {
        this.Name = name;
        this.Value = value as string;
        this.Text = name + "=\"" + value + "\"";
    }
}


export class CurrentTag
{
    Name: string = "";
    Id: string = ""; // отличается ПОКА только для Item - в зависимости от родителя
    Attributes: Array<InlineAttribute> = [];
    Body: string = "";
    Closed: boolean = false; // закрыт не тег, просто есть вторая скобка <Page...>
    Parents: Array<string> = [];
    LastParent: string = "";
    CSMode: boolean = false;
    CSSingle: boolean = false; //$Method()
    CSInline: boolean = false; //[c#]Method();[/c#]
    Position: vscode.Position;
    InString: boolean = false; // "body$
    InCSString: boolean = false; // "body1 [c#]Method("str$

    constructor(name: string)
    {
        this.Name = name;
        this.Id = name;
    }

    attributeNames()
    {
        return this.Attributes.map(function (e)
        {
            return e.Name;
        });
    }

    setAttributes(str: string)
    {
        var attrs = CurrentTag.getAttributesArray(str);
        var parent = this;
        attrs.forEach(function (key, val)
        {
            parent.Attributes.push(new InlineAttribute(key, val));
        });
    }

    static getAttributesArray(str: string): KeyedCollection<string>
    {
        var mt = str.match(/\s*([\w\d]+)=(("([^"]+)?")|(('([^']+)?')))\s*/g);
        var res: KeyedCollection<string> = new KeyedCollection<string>();
        if (mt)
        {
            mt.forEach(element =>
            {
                var parse = element.match(/\s*([\w\d]+)=(("([^"]+)?")|(('([^']+)?')))\s*/);
                if (parse) res.AddPair(parse[1], parse[2]);
            });
        }
        return res;
    }
}


export class SurveyNode
{
    constructor(type: string, id: string, pos: vscode.Position)
    {
        this.Id = id;
        this.Type = type;
        this.Position = pos;
    }

    Id: string = "";
    Type: string = "";
    Position: vscode.Position;

    GetLocation(uri: vscode.Uri): vscode.Location
    {
        return new vscode.Location(uri, this.Position);
    }
}


export class SurveyNodes extends KeyedCollection<SurveyNode[]>
{
    constructor()
    {
        super();
    }

    Add(item: SurveyNode)
    {
        if (!this.Contains(item.Type))
            this.AddPair(item.Type, [item]);
        else if (this.Item(item.Type).findIndex(x => x.Id == item.Id)) this.Item(item.Type).push(item);
    }

    GetIds(type: string): string[]
    {
        return this.Item(type).map(function (e)
        {
            return e.Id;
        });
    }

    GetItem(id: string, type?: string): SurveyNode
    {
        var nodes = this.Item(type);
        var res: SurveyNode;
        for (let i = 0; i < nodes.length; i++)
        {
            if (nodes[i].Id == id)
            {
                res = nodes[i];
                break;
            }
        };
        return res;
    }

    Clear(names?: string[])
    {
        if (!names) super.Clear();
        else
            names.forEach(element =>
            {
                this.items[element] = [];
            });
    }

    CompletitionItems(name: string, closeQt: string = ""): vscode.CompletionItem[]
    {
        var res: vscode.CompletionItem[] = [];
        this.Item(name).forEach(element =>
        {
            var ci = new vscode.CompletionItem(element.Id, vscode.CompletionItemKind.Enum);
            ci.detail = name;
            ci.insertText = new vscode.SnippetString(element.Id + closeQt);
            res.push(ci);
        });
        return res;
    }

}



export namespace TibTransform
{

    export function AnswersToItems(text: string): string
    {
        return TransformElement(text, "Answer", "Item");
    }

    export function ItemsToAnswers(text: string): string
    {
        return TransformElement(text, "Item", "Answer");
    }

    function TransformElement(text: string, from: string, to: string): string
    {
        var ar = text.split("\n");
        var res = "";
        ar.forEach(element => 
        {
            var mt = element.match(new RegExp("(\\s*)<" + from + "\\s*([^\\/>]+)((\\/>)|(>([\\s\\S]+?)<\\/" + from + ".*>))"));
            if (!mt) res += element + "\n";
            else
            {
                if (mt[1]) res += mt[1];
                res += "<" + to;
                if (mt[2])
                {
                    var id = mt[2].match(/Id=["'][^"']+["']/);
                    if (id) res += " " + id[0];
                    var txt = mt[2].match(/Text=["'][^"']*["']/);
                    if (txt) res += " " + txt[0];
                }
                res += ">";
                if (mt[6])
                {
                    var txt = mt[6].match(/<Text[^>]*>.*<\/Text\s*>/);
                    if (txt) res += txt[0];
                }
                res += "</" + to + ">\n"
            }
        });
        return res.substr(0, res.length - 1);
    }

}


export class ExtensionSettings extends KeyedCollection<any>
{
    constructor()
    {
        super();
    }

    update(config: vscode.WorkspaceConfiguration): void
    {
        for (var key in config) this.AddPair(key.toString(), config[key]);
    }
}


export class ContextChange
{
    constructor(contextChange: vscode.TextDocumentContentChangeEvent, selection: vscode.Selection)
    {
        this.Change = contextChange;
        this.Selection = selection;
        this.Start = selection.start;
        this.End = selection.end;
        this.Active = selection.active;
    }

    Start: vscode.Position;
    End: vscode.Position;
    Active: vscode.Position;
    Change: vscode.TextDocumentContentChangeEvent;
    Selection: vscode.Selection;
}


export interface TextRange
{
    From: number;
    To: number;
    Length?: number;
}


// собирает данные для первого встреченного <тега> на новой строке
// To - позиция следующего символа
export class TagInfo
{
    constructor(text: string, offset: number = 0)
    {
        var mt = text.match(/(\n|^)[\t ]*<(\w+)/);
        if (!!mt)
        {
            this.Name = mt[2];
            let lineFrom = text.indexOf(mt[0]) + mt[1].length;
            let lineTo = text.length;
            this.Language = TagInfo.getTagLanguage(this.Name);
            let from = text.indexOf("<" + this.Name);
            let to = text.indexOf(">", from) + 1;
            // выделяем AllowCode fake
            this.IsAllowCodeTag = !!this.Name.match(new RegExp("^" + _AllowCodeTags + "$")) && !text.substr(to).match(/^([\s\n]*)*<\w/g);
            if (this.Language == Language.CSharp && !this.IsAllowCodeTag) this.Language = Language.XML;
            this.OpenTag = { From: from, To: to };
            let before = text.substr(0, this.OpenTag.From + 1);
            let newLine = text.indexOf("\n", to - 1);
            this.Multiline = newLine > -1;
            let openTag = text.slice(from, to);
            this.SelfClosed = !!openTag.match(/\/>$/);
            var clt = XML.findCloseTag("<", this.Name, ">", before, text);
            if (!this.SelfClosed && clt)
            {
                this.CloseTag = { From: clt.From, To: clt.To + 1 };
                this.Closed = true;
                this.Body = { From: to, To: clt.From };
                let after = text.indexOf("\n", this.CloseTag.To - 1);
                if (after > -1) lineTo = after;
                this.Multiline = this.Multiline && newLine < clt.To - 1;
            }
            else
            {
                this.Body = { From: to, To: (this.SelfClosed ? to : text.length) };
                this.Closed = this.SelfClosed;
                this.CloseTag = { From: this.Body.To, To: this.Body.To };
                lineTo = this.Body.To;
            }
            if (offset != 0)
            {
                lineTo += offset;
                lineFrom += offset;
                this.OpenTag = { From: this.OpenTag.From + offset, To: this.OpenTag.To + offset };
                if (this.Closed) this.CloseTag = { From: this.CloseTag.From + offset, To: this.CloseTag.To + offset };
                this.Body = { From: this.Body.From + offset, To: this.Body.To + offset };
            }
            this.FullLines = { From: lineFrom, To: lineTo };
            this.Found = true;
        }
    }


    public static getTagLanguage(tagName: string): Language
    {
        var res = Language.XML;

        if (tagName.match(new RegExp("^(" + _AllowCodeTags + ")$"))) return Language.CSharp;

        switch (tagName.toLocaleLowerCase())
        {
            case "script":
                res = Language.JS;
                break;

            case "style":
                res = Language.CSS;
                break;

            case "text":
            case "header":
            case "holder":
            case "value":
                res = Language.PlainTetx;
                break;

            default:
                res = Language.XML;
                break;
        }
        return res;
    }

    public OpenTag: TextRange;
    public CloseTag: TextRange;
    public Body: TextRange;
    public Name: string;
    public IsAllowCodeTag: boolean;
    public Found: boolean = false;
    public Closed: boolean;
    public SelfClosed: boolean = false;
    public Language: Language;
    public FullLines: TextRange;
    public Multiline: boolean;
}