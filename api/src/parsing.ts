'use strict'

import { Language } from "./index";
import { TextRange, TagInfo, CurrentTag } from './currentTag'
import { safeString, positiveMin, KeyedCollection } from './customs'
import { clearXMLComments } from "./encoding"
import { RegExpPatterns } from './constants'
import * as charDetect from 'charset-detector'
import * as server from 'vscode-languageserver';
import { init as initJQuery } from './tibJQuery';



/** Результат поиска тегов */
export interface FindTagResult
{
    Range: TextRange;
    /** Самозакрывающийся тег */
    SelfClosed: boolean;
}


export interface ParsedElementObject
{
    Id: string;
    Text: string;
    Delimiter?: string;
}


/** 
 * Поиск закрывающего тега.
 * 
 * @param before предыдущий текст или позиция (== его длина)
 * @returns `FindTagResult` или `null`, если тег не закрыт
 * 
 * Если selfClosed, то `Range = null`
*/
export function findCloseTag(opBracket: string, tagName: string, clBracket: string, before: string | number, fullText: string): FindTagResult
{
    let tResult: FindTagResult = { Range: null, SelfClosed: false };
    let sct = new RegExp("^" + safeString(opBracket) + "?\\w*(\\s+\\w+=((\"[^\"]*\")|('[^']*')))*\\s*\\/" + safeString(clBracket) + ""); // для проверки на selfCloseed
    try
    {
        let pos = typeof before == 'number' ? before : before.length;
        pos++; // сдвигаем после <
        let textAfter = fullText.substr(pos);
        if (textAfter.match(sct))
        {
            // SelfClosed
            tResult.SelfClosed = true;
            return tResult;
        }
        let rest = textAfter;
        let regOp = new RegExp(safeString(opBracket) + safeString(tagName) + "[^\\w]");
        let regCl = new RegExp(safeString(opBracket) + "\\/" + safeString(tagName) + "[^\\w]");
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
                let selfClosed = rest.match(sct);
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

        tResult.Range = new TextRange({ From: fullText.length - rest.length - 1, To: fullText.length - rest.length + clLast });
        return tResult;
    }
    catch (err)
    {
        throw "Ошибка при поиске закрывающегося тега";
    }
    return null;
}


/** 
 * Поиск открывающего тега.
 * 
 * @param prevText предыдущий текст
 * @returns `FindTagResult` или `null`, если открывающий тег не найден
*/
export function findOpenTag(opBracket: string, tagName: string, clBracket: string, prevText: string): FindTagResult
{
    let tResult: FindTagResult = { Range: null, SelfClosed: false };

    /** Последняя из найденных позиций */
    function tagIndex(text: string, substr: string): number
    {
        return Math.max(text.lastIndexOf(substr + " "), text.lastIndexOf(substr + clBracket));
    }

    try
    {
        let curIndex = prevText.lastIndexOf(opBracket);
        let txt = prevText.substr(0, curIndex);
        let rest = txt;
        let regOp = new RegExp(safeString(opBracket) + safeString(tagName) + "[^\\w]");
        let regCl = new RegExp(safeString(opBracket) + "\\/" + safeString(tagName) + "[^\\w]");
        let cl = -1;
        let op = -1;

        op = tagIndex(rest, opBracket + tagName);

        if (op === null || op < 0) return null;

        cl = tagIndex(rest, opBracket + "/" + tagName);

        let cO = 0;
        let cC = 1;
        while (op !== null && ((cl === null) || cO != cC))
        {
            if (cl !== null && cl > op)
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

        if (op === null || clLast < 0) return null;

        let to = txt.indexOf(clBracket, rest.length + 1);

        tResult.Range = new TextRange({ From: rest.length, To: to });
        return tResult;
    }
    catch (err)
    {
        throw "Ошибка при поиске открывающегося тега";
    }
    return null;
}


/** Тег, не требующий закрывающего */
export function isSelfClosedTag(tag: string): boolean
{
    return !!tag && !!tag.match("^(" + RegExpPatterns.SelfClosedTags + ")$");
}


/** получает теги 0 вложенности */
export function get1LevelNodes(text: string): TagInfo[]
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
        throw "Ошибка при поиске вложенных тегов";
    }
    return tags;
}


/** Проверка на нахождение внутри кавычек */
export function inString(text: string): boolean
{
    try
    {
        let rest = text.replace(/\\"/g, "  "); // убираем экранированные кавычки
        let i = positiveMin(rest.indexOf("'"), rest.indexOf("\""));
        while (rest.length > 0 && i !== null)
        {
            if (i !== null)
            {
                let ch = rest[i];
                rest = rest.substr(i + 1);
                let next = rest.indexOf(ch);
                if (next < 0) return true;
                rest = rest.substr(next + 1);
                i = positiveMin(rest.indexOf("'"), rest.indexOf("\""));
            }
        }
    } catch (error)
    {
        throw "Ошибка выделения строки";
    }
    return false;
}


/** Индекс конца открывающегося тега. 
 * 
 * Текст должен начинаться с открывающегося тега. Если не находит возвращает -1.
*/
export function indexOfOpenedEnd(text: string): number
{
    let res = text.match(/^<\w+(\s+(\w+=(("[^"]*")|('[^']*'))\s*)*)?\/?>/);
    if (!res) return -1;
    return res[0].length - 1;
}


/** проверяет содержит ли строка начало объявления метода */
export function isMethodDefinition(text: string): boolean
{
    return !!text.match(/((public)|(private)|(protected))(((\s*static)|(\s*readonly))*)?\s+([\w<>\[\],\s]+)\s+\w+(\([^\)]*)?$/);
}


/** Получает коллекцию атрибутов из строки */
export function getAttributes(str: string): KeyedCollection<string>
{
    return CurrentTag.GetAttributesArray(str);
}

/** Возвращает `true`, если файл может быть прочитан в `windows-1251` */
export function win1251Avaliabe(buf: Buffer)
{
    let charsetMatch: Array<any> = charDetect(buf) || [];
    return charsetMatch.filter(x => (x.charsetName as string).toLowerCase() == 'windows-1251').length > 0;
}


/** Разбирает текст на `Id` + `Text` */
export function parseElements(strings: string[]): ParsedElementObject[]
{
    let res: ParsedElementObject[];
    if (strings.length == 0) return res;
    strings = strings.map(x => x.trim()).filter(x => x.length > 0);

    // пробуем разбить на Id + text
    let regTests = [
        {
            Regex: /^(\d+)([\.\-—:\s]*)(.+?)$/,
            IdGroup: 1,
            TextGroup: 3
        },
        {
            Regex: /^(.+?)([\.\-—:\s]*)(\d+)$/,
            IdGroup: 3,
            TextGroup: 1
        }
    ];

    let withIds = false;

    for (let i = 0; i < regTests.length; i++)
    {
        const reg = regTests[i];
        res = [];
        let found = true;
        for (let j = 0; j < strings.length; j++)
        {
            const str = strings[j];
            let match = str.match(reg.Regex);
            if (!match)
            {
                found = false;
                break;
            }
            res.push({ Id: match[reg.IdGroup], Text: match[reg.TextGroup] });
        }
        if (found)
        {
            withIds = true;
            break;
        }
    }

    if (!withIds)
    {
        for (let i = 0; i < strings.length; i++)
        {
            res.push({ Id: '' + (i + 1), Text: strings[i] });
        }
    }

    return res;
}


/** Вычленяет вопрос из строки */
export function parseQuestion(text: string): ParsedElementObject
{
    let res = { Id: "", Text: text, Prefix: "" };
    let match = text.match(/^([A-Za-z]+\w+)(\.?\s*)(.*)/);
    if (!match) return res;
    res.Id = match[1];
    res.Prefix = match[2];
    res.Text = match[3];
    return res;
}


interface ParentSearchResult
{
    Range: server.Range;
    TagName: string;
}

/** массив из Range всех незакрытых тегов 
 * @param prevText предыдущий текст (от начала документа)
 * @param startFrom откуда начинать
 * 
 * Теги JS, CSS и PlainText не парсятся
*/
export function getParentRanges(document: server.TextDocument, prevText: string, startFrom: number = 0): server.Range[]
{
    let res: server.Range[] = [];
    let rest = prevText.slice(startFrom);
    let next = getNextParent(document, rest, prevText);
    let i = 0;
    while (!!next && i < 50)
    {
        res.push(next.Range);
        rest = prevText.slice(document.offsetAt(next.Range.end));
        next = getNextParent(document, rest, prevText);
        if (!!next && !tagNeedToBeParsed(next.TagName))
        {
            res.push(next.Range);
            break;
        }
    }
    if (i >= 50) throw "Найдено слишком много вложенных тегов";
    return res;
}


/** Поиск позиции следующего незакрытого тега 
 * 
 * Возвращает Range открывающего или `null` если больше нет.
 * 
 * Теги JS, CSS и PlainText не парсятся.
*/
function getNextParent(document: server.TextDocument, text: string, fullPrevText?: string): ParentSearchResult
{
    let res = text.find(/<((?!xml)(\w+))/); // находим открывающийся
    if (res.Index < 0) return null;// открытых больше нет
    let tagName = res.Result[1];
    let rest = text.slice(res.Index); // от начала открывающегося
    let lastIndex = indexOfOpenedEnd(rest); // ищем его конец	

    if (!fullPrevText) fullPrevText = text; // если первый раз
    let shift = fullPrevText.length - text.length + res.Index; // сдвиг относительно начала документа
    let from = document.positionAt(shift); // стартовая позиция

    if (lastIndex < 0) // если открывающий тег неполный, то считаем, что курсор сейчас в нём
    {
        let to = document.positionAt(fullPrevText.length);
        return { Range: server.Range.create(from, to), TagName: tagName };
    }

    // двигаем относительно начала тега
    lastIndex += shift;

    // ищем закрывающий
    let closingTag = findCloseTag("<", res.Result[1], ">", shift, fullPrevText);

    if (!closingTag) // если не закрыт, то возвращаем его
    {
        let to = document.positionAt(lastIndex + 1);
        return { Range: server.Range.create(from, to), TagName: tagName };
    }

    // продолжаем искать после закрывающего
    if (closingTag.SelfClosed) rest = fullPrevText.slice(lastIndex);
    else rest = fullPrevText.slice(closingTag.Range.To + 1);
    return getNextParent(document, rest, fullPrevText);
}


/** Проверяет нужно ли парсить этот тег */
export function tagNeedToBeParsed(tagName: string): boolean
{
    let lang = TagInfo.getTagLanguage(tagName);
    let stopLangs = [Language.PlainText, Language.CSS, Language.JS];
    return stopLangs.indexOf(lang) < 0;
}


/** Удаляет из `text` объявление xml */
export function ReplaceXMLDeclaration(text: string): { Result: string, Declaration: string }
{
    let mt = text.match(/^\s*<\?xml[^>]*\?>/i);
    let res = text;
    let dec = null;
    if (!!mt)
    {
        res = res.replace(mt[0], "");
        dec = mt[0];
    }
    return { Result: res, Declaration: dec };
}



export interface IDocumentElement
{
    Value: RegExpMatchArray;
    From: number;
    To: number;
    Message: string;
    /** Если задан, используется для преобразования в `DiagnosticElement` */
    DiagnosticProperties?:
    {
        Type?: server.DiagnosticSeverity;
        Code?: string | number;
    }
}


/** Хранит информацию о расположении и тексте */
export class DocumentElement implements IDocumentElement
{
    constructor(document: server.TextDocument, obj: IDocumentElement)
    {
        for (const key in obj)
        {
            this[key] = obj[key];
        }
        this.Range = server.Range.create(document.positionAt(this.From), document.positionAt(this.To));
        this.Location = server.Location.create(document.uri, this.Range);
    }

    public Value: RegExpMatchArray;
    public From: number;
    public To: number;
    public Message: string;
    /** используется, только если задан вручную и не `null` */
    /** Если задан используется для преобразования в `DiagnosticElement` */
    DiagnosticProperties?:
        {
            Type?: server.DiagnosticSeverity;
            Code?: string | number;
        } = {};

    public Range: server.Range;
    public Location: server.Location;
}


/** 
 * Возвращает массив найденных `DocumentElement` 
 * 
 * Нельзя использовать флаг `g`!
 * 
 * Если задан `preparedText`, то используется он (но сначала сравнивается длина)
 * 
*/
export async function getDocumentElements(document: server.TextDocument, search: RegExp, errorMessage: string, preparedText: string): Promise<DocumentElement[]>
{
    let res: DocumentElement[] = [];
    let text = preparedText;
    let matches = text.matchAll(search);
    if (!!matches && matches.length > 0)
    {
        matches.forEach(element =>
        {
            let to = element.index + element[0].length;
            res.push(new DocumentElement(document, {
                Value: element,
                From: element.index,
                To: to,
                Message: errorMessage
            }));
        });
    }
    return res;
}


/** Возвращает все повторяющиеся Id, как `DocumentElement` */
export function getDuplicatedElementsIds(document: server.TextDocument, prepearedText: string): Promise<DocumentElement[]>
{
    return new Promise<DocumentElement[]>((resolve, reject) =>
    {
        let $ = initJQuery();
        let res: DocumentElement[] = [];
        let tagNames = ['Page', 'List', 'Question', 'Block'];
        let $dom;
        try
        {
            $dom = $.XMLDOM(prepearedText);
        } catch (error)
        { return resolve(res) }
        if (!$dom) return resolve(res);

        let ids = new KeyedCollection<string[]>();

        // собираем все Id
        tagNames.forEach(element =>
        {
            let ar: string[] = [];
            $dom.find(element).each((i, e) => ar.push($(e).attr('Id')));
            ids.AddPair(element, ar);
        });

        ids.ForEach((key, value) =>
        {
            // находим Range для дублирующихся
            let duplicated: string[] = value.reduce(function (acc, el, i, arr)
            {
                if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el);
                return acc;
            }, []);
            if (duplicated.length > 0)
            {
                duplicated.forEach(d =>
                {
                    let reg = new RegExp('(<' + key + ")(" + RegExpPatterns.SingleAttribute + ")*\\s*(Id=('|\")" + d + "('|\"))");
                    let matches = prepearedText.matchAll(reg);
                    if (!!matches)
                    {
                        matches.forEach(mt =>
                        {
                            if (!!mt.index)
                            {
                                let full = mt[0];
                                let idAttr = mt[mt.length - 3];
                                let from = mt.index + full.length - idAttr.length;
                                let to = mt.index + full.length;
                                let isWarning = d.contains("@");
                                res.push(new DocumentElement(document, {
                                    Value: null,
                                    From: from,
                                    To: to,
                                    Message: isWarning ? "Возможно Id дублируются" : "Найдены дублирующиеся Id",
                                    DiagnosticProperties: { Type: isWarning ? server.DiagnosticSeverity.Warning : server.DiagnosticSeverity.Error }
                                }));
                            }
                        });
                    }
                });
            }
        });

        resolve(res);
    });

}

export function getWrongMixedElements(document: server.TextDocument, prepearedText: string): Promise<DocumentElement[]>
{
    return new Promise<DocumentElement[]>((resolve, reject) =>
    {
        let res: DocumentElement[] = [];
        let parentRegexQuestion = /<(Question)\s[^>]*Mix(Id)?=[^>]*>[\s\S]*?<\/\1/;
        let parentRegexPage = /<(Page)\s[^>]*Mix(Id)?=[^>]*>[\s\S]*?<\/\1/;
        let repeatRegex = /(<Repeat\s[^>]*)(Mix(Id)?)=/;
        let parents = prepearedText.matchAll(parentRegexQuestion).concat(prepearedText.matchAll(parentRegexPage));

        parents.forEach(parent =>
        {
            let repeat = parent[0].find(repeatRegex);
            if (!!repeat.Result && repeat.Result.length > 0)
            {                    
                let resultIndex = parent.index + repeat.Index + repeat.Result[1].length;
                let endIndex = resultIndex + repeat.Result[2].length;

                // надо проверить, что это ближайший родитель (допустим, просто нету Question)
                if (parent[1] == "Page")
                {
                    let preRepeat = parent[0].slice(10, repeat.Index);
                    if (preRepeat.indexOf("<Question") > -1) return;   
                }

                res.push(new DocumentElement(document, {
                    From: resultIndex,
                    To: endIndex,
                    Value: repeat.Result,
                    Message: `${repeat.Result[2]} уже указан в теге ${parent[1]}: проблем при перемешивании не избежать`
                }));
            }
        });
        resolve(res);
    });
}
