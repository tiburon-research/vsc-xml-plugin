'use strict';

import * as server from 'vscode-languageserver';
import * as Encoding from './encoding'
import * as Parse from './parsing'
import * as JQuery from './tibJQuery'
import { CacheSet } from './cache'
import { safeSnippet, positiveMin, createDir, pathExists, uriFromName, unlockFile, showFile, fileIsLocked, lockFile, hideFile } from './customs'
import { ISurveyData } from './surveyData'
import { comparePositions, getCurrentLineText, getPreviousText, getWordAtPosition, getWordRangeAtPosition, isScriptLanguage, translatePosition, isValidDocumentPosition } from './vscodeDocument'
import { CurrentTag, IProtocolTagFields, CurrentTagFields, TagInfo, TextRange, SimpleTag, ProtocolTagFields, InlineAttribute, ITextRange, CurrentTagGetFields } from './currentTag'
import { translationArray, PreDefinedConstants, _pack } from './constants';
import '@vsc-xml-plugin/extensions';
import { KeyedCollection, KeyValuePair } from '@vsc-xml-plugin/common-classes/keyedCollection';




// проходной export, чтобы основное вызывать через import from 'tib-api'
export { JQuery, Parse, Encoding, safeSnippet, positiveMin, createDir, pathExists, uriFromName, ISurveyData, comparePositions, getCurrentLineText, getPreviousText, getWordAtPosition, getWordRangeAtPosition, isScriptLanguage, translatePosition, isValidDocumentPosition, CurrentTag, IProtocolTagFields, CurrentTagFields, TagInfo, TextRange, SimpleTag, ProtocolTagFields, InlineAttribute, ITextRange, CurrentTagGetFields, unlockFile, showFile, fileIsLocked, lockFile, hideFile };





/* ---------------------------------------- Classes, Structs, Namespaces, Enums, Consts, Interfaces ----------------------------------------*/
//#region


//enum WatcherCallContext { Client, Server };

/** Класс для получения логов внутри метода */
export class Watcher
{
	private _caller = "";
	private _hash = "";
	private _startTime: number;
	private _color = "";
	private _enabled = false;
	private _serverSide = false;

	/** `serverSide` - логи без подсветки */
	constructor(method: string, serverSide = false)
	{
		if (_pack == 'debug')
		{
			this._enabled = true;
			let rand = Math.floor(Math.random() * 10 ** 8);
			this._caller = method;
			this._hash = '' + rand;
			this._serverSide = serverSide;
			this._startTime = Date.now();
			if (!serverSide)
			{
				let colorsArray = ['darkslategray', 'orange', 'limegreen', 'indianred', 'olivedrab', 'olive', 'orangered', 'steelblue', 'cadetblue', 'navy', 'indigo', 'magenta', 'sienna', 'saddlebrown', 'brown'];
				let randomIndex = method.getHashCode() % colorsArray.length;
				this._color = colorsArray[randomIndex];
			}
		}
	}

	/** Возвращает строку для логирования на Client, чтоб в debugConsole */
	public GetLog(message: string): string[]
	{
		if (!this._enabled) return undefined;
		let data = this.generateString(message);
		return [data, 'color: #ccc', `color: ${this._color}`, 'color: #ccc', `color: ${this._color}; font-weight: bold;`, 'color: black'];
	}

	/** Создаёт метод логирования 
	 * 
	 * Для логов на клиенте можно передавать callback
	*/
	public CreateLogger(fn?: (data: string[]) => void): (data: String) => void
	{
		if (!this._enabled) return (data: string) => { };
		if (this._serverSide) return (data: string) => { console.log(this.generateString(data)); };
		let res = fn;
		if (!fn) res = (data: string[]) => { if (!!data) console.log(...data); };
		return (data: string) =>
		{
			res(this.GetLog(data));
		}
	}

	/*private _checkContext(): WatcherCallContext
	{
		let stack = new Error().stack.split('\n');
		let res: WatcherCallContext = WatcherCallContext.Server;
		if (!!stack && stack.length > 3)
		{
			let caller = stack[3]; // 1 = _checkContext, 2 = Log
			if (caller.contains('\\vsc-xml-plugin\\client\\')) res = WatcherCallContext.Client;
		}
		return res;
	}*/

	private generateString(message: string): string
	{
		let now = Date.now();
		let diff = now - this._startTime;
		let separator = this._serverSide ? '' : '%c';
		return `${separator}[${separator}${this._caller}.${separator}${this._hash}]: ${separator}<${now}-${diff}> ${separator}` + message;
	}
}

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
	duplicatedText = "duplicatedText",
	copyPastedCS = "copyPastedCS",
	wrongQuotes = "wrongQuotes",
	notImperative = "notImperative",
	linqHelp = "linqHelp",
	mixIdSuggestion = "mixIdSuggestion",
	oldCustomMethods = "oldCustomMethods",
	exportLabelsWithCS = "csInLabels",
	notDigitalAnswerIds = "notDigitalAnswerIds",
	metaNotProhibited = "metaNotProhibited"
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

export enum Language { XML, CSharp, CSS, JS, PlainText, Inline };



export interface IServerDocument
{
	uri: string;
	version: number;
	content: string;
}


export interface OnDidChangeDocumentData
{
	document: IServerDocument;
	// на contentChanges нельзя полагаться, т.к. при удалении он пустой
	// contentChanges: server.TextDocumentContentChangeEvent[];
	currentPosition?: server.Position;
	previousText?: string;
}


/** Коллекция для перевода */
const _translation = KeyedCollection.FromArrays(translationArray.rus, translationArray.eng);
const _translitaration = KeyedCollection.FromArrays(translationArray.rus, translationArray.engT);


//#endregion






/*---------------------------------------- Functions ----------------------------------------*/
//#region


/** Заменяет в строке все константы на значения */
export function applyConstants(input: string): string
{
	let cons = KeyedCollection.FromObject(PreDefinedConstants).Select((key, value) => new KeyValuePair<string>('@' + key, value));
	return input.replaceValues(cons.ToSimpleObject());
}

type LoggerFunction = (logData: string[]) => void;

export function getCurrentTag(data: CurrentTagGetFields, cache: CacheSet, logger?: LoggerFunction)
{
	return _getCurrentTag(data.document, data.position, cache, data.text, data.force, logger);
}


function _getCurrentTag(document: server.TextDocument, position: server.Position, cache: CacheSet, txt?: string, force = false, logger?: LoggerFunction): CurrentTag
{
	let watcher = new Watcher("CurrentTag");
	let log = !!logger ? (data: string) =>
	{
		logger(watcher.GetLog(data));
	} : (data: string) => { };

	log('start');
	let tag: CurrentTag;
	let text = txt || getPreviousText(document, position);

	// сначала пытаемся вытащить из кэша (сначала обновить, если позиция изменилась)
	if (!force)
	{
		log('checking cache');
		if (cache.Active())
		{
			cache.Update(document, position, text);
			tag = cache.Tag.Get();
		}
	}

	if (!tag)
	{
		log('updating tag');
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
				PreviousText: Encoding.clearXMLComments(text), //pure не подойдёт, потому что он чистит c#
				Body: tag.OpenTagIsClosed ? document.getText(server.Range.create(lastRange.end, position)) : undefined,
				LastParent: !!parents && parents.length > 0 ? parents.last() : undefined
			});
		}
	}
	log('complete');
	return tag;
}


/** Транслитерация по звукам с учётом итераторов (`allowIterators`) */
export function translate(input: string, allowIterators = true): string
{
	return _changeLanguage(input, _translation, allowIterators);
}

/** Транслитерация по написанию с учётом итераторов (`allowIterators`) */
export function translit(input: string, allowIterators = true): string
{
	return _changeLanguage(input, _translitaration, allowIterators);
}

function _changeLanguage(input: string, dict: KeyedCollection<string>, allowIterators = true): string
{
	let res = "";
	let reg = allowIterators ? /[\dA-Za-z_@\-\(\)]/ : /[\dA-Za-z_]/;
	for (const char of input)
	{
		if (!char.match(reg))
		{
			if (dict.ContainsKey(char))
				res += dict.Item(char);
			else res += "_";
		}
		else res += char;
	}
	return res;
}


//#endregion
