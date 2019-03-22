'use strict';

import * as server from 'vscode-languageserver';
import * as Encoding from './encoding'
import * as Parse from './parsing'
import * as clipboard from "clipboardy"
import * as Constants from './constants'
import * as JQuery from './tibJQuery'
import { CacheSet } from './cache'
import * as fs from 'fs'
import Uri from 'vscode-uri'


export { Encoding, Parse, Constants, JQuery };



/* ---------------------------------------- Classes, Structs, Namespaces, Enums, Consts, Interfaces ----------------------------------------*/
//#region


/** Для передачи ошибки на клиента */
export interface IErrorLogData
{
	Message: string;
	/** Ошибка не будет показана */
	Silent: boolean;
	Error?: any;
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
interface SearchResult
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


/**
 * @param From Включаемая граница
 * @param To Не влючамая граница
*/
export class ITextRange
{
	From: number;
	To: number;
}

export class TextRange
{
	From: number;
	To: number;

	get Length(): number
	{
		return this.To - this.From;
	}

	constructor(obj: ITextRange)
	{
		if (!!obj)
		{
			for (let key in obj)
			{
				this[key] = obj[key];
			}
		}
	}

	ToRange(document: server.TextDocument): server.Range
	{
		return server.Range.create(document.positionAt(this.From), document.positionAt(this.To));
	}
}



/** Пара ключ-значение */
export interface IPair<T>
{
	Key: string;
	Value: T;
}


/** Элемент `KeyedCollection` */
export class KeyValuePair<T> implements IPair<T>
{
	constructor(key: string, value: T)
	{
		this.Key = key;
		this.Value = value;
	}

	Key: string;
	Value: T;
}

export class KeyedCollection<T>
{
	protected items: { [index: string]: T } = {};
	private count: number = 0;

	constructor()
	{
	}

	/** Создаёт коллекцию из массивов ключей и значений */
	public static FromArrays<T>(keys: string[], values: T[]): KeyedCollection<T>
	{
		if (keys.length != values.length) return null;
		let res = new KeyedCollection<T>();
		for (let i = 0; i < keys.length; i++)
		{
			res.AddPair(keys[i], values[i]);
		}
		return res;
	}

	/** Создаёт коллекцию из массива `IPair` */
	public static FromPairs<T>(pairs: IPair<T>[]): KeyedCollection<T>
	{
		let res = new KeyedCollection<T>();
		pairs.forEach(pair =>
		{
			res.AddPair(pair.Key, pair.Value);
		});
		return res;
	}

	/** Проверяет наличие ключа */
	public Contains(key: string): boolean
	{
		return this.items.hasOwnProperty(key);
	}

	public Count(): number
	{
		return this.count;
	}

	public AddElement(element: KeyValuePair<T>)
	{
		this.AddPair(element.Key, element.Value);
	}

	/** Добавляет или заменяет */
	public AddPair(key: string, value: T)
	{
		if (!this.items.hasOwnProperty(key))
			this.count++;

		this.items[key] = value;
	}

	public Remove(key: string): T
	{
		let val = this.items[key];
		delete this.items[key];
		this.count--;
		return val;
	}

	public Item(key: string): T
	{
		return this.items[key];
	}

	/** массив ключей */
	public Keys(): string[]
	{
		let keySet: string[] = [];

		for (let prop in this.items)
		{
			if (this.items.hasOwnProperty(prop))
			{
				keySet.push(prop);
			}
		}

		return keySet;
	}

	/** массив значений */
	public Values(): T[]
	{
		let values: T[] = [];

		for (let prop in this.items)
		{
			if (this.items.hasOwnProperty(prop))
			{
				values.push(this.items[prop]);
			}
		}

		return values;
	}

	/** Очищает всю коллекцию */
	public Clear(): void
	{
		this.items = {};
		this.count = 0;
	}

	/** обход элементов */
	public forEach(callback: (key: string, val: T) => any)
	{
		for (let key in this.items)
			callback(key, this.Item(key));
	}

	/** 
	 * преобразует набор 
	 * @param clearNull очищать ли по проверке (!!element)
	*/
	public Select(filter: (key: string, value: T) => any, clearNull = false): any[]
	{
		let res = [];
		this.forEach((key, value) =>
		{
			let item = filter(key, value);
			if (!clearNull || !!item) res.push(item);
		});
		return res;
	}

	/** Фильтрует набор */
	protected Filter(filter: (key: string, value: T) => boolean): KeyedCollection<T>
	{
		let res = new KeyedCollection<T>();
		this.forEach((key, value) =>
		{
			if (filter(key, value)) res.AddPair(key, value);
		});
		return res;
	}

	/** Обновляет значение элемента по ключу */
	public UpdateValue(key: string, transform: (value: T) => T): void
	{
		this.AddPair(key, transform(this.Item(key)));
	}

	/** Добавляет диапазон значений */
	public AddRange(range: KeyedCollection<T>): void
	{
		range.forEach((key, value) =>
		{
			this.AddPair(key, value);
		})
	}

	/** Преобразует коллекцию в новую */
	public Map(func: (key: string, value: T) => KeyValuePair<any>): KeyedCollection<T>
	{
		let res = new KeyedCollection<T>();
		this.forEach((key, value) =>
		{
			res.AddElement(func(key, value));
		});
		return res;
	}

	/** Преобразует коллекцию в массив */
	public ToArray(func: (element: KeyValuePair<T>) => any): any[]
	{
		let ar: KeyValuePair<T>[] = [];
		this.forEach((key, value) => { ar.push(new KeyValuePair(key, value)); });
		return ar.map(func);
	}


	/** Возвращает отсортированную массив пар */
	public OrderBy(func: (x: KeyValuePair<T>) => number): KeyValuePair<T>[]
	{
		let res: KeyValuePair<T>[] = [];
		let sortedAr: KeyValuePair<T>[] = this.ToArray(x => x);
		sortedAr = sortedAr.sort(x => func(x));
		sortedAr.forEach(element =>
		{
			res.push(element);
		});
		return res;
	}

}


export class OrderedCollection<T>
{
	private items: KeyValuePair<T>[] = [];
	private keys: string[] = [];


	constructor()
	{ }

	private _addKey(key: string)
	{
		this.keys.push(key);
	}

	protected _getIndex(key: string)
	{
		return this.keys.indexOf(key);
	}



	public Get(key: string): T
	{
		let ind = this._getIndex(key);
		if (ind < 0) throw `Ключ "${key}" отсутствует в коллекции`;
		return this.items[ind].Value;
	}


	public Add(key: string, item: T)
	{
		let ind = this._getIndex(key);
		if (ind > -1) throw `Ключ ${key} уже присутствует в коллекции`;
		this._addKey(key)
		this.items.push(new KeyValuePair(key, item));
	}

	public get Count(): number
	{
		return this.items.length;
	}

	public Clear()
	{
		this.items = [];
		this.keys = [];
	}

	public ForEach(callbackfn: (value: KeyValuePair<T>, index: number, array: KeyValuePair<T>[]) => void, thisArg?: any)
	{
		this.items.forEach(callbackfn, thisArg);
	}

	public Contains(key: string): boolean
	{
		return this._getIndex(key) > -1;
	}

	public UpdateValue(key: string, func: (val: T) => T)
	{
		let ind = this._getIndex(key);
		if (ind < 0) throw `Ключ "${key}" не найден в коллекции`;
		this.items[ind].Value = func(this.items[ind].Value);
	}

	public Remove(key: string): T
	{
		let ind = this._getIndex(key);
		if (ind < 0) return undefined;
		this.keys.remove(key);
		let val = this.items[ind].Value;
		this.items = this.items.splice(ind, 1);
		return val;
	}


	public Keys(): string[]
	{
		return this.keys;
	}


	public ToArray(func: (T) => any): any[]
	{
		return this.items.map(x => func(x));
	}
}



export class TibAttribute
{
	Name: string = "";
	Type: string = "";
	/** значение по умолчанию (если не задано) */
	Default = null;
	/** Значение, подставляемое автоматически при вставке атрибута */
	Auto: string;
	AllowCode: boolean = false;
	/** краткое описание (появляется в редакторе в той же строчке) */
	Detail: string = "";
	/** подробное описание (появляется при клике на i (зависит от настроек)) */
	Description: string = "";
	/** кусок кода, сигнатура (показывается при наведении) */
	Documentation: string = "";
	/** Значения, которые подставляются в AutoComplete */
	Values: Array<string> = [];
	/** код функции, вызываемый потом в callback, чтобы вернуть string[] для Snippet */
	Result: string;

	constructor(obj: Object)
	{
		for (let key in obj)
			this[key] = obj[key];
	}

	/** `nameOnly` - не подставлять значения */
	ToCompletionItem(callback: (query: string) => string[], nameOnly = false): server.CompletionItem
	{
		let item = server.CompletionItem.create(this.Name);
		let snip = this.Name;
		if (!nameOnly)
		{
			snip += '="';
			let valAr: string[];
			let auto = this.AutoValue();
			if (!auto)
			{
				valAr = this.ValueCompletitions(callback);
				if (valAr.length > 0) snip += "${1|" + valAr.join(",") + "|}";
				else snip += "$1";
			}
			else snip += auto;
			snip += '"';
		}
		item.insertText = snip;
		item.insertTextFormat = server.InsertTextFormat.Snippet;
		item.detail = (this.Detail ? this.Detail : this.Name) + (this.Type ? (" (" + this.Type + ")") : "");
		let doc = "";
		if (this.Default) doc += "Значение по умолчанию: `" + this.Default + "`";
		doc += "\nПоддержка кодовых вставок: `" + (this.AllowCode ? "да" : "нет") + "`";
		item.documentation = {
			kind: server.MarkupKind.Markdown,
			value: doc
		};
		return item;
	}

	ValueCompletitions(callback: (query: string) => string[]): string[]
	{
		if (this.Values && this.Values.length) return this.Values;
		else if (!!this.Result) return callback(this.Result);
		return [];
	}

	AutoValue(): string
	{
		if (this.Auto) return this.Auto;
		if (this.Type == "Boolean")
		{
			if (!!this.Default) return this.Default == "true" ? "false" : "true";
			return "true";
		}
		return null;
	}
}



/** Текстовая структура для хранения Name/Value */
export class InlineAttribute
{
	Name: string = "";
	Value: string = "";
	/** Результирующая строка */
	Text: string = "";

	constructor(name: string, value)
	{
		this.Name = name;
		this.Value = value as string;
		this.Text = name + "=\"" + value + "\"";
	}
}


/** Класс для получения информации по полному открывающемуся тегу
 * 
 * используется для родителей и инициализации CurrentTag
 */
export class SimpleTag
{
	constructor(document: server.TextDocument, range: server.Range)
	{
		let raw = document.getText(range);
		let startPosition = translatePosition(document, range.start, raw.indexOf("<"));
		this.Raw = raw;
		let cl = this.Raw.trim().find(Constants.RegExpPatterns.OpenTagFull);
		let from = document.offsetAt(range.start);
		if (cl.Index > -1)
			this.OpenTagRange = server.Range.create(startPosition, document.positionAt(from + cl.Result[0].length));
		else
			this.OpenTagRange = server.Range.create(startPosition, range.end);
		let res = raw.match(/<(\w+)(\W|$)/);
		if (!!res) this.Name = res[1];
	}

	public getAttributes(): KeyedCollection<string>
	{
		if (!!this.Attrs) return this.Attrs; // кеш :)
		let attrs = new KeyedCollection<string>();
		let res = this.Raw.match(/^\s*<(\w+)(\s+(\s*\w+=(("[^"]*")|('[^']*')))*)?\s*>?/);
		if (!!res && !!res[2]) attrs = CurrentTag.GetAttributesArray(res[2]);
		this.Attrs = attrs;
		return attrs;
	}

	/** Возвращает источник повтора для `Repeat` */
	public getRepeatSource(): string
	{
		if (this.Name != "Repeat") return null;
		let attrs = this.getAttributes();
		return ["List", "Length", "Range", "Source"].find(x => attrs.Contains(x));
	}

	/** Закрыт ли открывающий тег */
	public isClosed(): boolean
	{
		return !!this.Raw.trim().match(Constants.RegExpPatterns.OpenTagFull);
	}

	public readonly Name: string;
	protected Attrs: KeyedCollection<string>;
	/** Позиция открывающего тега */
	//public readonly StartPosition: vscode.Position;
	public readonly OpenTagRange: server.Range;

	private readonly Raw: string; // хранение исходных данных
}


/** Поля для CurrentTag */
export interface CurrentTagFields
{
	PreviousText: string;
	//PreviousTextSafe: string;
	StartPosition?: server.Position;
	StartIndex?: number;
	OpenTagIsClosed?: boolean;
	LastParent?: SimpleTag;
	Body?: string;
	Parents?: SimpleTag[];
	OpenTagRange?: server.Range;
}


export interface IProtocolTagFields
{
	uri: string;
	position: server.Position;
	text?: string;
	force?: boolean;
}

export class ProtocolTagFields
{
	constructor(data: IProtocolTagFields)
	{
		for (let key in data)
		{
			this[key] = data[key];
		}
	}

	uri: string;
	position: server.Position;
	text?: string;
	force?: boolean;

	toCurrentTagGetFields(document: server.TextDocument): CurrentTagGetFields
	{
		return {
			document,
			text: this.text,
			position: this.position,
			force: this.force
		};
	}
}

export interface CurrentTagGetFields
{
	document: server.TextDocument;
	position: server.Position;
	text?: string;
	force?: boolean;
}

/** Самый главный класс */
export class CurrentTag
{
	// -------------------- ПЕРЕМЕННЫЕ

	public Name: string = "";
	/** Идентификатор тега
	 * - для `Item` - в зависимости от родителя 
	 * - для `Repeat` - в зависимости от источника
	*/
	public Id: string = null;
	public Attributes: Array<InlineAttribute> = [];
	public Body: string = null;
	/** Закрыт не тег, просто есть вторая скобка <Page...> */
	public OpenTagIsClosed = false;
	public Parents: Array<SimpleTag> = [];
	public LastParent: SimpleTag;
	/** Откуда начинается */
	public StartIndex: number;
	public OpenTagRange: server.Range;
	/** Текст от начала документа до Position */
	public PreviousText = null;


	// -------------------- ТЕХНИЧЕСКОЕ

	/** Кеширование языка */
	private Language: Language;


	/** Задаёт атрибуты */
	private SetAttributes(attrs: KeyedCollection<string>)
	{
		this.Attributes = [];
		let parent = this;
		attrs.forEach(function (key, val)
		{
			parent.Attributes.push(new InlineAttribute(key, val));
		});
	}

	/** Обновление только самогО тега */
	private _update(tag: string | SimpleTag)
	{
		if (typeof tag == "string")
		{
			this.Name = tag;
			this.Id = tag;
		}
		else
		{
			this.Name = tag.Name;
			this.Id = tag.Name;
			this.SetAttributes(tag.getAttributes());
			this.OpenTagIsClosed = tag.isClosed();
			this.OpenTagRange = tag.OpenTagRange;

			// Id для Repeat
			if (this.Name == "Repeat")
			{
				let source = tag.getRepeatSource();
				if (!!source) this.Id == source + "Repeat";
			}
		}
	}

	/** Задаёт родителей */
	private _setParents(data: SimpleTag[] | CurrentTagFields)
	{
		let parents: SimpleTag[];
		if (Array.isArray(data)) parents = data;
		else
		{
			if (!data) return;
			parents = data.Parents;
		}
		this.Parents = parents;
		if (!!parents && parents.length > 0)
		{
			this.LastParent = parents.last();
			// Id для Item
			if (parents && this.Name == "Item")
			{
				let parName = "";
				// ищем нормального родителя
				for (let i = parents.length - 1; i >= 0; i--) 
				{
					if (["Condition", "Repeat"].indexOf(parents[i].Name) < 0)
					{
						parName = parents[i].Name;
						break;
					}
				}
				this.Id = parName + "Item";
			}
		}
	}

	/** Сброс закешированного */
	private _reset()
	{
		this.Language = null;
		this.LastParent = null;
	}



	// -------------------- МЕТОДЫ

	constructor(tag: string | SimpleTag, parents?: SimpleTag[])
	{
		this._update(tag);
		this._setParents(parents);
	}

	/** Подготавливает TibXML для поиска теги */
	public static PrepareXML(text: string): string
	{
		// замазываем комментарии
		let pure = Encoding.clearXMLComments(text);
		// удаление _AllowCodeTag из остатка кода (чтобы не искать <int>)
		pure = Encoding.clearCSContents(pure);
		return pure;
	}

	/** возвращает массив имён атрибутов */
	public AttributeNames()
	{
		return this.Attributes.map(function (e)
		{
			return e.Name;
		});
	}

	/** возвращает коллекцию атрибутов из переданной строки */
	public static GetAttributesArray(str: string): KeyedCollection<string>
	{
		let mt = str.match(Constants.RegExpPatterns.Attributes);
		let res: KeyedCollection<string> = new KeyedCollection<string>();
		if (mt)
		{
			let reg = new RegExp(Constants.RegExpPatterns.SingleAttribute);
			mt.forEach(element =>
			{
				let parse = element.match(reg);
				if (parse) res.AddPair(parse[1], parse[2].replace(/^('|")(.*)('|")$/, "$2"));
			});
		}
		return res;
	}

	/** Получает все атрибуты, независимо от Position */
	public GetAllAttributes(document: server.TextDocument): KeyedCollection<string>
	{
		if (this.OpenTagIsClosed) return this.Attributes.toKeyedCollection(x => new KeyValuePair<string>(x.Name, x.Value));
		let fromStart = document.getText().slice(this.StartIndex);
		let tag = new TagInfo(fromStart);
		if (!tag.Found || !tag.OpenTag) return this.Attributes.toKeyedCollection(x => new KeyValuePair<string>(x.Name, x.Value));
		return CurrentTag.GetAttributesArray(fromStart.slice(0, tag.OpenTag.Length));
	}

	/** Язык содержимого */
	public GetLaguage(): Language
	{
		if (this.Language) return this.Language; // так быстрее
		let tagLanguage: Language;
		// специальные $-вставки
		if (this.IsSpecial())
		{
			tagLanguage = Language.Inline;
		}
		else
		{
			if (this.CSSingle() || this.CSInline())
			{// по-любому C#
				tagLanguage = Language.CSharp;
			}
			else
			{
				tagLanguage = TagInfo.getTagLanguage(this.Name);
				// проверка на Fake и закрывающий тег
				if (tagLanguage == Language.CSharp)
				{
					if
						(
						!this.OpenTagIsClosed ||
						!!this.Body && this.Body.match(/(<\/\w*$)|(^[\t ]+\r?\n)/)
					)
						tagLanguage = Language.XML;
				}
				// проверка что для PlainText тег закрыт
				if (tagLanguage == Language.PlainText && !this.OpenTagIsClosed) tagLanguage = Language.XML;
				// проверка, что не внутри style/script
				this.Parents.forEach(x =>
				{
					let pLang = TagInfo.getTagLanguage(x.Name);
					if (pLang == Language.JS || pLang == Language.CSS)
					{
						tagLanguage = pLang;
						return;
					}
				});
			}
		}
		this.Language = tagLanguage;
		return tagLanguage;
	}


	/** [c#]Method() */
	public CSInline(): boolean
	{
		if (!this.PreviousText) return false;
		let lastc = this.PreviousText.lastIndexOf("[c#");
		if (lastc < 0) return false;
		let clC = this.PreviousText.indexOf("]", lastc);
		let lastcEnd = this.PreviousText.indexOf("[/c#", lastc);
		return lastc > 0 && clC > 0 && lastcEnd < 0;
	}


	/** $Method */
	public CSSingle()
	{
		return !!this.PreviousText && !!this.PreviousText.match("\\$((?!" + Constants.RegExpPatterns.InlineSpecial + ")(\\w+))$");
	}


	/** Курсор находится в строке */
	public InString(): boolean
	{
		if (!this.OpenTagIsClosed)
		{
			let rest = this.PreviousText.slice(this.StartIndex);
			rest = rest.replace(Constants.RegExpPatterns.Attributes, "");
			return !!rest.match(/(("[^"]*)|('[^']*))$/);
		}
		return !!this.Body && Parse.inString(this.Body);
	}

	/** == Language.Inline. Но это только когда написано полностью */
	public IsSpecial()
	{
		return !!this.PreviousText && !!this.PreviousText.match("\\$(" + Constants.RegExpPatterns.InlineSpecial + ")$");
	}


	/** В строке внутри C# */
	public InCSString(): boolean
	{
		if (this.GetLaguage() == Language.CSharp)
		{
			if (this.CSSingle())
			{
				let rest = this.PreviousText.substr(this.PreviousText.lastIndexOf("$"));
				return Parse.inString(rest);
			}
			else if (this.CSInline())
			{
				let rest = this.PreviousText.substr(this.PreviousText.lastIndexOf("[c#"));
				rest = rest.substr(rest.indexOf("]") + 1);
				return Parse.inString(rest);
			}
			else return this.InString();
		}
	}


	/** Обновляет поля, если новые не undefined */
	public SetFields(fields: CurrentTagFields)
	{
		this._reset();
		if (!!fields.Parents && !!fields.LastParent) fields.LastParent = undefined;
		for (let key in fields)
		{
			switch (key)
			{
				case "Parents":
					this._setParents(fields[key]);
					break;
				default:
					if (typeof fields[key] != 'undefined') this[key] = fields[key];
					break;
			}
		}
	}


	/** Обновляет только текущий тег */
	public Update(tag: string | SimpleTag, fields: CurrentTagFields)
	{
		if (!!tag)
		{
			this._reset();
			this._update(tag);
		}
		this.SetFields(fields);
	}


	/** Получает индекс текущего Var в Item 
	 * 
	 * Если найти не получилось, то -1
	*/
	public GetVarIndex(): number
	{
		if (this.Name != "Var" || !this.Parents || this.LastParent.Name != "Item") return -1;
		try
		{
			let res = -1;
			let prevText = this.PreviousText.slice(0, this.StartIndex);
			let itemIndex = prevText.lastIndexOf("Item");
			if (itemIndex > 0)
			{
				prevText = prevText.slice(itemIndex);
				let match = prevText.match(/<Var>/g);
				if (!!match) return match.length;
				else return 0;
			}
			return res;
		}
		catch (error)
		{
			return -1;
		}
	}


	public GetIndent(): number
	{
		if (!this.Parents) return 0;
		return this.Parents.length + 1;
	}

}


/** Собирает данные для первого встреченного <тега> на новой строке */
export class TagInfo
{
	constructor(text: string, offset: number = 0)
	{
		let mt = text.match(/^((\s*(\n|^))[\t ]*)<(\w+)/);
		// группы mt
		let groups = {
			beforeFull: 1,
			linesBefore: 2,
			tagName: 4
		};
		if (!!mt)
		{
			this.Name = mt[groups.tagName];
			let lineFrom = text.indexOf(mt[0]) + mt[groups.linesBefore].length;
			let lineTo = text.length;
			this.Language = TagInfo.getTagLanguage(this.Name);
			let from = mt[groups.beforeFull].length;
			let to = text.indexOf(">", from) + 1; // TODO: вот это отстойный вариант, но другие очень сложные
			// выделяем AllowCode fake
			this.IsAllowCodeTag = !!this.Name.match(new RegExp("^" + Constants.RegExpPatterns.AllowCodeTags + "$")) && !text.substr(to).match(/^([\s\n]*)*<\w/g);
			if (this.Language == Language.CSharp && !this.IsAllowCodeTag) this.Language = Language.XML;
			this.OpenTag = new TextRange({ From: from, To: to });
			let before = text.substr(0, this.OpenTag.From + 1);
			let newLine = text.indexOf("\n", to - 1);
			this.Multiline = newLine > -1;
			let clt = Parse.findCloseTag("<", this.Name, ">", before, text);
			this.SelfClosed = !!clt && clt.SelfClosed;
			if (!!clt && !this.SelfClosed)
			{
				this.CloseTag = new TextRange({ From: clt.Range.From, To: clt.Range.To + 1 });
				this.Closed = true;
				this.Body = new TextRange({ From: to, To: clt.Range.From });
				this.HasCDATA = !!text.slice(this.Body.From, this.Body.To).match(/^\s*<!\[CDATA\[/);
				let after = text.indexOf("\n", this.CloseTag.To - 1);
				if (after > -1) lineTo = after;
				this.Multiline = this.Multiline && newLine < clt.Range.To - 1;
			}
			else
			{
				this.Body = new TextRange({ From: to, To: (this.SelfClosed ? to : text.length) });
				this.Closed = this.SelfClosed;
				this.CloseTag = new TextRange({ From: this.Body.To, To: this.Body.To });
				lineTo = this.Body.To;
			}
			if (offset != 0)
			{
				lineTo += offset;
				lineFrom += offset;
				this.OpenTag = new TextRange({ From: this.OpenTag.From + offset, To: this.OpenTag.To + offset });
				if (this.Closed) this.CloseTag = new TextRange({ From: this.CloseTag.From + offset, To: this.CloseTag.To + offset });
				this.Body = new TextRange({ From: this.Body.From + offset, To: this.Body.To + offset });
			}
			this.FullLines = new TextRange({ From: lineFrom, To: lineTo });
			this.Found = true;
		}
	}


	/** Возвращает язык исходя только из имени тега */
	public static getTagLanguage(tagName: string): Language
	{
		let res = Language.XML;

		if (!tagName) return res;

		if (tagName.match(new RegExp("^(" + Constants.RegExpPatterns.AllowCodeTags + ")$"))) return Language.CSharp;

		switch (tagName.toLocaleLowerCase())
		{
			case "script":
				res = Language.JS;
				break;

			case "style":
				res = Language.CSS;
				break;

			case "text":
			case "endtext":
			case "header":
			case "holder":
			case "value":
			case "label":
			case "var":
				res = Language.PlainText;
				break;

			default:
				res = Language.XML;
				break;
		}
		return res;
	}

	public OpenTag: TextRange;
	public CloseTag: TextRange;
	public Body: TextRange;
	public Name: string;
	public IsAllowCodeTag: boolean;
	/** Валидация: получилось ли распарсить */
	public Found: boolean = false;
	public Closed: boolean;
	public SelfClosed: boolean = false;
	public Language: Language;
	/** от начала строки открывающегося до конца строки закрывающегося */
	public FullLines: TextRange;
	public Multiline: boolean;
	/** если всё содержимое обёрнуто */
	public HasCDATA: boolean = false;
}




export class TibMethod
{
	public Name: string = "";
	public Signature: string = "";
	public IsFunction: boolean;
	public Type: string;
	public FileName: String;

	private Uri: string;
	private Location: server.Range;

	constructor(name: string, sign: string, location: server.Range, fileName: string, isFunction: boolean = false, type: string = "")
	{
		this.Name = name;
		this.Signature = sign;
		this.Location = location;
		this.Type = type;
		this.FileName = fileName;
		this.Uri = fileName;
		this.IsFunction = isFunction;
	}

	public GetLocation(): server.Location
	{
		return server.Location.create(this.Uri, this.Location)
	}

	ToCompletionItem()
	{
		let item = server.CompletionItem.create(this.Name);
		item.kind = server.CompletionItemKind.Function;
		item.insertTextFormat = server.InsertTextFormat.Snippet;
		if (this.IsFunction) item.insertText = this.Name + "($0)";
		let mds: server.MarkedString = { language: 'XML', value: '' };
		mds.value = this.Signature;
		if (this.Type) item.detail = this.Type;
		item.documentation = mds.value;
		item.sortText = '___' + this.Name;
		return item;
	}

	ToHoverItem()
	{
		return { language: "csharp", value: this.Signature };
	}

	ToSignatureInformation()
	{
		return server.SignatureInformation.create(this.Name, this.Signature);
	}
}


export class TibMethods extends KeyedCollection<TibMethod>
{
	constructor(collection?: KeyedCollection<TibMethod>)
	{
		super();
		if (!!collection)
			collection.forEach((key, value) =>
			{
				this.Add(value);
			})
	}

	public Add(item: TibMethod)
	{
		if (!this.Contains(item.Name)) this.AddPair(item.Name, item);
	}

	CompletionArray(): server.CompletionItem[]
	{
		return this.Values().map(function (e)
		{
			return e.ToCompletionItem();
		}).filter(x => !!x);;
	}

	HoverArray(word: string): any[]
	{
		return this.Values().map(function (e)
		{
			if (e.Name == word) return e.ToHoverItem();
		}).filter(x => !!x);
	}

	SignatureArray(word: string)
	{
		return this.Values().map(function (e)
		{
			if (e.Name == word) return e.ToSignatureInformation();
		}).filter(x => !!x);
	}

	Filter(filter: (key: string, value: TibMethod) => boolean): TibMethods
	{
		return new TibMethods(super.Filter(filter));
	}
}






/** Информация об XML узле */
export class SurveyNode
{
	constructor(type: string, id: string, pos: server.Position, fileName: string)
	{
		this.Id = id;
		this.Type = type;
		this.Position = pos;
		this.FileName = fileName;
		this.Uri = fileName;
		this.IconKind = this.GetKind(type);
	}

	public Id: string = "";
	public Type: string = "";
	public Position: server.Position;
	public FileName: string;
	public IconKind: server.CompletionItemKind;

	private Uri: string;

	GetLocation(): server.Location
	{
		return server.Location.create(this.Uri, server.Range.create(this.Position, this.Position));
	}

	/** Чтобы иконки отличались */
	private GetKind(nodeName: string): server.CompletionItemKind
	{
		switch (nodeName)
		{
			case "Page":
				return server.CompletionItemKind.File;

			case "Question":
				return server.CompletionItemKind.EnumMember;

			case "List":
				return server.CompletionItemKind.Unit;

			case "Quota":
				return server.CompletionItemKind.Event;

			default:
				break;
		}
	}
}


export class SurveyNodes extends KeyedCollection<SurveyNode[]>
{
	constructor()
	{
		super();
	}

	/** Добавляет в нужный элемент */
	Add(item: SurveyNode)
	{
		if (!this.Contains(item.Type))
			this.AddPair(item.Type, [item]);
		else if (this.Item(item.Type).findIndex(x => x.Id == item.Id)) this.Item(item.Type).push(item);
	}


	/** Добавляет к нужным элементам, не заменяя */
	AddRange(range: KeyedCollection<SurveyNode[]>): void
	{
		range.forEach((key, value) =>
		{
			if (!this.Contains(key))
				this.AddPair(key, value);
			else this.UpdateValue(key, x => x.concat(value));
		})
	}

	GetIds(type: string): string[]
	{
		let res = [];
		if (this.Contains(type)) res = this.Item(type).map(e => e.Id);
		return res;
	}

	GetItem(id: string, type?: string): SurveyNode
	{
		let nodes = this.Item(type);
		if (!nodes) return null;
		let res: SurveyNode;
		if (!!nodes)
		{
			for (let i = 0; i < nodes.length; i++)
			{
				if (nodes[i].Id == id)
				{
					res = nodes[i];
					break;
				}
			};
		}

		return res;
	}

	Clear(names?: string[])
	{
		if (!names) super.Clear();
		else
			names.forEach(element =>
			{
				this.items[element] = [];
			});
	}

	CompletitionItems(name: string, closeQt: string = ""): server.CompletionItem[]
	{
		let res: server.CompletionItem[] = [];
		if (!this.Item(name)) return res;
		this.Item(name).forEach(element =>
		{
			let ci = server.CompletionItem.create(element.Id);
			ci.kind = server.CompletionItemKind.Enum;
			ci.detail = name;
			ci.insertText = element.Id + closeQt;
			ci.kind = element.IconKind;
			ci.sortText = name + ci.insertText;
			res.push(ci);
		});
		return res;
	}

	/** Фильтрует элементы */
	FilterNodes(filter: (node: SurveyNode) => boolean): SurveyNodes
	{
		let res = new SurveyNodes();
		this.forEach((key, value) =>
		{
			let nodes = value.filter(x => filter(x));
			if (nodes.length) res.AddPair(key, nodes);
		})
		return res;
	}

}



//#endregion




/*---------------------------------------- Functions ----------------------------------------*/
//#region


/** Заменяет в строке все константы на значения */
export function applyConstants(input: string): string
{
	let cons = Constants.PreDifinedConstants.toKeyedCollection(x => x).Map((key, value) => new KeyValuePair<string>('@' + key, value));
	return input.replaceValues(cons);
}

/** Текст всей строки для `position` */
export function getCurrentLineText(document: server.TextDocument, position: server.Position): string
{
	try
	{
		let start = server.Position.create(position.line, 0);
		let from = document.offsetAt(start);
		let fullText = document.getText();
		let res = fullText.slice(from);
		let lastIndex = res.indexOf('\n');
		if (lastIndex > -1) res = res.slice(0, lastIndex);
		return res;
	} catch (error)
	{
		/*logError("Ошибка получения текста текущей строки", error);
		return null;*/
	}
}


/** Возвращает диапазон для слова в позиции `index` строки `line` */
function getWordRange(index: number, line: string, regex?: RegExp): { from: number, to: number }
{
	if (!regex) regex = /[\w]/;
	let from = index;
	let to = from + 1;
	for (let i = index; i < line.length; i++) {
		if (!line[i].match(regex))
		{
			to = i;
			break;
		}
	}
	for (let i = index; i > 0; i--) {
		if (!line[i - 1].match(regex))
		{
			from = i;
			break;
		}
	}
	return { from, to };
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



/** возвращает минимальное неотрицательное или `negative` (= null), если нет таких */
export function positiveMin(a, b, negative: any = null)
{
	let neg = null;
	if (typeof negative !== typeof null) neg = negative;

	if (a < 0)
		if (b < 0) return neg;
		else return b;
	else
		if (b < 0) return a;
		else return Math.min(a, b);
}


/** записывает данные в буфер обмена */
export function copyToCB(text: string)
{
	clipboard.writeSync(text);
}


/** получает данные из буфера обмена */
export function getFromClioboard(): string
{
	return clipboard.readSync();
}



/** Подготовленная для RegExp строка */
export function safeString(text: string): string
{
	return text.replace(/[\|\\\{\}\(\)\[\]\^\$\+\*\?\.\/]/g, "\\$&");
}




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



const _translation = KeyedCollection.FromArrays(Constants.translationArray.rus, Constants.translationArray.eng);

/** Транслитерация с учётом итераторов (`allowIterators`) */
export function translate(input: string, allowIterators = true): string
{
	let res = "";
	let reg = allowIterators ? /[\dA-Za-z_@\-\(\)]/ : /[\dA-Za-z_]/;
	for (const char of input)
	{
		if (!char.match(reg))
		{
			if (_translation.Contains(char))
				res += _translation.Item(char);
			else res += "_";
		}
		else res += char;
	}
	return res;
}





export function getDocumentMethods(document: server.TextDocument, Settings: KeyedCollection<any>): Promise<TibMethods>
{
	return new Promise<TibMethods>((resolve, reject) =>
	{
		resolve(getDocumentMethodsSync(document, Settings));
	});
}



export function getDocumentMethodsSync(document: server.TextDocument, Settings: KeyedCollection<any>): TibMethods
{
	let res = new TibMethods();
	let text = document.getText();
	text = Encoding.clearXMLComments(text);
	let mtd = text.matchAll(/(<Methods)([^>]*>)([\s\S]*)(<\/Methods)/);
	if (mtd.length == 0)
	{
		return res;
	}
	let reg = new RegExp(/((public)|(private)|(protected))(((\s*static)|(\s*readonly))*)?\s+([\w<>\[\],\s]+)\s+((\w+)\s*(\([^)]*\))?)/);
	let groups = {
		Full: 0,
		Modificator: 1,
		Properties: 5,
		Type: 9,
		FullName: 10,
		Name: 11,
		Parameters: 12
	};
	mtd.forEach(element =>
	{
		let str = element[3];
		str = Encoding.clearCSComments(str);
		let m = str.matchAll(reg);
		m.forEach(met => 
		{
			if (met[groups.FullName])
			{
				let start = text.indexOf(met[groups.Full]);
				let isFunc = !!met[groups.Parameters];
				let end = text.indexOf(isFunc ? ")" : ";", start) + 1;
				let positionFrom = document.positionAt(start);
				let positionTo = document.positionAt(end);
				let rng = server.Range.create(positionFrom, positionTo);
				res.Add(new TibMethod(met[groups.Name], met[groups.Full].trim().replace(/\s{2,}/g, " "), rng, document.uri, isFunc, met[groups.Type]));
			}
		});
	});
	return res;
}



export function getDocumentNodeIds(document: server.TextDocument, Settings: KeyedCollection<any>, NodeStoreNames: string[]): Promise<SurveyNodes>
{
	return new Promise<SurveyNodes>((resolve, reject) =>
	{
		resolve(getDocumentNodeIdsSync(document, Settings, NodeStoreNames));
	});
}


export function getDocumentNodeIdsSync(document: server.TextDocument, Settings: KeyedCollection<any>, NodeStoreNames: string[]): SurveyNodes
{
	let nNames = NodeStoreNames;
	let txt = document.getText();
	txt = Encoding.clearXMLComments(txt);
	let reg = new RegExp("<((" + nNames.join(")|(") + "))[^>]*\\sId=(\"|')([^\"']+)(\"|')");
	let idIndex = nNames.length + 3;
	let nodes = new SurveyNodes();
	let res = txt.matchAll(reg);
	res.forEach(element => 
	{
		let pos = document.positionAt(txt.indexOf(element[0]));
		let item = new SurveyNode(element[1], element[idIndex], pos, document.uri);
		nodes.Add(item);
	});
	// дополнительно
	nodes.Add(new SurveyNode("Page", "pre_data", null, document.uri));
	nodes.Add(new SurveyNode("Question", "pre_data", null, document.uri));
	nodes.Add(new SurveyNode("Question", "pre_sex", null, document.uri));
	nodes.Add(new SurveyNode("Question", "pre_age", null, document.uri));
	nodes.Add(new SurveyNode("Page", "debug", null, document.uri));
	nodes.Add(new SurveyNode("Question", "debug", null, document.uri));
	return nodes;
}


/** Возвращает список MixId */
export function getMixIds(document: server.TextDocument, Settings: KeyedCollection<any>): Promise<string[]>
{
	return new Promise<string[]>((resolve, reject) =>
	{
		resolve(getMixIdsSync(document, Settings));
	});
}


/** Возвращает список MixId */
export function getMixIdsSync(document: server.TextDocument, Settings: KeyedCollection<any>): string[]
{
	let res: string[] = [];
	let txt = document.getText();
	txt = Encoding.clearXMLComments(txt);
	let matches = txt.matchAll(/MixId=('|")((?!:)(\w+))(\1)/);
	let matchesStore = txt.matchAll(/<Question[^>]+Store=('|")(\w+?)(\1)[^>]*>/);
	let mixIdsStore: string[] = [];
	matchesStore.forEach(element =>
	{
		let idmt = element[0].match(/\sId=("|')(.+?)\1/);
		if (!idmt) return;
		mixIdsStore.push(":" + idmt[2]);
	});
	if (!!matches) res = res.concat(matches.map(x => x[2]));
	if (!!matchesStore) res = res.concat(mixIdsStore);
	return res.distinct();
}


/** проверяет наличие файла/папки */
export function pathExists(path: string): boolean
{
	return fs.existsSync(path);
}


/** создаёт папку */
export function createDir(path: string)
{
	fs.mkdirSync(path);
}


/** Преобразует путь в URI */
export function uriFromName(path: string): string
{
	return Uri.file(path).toString()
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
		contains(element: T): boolean;
		/** Удаляет элемент из массива и возвращает этот элемент */
		remove(element: T): T;
		/** Преобразует массив в коллекцию */
		toKeyedCollection(func: (x: T) => KeyValuePair<any>): KeyedCollection<any>
		/** Преjбразует массив в коллекцию T */
		toKeyedCollection(func: (x: T) => Object): KeyedCollection<any>
		/** Асинхронный forEach */
		forEachAsync<R>(func: (x: T, i?: number) => Promise<R>): Promise<R[]>
		/** Сортировка массива с сохранением порядка индексов (аналогично `sort`) */
		orderBy<T>(func: (a: T, b: T) => number): SortedArrayResult<T>
	}

}

String.prototype.find = function (search: string | RegExp): SearchResult
{
	let res = new RegExp(search).exec(this);
	let ind = !!res ? res.index : -1;
	return { Index: ind, Result: res };
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
	let mat: RegExpExecArray;
	let text = this;
	let reg = new RegExp(search, "g");
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
	let sorted: KeyValuePair<string>[] = elements.OrderBy(x => x.Key.length);
	sorted.forEach(x =>
	{
		res = res.replace(new RegExp(safeString(x.Key), "g"), x.Value);
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


Array.prototype.contains = function <T>(this: T[], element: T): boolean
{
	return this.indexOf(element) > -1;
}

Array.prototype.remove = function <T>(this: T[], element: T): T
{
	let index = this.indexOf(element);
	let res: T;
	if (index > -1)
		res = this.splice(index, 1)[0];
	return res;
}

Array.prototype.toKeyedCollection = function <T>(this: T[], func: (x: T) => KeyValuePair<any>): KeyedCollection<any>
{
	let res = new KeyedCollection<any>();
	this.forEach(element =>
	{
		res.AddElement(func(element));
	});
	return res;
}


Array.prototype.toKeyedCollection = function <T>(this: T[], func: (x: T) => Object): KeyedCollection<any>
{
	let res = new KeyedCollection<any>();
	this.forEach(element =>
	{
		let obj = func(element);
		let key = Object.keys(obj)[0];
		res.AddPair(key, obj[key] as T);
	});
	return res;
}


Array.prototype.forEachAsync = function <T, R>(this: T[], func: (x: T, i?: number) => Promise<R>): Promise<R[]>
{
	let promises: Promise<R>[] = [];
	let index = 0;
	this.forEach(element => {
		promises.push(func(element, index));
		index++;
	});
	return Promise.all(promises);
}


Array.prototype.orderBy = function <T>(this: Array<T>, func: (a: T, b: T) => number): SortedArrayResult<T>
{
	let res: ArraySortingData<T>[] = this.map((x, i) => { return { Element: x, Index: i } as ArraySortingData<T> }).sort((a, b) => func(a.Element, b.Element));
	return {
		Array: res.map(x => x.Element),
		IndexOrder: res.map(x => x.Index)
	}
}

//#endregion
