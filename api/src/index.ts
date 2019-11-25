'use strict';

import * as server from 'vscode-languageserver';
import * as Encoding from './encoding'
import * as Parse from './parsing'
import * as JQuery from './tibJQuery'
import { CacheSet } from './cache'
import { KeyValuePair, KeyedCollection, safeString, IPair, positiveMin, createDir, pathExists, uriFromName, unlockFile, showFile, fileIsLocked, lockFile, hideFile } from './customs'
import { ISurveyData } from './surveyData'
import { comparePositions, getCurrentLineText, getPreviousText, getWordAtPosition, getWordRangeAtPosition, isScriptLanguage, translatePosition, isValidDocumentPosition } from './vscodeDocument'
import { CurrentTag, IProtocolTagFields, CurrentTagFields, TagInfo, TextRange, SimpleTag, ProtocolTagFields, InlineAttribute, ITextRange, CurrentTagGetFields } from './currentTag'
import { translationArray, PreDefinedConstants } from './constants';




// проходной export, чтобы основное вызывать через import from 'tib-api'
export { JQuery, Parse, Encoding, KeyValuePair, KeyedCollection, safeString, IPair, positiveMin, createDir, pathExists, uriFromName, ISurveyData, comparePositions, getCurrentLineText, getPreviousText, getWordAtPosition, getWordRangeAtPosition, isScriptLanguage, translatePosition, isValidDocumentPosition, CurrentTag, IProtocolTagFields, CurrentTagFields, TagInfo, TextRange, SimpleTag, ProtocolTagFields, InlineAttribute, ITextRange, CurrentTagGetFields, unlockFile, showFile, fileIsLocked, lockFile, hideFile };





/* ---------------------------------------- Classes, Structs, Namespaces, Enums, Consts, Interfaces ----------------------------------------*/
//#region

	
export enum ErrorCodes
{
	wrongIds = "wrongIds",
	longIds = "longIds",
	wrongXML = "wrongXML",
	duplicatedId = "duplicatedId",
	wrongMixes = "wrongMixes",
	csInAutoSplit = "csInAutoSplit",
	wrongSpaces = "wrongSpaces",
	constantIds = "constantIds",
	delimitedConstant = "delimitedConstant",
	eqHeaders = "eqHeaders",
	copyPastedCS = "copyPastedCS"
};
	
export interface IErrorTagData
{
	Language: Language;
	XmlPath: string;
}

/** Для передачи ошибки на клиента */
export interface IErrorLogData
{
	/** Описание для пользователя */
	MessageFriendly: string;
	/** Текст ошибки */
	Message?: string
	/** Ошибка не будет показана */
	Silent: boolean;
	StackTrace?: any;
	/** Информация о закешированном теге */
	TagData?: IErrorTagData;
}


/** Результат сортировки массива */
export interface SortedArrayResult<T>
{
	/** Отсортированный массив элементов */
	Array: T[];
	/** Отсортированный массив индексов */
	IndexOrder: number[];
}

interface ArraySortingData<T>
{
	Element: T;
	Index: number;
}

export enum Language { XML, CSharp, CSS, JS, PlainText, Inline };


/** Результат поиска в строке */
export interface SearchResult
{
	Result: RegExpMatchArray;
	Index: number;
}


export interface IServerDocument
{
	uri: string;
	version: number;
	content: string
}


export interface OnDidChangeDocumentData
{
	document: IServerDocument;
	//contentChanges: server.TextDocumentContentChangeEvent[];
	currentPosition?: server.Position;
	previousText?: string;
}


/** Коллекция для перевода */
const _translation = KeyedCollection.FromArrays(translationArray.rus, translationArray.eng);


//#endregion






/*---------------------------------------- Functions ----------------------------------------*/
//#region


/** Заменяет в строке все константы на значения */
export function applyConstants(input: string): string
{
	let cons = KeyedCollection.FromObject(PreDefinedConstants).Select((key, value) => new KeyValuePair<string>('@' + key, value));
	return input.replaceValues(cons);
}


export function getCurrentTag(data: CurrentTagGetFields, cache: CacheSet)
{
	return _getCurrentTag(data.document, data.position, cache, data.text, data.force);
}


function _getCurrentTag(document: server.TextDocument, position: server.Position, cache: CacheSet, txt?: string, force = false): CurrentTag
{
	let tag: CurrentTag;
	let text = txt || getPreviousText(document, position);

	// сначала пытаемся вытащить из кэша (сначала обновить, если позиция изменилась)
	if (!force)
	{
		if (cache.Active())
		{
			cache.Update(document, position, text);
			tag = cache.Tag.Get();
		}
	}

	if (!tag)
	{
		// собираем тег заново
		let pure: string;
		if (!pure) pure = CurrentTag.PrepareXML(text);
		let ranges = Parse.getParentRanges(document, pure);
		// где-то вне
		if (ranges.length == 0) tag = null;//new CurrentTag("XML");
		else
		{
			let parents = ranges.map(range => new SimpleTag(document, range))

			/** Последний незакрытый тег */
			let current = parents.pop();
			tag = new CurrentTag(current, parents);

			// Заполняем поля
			let lastRange = ranges.last();
			tag.SetFields({
				StartPosition: current.OpenTagRange.start,
				StartIndex: document.offsetAt(current.OpenTagRange.start),
				PreviousText: text,
				Body: tag.OpenTagIsClosed ? document.getText(server.Range.create(lastRange.end, position)) : undefined,
				LastParent: !!parents && parents.length > 0 ? parents.last() : undefined
			});
		}
	}
	return tag;
}


/** Транслитерация с учётом итераторов (`allowIterators`) */
export function translate(input: string, allowIterators = true): string
{
	let res = "";
	let reg = allowIterators ? /[\dA-Za-z_@\-\(\)]/ : /[\dA-Za-z_]/;
	for (const char of input)
	{
		if (!char.match(reg))
		{
			if (_translation.ContainsKey(char))
				res += _translation.Item(char);
			else res += "_";
		}
		else res += char;
	}
	return res;
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
		/** Находит все вхождения
		 * 
		 * Нельзя использовать флаг `g`!
		*/
		findAll(search: string | RegExp): SearchResult[];
		/** Продвинутый lastIndexOf string=Regexp */
		//findLast(search: string): SearchResult;
		/** Поиск с группами по всей строке 
		 *  
		 * Нельзя использовать флаг `g`!
		*/
		matchAll(search: RegExp): RegExpMatchArray[];
		/** Замена, начиная с `from` длиной `subsr` символов (если string, то берётся длина строки) */
		replaceRange(from: number, substr: string | number, newValue: string): string;
		/** Заменяет все Key (отсортированные) на Value */
		replaceValues(items: KeyedCollection<string>): string
		/** Проверяет вхождение */
		contains(search: string): boolean
	}

	interface Array<T>
	{
		/** Возвращает последний элемент */
		last(): T;
		/** Проверяет, что все элементы совпадают, независимо от порядка */
		equalsTo(ar: Array<T>): boolean;
		//** Возвращает массив уникальных значений */
		distinct(): T[]
		/** Содержит элемент */
		contains(element: T, compareFunc?: (elem1: T, elem2: T) => boolean): boolean;
		/** Удаляет элемент из массива и возвращает этот элемент */
		remove(element: T): T;
		/** Преобразует массив в коллекцию */
		toKeyedCollection<Q>(func: (x: T) => KeyValuePair<Q>): KeyedCollection<Q>
		/** Преобразует массив в коллекцию T */
		toKeyedCollection<Q>(func: (x: T) => Q): KeyedCollection<Q>
		/** Асинхронный forEach */
		forEachAsync<R>(func: (x: T, i?: number) => Promise<R>): Promise<R[]>
		/** Сортировка массива с сохранением порядка индексов (аналогично `sort`) */
		orderBy<T>(func?: (a: T, b: T) => number): SortedArrayResult<T>
		/** Сортировка преобразованного массива */
		orderByValue<T>(this: Array<T>, func: (a: T) => string | number, desc?: boolean): T[]
		/** Находит повторяющиеся значения */
		findDuplicates<T>(compareFunc?: (elem1: T, elem2: T) => boolean): T[]
		/** Группирует элементы по ключу */
		groupBy<T>(keyFunc: (el: T) => string): KeyedCollection<T[]>
	}

}

String.prototype.find = function (this: string, search: string | RegExp): SearchResult
{
	let res = new RegExp(search).exec(this);
	let ind = !!res ? res.index : -1;
	return { Index: ind, Result: res };
}

String.prototype.findAll = function (this: string, search: string | RegExp): SearchResult[]
{
	let res: SearchResult[] = [];
	let value = typeof search == "string" ? search : search.source;
	let reg = new RegExp(value);
	let match: RegExpExecArray;
	let restText = this;
	let len = this.length;
	let i = 0;
	while ((match = reg.exec(restText)) !== null && i < 10000)
	{
		let index = len - restText.length + match.index;
		res.push({ Result: match, Index: index });
		restText = restText.slice(match.index + match[0].length);
		i++;
	}
	if (i >= 10000) throw "Слишком много итераций при поиске элементов";
	return res;
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
	let res: RegExpMatchArray[] = [];
	if (typeof search == 'undefined') return res;
	let mat: RegExpExecArray;
	let text = this;
	let reg = new RegExp(search, search.flags + "g");
	while ((mat = reg.exec(text)) !== null)
	{
		res.push(mat);
	}
	return res;
}

String.prototype.replaceRange = function (from: number, substr: string | number, newValue: string): string
{
	let pre = (this as string).slice(0, from);
	let middle = newValue;
	let to = from + (typeof substr == "string" ? substr.length : substr);
	let after = (this as string).slice(to);
	return pre + middle + after;
}


String.prototype.replaceValues = function (elements: KeyedCollection<string>): string
{
	let res = this as string;
	elements.OrderBy((key, value) => key.length).ForEach((key, value) =>
	{
		res = res.replace(new RegExp(safeString(key), "g"), value);
	});
	return res;
}


String.prototype.contains = function (search: string): boolean
{
	return this.indexOf(search) > -1;
}



Array.prototype.last = function <T>(this: T[]): T
{
	let res: T;
	if (this.length > 0) res = this[this.length - 1];
	return res;
}


Array.prototype.equalsTo = function <T>(this: T[], ar: Array<T>): boolean
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


Array.prototype.distinct = function <T>(this: T[]): T[]
{
	let orig: Array<T> = this;
	return [... new Set(orig)];
}


Array.prototype.contains = function <T>(this: T[], element: T, compareFunc?: (elem1: T, elem2: T) => boolean): boolean
{
	if (!compareFunc) return this.indexOf(element) > -1;
	return this.findIndex(x => { return compareFunc(x, element); }) > -1;
}


Array.prototype.remove = function <T>(this: T[], element: T): T
{
	let index = this.indexOf(element);
	let res: T;
	if (index > -1)
		res = this.splice(index, 1)[0];
	return res;
}

Array.prototype.toKeyedCollection = function <Q, T>(this: T[], func: (x: T) => KeyValuePair<Q>): KeyedCollection<Q>
{
	let res = new KeyedCollection<Q>();
	this.forEach(element =>
	{
		res.AddElement(func(element));
	});
	return res;
}


Array.prototype.toKeyedCollection = function <Q, T>(this: T[], func: (x: T) => Q): KeyedCollection<Q>
{
	let res = new KeyedCollection<Q>();
	this.forEach(element =>
	{
		let obj = func(element);
		let key = Object.keys(obj)[0];
		res.AddPair(key, obj[key] as Q);
	});
	return res;
}


Array.prototype.forEachAsync = function <T, R>(this: T[], func: (x: T, i?: number) => Promise<R>): Promise<R[]>
{
	let promises: Promise<R>[] = [];
	let index = 0;
	this.forEach(element =>
	{
		promises.push(func(element, index));
		index++;
	});
	return Promise.all(promises);
}


Array.prototype.orderBy = function <T>(this: Array<T>, func?: (a: T, b: T) => number): SortedArrayResult<T>
{
	let sortFunction = !!func ? func : (a: T, b: T) => {
		if (a > b) return 1;
		if (b > a) return -1;
		return 0;
	}
	let res: ArraySortingData<T>[] = this.map((x, i) => { return { Element: x, Index: i } as ArraySortingData<T> }).sort((a, b) => sortFunction(a.Element, b.Element));
	return {
		Array: res.map(x => x.Element),
		IndexOrder: res.map(x => x.Index)
	}
}


Array.prototype.orderByValue = function <T>(this: Array<T>, func: (a: T) => string | number, desc = false): T[]
{
	// стандартная функция сортировки
	let sortingData = this.map(x => func(x)).orderBy((a, b) =>
	{
		if (a > b) return desc? -1 : 1;
		if (b > a) return desc ? 1 : -1;
		return 0;
	})
	return sortingData.IndexOrder.map(i => this[i]);
}


Array.prototype.findDuplicates = function <T>(this: Array<T>, compareFunc?: (elem1: T, elem2: T) => boolean): T[]
{
	let res: T[] = [];
	let func = compareFunc || ((elem1: T, elem2: T) => { return elem1 == elem2; });
	for (let i = 0; i < this.length; i++)
	{
		const currentElement = this[i];
		if (!res.contains(currentElement, func) && this.slice(i + 1).findIndex(x => { return func(x, currentElement); }) > -1)
		{
			res.push(currentElement);
		}
	}
	return res;
}


Array.prototype.groupBy = function <T>(this: Array<T>, keyFunc: (el: T) => string): KeyedCollection<T[]>
{
	let res = new KeyedCollection<T[]>();
	this.forEach(element => {
		let key = keyFunc(element);
		let existing = res.Item(key);
		if (!existing) existing = [];
		existing.push(element);
		res.AddPair(key, existing);
	});
	return res;
}


//#endregion
