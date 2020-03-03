'use strict'

import { Language, getPreviousText } from "./index";
import { TextRange, TagInfo, CurrentTag } from './currentTag'
import { safeString, positiveMin, KeyedCollection } from './customs'
import { clearXMLComments } from "./encoding"
import { RegExpPatterns } from './constants'
import * as charDetect from 'charset-detector'
import * as server from 'vscode-languageserver';
import { init as initJQuery } from './tibJQuery';
import { Structures } from "./surveyObjects";



/** Результат поиска тегов */
export interface FindTagResult
{
	Range: TextRange;
	/** Самозакрывающийся тег */
	SelfClosed: boolean;
}


/** Результат поиска элементов */
export class ParsedElementObject
{
	/** Инициализация */
	constructor(Id?: string, Text?: string )
	{
		if (!!Id) this.Id = Id;
		if (!!Text) this.Text = Text;
	}

	public Id: string;
	public Text: string;
	public Vars: string[] = [];

	public IsResetAnswer(): boolean
	{
		return checkResetAnswer(this.Text);
	}
	
	public IsTextAnswer(): boolean
	{
		return checkOpenAnswer(this.Text);
	}
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

/** Возвращает диапазон закрывающегося тега или null */
export function getCloseTagRange(opBracket: string, tagName: string, clBracket: string, document: server.TextDocument, position: server.Position): server.Range
{
	let fullText = document.getText();
	let prevText = getPreviousText(document, position);
	let res = findCloseTag(opBracket, tagName, clBracket, prevText, fullText);
	if (!res || !res.Range) return null;
	let startPos = document.positionAt(res.Range.From);
	let endPos = document.positionAt(res.Range.To + 1);
	return server.Range.create(startPos, endPos);
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
}

/** Возвращает диапазон открывающегося тега или null */
export function getOpenTagRange(opBracket: string, tagName: string, clBracket: string, document: server.TextDocument, position: server.Position): server.Range
{
	let prevText = getPreviousText(document, position);
	let res = findOpenTag(opBracket, tagName, clBracket, prevText);
	if (!res) return null;
	let startPos = document.positionAt(res.Range.From);
	let endPos = document.positionAt(res.Range.To + 1);
	return server.Range.create(startPos, endPos);
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


/** Проверяет ответ на з.о. по тексту */
function checkResetAnswer(answerText: string): boolean
{
	if (!answerText || answerText.length > 50) return false;
	let text = answerText.toLocaleLowerCase();
	for (const pattern of RegExpPatterns.ResetAnswerText) {
		if (text.match(pattern)) return true;
	}
	return false;
}


/** Проверяет ответ на открытый по тексту */
function checkOpenAnswer(answerText: string): boolean
{
	if (!answerText) return false;
	let text = answerText.toLocaleLowerCase();
	for (const pattern of RegExpPatterns.OpenAnswerText) {
		if (text.match(pattern)) return true;
	}
	return false;
}


/** Разбирает текст на Answer/Item */
export function parseElements(strings: string[]): ParsedElementObject[]
{
	let res: ParsedElementObject[] = [];
	if (strings.length == 0) return res;
	strings = strings.map(x => x.trim()).filter(x => x.length > 0);

	// сначала пробуем особые варианты
	res = parseHorizontalAnswers(strings);
	if (res.length > 0) return res;
	res = parseTableForItems(strings);
	if (res.length > 0) return res;

	// пробуем разбить на Id + text
	let regTests = [
		{
			Regex: /^(\d+)([\.\-—:\)\s]*)(.+?)$/,
			IdGroup: 1,
			TextGroup: 3
		},
		{
			Regex: /^(.+?)([\.\-—:\s]*)(\d+)$/,
			IdGroup: 3,
			TextGroup: 1
		},
		{
			Regex: /^(\w)(\s?[\.\-—:\)]\s*)(.+?)$/,
			IdGroup: 1,
			TextGroup: 3
		}
	];

	let withIds = false;

	for (let i = 0; i < regTests.length; i++)
	{
		const reg = regTests[i];
		res = [];
		let found = false;
		for (let j = 0; j < strings.length; j++)
		{
			found = false;
			const str = strings[j];
			let match = str.match(reg.Regex);
			if (!match) break;
			else found = true;
			let data = new ParsedElementObject();
			data.Id = match[reg.IdGroup].match(/\d+/) ? match[reg.IdGroup] : '' + (j + 1);
			data.Text = match[reg.TextGroup];
			res.push(data);
		}
		found = found && res.length == strings.length;
		if (found)
		{
			withIds = true;
			break;
		}
	}

	if (!withIds) res = strings.map((s, i) => { return new ParsedElementObject('' + (i + 1), s); } );

	return res;
}

/** Ищет id+text в горизонтальном виде */
function parseHorizontalAnswers(strings: string[]): ParsedElementObject[]
{
	let res: ParsedElementObject[] = [];
	// подходит только 1 или 2 строки
	if (strings.length != 1 && strings.length != 2) return res;
	// проверяем первую строку
	let l1 = strings[0].split('\t');
	// будем искать только от 5 вариантов
	if (l1.length < 5) return res;
	let isIds = l1.length == l1.filter(x => !!x.match(/^\d+$/)).length;
	if (strings.length == 2)
	{
		// если строк две и первая не ids, то не подходит
		if (!isIds) return res;
		let l2 = strings[1].split('\t');
		// количество должно быть одинаковым
		if (l1.length != l2.length) return res;
		for (let i = 0; i < l1.length; i++) {
			res.push(new ParsedElementObject(l1[i], l2[i]));
		}
	}
	else
	{
		if (isIds)
		{
			for (let i = 0; i < l1.length; i++) {
				res.push(new ParsedElementObject(l1[i], l1[i]));
			}
		}
		else
		{
			for (let i = 0; i < l1.length; i++) {
				res.push(new ParsedElementObject(''+ (i+1), l1[i]));
			}
		}
	}

	return res;
}

/** Ищет разделённые табуляцией Items с Var */
function parseTableForItems(strings: string[]): ParsedElementObject[]
{
	let res: ParsedElementObject[] = [];
	let splitted = strings.map(x => x.split('\t'));
	// все строки должны быть с одинаковым количеством \t
	if (splitted.map(x => x.length).distinct().length != 1) return res;
	// считаем только больше одного \t
	if (splitted[0].length < 3) return res;
	splitted.forEach(str => {
		let el = new ParsedElementObject(str[0], str.last());
		let vars: string[] = [];
		for (let i = 1; i < str.length - 1; i++)
		{
			vars.push(str[i]);
		}
		el.Vars = vars;
		res.push(el);
	});
	return res;
}


/** Вычленяет вопрос из строки 
 * 
 * `force` - искать русские буквы и числовой Id
 *  */
export function parseQuestion(text: string, force = false): ParsedElementObject
{
	let res = new ParsedElementObject("", text);
	let regex = /^([a-zA-Z]\w+)(\.?\s*)(.*)/;
	let indexes = {
		id: 1,
		text: 3
	}
	if (force)
	{
		regex = /^((\d+)|([A-Za-zА-Яа-я][А-Яа-я\w]+))(\.?\s*)(.*)/;
		indexes = {
			id: 1,
			text: 5
		}
	}
	let match = text.match(regex);
	if (!match) return res;
	res.Id = match[indexes.id];
	res.Text = match[indexes.text];
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


export interface IDocumentElementDiagnosticProps
{
	Type?: server.DiagnosticSeverity;
	Code?: string | number;
}

export interface IDocumentElement
{
	Value: RegExpMatchArray;
	From: number;
	To: number;
	Message: string;
	/** Если задан, используется для преобразования в `DiagnosticElement` */
	DiagnosticProperties?: IDocumentElementDiagnosticProps;
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
export async function getDocumentElements(document: server.TextDocument, search: RegExp, errorMessage: string, preparedText: string, diagnosticProps?: IDocumentElementDiagnosticProps, indentGroup?: number): Promise<DocumentElement[]>
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
				From: element.index + (!!indentGroup ? element[indentGroup].length : 0),
				To: to,
				Message: errorMessage,
				DiagnosticProperties: diagnosticProps || {} as IDocumentElementDiagnosticProps
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
		let tagNames = ['Page', 'List', 'Question'];
		let $dom;
		try
		{
			$dom = $.XMLDOM(prepearedText);
		} catch (error)
		{ return resolve(res) }
		if (!$dom) return resolve(res);

		let ids = new KeyedCollection<string[]>();

		try
		{
			// собираем все Id
			tagNames.forEach(element =>
			{
				let ar: string[] = [];
				$dom.find(element).each((i, e) =>
				{
					let attr = $(e).attr('Id');
					if (!!attr) ar.push(attr.toLowerCase());
				});
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
						let reg = new RegExp('(<' + key + ")(" + RegExpPatterns.SingleAttribute + ")*\\s*(Id=('|\")" + d + "('|\"))", "i");
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
		} catch (error)
		{
			reject(error);
		}

		resolve(res);
	});

}

export function getWrongMixedElements(document: server.TextDocument, prepearedText: string): Promise<DocumentElement[]>
{
	return new Promise<DocumentElement[]>((resolve, reject) =>
	{
		let res: DocumentElement[] = [];
		let mixRegex = /((<(Page|Question|Repeat)\s[^>]*)(Mix(Id)?)=[^>]*>)([\s\S]*?)<\/\3/;
		let parents = prepearedText.matchAll(mixRegex);

		parents.forEach(parent =>
		{
			let child = parent[6].find(mixRegex);
			if (!!child.Result && child.Result.length > 0)
			{
				let resultIndex = parent.index + parent[1].length + child.Index + child.Result[2].length;
				let endIndex = resultIndex + child.Result[4].length;
				let parentString = document.positionAt(parent.index).line + 1;
				res.push(new DocumentElement(document, {
					From: resultIndex,
					To: endIndex,
					Value: child.Result,
					Message: `В родительском ${parent[3]} (строка ${parentString}) указан ${parent[4]}. Вложенные Mix/MixId надо оборачивать в <Block />`
				}));
			}
		});
		resolve(res);
	});
}


/** Находит использование c# в AutoSplit */
export function getCsInAutoSplit(document: server.TextDocument, prepearedText: string): Promise<DocumentElement[]>
{
	return new Promise<DocumentElement[]>((resolve, reject) => {
		let res: DocumentElement[] = [];
		let autoSplits = prepearedText.findAll(/(Type=("|')AutoSplit(\2))([\s\S]+?)<\/Question/);
		autoSplits.forEach(element =>
		{
			let content = element.Result[4];
			if (!content) return;
			let answer = content.find(/(<Answer([\s\S]+?)<Text\s*>)([\s\S]+?)<\/Text/);
			if (!!answer.Result)
			{
				let matchAll = answer.Result[3].findAll(/(\[c#[^\]]*\][\s\S]+?\[\/c#\])|(\$\w+)|(@Text)/i).filter(x => !!x.Result && x.Result[0] != '$repeat');
				let match = matchAll.length > 0 ? matchAll[0] : null;
				if (!!match)
				{
					let From = element.Index + element.Result[1].length + answer.Index + answer.Result[1].length + match.Index;
					let To = From + match.Result[0].length;
					let msg = 'ClickText.AutoSplit не поддерживает кодовые вставки. ';
					if (match.Result[0] == "@Text") msg += 'Используйте @Pure вместо @Text.';
					else msg += 'Надо делать Repeat+Filter.'
					res.push(new DocumentElement(document, {
						From,
						To,
						Value: match.Result,
						Message: msg,
						DiagnosticProperties: { Type: server.DiagnosticSeverity.Error }
					}));
				}
			}
		});
		resolve(res);
	});
}


/** Ищет весь пользовательский JS и возвращает одной строкой */
export async function getCustomJS(text: string): Promise<string>
{
	let res: string = null;
	let jsElements = text.matchAll(/<!--#JS([\s\S]*?)-->/);
	jsElements.forEach(body =>
	{
		if (!body[1]) return;
		if (!!res) res += "\n" + body[1];
		else res += body[1];
	});
	return res;
}


function getDefaultElement(jqObject, name: string)
{
	if (!jqObject || jqObject.length == 0 || !jqObject[0] || jqObject[0].nodeName != name) return null;
	let text = jqObject.attr('Text') || jqObject.find('Text').text();
	text = text || '';

	return {
		Id: jqObject.attr('Id'),
		Text: text
	}
}


/** Получает `Structures.ListItem` из объекта `JQuery` */
export function getListItem(jqObject): Structures.ListItem
{
	let parsed = getDefaultElement(jqObject, 'Item');
	if (!parsed) return null;
	let vars = [];
	let varsAttrs = jqObject.attr('Var');
	let varsTags = jqObject.find('Var');
	if (!!varsAttrs) vars = vars.concat(varsAttrs.split(','));
	if (varsTags.length > 0) vars = vars.concat(varsTags.map((i, el) => el.innerHTML).get());

	let res = new Structures.ListItem();
	res.Id = parsed.Id;
	res.Text = parsed.Text;
	res.Vars = vars;
	return res;
}

/** Получает `Structures.Answer` из объекта `JQuery` */
export function getAnswer(jqObject): Structures.Answer
{
	return getDefaultElement(jqObject, 'Answer');
}


/** Находит закрывающуюся скобку */
export function findCloseBracket(text: string, openBracketIndex: number): number
{
	let res = -1;
	if (!text ||openBracketIndex < 0 || openBracketIndex >= text.length) return res;
	let bracketMatch = KeyedCollection.FromArrays(["(", "[", "{", "<"], [")", "]", "}", ">"]);
	let openB = text[openBracketIndex];
	let closeB = bracketMatch.Item(openB);
	if (!closeB) return res;
	let openCount = 0;
	let closeCount = 0;
	for (let i = openBracketIndex; i < text.length; i++)
	{
		if (text[i] == openB) openCount++;
		else if (text[i] == closeB) closeCount++;
		if (openCount > 0 && openCount == closeCount)
		{
			res = i;
			break;
		};
	}
	return res;
}
