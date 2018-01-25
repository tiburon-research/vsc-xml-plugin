'use strict';

import { _AllowCodeTags, KeyedCollection, TagInfo, TextRange } from "./classes";
import * as beautify from 'js-beautify';
import * as escapeStringRegexp from 'escape-string-regexp';

// форматирование, проверка и другие операции с текстом документа


export class FormatResult 
{
    constructor()
    { }

    Errors: string[] = [];
    Result: string = "";
}


export function format(text: string, language: string, tab: string = "\t", indent: number = 0): FormatResult
{
    var func;

    switch (language)
    {
        case "XML":
            func = formatXML;
            break;

        case "JS":
            func = formatJS;
            break;

        case "CSS":
            func = formatCSS;
            break;

        case "C#":
            func = formatCSharp;
            break;
    }

    return func(text, tab, indent);
}


function formatXML(text: string, tab: string = "\t", indent: number = 0): FormatResult
{
    /*
        XML форматируем сами, CSS и JS с помощью beautify, C# пока никак
        для beautify: т.к. у нас везде бывает [c#], то добавляем костыли:
            - перед форматированием присваиваем (прям в тексте) всем c# вставкам свой Id
            - сохраняем их в первозданном виде в коллекцию согласно Id
            - форматируем всё
            - возвращаем c# вставки по Id
    */
    var res = new FormatResult();
    res.Result = text;
    var newText = text;

    // удаляем лишнее и заменяем некрасивое на красивое
    newText = newText.replace(/(\n|^)[\t ]+<([\w\/])/g, '$1<$2'); // убираем все отступы перед тегами
    newText = newText.replace("  ", " "); // двойные пробелы
    var reg = new RegExp("(<((?!(" + _AllowCodeTags + "))(\\w+))([^>]*)>)[\t ]+", "g"); // отступы после тегов (кроме тех, которые после AllowCodeTags)
    newText = newText.replace(reg, "$1");

    // форматирование
    newText = formatXMLblock(newText, tab, indent);

    res.Result = newText;
    return res;
}


// рекурсивное форматирование блоков
function formatXMLblock(text: string, tab: string = "\t", indent: number = 0): string
{
    var res = "";
    var ind = tab.repeat(indent);

    var oldText = text;
    var tags = get1LevelNodes(oldText);

    // если внутри тегов нет, то возвращаем внутренность с отступом?
    if (tags.length == 0) return oldText;//formatText(oldText, ind);
    var newText = oldText;

    tags.forEach(tag =>
    {
        // если теги есть, то рекурсивно форматируем внутренности каждого
        let body = oldText.slice(tag.Body.From, tag.Body.To);
        let formattedBody = body;
        let openTag = oldText.slice(tag.OpenTag.From, tag.OpenTag.To);
        let closeTag = oldText.slice(tag.CloseTag.From, tag.CloseTag.To);
        let oldFull = oldText.slice(tag.OpenTag.From, tag.CloseTag.To); // это, что надо заменить на новое
        // форматируем только если есть несколько строк, иначе просто добавляем отступ
        var newFul;
        if (body.indexOf("\n") > -1)
        {
            formattedBody = formatXMLblock(body, tab, indent + 1);
            if (tag.Closed && !tag.SelfClosed) closeTag = ind + closeTag;
        }

        // формируем результат
        newFul = ind + openTag + formattedBody + closeTag;
        newText = newText.replace(oldFull, newFul);
    });

    // форматируем между тегами?

    return newText;
}


function formatText(text: string, ind: string): string
{
    var txt = text.replace(/\n[\t ]*/g, "\n" + ind);
    return txt.replace(/\n[\t ]+$/, "\n");
}


function formatCSS(text: string, tab: string = "\t", indent: number = 0): FormatResult
{
    var res = new FormatResult();
    res.Result = text;
    var newText = text;

    newText = beautify.css(newText,
        {
            indent_size: 1,
            indent_char: tab,
            indent_with_tabs: tab == "\t",
            indent_level: indent
        });

    res.Result = newText;
    return res;
}


function formatJS(text: string, tab: string = "\t", indent: number = 0): FormatResult
{
    var res = new FormatResult();
    res.Result = text;
    var newText = text;

    newText = beautify.js(newText,
        {
            indent_size: 1,
            indent_char: tab,
            indent_with_tabs: tab == "\t",
            indent_level: indent
        });

    res.Result = newText;
    return res;
}


function formatCSharp(text: string, tab: string = "\t", indent: number = 0): FormatResult
{
    return null;
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
        resCS = regCS.exec(newText);
    }
    return cs;
}


// кодируем вставки в тексте
function codeCS(text: string, cs: KeyedCollection<string>): string
{
    var reg = new RegExp(/(\[c#)([\s\S]+)$/);
    var newText = text;
    cs.forEach(function (i, e)
    {
        let res = e.match(reg);
        newText = newText.replace(e, res[1] + i + res[2]);
    });
    return newText;
}


// возвращаем c# вставки
function getCSBack(text: string, cs: KeyedCollection<string>): string
{
    var newText = text;
    cs.forEach(function (i, e)
    {
        newText = newText.replace(new RegExp("(\\[c#)(" + i + ")(([^\\]]*)\\]([\\s\\S]+?)?\\[\\/c#[^\\]]*\\])", "g"), e);
    })
    return newText;
}