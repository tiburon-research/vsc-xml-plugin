'use strict';

import * as vscode from 'vscode';
import * as Encoding from './encoding'
import * as Parse from './parsing'
import * as clipboard from "clipboardy"
import * as fs from 'fs'
import * as os from 'os'
import { bot, $ } from './extension'
import * as shortHash from "short-hash"
import { RegExpPatterns } from './constants'


/* ---------------------------------------- Classes, Structs, Namespaces, Enums, Consts, Interfaces ----------------------------------------*/
//#region


export enum Language { XML, CSharp, CSS, JS, PlainTetx, Inline };


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

    export function RemoveQuestionIds(text: string): string
    {
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
            $item.appendTo($dom.find("List").html(''));
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
     * @param clearNull очищать ли по проверке (!!element)
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
    protected Filter(filter: (key: string, value: T) => boolean): KeyedCollection<T>
    {
        let res = new KeyedCollection<T>();
        this.forEach((key, value) =>
        {
            if (filter(key, value)) res.AddPair(key, value);
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
    public Name: string = "";
    public Signature: string = "";
    public IsFunction: boolean;
    public Type: string;
    public FileName: String;

    private Uri: vscode.Uri;
    private Location: vscode.Range;

    constructor(name: string, sign: string, location: vscode.Range, fileName: string, isFunction: boolean = false, type: string = "")
    {
        this.Name = name;
        this.Signature = sign;
        this.Location = location;
        this.Type = type;
        this.FileName = fileName;
        this.Uri = vscode.Uri.file(fileName);
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
    constructor(collection?: KeyedCollection<TibMethod>)
    {
        super();
        if (!!collection)
            collection.forEach((key, value) =>
            {
                this.Add(value);
            })    
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

    Filter(filter: (key: string, value: TibMethod) => boolean): TibMethods
    {
        return new TibMethods(super.Filter(filter));
    }
}


/** Текстовая структура для хранения Name/Value */
export class InlineAttribute
{
    Name: string = "";
    Value: string = "";
    /** Результирующая строка */
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
 * используется для родителей и инициализации CurrentTag
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


/** Самый главный класс */
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
            if (parents && this.Name == "Item")
            {
                let parName = "";
                // ищем нормального родителя
                for (let i = parents.length - 1; i >= 0 ; i--) 
                {
                    if (["Condition", "Repeat"].indexOf(parents[i].Name) < 0)
                    {
                        parName = parents[i].Name;
                        break;
                    }
                }
                this.Id = parName + "Item";
            }
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
        let pure = Encoding.clearXMLComments(text);
        // удаление закрытых _AllowCodeTag из остатка кода (чтобы не искать <int>)
        pure = Encoding.clearCSContents(pure);
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
        return !!this.Body && Parse.inString(this.Body);
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
                return Parse.inString(rest);
            }
            else if (this.CSInline())
            {
                let rest = this.PreviousText.substr(this.PreviousText.lastIndexOf("[c#"));
                rest = rest.substr(rest.indexOf("]") + 1);
                return Parse.inString(rest);
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


/** Информация об XML узле */
export class SurveyNode
{
    constructor(type: string, id: string, pos: vscode.Position, fileName: string)
    {
        this.Id = id;
        this.Type = type;
        this.Position = pos;
        this.FileName = fileName;
        this.Uri = vscode.Uri.file(fileName);
    }

    public Id: string = "";
    public Type: string = "";
    public Position: vscode.Position;
    public FileName: string;

    private Uri: vscode.Uri;

    GetLocation(): vscode.Location
    {
        return new vscode.Location(this.Uri, this.Position);
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
        if (!this.Contains(item.Type))
            this.AddPair(item.Type, [item]);
        else if (this.Item(item.Type).findIndex(x => x.Id == item.Id)) this.Item(item.Type).push(item);
    }


    /** Добавляет к нужным элементам, не заменяя */
    AddRange(range: KeyedCollection<SurveyNode[]>): void
    {
        range.forEach((key, value) =>
        {
            if (!this.Contains(key))
                this.AddPair(key, value);
            else this.UpdateValue(key, x => x.concat(value));
        })
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

    /** Фильтрует элементы */
    FilterNodes(filter: (node: SurveyNode) => boolean): SurveyNodes
    {
        let res = new SurveyNodes();
        this.forEach((key, value) =>
        {
            let nodes = value.filter(x => filter(x));
            if (nodes.length) res.AddPair(key, nodes);
        })
        return res;
    }

}


/** Настройки расширения */
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


/** Совмещённая структура ContentChangeEvent + Selection */
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


/** Собирает данные для первого встреченного <тега> на новой строке */
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
            let clt = Parse.findCloseTag("<", this.Name, ">", before, text);
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


/** Для преобразований Snippet -> CompletitionItem */
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

/** Данные для хранения логов */
export class LogData 
{
    /**
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


/** C# / JS / CSS */
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



/** Показывает сообщение об ошибке */
export function showError(text: string)
{
    vscode.window.showErrorMessage(text);
}


/** Показывает предупреждение */
export function showWarning(text: string)
{
    vscode.window.showWarningMessage(text);
}


/** возвращает минимальное неотрицательное или `negative` (= null), если нет таких */
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


/** 
 * Создаёт лог (файл) об ошибке 
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
    let hash = "" + shortHash(text);
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


function sendLogMessage(text: string)
{
    if (!!bot && bot.active) bot.sendLog(text);
}


/** Подготовленная для RegExp строка */
export function safeString(text: string): string
{
    return text.replace(/[\|\\\{\}\(\)\[\]\^\$\+\*\?\.\/]/g, "\\$&");
}


/** Открытие текста файла в новом окне */
export function openFileText(path: string): void
{
    vscode.workspace.openTextDocument(path).then(doc =>
    { // открываем файл (в памяти)
        let txt = doc.getText();
        vscode.workspace.openTextDocument({ language: "tib" }).then(newDoc =>
        { // создаём пустой tib-файл
            vscode.window.showTextDocument(newDoc).then(editor => 
            { // отображаем пустой
                editor.edit(builder => 
                { // заливаем в него текст
                    builder.insert(new vscode.Position(0, 0), txt)
                });
            });
        })
    });
}


/** Открыть ссылку */
function execute(link: string)
{
    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(link));
}


export function getDocumentMethods(document: vscode.TextDocument, Settings: ExtensionSettings): Promise<TibMethods>
{
    return new Promise<TibMethods>((resolve, reject) =>
    {
        let res = new TibMethods();
        let text = document.getText();
        if (Settings.Item("ignoreComments")) text = Encoding.clearXMLComments(text);
        let mtd = text.matchAll(/(<Methods)([^>]*>)([\s\S]*)(<\/Methods)/);
        if (mtd.length == 0)
        {
            resolve(res);
            return;
        }
        let reg = new RegExp(/((public)|(private)|(protected))(((\s*static)|(\s*readonly))*)?\s+([\w<>\[\],\s]+)\s+((\w+)\s*(\([^)]*\))?)/, "g");
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
            if (Settings.Item("ignoreComments")) str = Encoding.clearCSComments(str);
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
                    let rng = new vscode.Range(positionFrom, positionTo);
                    res.Add(new TibMethod(met[groups.Name], met[groups.Full].trim().replace(/\s{2,}/g, " "), rng, document.fileName, isFunc, met[groups.Type]));
                }
            });
        });
        resolve(res);
    });
}


export function getDocumentNodeIds(document: vscode.TextDocument, Settings: ExtensionSettings, NodeStoreNames: string[]): Promise<SurveyNodes>
{
    return new Promise<SurveyNodes>((resolve, reject) =>
    {
        let nNames = NodeStoreNames;
        let txt = document.getText();
        if (Settings.Item("ignoreComments")) txt = Encoding.clearXMLComments(txt);
        let reg = new RegExp("<((" + nNames.join(")|(") + "))[^>]+Id=(\"|')([^\"']+)(\"|')", "g");
        let idIndex = nNames.length + 3;
        let nodes = new SurveyNodes();
        let res = txt.matchAll(reg);
        res.forEach(element => 
        {
            let pos = document.positionAt(txt.indexOf(element[0]));
            let item = new SurveyNode(element[1], element[idIndex], pos, document.fileName);
            nodes.Add(item);
        });
        nodes.Add(new SurveyNode("Page", "pre_data", null, document.fileName));
        resolve(nodes);
    });
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
        //findLast(search: string): SearchResult;
        /** Поиск с группами по всему документу */
        matchAll(search: RegExp): RegExpMatchArray[];
        /** Замена, начиная с `from` длиной `subsr` символов (если string, то берётся длина строки) */
        replaceRange(from: number, substr: string | number, newValue: string): string;
    }

    interface Array<T>
    {
        /** Возвращает последний элемент */
        last(): T;
        /** Проверяет, что все элементы совпадают, независимо от порядка */
        equalsTo(ar: Array<T>): boolean;
        /** Возвращает массив уникальных значений */
        //distinct(): T[]
    }
  
}

String.prototype.find = function (search: string | RegExp): SearchResult
{
    let res = new RegExp(search).exec(this);
    let ind = !!res ? res.index : -1;
    return { Index: ind, Result: res };
}
/* 
String.prototype.findLast = function (search: string): SearchResult
{
    let reg = this.match(new RegExp(search, "g"));
    let res = !!reg ? reg[reg.length - 1].match(search) : null;
    let ind = !!reg ? this.lastIndexOf(res) : -1;
    return { Index: ind, Result: res };
} */

String.prototype.matchAll = function (search: RegExp): RegExpMatchArray[]
{
    let newText = this;
    let res: RegExpMatchArray[] = [];
    let mat = search.exec(this);
    while (!!mat)
    {
        newText = newText.replace(mat[0]);
        res.push(mat);
        mat = search.exec(newText);
    }
    return res;
}

String.prototype.replaceRange = function(from: number, substr: string | number, newValue: string): string
{
    let pre = (this as string).slice(0, from);
    let middle = newValue;
    let to = from + (typeof substr == "string" ? substr.length : substr);
    let after = (this as string).slice(to);
    return pre + middle + after;
}    


Array.prototype.last = function <T>(): T
{
    let res: T;
    if (this.length > 0) res = this[this.length - 1];
    return res;
}


Array.prototype.equalsTo = function <T>(ar: Array<T>): boolean
{
    if (this.length != ar.length) return false;
    let tmp = ar;
    for (let index = 0; index < this.length; index++)
    {
        let ind = tmp.indexOf(this[index]);
        if (ind < 0) return false;
        tmp = tmp.filter((x, i) => i != ind);
    }
    return true;
}


/* Array.prototype.distinct = function<T>(): T[]
{
    let orig: Array<T> = this;
    return [... new Set(orig)];
}  */   

//#endregion
