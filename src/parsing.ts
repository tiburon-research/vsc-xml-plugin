'use strict'

import { TextRange, safeString, TagInfo, RegExpPatterns } from "./classes";
import { logError } from "./extension";
import { clearXMLComments } from "./encoding"
import { positiveMin, KeyedCollection, CurrentTag } from "./classes"



/** Результат поиска тегов */
export interface FindTagResult
{
    Range: TextRange;
    /** Самозакрывающийся тег */
    SelfClosed: boolean;
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
        
        tResult.Range = { From: fullText.length - rest.length - 1, To: fullText.length - rest.length + clLast, Length: clLast + 1 };    
        return tResult;
    }
    catch (err)
    {
        logError("Ошибка при поиске закрывающегося тега");
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
        
        tResult.Range = { From: rest.length, To: to, Length: to - rest.length };
        return tResult;
    }
    catch (err)
    {
        logError("Ошибка при поиске открывающегося тега");
    }
    return null;
}


/** Тег, не требующий закрывающего */
export function isSelfClosedTag(tag: string): boolean
{
    return !!tag.match("^(" + RegExpPatterns.SelfClosedTags + ")$");
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
        logError("Ошибка при поиске вложенных тегов");
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
        logError("Ошибка выделения строки");
    }
    return false;
}


/** Индекс конца закрывающегося тега. 
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