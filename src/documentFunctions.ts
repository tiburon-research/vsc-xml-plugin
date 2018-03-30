'use strict';

import { _AllowCodeTags, KeyedCollection, TagInfo, TextRange, Language, logString, LogData, safeString, _pack, showWarning, ExtensionSettings, EncodeResult, EncodedXML, XMLencodeResult } from "./classes";
import * as beautify from 'js-beautify';
import * as cssbeautify from 'cssbeautify';
import { languages } from "vscode";
import { logError, CSFormatter } from "./extension";


// форматирование, проверка и другие операции с текстом документа


var _settings: ExtensionSettings;

export class FormatResult 
{
    constructor()
    { }

    Error: string;
    Result: string = "";
}


// выбираем функцию по Language
function LanguageFunction(language: Language)//: (text: string, tab?: string, indent?: number) => Promise<FormatResult>
{
    var func: (text: string, tab?: string, indent?: number) => Promise<FormatResult>;

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
export function format(text: string, language: Language, settings: ExtensionSettings, tab: string = "\t", indent: number = 0): Promise<string>
{
    return new Promise<string>((resolve, reject) =>
    {
        _settings = settings;
        let txt = text;
        if (language == Language.XML) txt = preFormatXML(text);
        LanguageFunction(language)(txt, tab, indent).then(res => 
        {
            if (!res.Error)
            {
                // дополнительная (одноразовая) постобработка XML
                if (language == Language.XML) res = postFormatXML(res);
                // пока не будет работать стабильно проверяем целостность текста
                let hash = text.replace(/\s+/g, '');
                if (res.Result.replace(/\s+/g, '') != hash)
                {
                    if (_pack != "debug")
                    {
                        res.Error = "Результат форматирования не прошёл проверку на целостность текста";
                        reject(res.Error);
                    }
                    else
                    {
                        showWarning("Результат форматирования не прошёл проверку на целостность текста");
                        resolve(res.Result);
                    }
                }
                else resolve(res.Result);
            }
            else reject(res.Error);
        });
    });
}


async function formatXML(text: string, tab: string = "\t", indent: number = 0): Promise<FormatResult>
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
        res = await formatPlainText(oldText, tab, indent);
    }
    else
    {
        // если теги есть, то рекурсивно форматируем внутренности каждого
        for (let i = 0; i < tags.length; i++)
        {
            let tag = tags[i];
            if (!!res.Error) continue; // если ошибка уже есть, то пропускаем всё
            let body = oldText.slice(tag.Body.From, tag.Body.To);
            let formattedBody = body;
            let openTag = oldText.slice(tag.OpenTag.From, tag.OpenTag.To);
            let closeTag = tag.Closed ? oldText.slice(tag.CloseTag.From, tag.CloseTag.To) : "";
            let oldFull = oldText.slice(tag.FullLines.From, tag.FullLines.To); // то, что надо заменить на новое
            if (!oldFull) continue;
            let before = oldText.slice(tag.FullLines.From, tag.OpenTag.From); // то, что идёт перед <тегом> на одной строке
            let after = oldText.slice(tag.CloseTag.To, tag.FullLines.To); // то, что идёт после </тега> на одной строке
            let newFul;
            // форматируем то, что вне тега на тех же строках\
            if (!before.match(/^\s*$/)) before = before.replace(/^\s*(\S.*)\s*/, '$1\n'); else before = '';
            if (!after.match(/^\s*$/)) after = after.replace(/^\s*(\S.*)\s*/, ' $1'); else after = '';

            // если внутри что-то есть            
            if (!body.match(/^\s*$/))
            {
                if (tag.Multiline)
                {
                    // убираем лишние пробелы/переносы
                    formattedBody = formattedBody.replace(/^\s*?(([\t ]*)(\S[\s\S]*\S))\s*$/, "$2$3");
                    // форматируем согласно содержанию
                    let tmpRes = await formatBody(formattedBody, tab, indent + 1, tag.Language);
                    if (!!tmpRes.Error)
                    {
                        res.Error = "Ошибка при форматировании тега" + (!!tag && !!tag.Name ? (" " + tag.Name) : "") + ":\n" + tmpRes.Error;
                        continue;
                    }
                    formattedBody = "\n" + tmpRes.Result + "\n";
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
        };

        // форматируем между тегами
        if (!res.Error) res = await formatBetweenTags(newText, tab, indent);
    }

    return res;
}


async function formatBody(text: string, tab: string, indent: number = 0, lang: Language): Promise<FormatResult>
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
            newText = saveEncodedCS(newText, cs, del);
            rm = true;
        }
    }
    let ind = tab.repeat(indent);
    newText = newText.replace(/(\n|^)[\t ]+$/g, '$1');
    res = await LanguageFunction(lang)(newText, tab, indent);
    if (rm && !res.Error) res.Result = getCSBack(res.Result, { Delimiter: del, EncodedCollection: cs });
    // для случаев <Text>текст\n.*
    if (res.Result.match(/^\n*\S/))
    {
        res.Result = res.Result.replace(/^(\n*)(\S)/, "$1" + ind + "$2");
    }
    return res;
}


async function formatPlainText(text: string, tab: string = "\t", indent: number = 0, preserveEdges = false): Promise<FormatResult>
{
    let res = text;
    let err: string;

    try
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
        res = strings.join('\n');

        //let ind = tab.repeat(indent);
        // убираем дублирование
        if (tab != " ") res = res.replace("  ", " ");
        res = res.replace(/([\t ]*\r?\n){4,}/g, "\n\n\n"); // две пустые строки, всё-таки, иногда отделяет что-то посмыслу, а вот 3 уже перебор

        let min = minIndent(text);
        let newInd = "";
        // отступаем
        if (min > -1)
        {
            let d = indent - min;
            // custom trim
            if (!preserveEdges)
            {
                res = res.replace(/\s+$/, '');
                if (d <= 0) res = res.replace(/^\s*\n+/, '');
                //else res = res.replace(/^\s+/, '');
            }
            // сдвигаем на разницу
            if (d > 0) // если отступ меньше нужного
            {
                newInd = tab.repeat(d);
                // двигаем только непустые строки
                res = res.replace(/(\n|^)([\t ]*)(\S)/g, "$1" + newInd + "$2$3");
            }
            else if (d < 0) // если больше нужного - убираем лишние
            {
                newInd = tab.repeat(indent);
                d = 0 - d;
                res = res.replace(new RegExp("(\\n|^)([\\t ]{" + d + "})(\\s*\\S)", "g"), "$1$3");
            }
        }

        // для случаев <Text>текст\n.*
        if (text.match(/^\S/))
        {
            res = tab.repeat(indent) + res.replace(/^(\n?)[\t ]/, "$1");
        }
    }
    catch (error)
    {
        err = "Ошибка при форматировании области PlainText";
    }

    // обрезаем хвосты
    res = res.replace(/(\n|^)(.*\S)[\t ]+(\r?\n)/, "$1$2$3");

    return { Result: res, Error: err };
}


async function formatCSS(text: string, tab: string = "\t", indent: number = 0): Promise<FormatResult>
{
    let newText = clearIndents(text);
    let er: string = null;
    try
    {
        newText = cssbeautify(newText,
            {
                indent: "\t",
                openbrace: (_settings.Item("formatSettings").braceStyle.indexOf("expand") > -1 ? "separate-line" : "end-of-line")
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


async function formatJS(text: string, tab: string = "\t", indent: number = 0): Promise<FormatResult>
{
    let newText = clearIndents(text);
    let er: string = null;
    try
    {
        newText = beautify.js(newText,
            {
                indent_size: 1,
                indent_char: tab,
                indent_with_tabs: tab == "\t",
                indent_level: indent,
                brace_style: _settings.Item("formatSettings").braceStyle
            });
    }
    catch (err)
    {
        er = "Ошибка форматирования JavaScript";
    }
    let ind = tab.repeat(indent);
    newText = ind + newText.replace(/\n/g, "\n" + ind);
    return { Result: newText, Error: er };
}


async function formatCSharp(text: string, tab: string = "\t", indent: number = 0): Promise<FormatResult>
{
    let res = text;
    let er = null;
    try
    {
        // если есть расширение Leopotam.csharpfixformat, то форматируем с помощью него
        if (!!CSFormatter)
        {
            // CDATA форматировать не надо
            let hasCDATA = !!res.match(/^\s*<!\[CDATA\[[\s\S]*\]\]>\s*$/);
            if (hasCDATA) res = res.replace(/^\s*<!\[CDATA\[*([\s\S]*)\]\]>\s*$/, "$1");
            res = clearIndents(res);
            res = await CSFormatter(res);
            let multiline = res.indexOf("\n") > -1;
            let space = multiline ? "\n" : " ";
            if (hasCDATA) res = res.replace(/^([\s\S]*)$/, "<![CDATA[" + space + "$1" + space + "]]>");
            let ind = tab.repeat(indent);
            res = res.replace(/\n([\t ]*\S)/g, "\n" + ind + "$1");
        }
        else
        {
            let tmpRes = await formatPlainText(res, tab, indent);
            if (!!tmpRes.Error) throw "Errors found";
            res = tmpRes.Result;
        }
    }
    catch (error)
    {
        er = "Ошибка при форматировании C#";
    }
    return { Result: res, Error: er };
}


/** форматирование XML между тегами */
async function formatBetweenTags(text: string, tab: string = "\t", indent: number = 0): Promise<FormatResult>
{
    let res = new FormatResult();
    let newText = text;
    let spaces = get1LevelNodes(text);

    try
    {
        if (spaces.length > 0)
        {
            for (let i = 0; i < spaces.length; i++)
            {
                let space = spaces[i];
                if (i == 0) // перед первым
                {
                    let repl = text.slice(0, space.OpenTag.From);
                    if (repl.match(/^\s*$/)) continue;
                    let spRes = await formatPlainText(repl, tab, indent, true);
                    if (!!spRes.Error)
                    {
                        res.Error = spRes.Error;
                        continue;
                    }
                    newText = newText.replace(repl, spRes.Result);
                }
                if (i == spaces.length - 1) // после последнего (он может быть и первым)
                {
                    let repl = text.slice(space.CloseTag.To, text.length);
                    if (repl.match(/^\s*$/)) continue;
                    let spRes = await formatPlainText(repl, tab, indent, true);
                    if (!!spRes.Error)
                    {
                        res.Error = spRes.Error;
                        continue;
                    }
                    newText = newText.replace(repl, spRes.Result);
                }
                if (i < spaces.length - 1) // между
                {
                    let repl = text.slice(space.CloseTag.To, spaces[i + 1].OpenTag.From);
                    if (repl.match(/^\s*$/)) continue;
                    let spRes = await formatPlainText(repl, tab, indent, true);
                    if (!!spRes.Error)
                    {
                        res.Error = spRes.Error;
                        continue;
                    }
                    spRes.Result = spRes.Result.replace(/^[\t ]+/, " ");
                    newText = newText.replace(repl, spRes.Result);
                }
            }
        }
    }
    catch (error)
    {
        res.Error = "Ошибка форматирования области между тегами";
    }

    res.Result = newText;

    return res;
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


/** сохраняем c# вставки */
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


function saveEncodedCS(text: string, cs: KeyedCollection<string>, del: string): string
{
    if (!del || cs.Count() == 0) return text;
    var newText = text;
    cs.forEach(function (i, e)
    {
        newText = newText.replace(new RegExp(safeString(e), "g"), del + i + del);
    });
    return newText;
}


/** кодируем вставки в тексте */
function encodeCS(text: string, delimiterLength?: number): EncodeResult
{
    let res = new EncodeResult();
    let cs = getEmbeddedCS(text);
    let del = getReplaceDelimiter(text, delimiterLength);
    res.Delimiter = del;
    res.EncodedCollection = cs;
    res.Result = saveEncodedCS(text, cs, del);
    return res;
}


/** возвращаем c# вставки */
function getCSBack(text: string, cs: XMLencodeResult): string
{
    if (!cs.Delimiter || cs.EncodedCollection.Count() == 0) return text;
    var newText = text;
    cs.EncodedCollection.forEach(function (i, e)
    {
        newText = newText.replace(new RegExp(safeString(cs.Delimiter + i + cs.Delimiter), "g"), e);
    })
    return newText;
}


/** кодирует CDATA в тексте */
function encodeCDATA(text: string): EncodeResult
{
    let res = new EncodeResult();
    let cd = getCDATA(text);
    // Delimiter тут - название атрибута
    res.Delimiter = "CDATAEncodedId";
    res.EncodedCollection = cd;
    res.Result = saveEncodedCDATA(text, cd, res.Delimiter);
    return res;
}


/** получает набор из CDATA */
function getCDATA(text: string): KeyedCollection<string>
{
    let cs = new KeyedCollection<string>();
    let regCS = new RegExp(/(<!\[CDATA\[)([\S\s]*)(\]\]>)/);
    let resCS = regCS.exec(text);
    let i = 0;
    let newText = text;
    while (!!resCS)
    {
        i++;
        cs.AddPair("" + i, resCS[0]);
        newText = newText.replace(new RegExp(safeString(resCS[0]), "g"), "");
        resCS = regCS.exec(newText);
    }
    return cs;
}


/** кодирует CDATA */
function saveEncodedCDATA(text: string, cs: KeyedCollection<string>, del: string): string
{
    if (!del || cs.Count() == 0) return text;
    var newText = text;
    cs.forEach(function (i, e)
    {
        newText = newText.replace(new RegExp(safeString(e), "g"), "<CDATA " + del + "=\"" + i + "\"></CDATA>");
    });
    return newText;
}


/** заменяет обратно закодированные CDATA */
function getCDATAback(text: string, cd: XMLencodeResult): string
{
    if (!cd || cd.EncodedCollection.Count() == 0) return text;
    var newText = text;
    cd.EncodedCollection.forEach(function (i, e)
    {
        newText = newText.replace(new RegExp(safeString("<CDATA " + cd.Delimiter + "=\"" + i + "\"></CDATA>"), "g"), e);
    })
    return newText;
}


// получаем разделитель, для временной замены вставок
function getReplaceDelimiter(text: string, length?: number): string
{
    let dels = ["_", "\\"];
    let del = null;
    length = length || 5;

    for (let i = 0; i < dels.length; i++) 
    {
        let curDel = dels[i].repeat(length);
        let mt = text.match(new RegExp(safeString(curDel) + "\\d+" + safeString(curDel), "g"));
        if (!mt || mt.length == 0) return curDel;
    }

    return del;
}


/** определяет минимальный отступ без учёта CDATA и FoldingBlock */
function minIndent(text: string): number
{
    let min = -1;
    let pure = text.replace(/((<!\[CDATA\[)|(\]\]>))/g, ""); // убираем CDATA
    pure = pure.replace(/<!--#(end)?block.*-->/g, ""); // убираем FoldingBlock
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
    let res = text.replace(/>\s*<!\[CDATA\[[\t ]*/g, "><![CDATA[");
    res = res.replace(/(\S)[\t ]*\]\]>[\t ]*</g, "$1 ]]><"); // однострочная + пробел
    res = res.replace(/\s*\]\]>[\t ]*?(\n[\t ]*)</g, "$1]]><"); // многострочная
    // пробелы
    res = res.replace(/<!\[CDATA\[[\t ]*(\S)/g, "<![CDATA[ $1");
    return res;
}


/** очищает </?тег/?> от лишнего */
function formatTag(tag: string): string
{
    let res = tag;

    try
    {
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
                let results = result[2].match(/^\s*\w+\s*=\s*(("[^"]*")|('[^']*'))\s*$/g);
                let attrs = result[2];
                if (!!results)
                {
                    attrs = "";
                    results.forEach(r =>
                    {
                        attrs += r.replace(/\s*(\w+)\s*=\s*(("[^"]*")|('[^']*'))\s*/, " $1=$2");
                    });
                }
                res = result[1] + attrs + result[3];
            }
        }
    }
    catch (error)
    {
        logError("Ошибка при форматировании атрибутов тега");
    }

    return res;
}


function formatFoldingBlocks(text: string): string
{
    return text.replace(/(^|\n)[\t ]+(<!--#(end)?block)/g, "$1$2");
}


/** предобработка XML */
function preFormatXML(text: string): string
{
    let res = text;
    // переносим открытый тег на новую строку
    res = res.replace(/(^|\n)([\t ]*)((((?!<!)\S)(.*?\S)?)[\t ]*)(<\w+(\s+\w+=(("[^"]*")|('[^']')))*\s*\/?>)[\t ]*\r?\n/g, "$1$2$4\n$2$7\n");
    return res;
}


/** постобработка XML */
function postFormatXML(res: FormatResult): FormatResult
{
    let tmp = res.Result;
    // форматируем сворачиваемые блоки
    tmp = formatFoldingBlocks(tmp);
    // форматируем CDATA
    tmp = formatCDATA(tmp);
    res.Result = tmp;
    return res;
}


/** очищает все отступы */
export function clearIndents(text: string): string
{
    return text.replace(/(^|\n)[\t ]+/g, "$1");
}


/** преобразовывает XML к безопасному для парсинга как HTML */
export function htmlToXml(html: string): EncodedXML
{
    let csRes = encodeCS(html, 5); // убираем кодовые вставки
    let cdRes = encodeCDATA(csRes.Result); // убираем CDATA
    return {
        Result: cdRes.Result,
        CSCollection: csRes.toXMLencodeResult(),
        CDATACollection: cdRes.toXMLencodeResult()
    };
}


/** преобразовывает безопасный XML в нормальный */
export function xmlToHtml(xml: EncodedXML): string
{
    let res = getCSBack(xml.Result, xml.CSCollection); // возвращаем кодовые вставки
    res = getCDATAback(res, xml.CDATACollection); // возвращаем CDATA
    res = res.replace(/"(\[c#[\s\S]*\/c#\])"/, "'$1'"); // при parseXML все значения атрибутов переделываются под Attr="Val"
    return res;
}
