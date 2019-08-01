'use strict';
// ВСЁ, ЧТО СВЯЗАНО С getCurrentTag




import * as server from 'vscode-languageserver';
import { translatePosition, KeyedCollection, Language, Encoding, KeyValuePair, Parse } from './index';
import * as Constants from './constants'




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
		if (!document || !range) return;
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
	    return ["List", "Length", "Range", "Source"].find(x => attrs.ContainsKey(x));
	}

	/** Закрыт ли открывающий тег */
	public isClosed(): boolean
	{
	    return !!this.Raw.trim().match(Constants.RegExpPatterns.OpenTagFull);
	}

	public UpdateFrom(data: SimpleTag): void
	{
		for (const key in data) {
			if (data.hasOwnProperty(key)) {
				this[key] = data[key];
			}
		}
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
	    attrs.ForEach(function (key, val)
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
	    let res: KeyedCollection<string> = new KeyedCollection<string>();
	    let mt = str.match(Constants.RegExpPatterns.Attributes);
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