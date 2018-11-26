'use strict';

import * as vscode from 'vscode';
import * as Encoding from './encoding'
import * as Parse from './parsing'
import * as clipboard from "clipboardy"
import * as fs from 'fs'
import * as os from 'os'
import { bot, OutChannel, _LogPath, logError } from './extension'
import * as shortHash from "short-hash"
import { RegExpPatterns, _LockInfoFilePrefix, _NodeStoreNames } from './constants'
import * as iconv from 'iconv-lite'
import * as dateFormat from 'dateformat'
import * as winattr from "winattr"
import { machineIdSync } from "node-machine-id"


// переменная для кэширования информации о пользователе
var userInfo: UserInfo =
{
	Name: null,
	Id: null,
	IP: null
}


/* ---------------------------------------- Classes, Structs, Namespaces, Enums, Consts, Interfaces ----------------------------------------*/
//#region


export enum Language { XML, CSharp, CSS, JS, PlainText, Inline };

/** Результат поиска в строке */
interface SearchResult
{
	Result: RegExpMatchArray;
	Index: number;
}


interface UserInfo
{
	Name: string;
	Id: string;
	IP: string;
}


/**
 * @param From Включаемая граница
 * @param To Не влючамая граница
*/
class ITextRange
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

	ToRange(document: vscode.TextDocument): vscode.Range
	{
		return new vscode.Range(document.positionAt(this.From), document.positionAt(this.To));
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
		return this.items.removeIndex(ind).Value;
	}


	public Keys(): string[]
	{
		return this.keys;
	}


	public ToArray(func: (x: KeyValuePair<T>) => any): any[]
	{
		return this.items.map(x => func(x));
	}
}


export class TibAutoCompleteItem 
{
	Name: string;
	/** тип объекта (string из vscode.CompletionItemKind) */
	Kind: keyof typeof vscode.CompletionItemKind;
	/** краткое описание (появляется в редакторе в той же строчке) */
	Detail: string = "";
	/** подробное описание (появляется при клике на i (зависит от настроек)) */
	Description: string = "";
	/** кусок кода, сигнатура (показывается при наведении) */
	Documentation: string = "";
	/** Родитель (объект) */
	Parent: string = "";
	Overloads: TibAutoCompleteItem[] = []; // массив перегрузок
	/** Тег, в котором должно работать */
	ParentTag: string = "";

	constructor(obj: Object)
	{
		for (let key in obj)
			this[key] = obj[key];
	}

	ToCompletionItem(addBracket: boolean = false, sortString?: string)
	{
		let kind: keyof typeof vscode.CompletionItemKind = this.Kind;
		let item = new vscode.CompletionItem(this.Name, vscode.CompletionItemKind[kind]);
		if (addBracket && (this.Kind == "Function" || this.Kind == "Method")) item.insertText = new vscode.SnippetString(this.Name + "($0)");
		let mds = new vscode.MarkdownString();
		if (this.Description) mds.value = this.Description;
		else if (this.Documentation) mds.value = this.Documentation;
		item.documentation = mds;
		if (sortString) item.sortText = sortString;
		if (this.Detail) item.detail = this.Detail;
		return item;

	}

	ToSignatureInformation()
	{
		return new vscode.SignatureInformation(this.Documentation, new vscode.MarkdownString(this.Description));
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
	ToCompletionItem(callback: (query: string) => string[], nameOnly = false): vscode.CompletionItem
	{
		let item = new vscode.CompletionItem(this.Name, vscode.CompletionItemKind.Property);
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
		let res = new vscode.SnippetString(snip);
		item.insertText = res;
		item.detail = (this.Detail ? this.Detail : this.Name) + (this.Type ? (" (" + this.Type + ")") : "");
		let doc = "";
		if (this.Default) doc += "Значение по умолчанию: `" + this.Default + "`";
		doc += "\nПоддержка кодовых вставок: `" + (this.AllowCode ? "да" : "нет") + "`";
		item.documentation = new vscode.MarkdownString(doc);
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


export class TibMethod
{
	public Name: string = "";
	public Signature: string = "";
	public IsFunction: boolean;
	public Type: string;
	public FileName: String;

	private Uri: vscode.Uri;
	private Location: vscode.Range;

	constructor(name: string, sign: string, location: vscode.Range, fileName: string, isFunction: boolean = false, type: string = "")
	{
		this.Name = name;
		this.Signature = sign;
		this.Location = location;
		this.Type = type;
		this.FileName = fileName;
		this.Uri = vscode.Uri.file(fileName);
		this.IsFunction = isFunction;
	}

	public GetLocation(): vscode.Location
	{
		return new vscode.Location(this.Uri, this.Location)
	}

	ToCompletionItem()
	{
		let item = new vscode.CompletionItem(this.Name, vscode.CompletionItemKind.Function);
		if (this.IsFunction) item.insertText = new vscode.SnippetString(this.Name + "($0)");
		let mds = new vscode.MarkdownString();
		mds.value = this.Signature;
		if (this.Type) item.detail = this.Type;
		item.documentation = mds;
		item.sortText = '___' + this.Name;
		return item;
	}

	ToHoverItem()
	{
		return { language: "csharp", value: this.Signature };
	}

	ToSignatureInformation()
	{
		return new vscode.SignatureInformation(this.Name, new vscode.MarkdownString(this.Signature));
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

	CompletionArray(): vscode.CompletionItem[]
	{
		return this.Values().map(function (e)
		{
			return e.ToCompletionItem();
		});
	}

	HoverArray(word: string): any[]
	{
		return this.Values().map(function (e)
		{
			if (e.Name == word) return e.ToHoverItem();
		});
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
	constructor(document: vscode.TextDocument, range: vscode.Range)
	{
		let raw = document.getText(range);
		let StartPosition = range.start.translate(0, raw.indexOf("<"));
		this.Raw = raw;
		let cl = this.Raw.trim().find(RegExpPatterns.OpenTagFull);
		let from = document.offsetAt(range.start);
		if (cl.Index > -1)
			this.OpenTagRange = new vscode.Range(StartPosition, document.positionAt(from + cl.Result[0].length));
		else
			this.OpenTagRange = new vscode.Range(StartPosition, range.end);
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
		return !!this.Raw.trim().match(RegExpPatterns.OpenTagFull);
	}

	public readonly Name: string;
	protected Attrs: KeyedCollection<string>;
	/** Позиция открывающего тега */
	//public readonly StartPosition: vscode.Position;
	public readonly OpenTagRange: vscode.Range;

	private readonly Raw: string; // хранение исходных данных
}


/** Поля для CurrentTag */
export interface CurrentTagFields
{
	PreviousText: string;
	//PreviousTextSafe: string;
	StartPosition?: vscode.Position;
	StartIndex?: number;
	OpenTagIsClosed?: boolean;
	LastParent?: SimpleTag;
	Body?: string;
	Parents?: SimpleTag[];
	OpenTagRange?: vscode.Range;
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
	public OpenTagRange: vscode.Range;
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
		let mt = str.match(RegExpPatterns.Attributes);
		let res: KeyedCollection<string> = new KeyedCollection<string>();
		if (mt)
		{
			let reg = new RegExp(RegExpPatterns.SingleAttribute);
			mt.forEach(element =>
			{
				let parse = element.match(reg);
				if (parse) res.AddPair(parse[1], parse[2].replace(/^('|")(.*)('|")$/, "$2"));
			});
		}
		return res;
	}

	/** Получает все атрибуты, независимо от Position */
	public GetAllAttributes(document: vscode.TextDocument): KeyedCollection<string>
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
		return !!this.PreviousText && !!this.PreviousText.match("\\$((?!" + RegExpPatterns.InlineSpecial + ")(\\w+))$");
	}


	/** Курсор находится в строке */
	public InString(): boolean
	{
		if (!this.OpenTagIsClosed)
		{
			let rest = this.PreviousText.slice(this.StartIndex);
			rest = rest.replace(RegExpPatterns.Attributes, "");
			return !!rest.match(/(("[^"]*)|('[^']*))$/);
		}
		return !!this.Body && Parse.inString(this.Body);
	}

	/** == Language.Inline. Но это только когда написано полностью */
	public IsSpecial()
	{
		return !!this.PreviousText && !!this.PreviousText.match("\\$(" + RegExpPatterns.InlineSpecial + ")$");
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


/** Информация об XML узле */
export class SurveyNode
{
	constructor(type: string, id: string, pos: vscode.Position, fileName: string)
	{
		this.Id = id;
		this.Type = type;
		this.Position = pos;
		this.FileName = fileName;
		this.Uri = vscode.Uri.file(fileName);
		this.IconKind = this.GetKind(type);
	}

	public Id: string = "";
	public Type: string = "";
	public Position: vscode.Position;
	public FileName: string;
	public IconKind: vscode.CompletionItemKind;

	private Uri: vscode.Uri;

	GetLocation(): vscode.Location
	{
		return new vscode.Location(this.Uri, this.Position);
	}

	/** Чтобы иконки отличались */
	private GetKind(nodeName: string): vscode.CompletionItemKind
	{
		switch (nodeName)
		{
			case "Page":
				return vscode.CompletionItemKind.File;

			case "Question":
				return vscode.CompletionItemKind.EnumMember;

			case "List":
				return vscode.CompletionItemKind.Unit;

			case "Quota":
				return vscode.CompletionItemKind.Event;

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

	CompletitionItems(name: string, closeQt: string = ""): vscode.CompletionItem[]
	{
		let res: vscode.CompletionItem[] = [];
		if (!this.Item(name)) return res;
		this.Item(name).forEach(element =>
		{
			let ci = new vscode.CompletionItem(element.Id, vscode.CompletionItemKind.Enum);
			ci.detail = name;
			ci.insertText = new vscode.SnippetString(element.Id + closeQt);
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


/** Настройки расширения */
export class ExtensionSettings extends KeyedCollection<any>
{
	constructor()
	{
		super();
		this.Update();
	}

	/** Обновляет объект настроек из файла конфигурации */
	public Update(): void
	{
		this.Config = vscode.workspace.getConfiguration('tib');
		for (let key in this.Config) this.AddPair(key.toString(), this.Config.get(key));
	}

	/** Изменяет настройки */
	public Set(key: string, value: any): Promise<void>
	{
		return new Promise<void>((resolve, reject) =>
		{
			try
			{
				this.Config.update(key, value, true).then(
					() =>
					{
						logToOutput("Значение параметра 'tib." + key + "' установлено на: " + JSON.stringify(value));
						resolve();
					},
					() => reject("Ошибка при изменении параметра конфигурации")
				);
			}
			catch (error)
			{
				reject(error);
			}
		});
	}

	private Config: vscode.WorkspaceConfiguration;
}



/** Совмещённая структура ContentChangeEvent + Selection */
export class ContextChange
{
	constructor(contextChange: vscode.TextDocumentContentChangeEvent, selection: vscode.Selection)
	{
		this.Change = contextChange;
		this.Selection = selection;
		this.Start = selection.start;
		this.End = selection.end;
		this.Active = selection.active;
	}

	Start: vscode.Position;
	End: vscode.Position;
	Active: vscode.Position;
	Change: vscode.TextDocumentContentChangeEvent;
	Selection: vscode.Selection;
}


/** Возвращает совмещённую структуру из изменений и соответствующих выделений */
export function getContextChanges(document: vscode.TextDocument, selections: vscode.Selection[], changes: vscode.TextDocumentContentChangeEvent[]): ContextChange[]
{
	let res: ContextChange[] = [];
	try
	{
		selections.forEach(selection =>
		{
			for (let i = 0; i < changes.length; i++)
			{
				// позиция на которой должен стоянть курсор, если selection совпадает с change
				let changeEnd = document.positionAt(document.offsetAt(changes[i].range.start) + changes[i].text.length);
				if (selection.start.character == changeEnd.character &&
					selection.start.line == changeEnd.line)
				{
					res.push(new ContextChange(changes[i], selection));
					continue;
				}
			}
		});
	} catch (error)
	{
		logError("Ошибка связи выделений с изменениями", error);
	}
	return res;
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
			this.IsAllowCodeTag = !!this.Name.match(new RegExp("^" + RegExpPatterns.AllowCodeTags + "$")) && !text.substr(to).match(/^([\s\n]*)*<\w/g);
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

		if (tagName.match(new RegExp("^(" + RegExpPatterns.AllowCodeTags + ")$"))) return Language.CSharp;

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


/** Для преобразований Snippet -> CompletitionItem */
export class SnippetObject
{
	prefix: string;
	body: string;
	description: string;

	constructor(obj: Object)
	{
		for (let key in obj)
		{
			if (key == "body" && typeof obj[key] != "string")
				this[key] = obj[key].join("\n");
			else
				this[key] = obj[key];
		}
	}
}

class ILogData
{
	FileName?: string;
	FullText?: string;
	Date?: string;
	Postion?: vscode.Position;
	CacheEnabled?: boolean;
	Version?: string;
	SurveyData?: Object;
	StackTrace?: string;
	Data?: Object;
	VSCVerion?: string;
	ActiveExtensions?: string[];
	UserData?: {
		UserIP?: string;
		UserId?: string;
	}
}

/** Данные для хранения логов */
export class LogData 
{

	constructor(data: ILogData)
	{
		if (!!data)
			for (let key in data)
				this.Data[key] = data[key];
		// дополнительно
		if (!this.Data) this.Data = {};
		if (!this.UserName) this.UserName = getUserName();
		if (!this.Data.Version) this.Data.Version = getTibVersion();
		this.Data.VSCVerion = vscode.version;
		this.Data.UserData =
			{
				UserId: getUserId(),
				UserIP: getUserIP()
			};
		this.Data.Date = (new Date()).toLocaleString('ru');
		this.Data.ActiveExtensions = vscode.extensions.all.filter(x => x.isActive && !x.id.startsWith('vscode.')).map(x => x.id);
	}

	/** добавляет элемент в отчёт */
	public add(items: ILogData): void
	{
		for (let key in items)
			this.Data[key] = items[key];
	}

	/** преобразует все данные в строку */
	public toString(): string
	{
		let res = `Error: ${this.ErrorMessage}\r\nUser: ${this.UserName}\r\n`;
		for (let key in this.Data)
		{
			switch (key)
			{
				case "FullText":
					// текст уберём в конец	
					break;
				case "SurveyData":
				case "Data":
					// разносим на отдельные строки
					res += "-------- " + key + " --------\r\n";
					for (let dataKey in this.Data[key])
					{
						res += this.stringifyData(dataKey, this.Data[key]);
					}
					res += "------------------------\r\n";
					break;
				default:
					res += this.stringifyData(key, this.Data);
			}
		}
		if (!!this.Data.FullText)
		{
			res += "______________ TEXT START _______________\r\n"
			res += this.Data.FullText;
			res += "\r\n______________ TEXT END _______________\r\n"
		}
		return res;
	}

	private stringifyData(key: string, data): string
	{
		return key + ": " + (typeof data[key] != "string" ? JSON.stringify(data[key]) : ("\"" + data[key] + "\"")) + "\r\n";
	}

	public UserName: string;
	public ErrorMessage: string;
	private Data = new ILogData();
}



class TelegramResult
{
	constructor(data?: string)
	{
		if (!!data) this.update(data);
	}

	/** добавление/обновлени данных */
	public update(data: string)
	{
		let obj = JSON.parse(data);
		if (!obj) return;
		for (let key in obj)
			this[key] = obj[key];
	}

	public ok: boolean = false;
	public result: Object = {};
}


export class TelegramBotData
{
	constructor(obj)
	{
		for (let key in obj)
			this[key] = obj[key];
	}

	public logIds: string[];
	public ignoreUsers: string[];
	public secret: string;
	public redirect: string;
}


export class TelegramBot
{
	constructor(obj: Object, callback?: (active: boolean) => any)
	{
		this.http = require('https');
		this.Data = new TelegramBotData(obj);

		this.check().then(res =>
		{
			this.active = res;
			callback(this.active);
		}).catch(res =>
		{
			this.active = false;
			callback(this.active);
		});
	}

	public check(): Promise<boolean>
	{
		return new Promise<boolean>((resolve, reject) =>
		{
			this.request('check').then(res =>
			{
				resolve(res.ok);
			}).catch(res =>
			{
				reject(false);
			})
		})
	}

	public sendLog(text: string): void
	{
		let curUser = getUserName();
		if (!!curUser && !!this.Data.ignoreUsers && this.Data.ignoreUsers.contains(curUser)) return;
		this.Data.logIds.forEach(id =>
		{
			this.sendMessage(id, text);
		});
	}

	public sendMessage(user: string, text: string): void
	{
		if (this.active)
		{
			let params = new KeyedCollection<string>();
			params.AddPair('to', user);
			params.AddPair('error', text);
			this.request('log', params).catch(res =>
			{
				showError("Ошибка при отправке сообщения");
			})
		}
	}

	private request(method: string, args?: KeyedCollection<string>): Promise<TelegramResult>
	{
		let result = new TelegramResult();
		return new Promise<TelegramResult>((resolve, reject) =>
		{
			try
			{
				let url = this.buildURL(method, args);
				this.http.get(url, (res) =>
				{
					res.setEncoding("utf8");
					let body = "";
					res.on("data", data =>
					{
						body += data;
					});
					res.on("end", () =>
					{
						result.update(body);
						if (!result.ok)
						{
							reject(result);
						}
						else resolve(result);
					});
				}).on('error', (e) =>
				{
					reject(result);
					// комментируем пока Telegram не восстановят
					//showError("Ошибка при отправке отчёта об ошибке =)");
				});
			}
			catch (error)
			{
				reject(result);
				showError("Ошибка обработки запроса");
			}
		});
	}

	/** url для запроса */
	private buildURL(method: string, args?: KeyedCollection<string>): string
	{
		let res = this.Data.redirect + method;
		if (!args) args = new KeyedCollection<string>();
		args.AddPair("secret", this.Data.secret);
		let params = args.Select((key, value) => encodeURIComponent(key) + '=' + encodeURIComponent(value));
		res += "?" + params.join('&');
		return res;
	}

	private http;
	/** прошла ли инициализация */
	public active = false;
	private Data: TelegramBotData;
}



/** Класс для работы с путями */
export class Path
{

	constructor(path: string)
	{
		this.originalPath = path;
	}

	/** Приведение к стандартному типу */
	public static Normalize(value: string): string
	{
		// замена слешей
		let res = value.replace(/\//, "\\");
		// убираем слеш в начале и в конце
		res = res.replace(/(^\\)|(\\$)/, '');
		// заглавная буква диска
		if (res.match(/^[a-z]:/)) res = res[0].toLocaleUpperCase() + res.slice(1);
		return res;
	}

	/** Полный путь элемента */
	public get FullPath(): string
	{
		return Path.Normalize(this.originalPath);
	}

	/** Имя файла с расширением */
	public get FileName(): string
	{
		return this.originalPath.replace(/^.+[\\\/]/, '');
	}

	/** Расширение файла */
	public get FileExt(): string
	{
		return this.originalPath.replace(/^.*\./, '').toLocaleLowerCase();
	}

	/** Объединяет в один нормальный путь */
	public static Concat(...values: string[]): string
	{
		let res = "";
		values.forEach(element => 
		{
			let val = Path.Normalize(element);
			res += val + "\\";
		});
		return res.replace(/\\$/, '');
	}

	/** Возвращает папку в которой находится текущий элемент */
	public get Directory(): string
	{
		return this.originalPath.replace(/\\[^\\]+$/, '');
	}



	private originalPath: string;

}


export interface LockData
{
	User: string;
	Id: string;
}


export class StatusBar
{
	private currentStatus: vscode.Disposable;
	private currentItem: vscode.StatusBarItem;

	/** Устанавливает сообщение на время `timeout` */
	public setInfoMessage(text: string, timeout: number): Promise<vscode.Disposable>
	{
		return this.statusMessage(text, timeout);
	}

	/** Добавляет элемент слева */
	public setStatusItem(text: string): Promise<void>
	{
		return new Promise<void>((resolve, reject) => {
			this.createStatusBarItem(text).then(x =>
			{
				this.currentItem = x;
				resolve();
			})
		});
	}

	/** очищает элемент слева*/
	public removeStatusItem()
	{
		if (!!this.currentItem) this.currentItem.hide();
	}


	/** выводит в строку состояния информацию о текущем теге */
	public setTagInfo(tag: CurrentTag): Promise<vscode.Disposable>
	{
		let info = "";
		if (!tag) info = "";
		else
		{
			let lang = Language[tag.GetLaguage()];
			if (lang == "CSharp") lang = "C#";
			info = lang + ":\t" + tag.Parents.map(x => x.Name).concat([tag.Name]).join(" -> ");
			if (tag.Name == "Var")
			{
				let ind = tag.GetVarIndex();
				if (ind > -1) info += `[${ind}]`;
			}
		}
		return this.statusMessage(info);
	}

	/** выводит в строку состояния информацию о текущем процессе */
	public async setProcessMessage(text: string): Promise<vscode.Disposable>
	{
		this.currentStatus = await this.statusMessage(text);
		return this.currentStatus;
	}

	/** очищает строку состояния */
	public removeCurrentMessage()
	{
		if (!!this.currentStatus) this.currentStatus.dispose();
		else this.statusMessage('');
	}

	private statusMessage(text: string, after?: number): Promise<vscode.Disposable>
	{
		return new Promise<vscode.Disposable>((resolve, reject) =>
		{
			let res: vscode.Disposable;
			if (!!after) res = vscode.window.setStatusBarMessage(text, after);
			else res = vscode.window.setStatusBarMessage(text);
			setTimeout(() => { resolve(res) }, 100);
		});
	}

	private createStatusBarItem(text: string): Promise<vscode.StatusBarItem>
	{
		return new Promise<vscode.StatusBarItem>((resolve, reject) =>
		{
			if (!this.currentItem) this.currentItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 900);
			this.currentItem.text = text;
			this.currentItem.show();
			setTimeout(() => { resolve(this.currentItem) }, 100);
		});
	}
}

//#endregion




/*---------------------------------------- Functions ----------------------------------------*/
//#region


/** C# / JS / CSS */
export function isScriptLanguage(lang: Language): boolean
{
	return lang == Language.CSharp || lang == Language.JS || lang == Language.CSS;
}


export function logString(a?: string | number | boolean)
{
	let text = a;
	if (typeof text === typeof undefined) text = "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%";
	console.log("'" + text + "'");
}



/** Показывает сообщение об ошибке */
export function showError(text: string)
{
	vscode.window.showErrorMessage(text);
}


/** Показывает предупреждение */
export function showWarning(text: string)
{
	vscode.window.showWarningMessage(text);
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


/** преобразует стандартый Snippet в CompletionItem */
export function snippetToCompletitionItem(obj: Object): vscode.CompletionItem
{
	let snip = new SnippetObject(obj);
	let ci = new vscode.CompletionItem(snip.prefix, vscode.CompletionItemKind.Snippet);
	ci.detail = snip.description;
	ci.insertText = new vscode.SnippetString(snip.body);
	return ci;
}


/** проверяет наличие файла/папки */
export function pathExists(path: string): boolean
{
	return fs.existsSync(path);
}


/** Возвращаетмя пользователя */
export function getUserName()
{
	if (!!userInfo.Name) return userInfo.Name;
	return (userInfo.Name = os.userInfo().username);
}


/** Возвращает machineId */
export function getUserId()
{
	if (!!userInfo.Id) return userInfo.Id;
	return (userInfo.Id = machineIdSync());
}


/** Возвращает external Ipv4 */
export function getUserIP()
{
	if (!!userInfo.IP) return userInfo.IP;
	let ifs = os.networkInterfaces();
	for (const key in ifs)
	{
		if (!userInfo.IP && ifs.hasOwnProperty(key))
		{
			ifs[key].forEach(n =>
			{
				if (!userInfo.IP && 'IPv4' == n.family && !n.internal)
				{
					userInfo.IP = n.address;
				}
			});
		}
	}
	return userInfo.IP || "not found";
}


/** создаёт папку */
export function createDir(path: string)
{
	fs.mkdirSync(path);
}


/** 
 * Создаёт лог (файл) об ошибке 
 * @param text Текст ошибки
 * @param data Данные для лога
 */
export function saveError(text: string, data: LogData)
{
	logToOutput(text, "ERROR: ");
	if (!data) data = new LogData({ Data: { Error: "Ошибка без данных" } });
	if (!pathExists(_LogPath))
	{
		sendLogMessage("У пользователя `" + data.UserName + "` не найден путь для логов:\n`" + _LogPath + "`");
		return;
	}
	// генерируем имя файла из текста ошибки и сохраняем в папке с именем пользователя
	let hash = "" + shortHash(text);
	let dir = Path.Concat(_LogPath, data.UserName);
	if (!pathExists(dir)) createDir(dir);
	let filename = Path.Concat(dir, hash + ".log");
	if (pathExists(filename)) return;
	data.ErrorMessage = text;
	fs.writeFile(filename, data.toString(), (err) =>
	{
		if (!!err) sendLogMessage(JSON.stringify(err));
		sendLogMessage("Добавлена ошибка:\n`" + text + "`\n\nПуть:\n`" + filename + "`");
	});
}


/** Показ и сохранение ошибки */
export function tibError(text: string, data: LogData, error?)
{
	showError(text);
	if (!!error) data.add({ StackTrace: error });
	saveError(text, data);
}


function sendLogMessage(text: string)
{
	if (!!bot && bot.active) bot.sendLog(text);
}


/** Подготовленная для RegExp строка */
export function safeString(text: string): string
{
	return text.replace(/[\|\\\{\}\(\)\[\]\^\$\+\*\?\.\/]/g, "\\$&");
}


/** Открытие текста файла в новом окне */
export function openFileText(path: string): Promise<void>
{
	return new Promise<void>((resolve, reject) =>
	{
		/* vscode.workspace.openTextDocument(path).then(doc =>
		{ // открываем файл (в памяти)
			let txt = doc.getText();
			vscode.workspace.openTextDocument({ language: "tib" }).then(newDoc =>
			{ // создаём пустой tib-файл
				vscode.window.showTextDocument(newDoc).then(editor => 
				{ // отображаем пустой
					editor.edit(builder => 
					{ // заливаем в него текст
						builder.insert(new vscode.Position(0, 0), txt)
					});
				});
			})
		}); */

		let fileBuffer = fs.readFileSync(path);
		// по возможности читаем в 1251
		let text = Parse.win1251Avaliabe(fileBuffer) ? iconv.decode(fileBuffer, 'win1251') : fileBuffer.toString('utf8');
		vscode.workspace.openTextDocument({ language: "tib" }).then(newDoc =>
		{ // создаём пустой tib-файл
			if (!newDoc) return reject();
			vscode.window.showTextDocument(newDoc).then(editor => 
			{ // отображаем пустой
				if (!editor) return reject();
				editor.edit(builder => 
				{ // заливаем в него текст
					builder.insert(new vscode.Position(0, 0), text);
					resolve();
				});
			});
		})
	});
}


/** Открыть файл в VSCode */
/* function execute(link: string)
{
	vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(link));
} */


export function openUrl(url: string): Promise<string>
{
	return new Promise<string>((resolve, reject) =>
	{
		let http = require('https');
		http.get(url, (res) =>
		{
			res.setEncoding("utf8");
			let body = "";
			res.on("data", data =>
			{
				body += data;
			});
			res.on("end", () =>
			{
				resolve(body);
			});
		}).on('error', (e) =>
		{
			let data = new LogData({
				Data: { Url: url },
				StackTrace: e
			});
			tibError("Не удалось открыть ссылку", data);
			reject();
		});
	});
}


export function getDocumentMethods(document: vscode.TextDocument, Settings: ExtensionSettings): Promise<TibMethods>
{
	return new Promise<TibMethods>((resolve, reject) =>
	{
		let res = new TibMethods();
		let text = document.getText();
		if (Settings.Item("ignoreComments")) text = Encoding.clearXMLComments(text);
		let mtd = text.matchAll(/(<Methods)([^>]*>)([\s\S]*)(<\/Methods)/);
		if (mtd.length == 0) return resolve(res);
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
			if (Settings.Item("ignoreComments")) str = Encoding.clearCSComments(str);
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
					let rng = new vscode.Range(positionFrom, positionTo);
					res.Add(new TibMethod(met[groups.Name], met[groups.Full].trim().replace(/\s{2,}/g, " "), rng, document.fileName, isFunc, met[groups.Type]));
				}
			});
		});
		resolve(res);
	});
}


export function getDocumentNodeIds(document: vscode.TextDocument, Settings: ExtensionSettings): Promise<SurveyNodes>
{
	return new Promise<SurveyNodes>((resolve, reject) =>
	{
		try
		{
			let nNames = _NodeStoreNames;
			let txt = document.getText();
			if (Settings.Item("ignoreComments")) txt = Encoding.clearXMLComments(txt);
			let reg = new RegExp("<((" + nNames.join(")|(") + "))[^>]*\\sId=(\"|')([^\"']+)(\"|')");
			let idIndex = nNames.length + 3;
			let nodes = new SurveyNodes();
			let res = txt.matchAll(reg);
			res.forEach(element => 
			{
				let pos = document.positionAt(txt.indexOf(element[0]));
				let item = new SurveyNode(element[1], element[idIndex], pos, document.fileName);
				nodes.Add(item);
			});
			// дополнительно
			nodes.Add(new SurveyNode("Page", "pre_data", null, document.fileName));
			nodes.Add(new SurveyNode("Question", "pre_data", null, document.fileName));
			nodes.Add(new SurveyNode("Question", "pre_sex", null, document.fileName));
			nodes.Add(new SurveyNode("Question", "pre_age", null, document.fileName));
			nodes.Add(new SurveyNode("Page", "debug", null, document.fileName));
			nodes.Add(new SurveyNode("Question", "debug", null, document.fileName));
			resolve(nodes);
		} catch (error)
		{
			logError("Ошибка разбора элементов", error);
			reject(error);
		}

	});
}


/** Возвращает список MixId */
export function getMixIds(document: vscode.TextDocument, Settings: ExtensionSettings): Promise<string[]>
{
	return new Promise<string[]>((resolve, reject) =>
	{
		let res: string[] = [];
		let txt = document.getText();
		if (Settings.Item("ignoreComments")) txt = Encoding.clearXMLComments(txt);
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
		resolve(res.distinct());
	});
}


export function getTibVersion()
{
	return vscode.extensions.getExtension("TiburonResearch.tiburonscripter").packageJSON.version;
}


/** Лог в outputChannel */
export function logToOutput(message: string, prefix = " > "): void
{
	let timeLog = "[" + dateFormat(new Date(), "hh:MM:ss.l") + "]";
	OutChannel.appendLine(timeLog + prefix + message);
}


/** Задаёт файлу режим readonly */
export function unlockFile(path: string, log = false)
{
	winattr.setSync(path, { readonly: false });
	if (log) logToOutput(`Запись в файл ${path} разрешена`);
}


/** Снимает с файла режим readonly */
export function lockFile(path: string)
{
	if (!pathExists(path)) return;
	winattr.setSync(path, { readonly: true });
}

/** Файл в режиме readonly */
export function fileIsLocked(path: string): boolean
{
	if (!pathExists(path)) return false;
	let props = winattr.getSync(path);
	return !!props && !!props.readonly;
}


/** Делает файл hidden */
function hideFile(path: string)
{
	winattr.setSync(path, { hidden: true });
}

/** Делает файл hidden */
function showFile(path: string)
{
	winattr.setSync(path, { hidden: false });
}


/** Сохраняет файл с данными о блокировке */
export function createLockInfoFile(path: Path)
{
	if (!pathExists(path.FullPath)) return;
	let fileName = getLockFilePath(path);
	let data: LockData = {
		User: getUserName(),
		Id: getUserId()
	};
	if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
	fs.writeFileSync(fileName, JSON.stringify(data));
	hideFile(fileName);
}

/** Удаляет файл с данными о блокировке */
export function removeLockInfoFile(path: Path)
{
	let fileName = getLockFilePath(path);
	showFile(fileName);
	fs.unlinkSync(fileName);
}


/** Путь к файлу с информацией о блокировке */
export function getLockFilePath(path: Path): string
{
	let fileName = _LockInfoFilePrefix + path.FileName + ".json";
	fileName = Path.Concat(path.Directory, fileName);
	return fileName;
}


/** Получает информацию из `fileName` */
export function getLockData(fileName: string): LockData
{
	if (!pathExists(fileName)) return null;
	showFile(fileName);
	let data = fs.readFileSync(fileName).toString();
	hideFile(fileName);
	return JSON.parse(data);
}


/** Проверка текущего положения курсора на нахождение в CDATA */
export function inCDATA(document: vscode.TextDocument, position: vscode.Position): boolean
{
	let range = new vscode.Range(new vscode.Position(0, 0), position);
	let text = document.getText(range);
	return text.lastIndexOf("<![CDATA[") > text.lastIndexOf("]]>");
}

/** проверяет язык для activeTextEditor */
function isTib()
{
	return vscode.window.activeTextEditor.document.languageId == "tib";
}


/** Создаёт команду только для языка tib */
export async function registerCommand(name: string, command: Function): Promise<vscode.Disposable>
{
	return vscode.commands.registerCommand(name, (...args: any[]) => 
	{
		if (!isTib()) return;
		command(...args);
	});
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
		/** Удаляет элемент из массива по индексу и возвращает этот элемент */
		removeIndex(index: number): T;
		/** Преобразует массив в коллекцию */
		toKeyedCollection(func: (x: T) => KeyValuePair<any>): KeyedCollection<any>
		/** Преjбразует массив в коллекцию T */
		toKeyedCollection(func: (x: T) => Object): KeyedCollection<any>
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
	while ((mat = reg.exec(text)) !== null) {
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


String.prototype.replaceValues = function (items: KeyedCollection<string>): string
{
	let res = this as string;
	let sorted: KeyValuePair<string>[] = items.OrderBy(x => x.Key.length);
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



Array.prototype.last = function <T>(): T
{
	let res: T;
	if (this.length > 0) res = this[this.length - 1];
	return res;
}


Array.prototype.equalsTo = function <T>(ar: Array<T>): boolean
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


Array.prototype.distinct = function <T>(): T[]
{
	let orig: Array<T> = this;
	return [... new Set(orig)];
}


Array.prototype.contains = function <T>(element: T): boolean
{
	return this.indexOf(element) > -1;
}

Array.prototype.remove = function <T>(element: T): T
{
	let index = this.indexOf(element);
	let res: T;
	if (index > -1)
		res = this.splice(index, 1);
	return res;
}

Array.prototype.removeIndex = function <T>(index: number): T
{
	let res = this[index];
	this.splice(index, 1);
	return res;
}

Array.prototype.toKeyedCollection = function <T>(func: (x: T) => KeyValuePair<any>): KeyedCollection<any>
{
	let res = new KeyedCollection<any>();
	this.forEach(element =>
	{
		res.AddElement(func(element));
	});
	return res;
}


Array.prototype.toKeyedCollection = function <T>(func: (x: T) => Object): KeyedCollection<any>
{
	let res = new KeyedCollection<any>();
	(this as T[]).forEach(element =>
	{
		let obj = func(element);
		let key = Object.keys(obj)[0];
		res.AddPair(key, obj[key] as T);
	});
	return res;
}

//#endregion
