'use strict';
// ФУНКЦИИ ДЛЯ РАБОТЫ С server.TextDocument




import * as server from 'vscode-languageserver';
import { Language } from './index';



/** Текст всей строки для `position` */
export function getCurrentLineText(document: server.TextDocument, position: server.Position): string
{
	let start = server.Position.create(position.line, 0);
	let from = document.offsetAt(start);
	let fullText = document.getText();
	let res = fullText.slice(from);
	let lastIndex = res.indexOf('\n');
	if (lastIndex > -1) res = res.slice(0, lastIndex);
	return res;
}


/** Возвращает диапазон для слова в позиции `index` строки `line` */
function getWordRange(index: number, line: string, regex?: RegExp): { from: number, to: number }
{
	let emptyRange = { from: index, to: index };
	if (!line) return emptyRange;
	
	try
	{
	    if (!regex) regex = /\w/;
	    let from = index;
	    let to = from + 1;
	    for (let i = index; i < line.length; i++)
	    {
	        if (!line[i].match(regex))
	        {
	            to = i;
	            break;
	        }
	    }
	    for (let i = index; i > 0; i--)
	    {
	        if (!line[i - 1].match(regex))
	        {
	            from = i;
	            break;
	        }
	    }   
	    return { from, to };
	} catch (error) {
	    return emptyRange;
	}
}


/** Получает слово в текущей позиции 
 * 
 * `regex` - набор символов
 */
export function getWordAtPosition(document: server.TextDocument, position: server.Position, regex?: RegExp): string
{
	let line = getCurrentLineText(document, position);
	let range = getWordRange(position.character, line, regex);
	return line.slice(range.from, range.to);
}


/** Получает диапазон слова в позиции `position`
 * 
 * `regex` - набор символов
 */
export function getWordRangeAtPosition(document: server.TextDocument, position: server.Position, regex?: RegExp): server.Range
{
	let line = getCurrentLineText(document, position);
	let range = getWordRange(position.character, line, regex);
	return server.Range.create(server.Position.create(position.line, range.from), server.Position.create(position.line, range.to));
}


/** Получает текст от начала документа до `position` */
export function getPreviousText(document: server.TextDocument, position: server.Position, lineOnly: boolean = false): string
{
	try
	{
	    let start = lineOnly ? server.Position.create(position.line, 0) : server.Position.create(0, 0);
	    let end = server.Position.create(position.line, position.character);
	    let res = document.getText(server.Range.create(start, end));
	    return res;
	} catch (error)
	{
	    throw "Ошибка получения текста документа";
	}
}


/** C# / JS / CSS */
export function isScriptLanguage(lang: Language): boolean
{
	return lang == Language.CSharp || lang == Language.JS || lang == Language.CSS;
}


/** Возвращает сдвинутую позицию */
export function translatePosition(document: server.TextDocument, p: server.Position, offsetChars: number): server.Position
{
	let startOffset = document.offsetAt(p);
	return document.positionAt(startOffset + offsetChars);
}


/** Разница `p1`-`p2` */
export function comparePositions(document: server.TextDocument, p1: server.Position, p2: server.Position): number
{
	return document.offsetAt(p1) - document.offsetAt(p2);
}

/** Проверяет есть ли в `document` такая `position` */
export function isValidDocumentPosition(document: server.TextDocument, position: server.Position):boolean
{
	let offset = document.offsetAt(position);
	return comparePositions(document, position, document.positionAt(offset)) === 0;
}
