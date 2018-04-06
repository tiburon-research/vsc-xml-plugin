'use strict';

import * as vscode from 'vscode';
import * as XML from './documentFunctions'
import * as clipboard from "clipboardy"
import * as fs from 'fs'
import * as os from 'os'
import { bot, $ } from './extension'
import { JSDOM } from '../node_modules/jsdom'
import * as _JQuery from 'jquery'




//#region ---------------------------------------- Classes, Structs, Namespaces, Enums, Consts, Interfaces


/** Тип сборки */
export const _pack: ("debug" | "release") = "debug";

/** RegExp для XML тегов, которые могут содержать C# */
export const _AllowCodeTags = "(Filter)|(Redirect)|(Validate)|(Methods)";
/** RegExp для HTML тегов, которые не нужно закрывать */
export const _SelfClosedTags = "(area)|(base)|(br)|(col)|(embed)|(hr)|(img)|(input)|(keygen)|(link)|(menuitem)|(meta)|(param)|(source)|(track)|(wbr)";

export enum Language { XML, CSharp, CSS, JS, PlainTetx };



/**
 * @param From Включаемая граница
 * @param To Не влючамая граница
*/
export interface TextRange
{
    From: number;
    To: number;
    Length?: number;
}


/** interface для удобства использования: включает родные и новые свойства */
export interface TibJQuery extends Function
{
    // стандартные свойства и методы JQUery

    html: Function;
    fn: {
        /** получает XML, годный для просмотра */
        xml: Function,
        /** изменённая */
        text: Function,
        /** стандартная функция text() */
        textOriginal: Function,
        /** получение текста внутри CDATA */
        CDATAtext: Function
    };

    // добавленные свойства и методы

    /** данные закодированного XML */
    SurveyData: DOMSurveyData;
    /**
     * создаёт создаёт родительский объект (DOM)
     * @param isInitial является ли объект корнем (документом). По умолчанию - `true`
    */
    XMLDOM: (el: string, isInitial?: boolean) => any,
    /** стандартная функция получения объекта из XML */
    parseXML: Function,
    /** создаёт JQuery-объект из XML, предварительно сделав его безопасным */
    XML: (text: string) => any
}


export interface XMLencodeResult
{
    EncodedCollection: KeyedCollection<string>;
    Delimiter: string;
}


/** Результат кодирования */
export class EncodeResult
{
    Result: string;
    EncodedCollection = new KeyedCollection<string>();
    Delimiter: string = null;

    toXMLencodeResult(): XMLencodeResult
    {
        return { Delimiter: this.Delimiter, EncodedCollection: this.EncodedCollection };
    }
}


/** результат преобразования к безопасному XML */
export interface EncodedXML
{
    Result: string;
    CSCollection: XMLencodeResult;
    CDATACollection: XMLencodeResult;
}


export class DOMSurveyData
{
    Delimiter: string = null;
    CSCollection: XMLencodeResult = null;
    CDATACollection: XMLencodeResult = null;
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
        let $dom = $.XMLDOM(text);
        let $fromItems = $dom.find(from);
        if ($fromItems.length == 0) return text;
        $fromItems.map(function ()
        {
            let $el = $(this);
            let $newEl = $.XML("<" + to + "></" + to + ">");
            $newEl.attr('Id', $el.attr('Id'));
            let txt;
            let $text = $el.find('Text');
            if ($text.length > 0)
                txt = $text.text();
            else if (typeof $text.attr('Text') !== typeof undefined)
                txt = $text.attr('Text');
            $.XML('<Text></Text>').text(txt).appendTo($newEl);
            $el.replaceWith($newEl);
        });
        return $dom.xml();
    }

}


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

    /** Добавляет или заменяет */
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

    /** массив ключей */
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

    /** массив значений */
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

    /** обход элементов */
    public forEach(callback: (key: string, val: T) => any)
    {
        for (var key in this.items)
            callback(key, this.Item(key));
    }

    /** 
     * преобразует набор 
     * @param clearNull очищать ли поп проверке (!!element)
    */
    public Select(filter: (key: string, value: T) => any, clearNull = false): any[]
    {
        let res = [];
        this.forEach((key, value) =>
        {
            let item = filter(key, value);
            if (!clearNull || !!item) res.push(item);
        });
        return res;
    }

    /** Фильтрует набор */
    public Filter(filter: (key: string, value: T) => boolean): T[]
    {
        let res = [];
        this.forEach((key, value) =>
        {
            if (filter(key, value)) res.push(value);
        });
        return res;
    }

    /** Обновляет значение элемента по ключу */
    public UpdateValue(key: string, transform: (value: T) => T): void
    {
        this.AddPair(key, transform(this.Item(key)));
    }

}


export class TibAutoCompleteItem 
{
    Name: string;
    /** тип объекта (vscode.CompletionItemKind) */
    Kind;
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
        let kind: keyof typeof vscode.CompletionItemKind = this.Kind;
        let item = new vscode.CompletionItem(this.Name, vscode.CompletionItemKind[kind]);
        if (addBracket && (this.Kind == "Function" || this.Kind == "Method")) item.insertText = new vscode.SnippetString(this.Name + "($1)");
        let mds = new vscode.MarkdownString();
        if (this.Description) mds.value = this.Description;
        else if (this.Documentation) mds.value = this.Documentation;
        item.documentation = mds;
        if (sortString) item.sortText = sortString;
        if (this.Detail) item.detail = this.Detail;
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
    /** значение по умолчанию (если не задано) */
    Default = null;
    /** Значение, подставляемое автоматически при вставке атрибута */
    Auto = "";
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
    Result: "";

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
        doc += "\nПоддержка кодовых вставок: `" + (this.AllowCode ? "да" : "нет") + "`";
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


export class TibMethod
{
    Name: string = "";
    Signature: string = "";
    Location: vscode.Range;
    Uri: vscode.Uri;
    IsFunction: boolean;
    Type: string;

    constructor(name: string, sign: string, location: vscode.Range, uri: vscode.Uri, isFunction: boolean = false, type: string = "")
    {
        this.Name = name;
        this.Signature = sign;
        this.Location = location;
        this.Type = type;
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
        if (this.Type) item.detail = this.Type;
        item.documentation = mds;
        return item;
    }

    ToHoverItem()
    {
        return { language: "csharp", value: this.Signature };
    }

    ToSignatureInformation()
    {
        return new vscode.SignatureInformation(this.Name, new vscode.MarkdownString(this.Signature));
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

    SignatureArray(word: string)
    {
        return this.Values().map(function (e)
        {
            if (e.Name == word) return e.ToSignatureInformation();
        }).filter(x => !!x);
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
    /** отличается ПОКА только для Item - в зависимости от родителя */
    Id: string = "";
    Attributes: Array<InlineAttribute> = [];
    Body: string = "";
    /** закрыт не тег, просто есть вторая скобка <Page...> */
    OpenTagIsClosed: boolean = false;
    Parents: Array<string> = [];
    LastParent: string = "";
    CSMode: boolean = false;
    /** $Method() */
    CSSingle: boolean = false;
    /** [c#]Method();[/c#] */
    CSInline: boolean = false;
    Position: vscode.Position;
    /** "body$ */
    InString: boolean = false;
    /** "body1 [c#]Method("str$ */
    InCSString: boolean = false;

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
        var mt = str.match(/\s*(\w+)=(("([^"]+)?")|(('([^']+)?')))\s*/g);
        var res: KeyedCollection<string> = new KeyedCollection<string>();
        if (mt)
        {
            mt.forEach(element =>
            {
                var parse = element.match(/\s*(\w+)=(("([^"]+)?")|(('([^']+)?')))\s*/);
                if (parse) res.AddPair(parse[1], parse[2]);
            });
        }
        return res;
    }

    getLaguage(): Language
    {
        if (this.CSMode) return Language.CSharp; // так быстрее
        return TagInfo.getTagLanguage(this.Name);
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


/** 
 * Собирает данные для первого встреченного <тега> на новой строке
 */
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
                this.HasCDATA = !!text.slice(this.Body.From, this.Body.To).match(/^\s*<!\[CDATA\[/);
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
            case "endtext":
            case "header":
            case "holder":
            case "value":
            case "label":
            case "var":
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
    /** Валидация: получилось ли распарсить */
    public Found: boolean = false;
    public Closed: boolean;
    public SelfClosed: boolean = false;
    public Language: Language;
    /** от начала строки открывающегося до конца строки закрывающегося */
    public FullLines: TextRange;
    public Multiline: boolean;
    /** если всё содержимое обёрнуто */
    public HasCDATA: boolean = false;
}


export class SnippetObject
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


export class LogData 
{
    /**
     * Данные для сохранения лога
     * @param data.FileName имя файла в котором произошла ошибка
     * @param data.Position позиция на которой произошла ошибка
     * @param data.FullText полный текст файла на момент ошибки
     */
    constructor(data: Object)
    {
        for (let key in data)
            this[key] = data[key];
        this.UserName = getUserName();
    }

    /** добавляет элемент в отчёт */
    public add(name: string, value: any): void
    {
        this[name] = value;
    }

    /** преобразует все данные в строку */
    public toString(): string
    {
        let res = "";
        for (let key in this)
            if (key != "FullText" && {}.toString.call(this[key]) !== '[object Function]')
            {
                res += key + ": " + JSON.stringify(this[key]) + "\r\n";
            }
        if (!!this.FullText)
        {
            res += "______________ TEXT START _______________\r\n"
            res += this.FullText;
            res += "\r\n______________ TEXT END _______________\r\n"
        }
        return res;
    }

    private UserName: string;
    private FileName: string;
    private FullText: string;
    private Postion: vscode.Position;

}



class TelegramResult
{
    constructor(data?: string)
    {
        if (!!data) this.update(data);
    }

    /** добавление/обновлени данных */
    public update(data: string)
    {
        let obj = JSON.parse(data);
        if (!obj) return;
        for (let key in obj)
            this[key] = obj[key];
    }

    public ok: boolean = false;
    public result: Object = {};
}


export class TelegramBot
{
    constructor(botToken: string, callback?: (active: boolean) => any)
    {
        this.http = require('https');
        this.token = botToken;
        this.check().then(res =>
        {
            this.active = res;
            callback(this.active);
        }).catch(res =>
        {
            this.active = false;
            callback(this.active);
        });
    }

    public check(): Promise<boolean>
    {
        return new Promise<boolean>((resolve, reject) =>
        {
            this.request('getMe').then(res =>
            {
                resolve(res.ok);
            }).catch(res =>
            {
                reject(false);
            })
        })
    }

    public sendLog(text: string): void
    {
        this.sendMessage(this.logId, text);
    }

    public sendMessage(user: string, text: string): void
    {
        if (this.active)
        {
            let params = new KeyedCollection<string>();
            params.AddPair('chat_id', user);
            params.AddPair('text', text);
            params.AddPair('parse_mode', 'Markdown');
            params.AddPair('disable_web_page_preview', 'true');
            this.request('sendMessage', params).catch(res =>
            {
                showError("Ошибка при отправке сообщения");
            })
        }
    }

    private request(method: string, args?: KeyedCollection<string>): Promise<TelegramResult>
    {
        let result = new TelegramResult();
        return new Promise<TelegramResult>((resolve, reject) =>
        {
            try
            {
                let url = this.buildURL(method, args);
                this.http.get(url, (res) =>
                {
                    res.setEncoding("utf8");
                    let body = "";
                    res.on("data", data =>
                    {
                        body += data;
                    });
                    res.on("end", () =>
                    {
                        result.update(body);
                        if (!result.ok)
                        {
                            reject(result);
                        }
                        else resolve(result);
                    });
                }).on('error', (e) =>
                {
                    reject(result);
                    showError("Ошибка при отправке отчёта об ошибке =)");
                });
            }
            catch (error)
            {
                reject(result);
                showError("Ошибка обработки запроса");
            }
        });
    }

    /** url для запроса */
    private buildURL(method: string, args?: KeyedCollection<string>): string
    {
        let res = this.host + "bot" + this.token + "/" + method;
        if (!args || args.Count() == 0) return res;
        let params = [];
        args.forEach((key, value) =>
        {
            params.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        });
        res += "?" + params.join('&');
        return res;
    }

    private host = "https://api.telegram.org/";
    private token: string;
    private http;
    /** прошла ли инициализация */
    public active = false;
    public logId: string;
    public groupId: string;
}


//#endregion





//#region ---------------------------------------- Functions 




export function isScriptLanguage(lang: Language): boolean
{
    return lang == Language.CSharp || lang == Language.JS || lang == Language.CSS;
}


export function logString(a)
{
    console.log("'" + a + "'");
}



/** Выводит сообщение об ошибке */
export function showError(text: string)
{
    vscode.window.showErrorMessage(text);
}


export function showWarning(text: string)
{
    vscode.window.showWarningMessage(text);
}


/** возвращает минимальное неотрицательное или null, если нет таких */
export function positiveMin(a, b)
{
    if (a < 0)
        if (b < 0) return null;
        else return b;
    else
        if (b < 0) return a;
        else return Math.min(a, b);
}


/** записывает данные в буфер обмена */
export function copyToCB(text: string)
{
    clipboard.writeSync(text);
}


/** получает данные из буфера обмена */
export function getFromClioboard(): string
{
    return clipboard.readSync();
}


export function statusMessage(text: string, after: number | Thenable<any>): void
{
    var num: number;
    var th: Thenable<any>;
    if (typeof after == "number")
    {
        num = after;
        vscode.window.setStatusBarMessage(text, num);
    }
    else 
    {
        th = after;
        vscode.window.setStatusBarMessage(text, th);
    }
}


/** преобразует стандартый Snippet в CompletionItem */
export function snippetToCompletitionItem(obj: Object): vscode.CompletionItem
{
    let snip = new SnippetObject(obj);
    let ci = new vscode.CompletionItem(snip.prefix, vscode.CompletionItemKind.Snippet);
    ci.detail = snip.description;
    ci.insertText = new vscode.SnippetString(snip.body);
    vscode.MarkdownString
    return ci;
}


/** проверяет наличие файла/папки */
export function pathExists(path: string): boolean
{
    return fs.existsSync(path);
}


/** Возвращаетмя пользователя */
export function getUserName()
{
    return os.userInfo().username;
}


/** создаёт папку */
export function createDir(path: string)
{
    fs.mkdirSync(path);
}


/** кодирование строки в безопасные символы */
export function safeEncode(txt: string, replacement = "_"): string
{
    let buf = new Buffer(txt, 'binary');
    return buf.toString('base64').replace(/[^\w\-]/g, replacement);
}


/** 
 * Создаёт лог об ошибке 
 * @param text Текст ошибки
 * @param data Данные для лога
 * @param path Путь для сохранения файла
 */
export function saveError(text: string, data: LogData, path: string)
{
    if (!pathExists(path))
    {
        sendLogMessage("Path was not found!");
        return;
    }
    // генерируем имя файла из текста ошибки и сохраняем в папке с именем пользователя
    let hash = "" + safeEncode(text);
    let dir = path + (!!path.match(/[\\\/]$/) ? "" : "\\") + getUserName();
    if (!pathExists(dir)) createDir(dir);
    let filename = dir + "\\" + hash + ".log";
    if (pathExists(filename)) return;
    data.add("ErrorMessage", text);
    fs.writeFile(filename, data.toString(), (err) =>
    {
        if (!!err) sendLogMessage(JSON.stringify(err));
        sendLogMessage("Добавлена ошибка:\n`" + text + "`\n\nПуть:\n`" + filename + "`");
    });
}


export function sendLogMessage(text: string)
{
    bot.sendLog(text);
}


/** Подготовленная для RegExp строка */
export function safeString(text: string): string
{
    return text.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}


/** возвращает JQuery, модернизированный под XML */
export function initJQuery(): TibJQuery
{
    let $dom; // JQuery для работы требуется объект window
    const dom = new JSDOM("<Root></Root>"); // нормальный объект DOM
    //console.log(dom.window.document.documentElement.innerHTML);
    let JQuery: TibJQuery = _JQuery(dom.window);

    // инициализируем пустой
    JQuery.SurveyData = new DOMSurveyData();

    // преобразуем селекторы при вызове методов
    for (let key in JQuery)
    {
        if (typeof JQuery[key] == "function")
        {
            // изменяем входные параметры
            let f = JQuery[key];
            JQuery[key] = function (...params)
            {
                let sParams = safeParams(params);
                return f.apply(this, sParams);
            }
            // сохраняем свойства объекта
            Object.assign(JQuery[key], f);
        }
    }

    JQuery.XMLDOM = function (el: string, isInitial = true)
    {
        let res = XML.htmlToXml(el);
        if (isInitial)
        {
            JQuery.SurveyData.CDATACollection = res.CDATACollection;
            JQuery.SurveyData.CSCollection = res.CSCollection;
        }
        return JQuery(JQuery.parseXML('<Root>' + res.Result + '</Root>')).find('Root');
    }

    JQuery.XML = function (el: string)
    {
        return JQuery.XMLDOM(el, false).children();
    }

    JQuery.fn.xml = function (formatFunction?: (text: string) => Promise<string>): string
    {
        let el = JQuery(this[0]);
        let res = el.html();
        res = XML.xmlToHtml({
            Result: res,
            CSCollection: JQuery.SurveyData.CSCollection,
            CDATACollection: JQuery.SurveyData.CDATACollection
        });
        return res;
    }

    // тескт CDATA
    JQuery.fn.CDATAtext = function (...params)
    {
        let el = JQuery(this[0]);
        let id = el.attr(JQuery.SurveyData.CDATACollection.Delimiter);
        if (!params || params.length == 0) // получение
        {
            let text = JQuery.SurveyData.CDATACollection.EncodedCollection.Item(id);
            if (!!text) text = text.replace(/<!\[CDATA\[([\s\S]*)\]\]>/, "$1");
            return text;
        }
        else // замена
        {
            let space = params[0].indexOf('\n') > 0 ? "\n" : " ";
            let pure = "<![CDATA[" + space + params[0] + space + "]]>";
            JQuery.SurveyData.CDATACollection.EncodedCollection.AddPair(id, pure);
            return this;
        }
    }

    // переписываем функцию получения текста
    JQuery.fn.textOriginal = JQuery.fn.text;
    let newText = function (...params)
    {
        let el = JQuery(this[0]);
        if (this[0].tagName == "CDATA") // для CDATA своя функция
        {
            return el.CDATAtext.apply(this, params);
        }
        let res;
        if (!params || params.length == 0) // если запрос, то возвращаем xmlToHtml
        {
            res = XML.xmlToHtml({
                Result: el.textOriginal(),
                CSCollection: JQuery.SurveyData.CSCollection,
                CDATACollection: JQuery.SurveyData.CDATACollection
            });
        }
        else // если задаём текст, то как обычно
        {
            res = el.textOriginal.apply(this, params);
        }
        return res;
    }
    Object.assign(newText, JQuery.fn.textOriginal);
    JQuery.fn.text = newText;

    return JQuery;
}


/** преобразует селектор для XML */
function safeSelector(selector: string): string
{
    let safeSel = selector;
    safeSel = safeSel.replace(/#([a-zA-Z0-9_\-@\)\(]+)/, '[Id="$1"]');
    return safeSel;
}


/** преобразует строковые параметры $ для XML */
function safeParams(params: any[]): any[]
{
    return params.map(s => (typeof s == "string") ? safeSelector(s) : s);
}




//#endregion