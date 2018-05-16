'use strict'

import * as shortHash from "short-hash"
import { KeyedCollection, safeString, RegExpPatterns } from "./classes"
import { logError } from "./extension";


/* ---------------------------------------- КОДИРОВАНИЕ ---------------------------------------- */
//#region


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
        if (!delimiter) del = getReplaceDelimiter(text);
        else
        {
            if (typeof delimiter == "string") del = delimiter;
            else del = getReplaceDelimiter(text, delimiter);
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



/** возвращает пронумерованный список элементов, найденных в `text` */
function getElements(text: string, elem: RegExp): KeyedCollection<string>
{
    let res = new KeyedCollection<string>();
    try
    {
        let reg = new RegExp(elem, "g");
        let mat = elem.exec(text);
        let newText = text;
        while (!!mat)
        {
            let i = shortHash(mat[0]);
            if (res.Contains(i)) throw "Коллекция закодированных элементов уже содержит добавляемый хеш";
            res.AddPair("" + i, mat[0]);
            newText = newText.replace(new RegExp(safeString(mat[0]), "g"), "");
            mat = elem.exec(newText);
        }
    } catch (error)
    {
        logError("Ошибка получения списка элементов" + (!!error ? "\n" + error : ""));
    }
    return res;
}


/** Возвращает в `text` закодированные элементы */
export function getElementsBack(text: string, encodeResult: XMLencodeResult): string
{
    if (!encodeResult.Delimiter || encodeResult.EncodedCollection.Count() == 0) return text;
    let newText = text;
    encodeResult.EncodedCollection.forEach(function (i, e)
    {
        newText = newText.replace(new RegExp(safeString(encodeResult.Delimiter + i + encodeResult.Delimiter), "g"), e);
    })
    return newText;
}


/** Кодирует элементы */
export function encodeElements(text: string, elem: RegExp, delimiter: string): EncodeResult
{
    let res = new EncodeResult();
    let collection = getElements(text, elem);
    res.EncodedCollection = collection;
    res.Delimiter = delimiter;
    let result = text;
    if (!!delimiter && collection.Count() > 0)
    {
        collection.forEach(function (i, e)
        {
            result = result.replace(new RegExp(safeString(e), "g"), delimiter + i + delimiter);
        });
    }
    res.Result = result;
    return res;
}


/** кодирует C#-вставки в `text` */
export function encodeCS(text: string, delimiter: string): EncodeResult
{
    return encodeElements(text, /(\[c#)((?!\d)([^\]]*)\]([\s\S]+?)?\[\/c#[^\]]*\])/, delimiter);
}

/** кодирует CDATA в `text` */
export function encodeCDATA(text: string, delimiter: string): EncodeResult
{
    return encodeElements(text, RegExpPatterns.CDATA, delimiter);
}

export function encodeXMLComments(text: string, delimiter: string): EncodeResult
{
    return encodeElements(text, RegExpPatterns.XMLComment, delimiter);
}

// получаем разделитель, для временной замены вставок
export function getReplaceDelimiter(text: string, length?: number): string
{
    let dels = ["_", "!", "#"];
    let del = null;
    length = length || 5;

    for (let i = 0; i < dels.length; i++) 
    {
        let curDel = dels[i].repeat(length);
        let mt = text.match(new RegExp(safeString(curDel) + RegExpPatterns.DelimiterContent + safeString(curDel), "g"));
        if (!mt || mt.length == 0) return curDel;
    }

    return del;
}


/** XML с закодированными C#-вставками и CDATA */
export function safeXML(text: string, delimiter?: string): EncodeResult
{
    let res = new Encoder(text, delimiter);
    // важно сначала убирать CDATA, т.к. в ней могут быть кодовые вставки
    res.Encode(encodeCDATA); // убираем CDATA
    res.Encode(encodeCS); // убираем кодовые вставки
    return res.ToEncodeResult();
}


/** преобразовывает безопасный XML в нормальный */
export function originalXML(text: string, data: XMLencodeResult): string
{
    let res = getElementsBack(text, data); // возвращаем закодированные элементы
    res = res.replace(/"(\[c#[\s\S]*?\/c#\])"/, "'$1'"); // при parseXML все значения атрибутов переделываются под Attr="Val"
    return res;
}



//#endregion




/* ---------------------------------------- ОЧИСТКА ---------------------------------------- */
//#region 


/** Заменяет на пробелы */
function replaceWithSpaces(text: string, sub: RegExp): string
{
    let mt = text.match(new RegExp(sub, "g"));
    let res = text;
    let rep = "";
    if (!mt) return text;
    mt.forEach(element =>
    {
        rep = element.replace(/./g, ' ');
        res = res.replace(element, rep);
    });
    return res;
}

/** заменяет блок комментариев на пробелы */
export function clearXMLComments(txt: string): string
{
    let res = txt;
    res = replaceWithSpaces(res, RegExpPatterns.XMLComment);
    res = replaceWithSpaces(res, RegExpPatterns.XMLLastComment);
    return res;
}


/** заменяет CDATA на пробелы */
export function clearCDATA(txt: string): string
{
    let res = txt;
    res = replaceWithSpaces(res, RegExpPatterns.CDATA);
    res = replaceWithSpaces(res, RegExpPatterns.CDATALast);
    return res;
}

/** Заменяет содержимое CS-тегов пробелами */
export function clearCSContents(text: string): string
{
    let res = text;
    let newText = text;
    let rep = "";
    let tCount = RegExpPatterns.AllowCodeTags.match(/\(/g).length;

    // Очищаем полные теги
    let reg = new RegExp("(<(" + RegExpPatterns.AllowCodeTags + ")(\\s*\\w+=((\"[^\"]*\")|('[^']*')))*\\s*>)((?![\\t ]+\\r?\\n)[\\s\\S]*?)(<\\/\\2\\s*>)");

    let resCS = reg.exec(newText);

    while (!!resCS)
    {
        let open = resCS[1];
        let inner = resCS[7 + tCount].replace(/./g, ' ');
        let close = resCS[8 + tCount];
        let repl = new RegExp(safeString(resCS[0]));
        res = res.replace(repl, open + inner + close);
        newText = newText.replace(repl, "");
        resCS = reg.exec(newText);
    }

    // Очищаем незакрытый CS-тег в конце
    let regEnd = new RegExp("(<(" + RegExpPatterns.AllowCodeTags + ")(\\s*\\w+=((\"[^\"]*\")|('[^']*')))*\\s*>)((?!([\\t ]+\\r?\\n)|(\\s+<\/\\2))[\\s\\S]*)$");
    resCS = regEnd.exec(res);
    if (!!resCS)
    {
        let open = resCS[1];
        let inner = resCS[7 + tCount].replace(/./g, ' ');
        res = res.replace(resCS[0], open + inner);
    }

    return res;
}


/** Заменяет C#-комментарии пробелами */
export function clearCSComments(txt: string): string
{
    return replaceWithSpaces(txt, RegExpPatterns.CSComments);
}

//#endregion
