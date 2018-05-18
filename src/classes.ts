'use strict';

import * as vscode from 'vscode';
import * as XML from './documentFunctions'
import * as clipboard from "clipboardy"
import * as fs from 'fs'
import * as os from 'os'
import { bot, $ } from './extension'



/* ---------------------------------------- Classes, Structs, Namespaces, Enums, Consts, Interfaces ----------------------------------------*/
//#region


/** Тип сборки */
export const _pack: ("debug" | "release") = "debug";


export enum Language { XML, CSharp, CSS, JS, PlainTetx, Inline };


/** Работают правильно, но медленно */
export const RegExpPatterns = {
    CDATA: /<!\[CDATA\[([\S\s]*?)\]\]>/,
    CDATALast: /<!\[CDATA\[[\S\s]*$/,
    XMLComment: /(<!--([\S\s]*?)-->\s*)+/,
    XMLLastComment: /<!--[\S\s]*$/,
    /** RegExp для XML тегов, которые могут содержать C# */
    AllowCodeTags: "(Filter)|(Redirect)|(Validate)|(Methods)",
    /** RegExp для HTML тегов, которые не нужно закрывать */
    SelfClosedTags: "(area)|(base)|(br)|(col)|(embed)|(hr)|(img)|(input)|(keygen)|(link)|(menuitem)|(meta)|(param)|(source)|(track)|(wbr)",
    InlineSpecial: "(repeat)|(place)",
    /** Набор символов разделителя замены */
    DelimiterContent: "[0-9][a-z][A-Z]",
    SingleAttribute: /\s*(\w+)=(("[^"]*")|(('[^']*')))\s*/,
    Attributes: /\s*(\w+)=(("[^"]*")|(('[^']*')))\s*/g,
    OpenTagFull: /^\s*<\w+(\s*(\w+)=(("[^"]*")|('[^']*'))\s*)*\s*\/?>/,
    FormattingHash: /(\s)|(<!\[CDATA\[)|(\]\]>)/g
}


/** Результат поиска в строке */
interface SearchResult
{
    Result: RegExpMatchArray;
    Index: number;
}


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

/** Результат поиска тегов */
export interface FindTagResult
{
    Range: TextRange;
    /** Самозакрывающийся тег */
    SelfClosed: boolean;
}

/** { `Delimiter`, `EncodedCollection` } */
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


/** Класс для множественного последовательного кодирования текста */
export class Encoder
{
    /** 
     * @param text исходный, который будет кодироваться 
     * @param delimiter разделитель или его длина
    */
    constructor(text: string, delimiter?: string | number)
    {
        this.OriginalText = text;
        this.Result = text;
        let del: string;
        if (!delimiter) del = XML.getReplaceDelimiter(text);
        else
        {
            if (typeof delimiter == "string") del = delimiter;
            else del = XML.getReplaceDelimiter(text, delimiter);
        }
        this.Delimiter = del;
    }

    /** Кодирование текущего результата указанной функцией `encodeFuntion` */
    public Encode(encodeFuntion: (text: string, delimiter: string) => EncodeResult): void
    {
        let tmpRes = encodeFuntion(this.Result, this.Delimiter);
        this.Result = tmpRes.Result;
        this.EncodedCollection.AddRange(tmpRes.EncodedCollection);
    }

    public ToEncodeResult(): EncodeResult
    {
        let res = new EncodeResult();
        res.EncodedCollection = this.EncodedCollection;
        res.Delimiter = this.Delimiter;
        res.Result = this.Result;
        return res;
    }

    /** Исходный текст */
    public readonly OriginalText: string;
    /** Разделитель для кодирования */
    public readonly Delimiter: string;
    /** Результат кодирования */
    public Result: string;
    /** Коллекция закодированных элементов */
    public readonly EncodedCollection = new KeyedCollection<string>();
}


export namespace TibDocumentEdits
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
            let id = $el.attr('Id');
            if (!!id) $newEl.attr('Id', id);
            let txt = "";
            let $text = $el.find('Text');
            if ($text.length > 0)
                txt = $text.text();
            else
            {
                let at = $el.attr('Text');
                if (!!at) txt = at;
            }
            let $nxml = $.XML('<Text></Text>');
            if (!!txt) $nxml.text(txt);
            $nxml.appendTo($newEl);
            $el.replaceWith($newEl);
        });

        return $dom.xml();
    }

    export function ToAgeList(text: string): string
    {
        let ageLimits = text.match(/\d+/g);

        let $dom = $.XMLDOM("<List></List>");
        let $list = $dom.find("List");
        $list.attr('Id', "ageList");

        for (let i = 0, length = ageLimits.length; i < length; i += 2)
        {
            let $item = $.XML("<Item></Item>");
            $item.attr("Id", i / 2 + 1);
            $item.attr("Var", ageLimits[i] + "," + ageLimits[i + 1]);
            $.XML('<Text></Text>').text(ageLimits[i] + "_" + ageLimits[i + 1]).appendTo($item);
            $item.appendTo($list);
        }

        return $dom.xml();
    }

    export function removeQuestionIds(text: string): string{
        let $dom = $.XMLDOM(text);
        let $question = $dom.find("Question");

        $question.map(function (){
 
            let $questionHeader = $(this).find("Header");
            let $headerText = $questionHeader.text();
            let $qIDValue = $(this).attr('Id');
           
            $qIDValue = $headerText.match($qIDValue+"\\.? ?");
            $headerText = $questionHeader.text().replace($qIDValue, "");
            $questionHeader.text($headerText);
        });

        return $dom.xml();
    }

    export function getVarCountFromList(list:string): number{

        let res = 0;
        let $dom = $.XMLDOM(list);
        let $item = $dom.find("Item").eq(0);        //берём только первый элемент, так как количество Var'ов должно быть одинаково у всех Item
        let $var = $item.find("Var");               //Ищем дочерний Var
        
        if($var.length > 0){        //<Var></Var>
            res = $var.length;
        }
        if(typeof $item.attr('Var') !== typeof undefined){      //Var=""
            res += $item.attr('Var').split(',').length;
        }

        return res;
    }

    export function sortListBy(list:string, attrName:string, attrIndex?:number): string{

        let $dom = $.XMLDOM(list);      //берём xml текст
        let $item = $dom.find("Item");  //ищём Item'ы

        $item.sort(function(item1,item2){       //сортируем массив DOM
            
            let el1,     //элементы для сравнения
                el2;

            if(attrIndex > 0){         //если есть индекс
                let attrValues =  $(item1).attr(attrName).split(',');       //берём у первого Item'а массив значений
                let attrLength = attrValues.length;
                
                if(attrIndex < attrLength){                          //проверка индекса на диапозон
                    el1 =  attrValues[attrIndex];                         //берём значение по индексу
                    el2 = $(item2).attr(attrName).split(',')[attrIndex];
                }else{
                    let child = $(item1).find(attrName);
                    let childLength = child.length;
                    el1 = child[attrIndex - attrLength];
                    el2 = $(item2).find(attrName).eq(attrIndex - attrLength);
                }               
            }else{
                if(typeof $item.attr(attrName) !== typeof undefined){       //проверка на атрибут
                    el1 = $(item1).attr(attrName);
                    el2 = $(item2).attr(attrName);
                }else if($item.find(attrName).length > 0){                  //проверка на дочерний тег
                    el1 = $(item1).find(attrName).eq(0).text();
                    el2 = $(item2).find(attrName).eq(0).text();
                }               
            }

            if(el1.match(/^\d+$/) && el2.match(/^\d+$/)){
                el1 = parseInt(el1);
                el2 = parseInt(el2);
            }

            if(el1 > el2){
                return 1;
            }
            if(el1 < el2){
                return -1;
            }

            return 0;
        });

        if($dom.find("List").length > 0){               //елси взят текст с List
            $item.appendTo($dom.find("List"));
        }else{
            $item.appendTo($dom);                       //если взят тескт только с Item'ами
        }

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
        let val = this.items[key];
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
        let keySet: string[] = [];

        for (let prop in this.items)
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
        let values: T[] = [];

        for (let prop in this.items)
        {
            if (this.items.hasOwnProperty(prop))
            {
                values.push(this.items[prop]);
            }
        }

        return values;
    }

    /** Очищает всю коллекцию */
    public Clear(): void
    {
        this.items = {};
        this.count = 0;
    }

    /** обход элементов */
    public forEach(callback: (key: string, val: T) => any)
    {
        for (let key in this.items)
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

    /** Добавляет диапазон значений */
    public AddRange(range: KeyedCollection<T>): void
    {
        range.forEach((key, value) =>
        {
            this.AddPair(key, value);
        })
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

    ToCompletionItem(callback: (query: string) => string[]): vscode.CompletionItem
    {
        let item = new vscode.CompletionItem(this.Name, vscode.CompletionItemKind.Property);
        let snip = this.Name + '="';
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
        let res = new vscode.SnippetString(snip);
        item.insertText = res;
        item.detail = (this.Detail ? this.Detail : this.Name) + (this.Type ? (" (" + this.Type + ")") : "");
        let doc = "";
        if (this.Default) doc += "Значение по умолчанию: `" + this.Default + "`";
        doc += "\nПоддержка кодовых вставок: `" + (this.AllowCode ? "да" : "нет") + "`";
        item.documentation = new vscode.MarkdownString(doc);
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
        let item = new vscode.CompletionItem(this.Name, vscode.CompletionItemKind.Function);
        if (this.IsFunction) item.insertText = new vscode.SnippetString(this.Name + "($1)");
        let mds = new vscode.MarkdownString();
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


/** Класс для получения информации по полному открывающемуся тегу
 * 
 * используется для родителей CurrentTag
 */
export class SimpleTag
{
    constructor(document: vscode.TextDocument, range: vscode.Range)
    {
        let raw = document.getText(range);
        let StartPosition = range.start.translate(0, raw.indexOf("<"));
        this.Raw = raw;
        let cl = this.Raw.find(RegExpPatterns.OpenTagFull);
        let from = document.offsetAt(range.start);
        if (cl.Index > -1)
            this.OpenTagRange = new vscode.Range(StartPosition, document.positionAt(from + cl.Result[0].length));
        else
            this.OpenTagRange = new vscode.Range(StartPosition, range.end);
        let res = raw.match(/<(\w+)(\W|$)/);
        if (!!res) this.Name = res[1];
    }

    public getAttributes(): KeyedCollection<string>
    {
        if (!!this.Attrs) return this.Attrs; // кеш :)
        let attrs = new KeyedCollection<string>();
        let res = this.Raw.match(/^\s*<(\w+)(\s+(\s*\w+=(("[^"]*")|('[^']*')))*)?\s*>?/);
        if (!!res && !!res[2]) attrs = CurrentTag.GetAttributesArray(res[2]);
        this.Attrs = attrs;
        return attrs;
    }

    /** Возвращает источник повтора для `Repeat` */
    public getRepeatSource(): string
    {
        if (this.Name != "Repeat") return null;
        let attrs = this.getAttributes();
        return ["List", "Length", "Range", "Source"].find(x => attrs.Contains(x));
    }

    /** Закрыт ли открывающий тег */
    public isClosed(): boolean
    {
        return !!this.Raw.match(RegExpPatterns.OpenTagFull);
    }

    public readonly Name: string;
    protected Attrs: KeyedCollection<string>;
    /** Позиция открывающего тега */
    //public readonly StartPosition: vscode.Position;
    public readonly OpenTagRange: vscode.Range;

    private readonly Raw: string; // хранение исходных данных
}

/** Поля для CurrentTag */
export interface CurrentTagFields
{
    PreviousText: string;
    //PreviousTextSafe: string;
    StartPosition?: vscode.Position;
    StartIndex?: number;
    OpenTagIsClosed?: boolean;
    LastParent?: SimpleTag;
    Body?: string;
    Parents?: SimpleTag[];
    OpenTagRange?: vscode.Range;
}


export class CurrentTag
{
    // -------------------- ПЕРЕМЕННЫЕ

    public Name: string = "";
    /** Идентификатор тега
     * - для `Item` - в зависимости от родителя 
     * - для `Repeat` - в зависимости от источника
    */
    public Id: string = null;
    public Attributes: Array<InlineAttribute> = [];
    public Body: string = null;
    /** Закрыт не тег, просто есть вторая скобка <Page...> */
    public OpenTagIsClosed = false;
    public Parents: Array<SimpleTag> = [];
    public LastParent: SimpleTag;
    /** Откуда начинается */
    //public StartPosition: vscode.Position;
    public StartIndex: number;
    public OpenTagRange: vscode.Range;
    /** Текст от начала документа до Position */
    public PreviousText = null;


    // -------------------- ТЕХНИЧЕСКОЕ

    /** Кеширование языка */
    private Language: Language;


    /** Задаёт атрибуты */
    private SetAttributes(attrs: KeyedCollection<string>)
    {
        this.Attributes = [];
        let parent = this;
        attrs.forEach(function (key, val)
        {
            parent.Attributes.push(new InlineAttribute(key, val));
        });
    }

    /** Обновление только самогО тега */
    private _update(tag: string | SimpleTag)
    {
        if (typeof tag == "string")
        {
            this.Name = tag;
            this.Id = tag;
        }
        else
        {
            this.Name = tag.Name;
            this.Id = tag.Name;
            this.SetAttributes(tag.getAttributes());
            this.OpenTagIsClosed = tag.isClosed();
            this.OpenTagRange = tag.OpenTagRange;

            // Id для Repeat
            if (this.Name == "Repeat")
            {
                let source = tag.getRepeatSource();
                if (!!source) this.Id == source + "Repeat";
            }
        }
    }

    /** Задаёт родителей */
    private _setParents(data: SimpleTag[] | CurrentTagFields)
    {
        let parents: SimpleTag[];
        if (Array.isArray(data)) parents = data;
        else
        {
            if (!data) return;
            parents = data.Parents;
        }
        this.Parents = parents;
        if (!!parents && parents.length > 0)
        {
            this.LastParent = parents.last();
            // Id для Item
            if (parents && this.Name == "Item") this.Id = parents.last().Name + "Item";
        }
    }

    /** Сброс закешированного */
    private _reset()
    {
        this.Language = null;
        this.LastParent = null;
    }



    // -------------------- МЕТОДЫ

    constructor(tag: string | SimpleTag, parents?: SimpleTag[])
    {
        this._update(tag);
        this._setParents(parents);
    }

    /** Подготавливает TibXML для поиска теги */
    public static PrepareXML(text: string): string
    {
        // замазываем комментарии
        let pure = XML.clearXMLComments(text);
        // удаление закрытых _AllowCodeTag из остатка кода (чтобы не искать <int>)
        pure = XML.clearCSContents(pure);
        return pure;
    }

    /** возвращает массив имён атрибутов */
    public AttributeNames()
    {
        return this.Attributes.map(function (e)
        {
            return e.Name;
        });
    }

    /** возвращает коллекцию атрибутов */
    public static GetAttributesArray(str: string): KeyedCollection<string>
    {
        let mt = str.match(RegExpPatterns.Attributes);
        let res: KeyedCollection<string> = new KeyedCollection<string>();
        if (mt)
        {
            let reg = new RegExp(RegExpPatterns.SingleAttribute);
            mt.forEach(element =>
            {
                let parse = element.match(reg);
                if (parse) res.AddPair(parse[1], parse[2].replace(/^('|")(.*)('|")$/, "$2"));
            });
        }
        return res;
    }

    /** Язык содержимого */
    public GetLaguage(): Language
    {
        if (this.Language) return this.Language; // так быстрее
        let tagLanguage: Language;
        // специальные $-вставки
        if (this.IsSpecial())
        {
            tagLanguage = Language.Inline;
        }
        else
            // по-любому C#
            if (this.CSSingle() || this.CSInline())
            {
                tagLanguage = Language.CSharp;
            }
            else
            {
                tagLanguage = TagInfo.getTagLanguage(this.Name);
                // проверка на Fake и закрывающий тег
                if (tagLanguage == Language.CSharp)
                {
                    if
                    (
                        !this.OpenTagIsClosed ||
                        !!this.Body && this.Body.match(/(<\/\w*$)|(^[\t ]+\r?\n)/)
                    )
                        tagLanguage = Language.XML;
                }
            }
        this.Language = tagLanguage;
        return tagLanguage;
    }


    /** [c#]Method() */
    public CSInline(): boolean
    {
        if (!this.PreviousText) return false;
        let lastc = this.PreviousText.lastIndexOf("[c#");
        if (lastc < 0) return false;
        let clC = this.PreviousText.indexOf("]", lastc);
        let lastcEnd = this.PreviousText.indexOf("[/c#", lastc);
        return lastc > 0 && clC > 0 && lastcEnd < 0;
    }


    /** $Method */
    public CSSingle()
    {
        return !!this.PreviousText && !!this.PreviousText.match("\\$((?!" + RegExpPatterns.InlineSpecial + ")(\\w+))$");
    }


    /** Курсор находится в строке */
    public InString(): boolean
    {
        if (!this.OpenTagIsClosed)
        {
            let rest = this.PreviousText.slice(this.StartIndex);
            rest = rest.replace(RegExpPatterns.Attributes, "");
            return !!rest.match(/(("[^"]*)|('[^']*))$/);
        }
        return !!this.Body && XML.inString(this.Body);
    }

    /** == Language.Inline. Но это только когда написано полностью */
    public IsSpecial()
    {
        return !!this.PreviousText && !!this.PreviousText.match("\\$(" + RegExpPatterns.InlineSpecial + ")$");
    }


    /** В строке внутри C# */
    public InCSString(): boolean
    {
        if (this.GetLaguage() == Language.CSharp)
        {
            if (this.CSSingle())
            {
                let rest = this.PreviousText.substr(this.PreviousText.lastIndexOf("$"));
                return XML.inString(rest);
            }
            else if (this.CSInline())
            {
                let rest = this.PreviousText.substr(this.PreviousText.lastIndexOf("[c#"));
                rest = rest.substr(rest.indexOf("]") + 1);
                return XML.inString(rest);
            }
            else return this.InString();
        }
    }


    /** Обновляет поля, если новые не undefined */
    public SetFields(fields: CurrentTagFields)
    {
        this._reset();
        if (!!fields.Parents && !!fields.LastParent) fields.LastParent = undefined;
        for (let key in fields)
        {
            switch (key)
            {
                case "Parents":
                    this._setParents(fields[key]);
                    break;
                default:
                    if (typeof fields[key] != 'undefined') this[key] = fields[key];
                    break;
            }
        }
    }


    /** Обновляет только текущий тег */
    public Update(tag: string | SimpleTag, fields: CurrentTagFields)
    {
        this._reset();
        this._update(tag);
        this.SetFields(fields);
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
        let nodes = this.Item(type);
        let res: SurveyNode;
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
        let res: vscode.CompletionItem[] = [];
        this.Item(name).forEach(element =>
        {
            let ci = new vscode.CompletionItem(element.Id, vscode.CompletionItemKind.Enum);
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
        for (let key in config) this.AddPair(key.toString(), config[key]);
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
        let mt = text.match(/(\n|^)[\t ]*<(\w+)/);
        if (!!mt)
        {
            this.Name = mt[2];
            let lineFrom = text.indexOf(mt[0]) + mt[1].length;
            let lineTo = text.length;
            this.Language = TagInfo.getTagLanguage(this.Name);
            let from = text.indexOf("<" + this.Name);
            let to = text.indexOf(">", from) + 1;
            // выделяем AllowCode fake
            this.IsAllowCodeTag = !!this.Name.match(new RegExp("^" + RegExpPatterns.AllowCodeTags + "$")) && !text.substr(to).match(/^([\s\n]*)*<\w/g);
            if (this.Language == Language.CSharp && !this.IsAllowCodeTag) this.Language = Language.XML;
            this.OpenTag = { From: from, To: to };
            let before = text.substr(0, this.OpenTag.From + 1);
            let newLine = text.indexOf("\n", to - 1);
            this.Multiline = newLine > -1;
            let openTag = text.slice(from, to);
            let clt = XML.findCloseTag("<", this.Name, ">", before, text);
            this.SelfClosed = !!clt && clt.SelfClosed;
            if (!!clt && !this.SelfClosed)
            {
                this.CloseTag = { From: clt.Range.From, To: clt.Range.To + 1 };
                this.Closed = true;
                this.Body = { From: to, To: clt.Range.From };
                this.HasCDATA = !!text.slice(this.Body.From, this.Body.To).match(/^\s*<!\[CDATA\[/);
                let after = text.indexOf("\n", this.CloseTag.To - 1);
                if (after > -1) lineTo = after;
                this.Multiline = this.Multiline && newLine < clt.Range.To - 1;
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


    /** Возвращает язык исходя только из имени тега */
    public static getTagLanguage(tagName: string): Language
    {
        let res = Language.XML;

        if (tagName.match(new RegExp("^(" + RegExpPatterns.AllowCodeTags + ")$"))) return Language.CSharp;

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
                    // комментируем пока Telegram не восстановят
                    //showError("Ошибка при отправке отчёта об ошибке =)");
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



export class CacheItem<T>
{
    private Value: T;

    public Set(item: T)
    {
        this.Value = item;
    }

    public Get(): T
    {
        return this.Value;
    }

    /** Очистка */
    public Remove()
    {
        this.Value = undefined;
    }

    /** Проверка на undefined */
    public IsSet()
    {
        return typeof this.Value !== 'undefined';
    }

}


//#endregion



/*---------------------------------------- Functions ----------------------------------------*/
//#region


export function isScriptLanguage(lang: Language): boolean
{
    return lang == Language.CSharp || lang == Language.JS || lang == Language.CSS;
}


export function logString(a?: string | number | boolean)
{
    let text = a;
    if (typeof text === typeof undefined) text = "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%";
    console.log("'" + text + "'");
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


/** 
 * возвращает минимальное неотрицательное или null, если нет таких 
 * @param negative значение, возвращаемое, если нет положительных
*/
export function positiveMin(a, b, negative: any = null)
{
    let neg = null;
    if (typeof negative !== typeof null) neg = negative;

    if (a < 0)
        if (b < 0) return neg;
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


export function statusMessage(text: string, after?: number | Thenable<any>): void
{
    if (typeof after == "number")
    {
        let num = after;
        vscode.window.setStatusBarMessage(text, num);
    }
    else if (after !== undefined)
    {
        let th = after;
        vscode.window.setStatusBarMessage(text, th);
    }
    else
    {
        vscode.window.setStatusBarMessage(text);
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
    if (!!bot && bot.active) bot.sendLog(text);
}


/** Подготовленная для RegExp строка */
export function safeString(text: string): string
{
    return text.replace(/[\|\\\{\}\(\)\[\]\^\$\+\*\?\.\/]/g, "\\$&");
}

/** Открытые файла в новом окне */
export function openFile(path: string): void
{

    vscode.workspace.openTextDocument(path).then(doc =>
    { // открываем демку (в памяти)
        let txt = doc.getText();
        vscode.workspace.openTextDocument({ language: "tib" }).then(newDoc =>
        { // создаём пустой tib-файл
            vscode.window.showTextDocument(newDoc).then(editor => 
            { // отображаем пустой
                editor.edit(builder => 
                { // заливаем в него демку
                    builder.insert(new vscode.Position(0, 0), txt)
                });
            });
        })
    });
}

function getAttr(path: string): void{


}


//#endregion




/*---------------------------------------- Расширения ----------------------------------------*/
//#region


declare global
{
    interface String
    {
        /** Продвинутый indexOf */
        find(search: string | RegExp): SearchResult;
        /** Продвинутый lastIndexOf string=Regexp */
        findLast(search: string): SearchResult;
    }

    interface Array<T>
    {
        /** Возвращает последний элемент */
        last(): T
    }
}

String.prototype.find = function (search: string | RegExp): SearchResult
{
    let res = this.match(search);
    let ind = !!res ? this.indexOf(res[0]) : -1;
    return { Index: ind, Result: res };
}

String.prototype.findLast = function (search: string): SearchResult
{
    let reg = this.match(new RegExp(search, "g"));
    let res = !!reg ? reg[reg.length - 1].match(search) : null;
    let ind = !!reg ? this.lastIndexOf(res) : -1;
    return { Index: ind, Result: res };
}


Array.prototype.last = function <T>(): T
{
    let res: T;
    if (this.length > 0) res = this[this.length - 1];
    return res;
}

//#endregion
