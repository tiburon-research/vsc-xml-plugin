'use strict';

import { _AllowCodeTags, KeyedCollection, TagInfo, TextRange, Language, logString, logError } from "./classes";
import * as beautify from 'js-beautify';
import { languages } from "vscode";

// форматирование, проверка и другие операции с текстом документа


export class FormatResult 
{
    constructor()
    { }

    Errors: string[] = [];
    Result: string = "";
}


// выбираем функцию по Language
function LanguageFunction(language: Language)
{
    var func;

    switch (language)
    {
        case Language.PlainTetx:
            func = formatPlainText;
            break;

        case Language.JS:
            func = formatJS;
            break;

        case Language.CSS:
            func = formatCSS;
            break;

        case Language.CSharp:
            func = formatCSharp;
            break;

        default:
            func = formatXML;
            break;
    }

    return func;
}


/*
    XML форматируем сами, CSS и JS с помощью beautify, C# пока никак
    для beautify: т.к. у нас везде бывает [c#], то добавляем костыли:
        - перед форматированием присваиваем (прям в тексте) всем c# вставкам свой Id
        - сохраняем их в первозданном виде в коллекцию согласно Id
        - форматируем всё
        - возвращаем c# вставки по Id
*/
export function format(text: string, language: Language, tab: string = "\t", indent: number = 0): FormatResult
{
    // пока не будет работать стабильно проверяем целостность текста
    var hash = text.replace(/\s+/g, '');
    var res: FormatResult = LanguageFunction(language)(text, tab, indent);
    if (res.Result.replace(/\s+/g, '') != hash)
    {
        res.Errors.push("Результат форматирования не прошёл проверку на целостность текста");
        logError(text);
    }
    return res;
}


function formatXML(text: string, tab: string = "\t", indent: number = 0): FormatResult
{
    var res = new FormatResult();
    res.Result = text;

    let ind = tab.repeat(indent);

    let oldText = text;
    let tags = get1LevelNodes(oldText);
    let newText = oldText;

    // если внутри тегов нет, то возвращаем внутренность с отступом?
    if (tags.length == 0) newText = formatPlainText(oldText, tab, indent).Result;
    else
    {
        // если теги есть, то рекурсивно форматируем внутренности каждого, убрав отступ перед тегом
        tags.forEach(tag =>
        {
            let body = oldText.slice(tag.Body.From, tag.Body.To);
            let formattedBody = body;
            let openTag = oldText.slice(tag.OpenTag.From, tag.OpenTag.To);
            let closeTag = tag.Closed ? oldText.slice(tag.CloseTag.From, tag.CloseTag.To) : "";
            let oldFull = oldText.slice(tag.FullLines.From, tag.FullLines.To); // то, что надо заменить на новое
            let newFul;
            // если внутри что-то есть
            if (!body.match(/^\s*$/))
            {
                if (tag.Multiline)
                {
                    // убираем лишние пробелы/переносы
                    formattedBody = formattedBody.replace(/^[\s]*([\s\S]*?)[\s]*$/, "$1");
                    formattedBody = formatBody(formattedBody, tab, indent + (tag.HasCDATA ? 2 : 1), tag.Language);
                    formattedBody = "\n" + formattedBody + "\n";
                    // форматируем CDATA
                    if (tag.HasCDATA)
                    {
                        formattedBody = formattedBody.replace(/\n\s*<!\[CDATA\[/, "\n" + ind + tab + "<![CDATA[");
                        formattedBody = formattedBody.replace(/\n\s*\]\]>/, "\n" + ind + tab + "]]>");
                        formattedBody = formattedBody.replace(/([^\n]+)\s*\]\]>/, "$1\n" + ind + tab + "]]>");
                    }
                }
                // отступ для AllowCode fake
                if (!tag.IsAllowCodeTag && !tag.SelfClosed && tag.Name.match(new RegExp("^" + _AllowCodeTags + "$")) && !formattedBody.match(/^[\t ]/))
                    formattedBody = " " + formattedBody;
                if (tag.Closed && !tag.SelfClosed) closeTag = (tag.Multiline ? ind : "") + closeTag;
            }
            else formattedBody = "";
            // формируем результат
            newFul = ind + openTag + formattedBody + closeTag;
            newText = newText.replace(oldFull, newFul);
        });
    }

    // форматируем между тегами?

    res.Result = newText;
    return res;
}


function formatBody(text: string, tab: string, indent: number = 0, lang: Language): string
{
    var cs: KeyedCollection<string>;
    var del;
    var newText = text;
    var rm = false;
    if (lang != Language.CSharp && lang != Language.XML)
    {
        cs = getEmbeddedCS(text)
        if (cs.Count() > 0)
        {
            del = getReplaceDelimiter(text);
            newText = encodeCS(newText, cs, del);
            rm = true;
        }
    }
    var ind = tab.repeat(indent);
    newText = newText.replace(/(\n|^)[\t ]+$/g, '$1');
    newText = LanguageFunction(lang)(newText, tab, indent).Result;
    if (rm) newText = getCSBack(newText, cs, del);
    return newText;
}


function formatPlainText(text: string, tab: string = "\t", indent: number = 0): FormatResult
{
    // убираем дублирование
    let res = text;
    if (tab != " ") text.replace("  ", " ");
    res = text.replace("\n\n\n", "\n\n"); // двойной перенос, всё-таки, иногда отделяет что-то посмыслу, а вот x3 уже перебор
    // отступаем
    var mt = text.match(/(\n|^)[\t ]*\S/g);
    var newInd = "";
    if (mt && mt.length > 0)
    {
        // находим минимальный существующий отступ;
        var min = -1;
        for (let i = 0; i < mt.length; i++)
        {
            let reg = mt[i].match(/(\n)([\t ]*)\S/);
            if (reg && reg[2] !== null && (reg[2].length < min || min == -1)) min = reg[2].length;
        }
        // сдвигаем на разницу
        var d = indent - min;
        if (d > 0) newInd = tab.repeat(d);
    }
    // двигаем только непустые строки и первую
    res = tab.repeat(indent) + res.replace(/(\n)([\t ]*)(\S)/g, "$1" + newInd + "$2$3");

    return { Result: res, Errors: [] };
}


function formatCSS(text: string, tab: string = "\t", indent: number = 0): FormatResult
{
    var newText = text;
    newText = beautify.css(newText,
        {
            indent_size: 1,
            indent_char: tab,
            indent_with_tabs: tab == "\t",
            indent_level: indent
        });
    var ind = tab.repeat(indent);
    newText = ind + newText.replace(/\n/g, "\n" + ind);
    return { Result: newText, Errors: [] };
}


function formatJS(text: string, tab: string = "\t", indent: number = 0): FormatResult
{
    var newText = text;
    newText = beautify.js(newText,
        {
            indent_size: 1,
            indent_char: tab,
            indent_with_tabs: tab == "\t",
            indent_level: indent
        });
    var ind = tab.repeat(indent);
    newText = ind + newText.replace(/\n/g, "\n" + ind);
    return { Result: newText, Errors: [] };
}


function formatCSharp(text: string, tab: string = "\t", indent: number = 0): FormatResult
{
    return formatPlainText(text, tab, indent);
}


export function findCloseTag(opBracket: string, tagName: string, clBracket: string, prevText: string, fullText: string): TextRange
{
    var textAfter = fullText.substr(prevText.length);
    var rest = textAfter;

    var curIndex = prevText.length + rest.indexOf(clBracket);
    var op = rest.indexOf(opBracket + tagName);
    var cl = rest.indexOf(opBracket + "/" + tagName);
    if (cl < 0) return null;

    var cO = 1;
    var cC = 0;
    while (cl > -1 && ((op > -1) || (cC != cO)))
    {
        if (op < cl && op > -1)
        {
            rest = rest.substr(op + 1);
            cO++;
        }
        else if (cO != cC)
        {
            rest = rest.substr(cl + 1);
            cC++;
        }

        if (cO == cC) break;
        op = rest.indexOf(opBracket + tagName);
        cl = rest.indexOf(opBracket + "/" + tagName);
    }

    //rest = rest.substr(cl);
    var clLast = rest.indexOf(clBracket);

    if (cl < 0 || clLast < 0) return null;
    return { From: fullText.length - rest.length - 1, To: fullText.length - rest.length + clLast, Length: clLast + 1 };
}


export function findOpenTag(opBracket: string, tagName: string, clBracket: string, prevText: string): TextRange
{
    var curIndex = prevText.lastIndexOf(opBracket);
    var txt = prevText.substr(0, curIndex);
    var rest = txt;
    var op = rest.lastIndexOf(opBracket + tagName);
    var cl = rest.lastIndexOf(opBracket + "/" + tagName);
    if (op < 0) return null;

    var cO = 0;
    var cC = 1;
    while (op > -1 && ((cl > -1) || op != cl))
    {
        if (cl > op && cl > -1)
        {
            rest = rest.substr(0, cl);
            cC++;
        }
        else if (cO != cC)
        {
            rest = rest.substr(0, op);
            cO++;
        }
        if (cO == cC) break;
        op = rest.lastIndexOf(opBracket + tagName);
        cl = rest.lastIndexOf(opBracket + "/" + tagName);
    }

    //rest = rest.substr(0, rest.indexOf(clBracket, op) + 1);
    var clLast = rest.lastIndexOf(clBracket) + 1;

    if (op < 0 || clLast < 0) return null;
    var to = txt.indexOf(clBracket, rest.length + 1);
    return { From: rest.length, To: to, Length: to - rest.length };
}


export function clearXMLComments(txt: string): string
{
    var mt = txt.match(/<!--([\s\S]+?)-->/g);
    var res = txt;
    var rep = "";
    if (!mt) return txt;
    mt.forEach(element =>
    {
        rep = element.replace(/./g, ' ');
        res = res.replace(element, rep);
    });
    return res;
}


function get1LevelNodes(text: string): TagInfo[]
{
    var tags: TagInfo[] = [];
    var rest = text;
    while (rest.length > 0)
    {
        let tag = new TagInfo(rest, text.length - rest.length);
        if (tag && tag.Found)
        {
            tags.push(tag);
            if (tag.Closed) rest = text.substr(tag.CloseTag.To + 1);
            else break;
        }
        else break;
    }
    return tags;
}


// сохраняем c# вставки
function getEmbeddedCS(text: string): KeyedCollection<string>
{
    var cs = new KeyedCollection<string>();
    var regCS = new RegExp(/(\[c#)((?!\d)([^\]]*)\]([\s\S]+?)?\[\/c#[^\]]*\])/);
    var resCS = regCS.exec(text);
    var i = 0;
    var newText = text;
    while (!!resCS && !!resCS[1])
    {
        i++;
        cs.AddPair("" + i, resCS[0]);
        newText = newText.replace(new RegExp(safeString(resCS[0]), "g"), "");
        resCS = regCS.exec(newText);
    }
    return cs;
}


// кодируем вставки в тексте
function encodeCS(text: string, cs: KeyedCollection<string>, del: string): string
{
    var newText = text;
    cs.forEach(function (i, e)
    {
        newText = newText.replace(new RegExp(safeString(e), "g"), del + i + del);
    });
    return newText;
}


// возвращаем c# вставки
function getCSBack(text: string, cs: KeyedCollection<string>, del: string): string
{
    var newText = text;
    del = safeString(del);
    cs.forEach(function (i, e)
    {
        newText = newText.replace(new RegExp(del + i + del, "g"), e);
    })
    return newText;
}


// получаем разделитель, для временной замены вставок
function getReplaceDelimiter(text: string, length: number = 5): string
{
    var dels = ["_", "\\"];
    var del = null;

    for (let i = 0; i < dels.length; i++) 
    {
        let curDel = dels[i].repeat(length);
        let mt = text.match(new RegExp(safeString(curDel + "\\d+" + curDel), "g"));
        if (!mt || mt.length == 0) return curDel;
    }

    return del;
}


function safeString(text: string): string
{
    return text.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}