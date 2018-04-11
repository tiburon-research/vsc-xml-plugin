'use strict';

import { _AllowCodeTags, KeyedCollection, TagInfo, TextRange, Language, logString, LogData, safeString, _pack, showWarning, ExtensionSettings, EncodeResult, XMLencodeResult, positiveMin } from "./classes";
import * as beautify from 'js-beautify';
import * as cssbeautify from 'cssbeautify';
import { languages } from "vscode";
import { logError, CSFormatter } from "./extension";


// форматирование, проверка и другие операции с текстом документа


var _settings: ExtensionSettings;

/* ФОРМАТИРОВАНИЕ */
//#region

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
    XML форматируем сами, CSS и JS с помощью beautify, C# с помощью расширения Leopotam.csharpfixformat или как PlainText
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
    let res = new FormatResult();
    let newText = text;
    let cs: EncodeResult;
    // кроме XML и C# заменяем вставки
    let del = getReplaceDelimiter(text);
    if (lang != Language.CSharp && lang != Language.XML) cs = encodeCS(text, del);
    let ind = tab.repeat(indent);
    newText = newText.replace(/(\n|^)[\t ]+$/g, '$1');
    res = await LanguageFunction(lang)(newText, tab, indent);
    if (!!cs && !res.Error) res.Result = getElementsBack(res.Result, { Delimiter: cs.Delimiter, EncodedCollection: cs.EncodedCollection });
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


function formatCDATA(text: string): string
{
    // располагает CDATA впритык к тегу
    let res = text.replace(/>\s*<!\[CDATA\[[\t ]*/g, "><![CDATA[");
    res = res.replace(/\s*\]\]>[\t ]*?(\n[\t ]*)</g, "$1]]><");
    // пробелы для однострочной
    res = res.replace(/<!\[CDATA\[[\t ]*(\S)/g, "<![CDATA[ $1");
    res = res.replace(/(\S)[\t ]*\]\]>/g, "$1 ]]>");
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
    // убираем пустые CDATA
    res = res.replace(/<!\[CDATA\[\s*\]\]>/, "");
    // переносим остатки CDATA на новую строку
    let regCS = new RegExp("(<!\\[CDATA\\[)(.*\\r?\\n[\\s\\S]*)(\\]\\]>)");
    let newText = res;
    let resCS = regCS.exec(newText);
    while (!!resCS)
    {
        if (!resCS[2].match(/\]\]>/))
        {
            if (resCS[2].match(/^.*\S.*\r?\n/)) // переносим начало
                res = res.replace(new RegExp(safeString(resCS[1] + resCS[2]), "g"), resCS[1] + "\n" + resCS[2]);
            if (resCS[2].match(/\S[ \t]*$/)) // переносим конец
                res = res.replace(new RegExp(safeString(resCS[2] + resCS[3]), "g"), resCS[2] + "\n" + resCS[3]);
        }
        newText = newText.replace(new RegExp(safeString(resCS[0])), "");
        resCS = regCS.exec(newText);
    }
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


//#endregion




/* КОДИРОВАНИЕ */
//#region


/** возвращает пронумерованный список элементов, найденных в `text` */
function getElements(text: string, elem: RegExp): KeyedCollection<string>
{
    let res = new KeyedCollection<string>();
    try
    {
        let reg = new RegExp(elem, "g");
        let mat = elem.exec(text);
        //let i = 0;
        let newText = text;
        while (!!mat)
        {
            let i = new Date().getTime();
            if (res.Contains("" + i)) i++; // ну вдруг чо =)
            res.AddPair("" + i, mat[0]);
            newText = newText.replace(new RegExp(safeString(mat[0]), "g"), "");
            mat = elem.exec(newText);
        }
    } catch (error)
    {
        logError("Ошибка получения списка элементов");
    }
    return res;
}


/** возвращает `text` с заменёнными `elements` */
function replaceElements(text: string, elements: KeyedCollection<string>, delimiter: string): string
{
    if (!delimiter || elements.Count() == 0) return text;
    var newText = text;
    elements.forEach(function (i, e)
    {
        newText = newText.replace(new RegExp(safeString(e), "g"), delimiter + i + delimiter);
    });
    return newText;
}


/** Возвращает в `text` закодированные элементы */
function getElementsBack(text: string, encodeResult: XMLencodeResult): string
{
    if (!encodeResult.Delimiter || encodeResult.EncodedCollection.Count() == 0) return text;
    var newText = text;
    encodeResult.EncodedCollection.forEach(function (i, e)
    {
        newText = newText.replace(new RegExp(safeString(encodeResult.Delimiter + i + encodeResult.Delimiter), "g"), e);
    })
    return newText;
}


/** Кодирует элементы */
function encodeElements(text: string, elem: RegExp, delimiter: string): EncodeResult
{
    let res = new EncodeResult();
    let collection = getElements(text, elem);
    res.EncodedCollection = collection;
    res.Delimiter = delimiter;
    let result = replaceElements(text, collection, delimiter);
    res.Result = result;
    return res;
}


/** кодирует C#-вставки в `text` */
function encodeCS(text: string, delimiter: string): EncodeResult
{
    return encodeElements(text, /(\[c#)((?!\d)([^\]]*)\]([\s\S]+?)?\[\/c#[^\]]*\])/, delimiter);
}

/** кодирует CDATA в `text` */
function encodeCDATA(text: string, delimiter: string): EncodeResult
{
    return encodeElements(text, /<!\[CDATA\[[\S\s]*\]\]>/, delimiter);
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
        let mt = text.match(new RegExp(safeString(curDel) + "\\d+" + safeString(curDel), "g"));
        if (!mt || mt.length == 0) return curDel;
    }

    return del;
}


/** безопасный (обычный, нормальный) XML без всяких тибуроновских приколов */
export function safeXML(text: string, delimiter: string): EncodeResult
{
    let res = new EncodeResult();
    let csRes = encodeCS(text, delimiter); // убираем кодовые вставки
    let cdRes = encodeCDATA(csRes.Result, delimiter); // убираем CDATA
    if (
        !res.join(csRes) ||
        !res.join(cdRes)
    ) logError("Ошибка при объединение результатов кодирования");
    return res;
}


/** преобразовывает безопасный XML в нормальный */
export function originalXML(text: string, data: XMLencodeResult): string
{
    let res = getElementsBack(text, data); // возвращаем закодированные элементы
    res = res.replace(/"(\[c#[\s\S]*\/c#\])"/, "'$1'"); // при parseXML все значения атрибутов переделываются под Attr="Val"
    return res;
}



//#endregion




/* доп. функции */
//#region 


/** 
 * Поиск закрывающего тега.
 * 
 * В `before` можно передавать предыдущий текст или позицию (== его длину)
*/
export function findCloseTag(opBracket: string, tagName: string, clBracket: string, before: string | number, fullText: string): TextRange
{
    try
    {
        let pos = typeof before == 'number' ? before : before.length;
        let textAfter = fullText.substr(pos);
        let rest = textAfter;
        let regOp = new RegExp("<" + safeString(tagName) + "[^\\w]");
        let regCl = new RegExp("<\\/" + safeString(tagName) + "[^\\w]");

        let op = -1;
        let cl = -1;
        let res = regCl.exec(rest);

        if (!!res) cl = rest.indexOf(res[0]);
        if (cl < 0) return null;

        res = regOp.exec(rest);
        if (!!res) op = rest.indexOf(res[0]);

        /** количество открывающихся */
        let cO = 1;
        /** количество закрывающихся */
        let cC = 0;
        while (cl > -1 && ((op > -1) || (cC != cO)))
        {
            if (op < cl && op > -1) // если сначала идёт открывающийся
            {
                rest = rest.substr(op + 1);
                let selfClosed = rest.match(/^\w*(\s+\w+=(("[^"]*")|('[^']*')))*\s*\/>/);
                if (!!selfClosed) // если он сам закрывается, то идём дальше
                {
                    rest = rest.substr(selfClosed[0].length);
                }
                else cO++;
            }
            else if (cO != cC)
            {
                rest = rest.substr(cl + 1);
                cC++;
            }

            if (cO == cC) break;
            cl = -1;
            op = -1;
            res = regCl.exec(rest);
            if (!!res) cl = rest.indexOf(res[0]);
            res = regOp.exec(rest);
            if (!!res) op = rest.indexOf(res[0]);
        }

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
    function tagIndex(text: string, substr: string): number
    {
        return positiveMin(text.lastIndexOf(substr + " "), text.lastIndexOf(substr + ">"));
    }

    try
    {
        let curIndex = prevText.lastIndexOf(opBracket);
        let txt = prevText.substr(0, curIndex);
        let rest = txt;
        let regOp = new RegExp("<" + safeString(tagName) + "[^\\w]");
        let regCl = new RegExp("<\\/" + safeString(tagName) + "[^\\w]");
        let cl = -1;
        let op = -1;

        op = tagIndex(rest, opBracket + tagName);
        if (op === null || op < 0) return null;

        cl = tagIndex(rest, opBracket + "/" + tagName);

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
            op = tagIndex(rest, opBracket + tagName);
            cl = tagIndex(rest, opBracket + "/" + tagName);
        }

        let clLast = rest.lastIndexOf(clBracket) + 1;

        if (op === null || op < 0 || clLast < 0) return null;
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

//#endregion
