'use strict';

import { _AllowCodeTags, KeyedCollection, TagInfo, TextRange, Language, logString, LogData, safeString, _pack, showWarning } from "./classes";
import * as beautify from 'js-beautify';
import { languages } from "vscode";
import { logError } from "./extension";

// форматирование, проверка и другие операции с текстом документа


export class FormatResult 
{
    constructor()
    { }

    Error: string;
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
    let res: FormatResult = LanguageFunction(language)(text, tab, indent);
    if (!res.Error)
    {
        // для XML форматируем CDATA. Тут - чтобы не рекурсивно
        if (language == Language.XML) res.Result = formatCDATA(res.Result);
        // пока не будет работать стабильно проверяем целостность текста
        let hash = text.replace(/\s+/g, '');
        if (res.Result.replace(/\s+/g, '') != hash)
        {
            if (_pack != "debug") res.Error = "Результат форматирования не прошёл проверку на целостность текста";
            else showWarning("Результат форматирования не прошёл проверку на целостность текста");
        }
    }
    return res;
}


function formatXML(text: string, tab: string = "\t", indent: number = 0): FormatResult
{
    let res = new FormatResult();
    res.Result = text;

    let ind = tab.repeat(indent);

    let oldText = text;
    let tags = get1LevelNodes(oldText);
    let newText = oldText;

    // если внутри тегов нет, то возвращаем внутренность с отступом
    if (tags.length == 0)
    {
        res = formatPlainText(oldText, tab, indent);
    }
    else
    {
        // если теги есть, то рекурсивно форматируем внутренности каждого
        tags.forEach(tag =>
        {
            if (!!res.Error) return; // если ошибка уже есть, то пропускаем всё
            let body = oldText.slice(tag.Body.From, tag.Body.To);
            let formattedBody = body;
            let openTag = oldText.slice(tag.OpenTag.From, tag.OpenTag.To);
            let closeTag = tag.Closed ? oldText.slice(tag.CloseTag.From, tag.CloseTag.To) : "";
            let oldFull = oldText.slice(tag.FullLines.From, tag.FullLines.To); // то, что надо заменить на новое
            if (!oldFull) return;
            let before = oldText.slice(tag.FullLines.From, tag.OpenTag.From); // то, что идёт перед <тегом> на одной строке
            let after = oldText.slice(tag.CloseTag.To, tag.FullLines.To); // то, что идёт после </тега> на одной строке
            let newFul;
            // форматируем то, что вне тега на тех же строках
            if (!before.match(/^\s*$/)) before = before.replace(/^\s*(.*?)\s*/g, '$1\n'); else before = '';
            if (!after.match(/^\s*$/)) after = after.replace(/^\s*(.*)\s*/g, '\n' + ind + '$1'); else after = '';
            // если внутри что-то есть            
            if (!body.match(/^\s*$/))
            {
                if (tag.Multiline)
                {
                    // убираем лишние пробелы/переносы
                    if (tag.Language != Language.PlainTetx && tag.Language != Language.CSharp) formattedBody = formattedBody.replace(/^[\s]*([\s\S]*?)[\s]*$/, "$1");
                    // форматируем согласно содержанию
                    let tmpRes = formatBody(formattedBody, tab, indent + 1, tag.Language);
                    if (!!tmpRes.Error)
                    {
                        res.Error = "Ошибка при форматировании тега";
                        return;
                    }
                    /* if (tag.Language != Language.PlainTetx) */
                    formattedBody = "\n" + tmpRes.Result + "\n";
                    //else formattedBody = tmpRes.Result;
                }
                // отступ для AllowCode fake
                if (!tag.IsAllowCodeTag && !tag.SelfClosed && tag.Name.match(new RegExp("^" + _AllowCodeTags + "$")) && !formattedBody.match(/^[\t ]/))
                    formattedBody = " " + formattedBody;
                if (tag.Closed && !tag.SelfClosed) closeTag = (tag.Multiline ? ind : "") + closeTag;
            }
            else formattedBody = "";
            // формируем результат
            newFul = before + ind + formatTag(openTag) + formattedBody + formatTag(closeTag) + after;
            newText = newText.replace(oldFull, newFul);
        });
        res.Result = newText;
    }

    // форматируем между тегами?

    return res;
}


function formatBody(text: string, tab: string, indent: number = 0, lang: Language): FormatResult
{
    let cs: KeyedCollection<string>;
    let del;
    let res = new FormatResult();
    let newText = text;
    let rm = false;
    // кроме XML и C# заменяем вставки
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
    let ind = tab.repeat(indent);
    newText = newText.replace(/(\n|^)[\t ]+$/g, '$1');
    res = LanguageFunction(lang)(newText, tab, indent);
    if (rm && !res.Error) res.Result = getCSBack(res.Result, cs, del);
    return res;
}


function formatPlainText(text: string, tab: string = "\t", indent: number = 0): FormatResult
{
    // заменяем неправильный отступ:
    let strings = text.split('\n');
    for (let i = 0; i < strings.length; i++)
    {
        let m = strings[i].match(/^[\t ]+/);
        if (!m) continue;
        // считаем \t за {,4} пробела
        let tabs = m[0].match(/\t+/);
        let spaces = m[0].match(/ +/);
        let count = (!!tabs ? tabs[0].length : 0) + (!!spaces ? Math.ceil(spaces[0].length / 4) : 0);
        let newInd = tab.repeat(count);
        strings[i] = strings[i].replace(/^[\t ]+/, newInd);
    }
    let res = strings.join('\n');
    
    let ind = tab.repeat(indent);
    let err: string;
    // убираем дублирование
    if (tab != " ") res = res.replace("  ", " ");
    res = res.replace("\n\n\n", "\n\n"); // двойной перенос, всё-таки, иногда отделяет что-то посмыслу, а вот x3 уже перебор
    
    let min = minIndent(text);
    let newInd = "";
    // отступаем
    if (min > -1)
    {
        let d = indent - min;
        // custom trim
        res = res.replace(/\s+$/, '');
        if (d <= 0) res = res.replace(/^\s*\n+/, '');
        else res = res.replace(/^\s+/, '');
        // сдвигаем на разницу
        if (d > 0) // если отступ меньше нужного
        {
            newInd = tab.repeat(d);
            // двигаем только непустые строки
            res = ind + res.replace(/(\n\^)([\t ]*)(\S)/g, "$1" + newInd + "$2$3");
        }
        else if (d < 0) // если больше нужного - убираем лишние
        {
            newInd = tab.repeat(indent);
            d = 0 - d;
            res = res.replace(new RegExp("(\\n|^)([\\t ]{" + d + "})(\\s*\\S)", "g"), "$1$3");
        }
    }
    return { Result: res, Error: err };
}


function formatCSS(text: string, tab: string = "\t", indent: number = 0): FormatResult
{
    let newText = text;
    let er: string = null;
    try
    {
        newText = beautify.css(newText,
            {
                indent_size: 1,
                indent_char: tab,
                indent_with_tabs: tab == "\t",
                indent_level: indent
            });
    }
    catch (err)
    {
        er = "Ошибка форматирования CSS";
    }
    var ind = tab.repeat(indent);
    newText = ind + newText.replace(/\n/g, "\n" + ind);
    return { Result: newText, Error: er };
}


function formatJS(text: string, tab: string = "\t", indent: number = 0): FormatResult
{
    var newText = text;
    let er: string = null;
    try
    {
        newText = beautify.js(newText,
            {
                indent_size: 1,
                indent_char: tab,
                indent_with_tabs: tab == "\t",
                indent_level: indent
            });
    }
    catch (err)
    {
        er = "Ошибка форматирования JavaScript";
    }
    var ind = tab.repeat(indent);
    newText = ind + newText.replace(/\n/g, "\n" + ind);
    return { Result: newText, Error: er };
}


function formatCSharp(text: string, tab: string = "\t", indent: number = 0): FormatResult
{
    return formatPlainText(text, tab, indent);
}


export function findCloseTag(opBracket: string, tagName: string, clBracket: string, prevText: string, fullText: string): TextRange
{
    try
    {
        let textAfter = fullText.substr(prevText.length);
        let rest = textAfter;

        let curIndex = prevText.length + rest.indexOf(clBracket);
        let op = rest.indexOf(opBracket + tagName);
        let cl = rest.indexOf(opBracket + "/" + tagName);
        if (cl < 0) return null;

        let cO = 1;
        let cC = 0;
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
        let clLast = rest.indexOf(clBracket);

        if (cl < 0 || clLast < 0) return null;
        return { From: fullText.length - rest.length - 1, To: fullText.length - rest.length + clLast, Length: clLast + 1 };

    }
    catch (err)
    {
        logError("Ошибка при поиске закрывающегося тега");
    }
    return null;
}


export function findOpenTag(opBracket: string, tagName: string, clBracket: string, prevText: string): TextRange
{
    try
    {
        let curIndex = prevText.lastIndexOf(opBracket);
        let txt = prevText.substr(0, curIndex);
        let rest = txt;
        let op = rest.lastIndexOf(opBracket + tagName);
        let cl = rest.lastIndexOf(opBracket + "/" + tagName);
        if (op < 0) return null;

        let cO = 0;
        let cC = 1;
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
        let clLast = rest.lastIndexOf(clBracket) + 1;

        if (op < 0 || clLast < 0) return null;
        let to = txt.indexOf(clBracket, rest.length + 1);
        return { From: rest.length, To: to, Length: to - rest.length };
    }
    catch (err)
    {
        logError("Ошибка при поиске открывающегося тега");
    }
    return null;
}

/** заменяет блок комментариев на пробелы */
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

/** получает теги 0 вложенности */
function get1LevelNodes(text: string): TagInfo[]
{
    let tags: TagInfo[] = [];
    let pure = clearXMLComments(text);
    try
    {
        let rest = pure;
        while (rest.length > 0)
        {
            let tag = new TagInfo(rest, pure.length - rest.length);
            if (tag && tag.Found)
            {
                tags.push(tag);
                if (tag.Closed) rest = pure.substr(tag.CloseTag.To + 1);
                else break;
            }
            else break;
        }
    }
    catch (err)
    {
        logError("Ошибка при поиске вложенных тегов");
    }
    return tags;
}


// сохраняем c# вставки
function getEmbeddedCS(text: string): KeyedCollection<string>
{
    let cs = new KeyedCollection<string>();
    let regCS = new RegExp(/(\[c#)((?!\d)([^\]]*)\]([\s\S]+?)?\[\/c#[^\]]*\])/);
    let resCS = regCS.exec(text);
    let i = 0;
    let newText = text;
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
    cs.forEach(function (i, e)
    {
        newText = newText.replace(new RegExp(safeString(del + i + del), "g"), e);
    })
    return newText;
}


// получаем разделитель, для временной замены вставок
function getReplaceDelimiter(text: string, length: number = 5): string
{
    let dels = ["_", "\\"];
    let del = null;

    for (let i = 0; i < dels.length; i++) 
    {
        let curDel = dels[i].repeat(length);
        let mt = text.match(new RegExp(safeString(curDel) + "\\d+" + safeString(curDel), "g"));
        if (!mt || mt.length == 0) return curDel;
    }

    return del;
}


function minIndent(text: string): number
{
    let min = -1;
    let pure = text.replace(/[\t ]*((<!\[CDATA\[]])|(\]\]>))[\t ]*/g, ""); // убираем CDATA
    let mt = pure.match(/(\n|^)[\t ]*\S/g);
    if (!!mt)
    {
        for (let i = 0; i < mt.length; i++)
        {
            let reg = mt[i].match(/(\n)([\t ]*)\S/);
            if (reg && reg[2] !== null && (reg[2].length < min || min == -1)) min = reg[2].length;
        }
    }
    return min;
}


/** располагает CDATA впритык к тегу */
function formatCDATA(text: string): string
{
    let res = text.replace(/>\s*<!\[CDATA\[/g, "><![CDATA[");
    res = res.replace(/[\t ]*\]\]>[\t ]*</g, "]]><"); // однострочная
    res = res.replace(/\s*\]\]>[\t ]*?(\n[\t ]*)</g, "$1]]><"); // многострочная
    // пробелы
    res = res.replace(/<!\[CDATA\[[\t ]*(\S)/g, "<![CDATA[ $1");
    res = res.replace(/(\S)[\t ]*\]\]>/g, "$1 ]]>");
    return res;
}


/** очищает </?тег/?> от лишнего */
function formatTag(tag: string): string
{
    let res = tag;
    let closing = !!res.match(/^\s*<\//);
    if (closing) // закрывающий
    {
        res = res.replace(/^(\s*<\/)(\w+)(\s.*)(>\s*)$/, "$1$2$4"); // всё, кроме имени
    }
    else
    {
        // форматируем все атрибуты
        let result = res.match(/^(\s*<\w+)(\s.*?)?(\/?>\s*)$/);
        if (!!result && !!result[2])
        {
            let results = result[2].match(/\s*\w+=(("[^"]*")|('[^']*'))\s*/g);
            let attrs = "";
            results.forEach(r =>
            {
                attrs += " " + r.trim();
            });
            res = result[1] + attrs + result[3];
        }
    }
    return res;
}