'use strict';

import * as server from 'vscode-languageserver';
import * as Encoding from './encoding'
import * as Parse from './parsing'
import * as clipboard from "clipboardy"
import * as Constants from './constants'
import * as JQuery from './tibJQuery'
import { CacheSet } from './cache'


export { Encoding, Parse, Constants, JQuery };



/* ---------------------------------------- Classes, Structs, Namespaces, Enums, Consts, Interfaces ----------------------------------------*/
//#region


export enum Language { XML, CSharp, CSS, JS, PlainText, Inline };

/** Результат поиска в строке */
interface SearchResult
{
	Result: RegExpMatchArray;
	Index: number;
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



export class ITibAttribute
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



//#endregion




/*---------------------------------------- Functions ----------------------------------------*/
//#region


/** Получает текст от начала документа до `position` */
export function getPreviousText(document: server.TextDocument, position: server.Position, lineOnly: boolean = false): string
{
	try
	{
		let
			start = lineOnly ? server.Position.create(position.line, 0) : server.Position.create(0, 0),
			end = server.Position.create(position.line, position.character);
		return document.getText(server.Range.create(start, end));
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
	document.getText
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
