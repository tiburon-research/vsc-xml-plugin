'use strict'
import * as server from 'vscode-languageserver';
import { KeyedCollection, translatePosition, Encoding, Parse, ErrorCodes, SearchResult } from 'tib-api';
import { RegExpPatterns } from 'tib-api/lib/constants';
import { logError, consoleLog } from './server';


//#region --------------------------- const type interface




/** Массив из всех типов диагностик */
const _AllDiagnostics: IDiagnosticType[] =
	[
		{
			Type: server.DiagnosticSeverity.Error,
			Functions: KeyedCollection.FromPairs(
				[
					{ Key: ErrorCodes.wrongIds, Value: getWrongIds },
					{ Key: ErrorCodes.longIds, Value: getLongIds },
					{ Key: ErrorCodes.wrongXML, Value: getWrongXML },
					{ Key: ErrorCodes.duplicatedId, Value: getDuplicatedIds },
					{ Key: ErrorCodes.wrongMixes, Value: getWrongMixes },
					{ Key: ErrorCodes.csInAutoSplit, Value: getCsInAutoSplit },
					{ Key: ErrorCodes.wrongSpaces, Value: getWrongSpaces },
					{ Key: ErrorCodes.wrongQuotes, Value: wrongQuots }
				]
			)
		},
		{
			Type: server.DiagnosticSeverity.Warning,
			Functions: KeyedCollection.FromPairs(
				[
					{ Key: ErrorCodes.constantIds, Value: dangerousConstandIds }, // иногда оно может стать "delimitedConstant"+Information
					{ Key: ErrorCodes.notImperative, Value: notImperativeQuestions }
				]
			)
		},
		{
			Type: server.DiagnosticSeverity.Information,
			Functions: KeyedCollection.FromPairs(
				[
					{ Key: ErrorCodes.duplicatedText, Value: equalTexts },
					{ Key: ErrorCodes.copyPastedCS, Value: copyPastedCS },
					{ Key: ErrorCodes.linqHelp, Value: linqHelper },
					{ Key: ErrorCodes.mixIdSuggestion, Value: mixIdSuggestion }
				]
			)
		}
	];



/** Интерфейс для одного типа диагностики */
interface IDiagnosticType
{
	/** Тип диагностики */
	Type: server.DiagnosticSeverity;
	/** Массив функций для этого типа диагностики */
	Functions: KeyedCollection<(document: server.TextDocument, preparedText: string) => Promise<Parse.DocumentElement[]>>;
}



//#endregion



//#region --------------------------- EXPORT



/** Возвращает все найденные предупреждения/ошибки */
export async function getDiagnosticElements(document: server.TextDocument): Promise<server.Diagnostic[]>
{
	let res: server.Diagnostic[] = [];
	try
	{
		let stack = [];
		let text = document.getText();
		text = Encoding.clearXMLComments(text);
		text = Encoding.clearCDATA(text);

		for (const diagnosticType of _AllDiagnostics) 
		{
			diagnosticType.Functions.ForEach((name, func) =>
			{
				stack.push(_diagnosticElements(document, diagnosticType.Type, text, func, name).then(x => res = res.concat(x)));
			});
		};
		await Promise.all(stack);
	} catch (error)
	{
		logError('Ошибка получения Diagnostic', true, error);
	}
	return res;
}



//#endregion




//#region --------------------------- Функции получения ошибок


/** Id с недопустимым набором символов */
async function getWrongIds(document: server.TextDocument, prepearedText: string): Promise<Parse.DocumentElement[]>
{
	let res = await Parse.getDocumentElements(document, /(\sId=("|'))(\w*[^\w'"\n@\-\(\)]\w*)/, "Вот таким Id быть не может", prepearedText, null, 1);
	return res;
}


/** слишком длинные Id */
async function getLongIds(document: server.TextDocument, prepearedText: string): Promise<Parse.DocumentElement[]>
{
	let res = await Parse.getDocumentElements(document, new RegExp("<(Page|Answer|Block)(" + RegExpPatterns.SingleAttribute + ")*\\s*(Id=('|\")\\w{25,}('|\"))"), "Слишком много букв", prepearedText);
	res = res.concat(await Parse.getDocumentElements(document, new RegExp("<Question(" + RegExpPatterns.SingleAttribute + ")*\\s*(Id=('|\")\\w{33,}('|\"))"), "Слишком много букв", prepearedText));
	return res;
}


/** проверка недопустимых символов XML */
async function getWrongXML(document: server.TextDocument, prepearedText: string): Promise<Parse.DocumentElement[]>
{
	let res: Parse.DocumentElement[] = [];
	res = res.concat(await Parse.getDocumentElements(document, /(&(?!(lt|gt|amp|quot|apos))(\w*);?)+/, "Такое надо прикрывать посредством CDATA", prepearedText)); // &
	res = res.concat(await Parse.getDocumentElements(document, /<((?![?\/!]|\w)(.*))/, "Тут, вроде, CDATA надо", prepearedText)); // <
	return res;
}

/** проверка недопустимых пробелов в XML */
async function getWrongSpaces(document: server.TextDocument, prepearedText: string): Promise<Parse.DocumentElement[]>
{
	let res: Parse.DocumentElement[] = [];
	res = res.concat(await Parse.getDocumentElements(document, RegExpPatterns.wrongSpaseChars, "Недопустимый символ (на самом деле, это не пробел)", prepearedText, { Code: ErrorCodes.wrongSpaces })); // 0xA0
	return res;
}


/** проверка уникальности Id */
async function getDuplicatedIds(document: server.TextDocument, prepearedText: string): Promise<Parse.DocumentElement[]>
{
	return await Parse.getDuplicatedElementsIds(document, prepearedText);
}

/** временная проверка миксов в Repeat и родителях */
async function getWrongMixes(document: server.TextDocument, prepearedText: string): Promise<Parse.DocumentElement[]>
{
	return await Parse.getWrongMixedElements(document, prepearedText);
}


async function getCsInAutoSplit(document: server.TextDocument, prepearedText: string): Promise<Parse.DocumentElement[]>
{
	return await Parse.getCsInAutoSplit(document, prepearedText);
}


async function wrongQuots(document: server.TextDocument, prepearedText: string): Promise<Parse.DocumentElement[]>
{
	let res: Parse.DocumentElement[] = [];
	let ins = prepearedText.findAll(/(\w+=)("|')([^'"]*\[c#.+?\[\/c#\s*\][^'"]*)\2/);
	ins.forEach(element => {
		if (element.Result[3].contains(element.Result[2]))
		{
			let from = element.Index + element.Result[1].length;
			res.push(new Parse.DocumentElement(document, {
				From: from,
				To: from + element.Result[2].length + element.Result[3].length + 1,
				Message: "Конфликт кавычек. Используйте разные кавычки для C#-констант и XML-атрибутов.",
				Value: element.Result,
				DiagnosticProperties: {
					Code: ErrorCodes.wrongQuotes
				}
			}));
		}
	});
	return res;
}

//#endregion




//#region --------------------------- Функции получения предупреждений


/** Константы, начинающиеся не с того */
async function dangerousConstandIds(document: server.TextDocument, prepearedText: string): Promise<Parse.DocumentElement[]>
{
	let res: Parse.DocumentElement[] = [];
	let constants = await Parse.getDocumentElements(document, /(<Constants[^>]*>)([\s\S]+?)<\/Constants[^>]*>/, "", prepearedText);
	const itemsGroup = 2;
	const constTagGroup = 1;
	const regStart = /^(ID|Text|Pure|Itera|Var|AnswerExists)/;
	const regItem = /(<Item[^>]*Id=("|'))([^"'\n]+)(\2)/;
	const itemPreGroup = 1;
	const itemIdGroup = 3;

	if (!!constants && constants.length > 0)
	{
		for (const constantTag of constants)
		{
			let items = constantTag.Value[itemsGroup].matchAll(regItem);
			if (!!items && items.length > 0)
			{
				for (const item of items)
				{
					if (!item) continue;
					let match = regStart.exec(item[itemIdGroup]);
					if (!!match)
					{
						let from = constantTag.From + constantTag.Value[constTagGroup].length + item.index + item[itemPreGroup].length;
						let wrongItem = new Parse.DocumentElement(document, {
							Value: match,
							Message: `Не стоит начинать Id константы с "${match[0]}"`,
							From: from,
							To: from + match[0].length
						});
						res.push(wrongItem);
					}
					let _ = item[itemIdGroup].indexOf("_");
					if (_ > -1)
					{
						let from = constantTag.From + constantTag.Value[constTagGroup].length + item.index + item[itemPreGroup].length;
						let wrongItem = new Parse.DocumentElement(document, {
							Value: ["_"],
							Message: "Константы с '_' не распознаются в расширении как константы",
							From: from,
							To: from + item[itemIdGroup].length,
							DiagnosticProperties:
							{
								Type: server.DiagnosticSeverity.Information,
								Code: ErrorCodes.delimitedConstant
							}
						});
						res.push(wrongItem);
					}
				}
			}
		}
	}

	return res;
}

/** Необязательные вопросы */
async function notImperativeQuestions(document: server.TextDocument, prepearedText: string): Promise<Parse.DocumentElement[]>
{
	let res = await Parse.getDocumentElements(document, /(<Question[^>]+)(Imperative=('|")false(\3))/, "Риторический вопрос detected", prepearedText, { Type: server.DiagnosticSeverity.Warning }, 1);
	return res;
}


//#endregion




//#region --------------------------- Функции получения подсказок


/** Одинаковые заголовки */
async function equalTexts(document: server.TextDocument, prepearedText: string): Promise<Parse.DocumentElement[]>
{
	let res: Parse.DocumentElement[] = [];
	let text = Encoding.clearXMLComments(document.getText());
	let headers = text.findAll(/(<Header\s*>\s*)([\s\S]+?)\s*<\/Header\s*>/);
	let labelsQ = text.findAll(/(<Question[^>]+)(ExportLabel=("|')(.+?)(\3))/);
	if (headers.length > 1) res = res.concat(await findDuplicatedText(document, headers, 2, 15, 'Найдены повторяющиеся заголовки', 1));
	if (labelsQ.length > 1) res = res.concat(await findDuplicatedText(document, labelsQ, 2, 3, 'Найдены повторяющиеся метки вопросов', 1));

	// ищем ответы внутри вопросов
	let questions = text.findAll(/(<Question[^>]+>)([\s\S]+?)<\/Question/);
	let eqAnswers: Parse.DocumentElement[] = [];
	await questions.forEachAsync(q => new Promise<void>((resolve, reject) =>
	{
		let answers = q.Result[2].findAll(/(<Answer[^>]+)(ExportLabel=("|')(.+?)(\3))/);
		if (answers.length < 1) return resolve();
		findDuplicatedText(document, answers, 2, 3, 'Найдены повторяющиеся метки ответов', 1).then(qAnswers =>
		{
			eqAnswers = eqAnswers.concat(qAnswers.map(a =>
			{
				let qIndent = q.Index + q.Result[1].length;
				return new Parse.DocumentElement(document, {
					DiagnosticProperties: a.DiagnosticProperties,
					From: qIndent + a.From,
					Message: a.Message,
					To: qIndent + a.To,
					Value: a.Value
				});
			}));
			resolve();
		});
	}));
	if (eqAnswers.length > 1) res = res.concat(eqAnswers);
	return res;
}

/** Повторяющиеся c# вставки */
function copyPastedCS(document: server.TextDocument, prepearedText: string): Promise<Parse.DocumentElement[]>
{
	return new Promise<Parse.DocumentElement[]>((resolve, reject) =>
	{
		let res: Parse.DocumentElement[] = [];
		let csIns = prepearedText.findAll(/\[c#[^\]]*\]([\s\S]+?)\[\/c#\s*\]/);
		let groups = csIns.groupBy<SearchResult>(x => x.Result[1]).Filter((key, value) =>
		{
			if (value.length < 5) return false;
			if (key.matchAll(/\w{5,}\(/).length > 1) return true; // проверяем количество вызываемых методов
			if (key.matchAll(/\+|(\|\|)|(\&\&)/).length > 2) return true; // проверяем количество операторов (самых частых)
			return false;
		});
		
		groups.ForEach((key, value) =>
		{
			let ar = value.map(x => new Parse.DocumentElement(document, {
				From: x.Index,
				To: x.Index + x.Result[0].length,
				Message: "Многократно повторяющийся код. Лучше использовать методы.",
				Value: x.Result
			}));
			res = res.concat(ar);
		});

		resolve(res);
	});
}

/** Помогаем писать Linq лучше */
async function linqHelper(document: server.TextDocument, prepearedText: string): Promise<Parse.DocumentElement[]>
{
	// ищем Count() > 0
	let text = Encoding.clearXMLComments(document.getText());
	text = Encoding.clearCSComments(text);
	let res = await Parse.getDocumentElements(document, /(\.Count)(\([^;]+)/, "Возможно, вместо проверки `Count() > 0` лучше использовать `Any()`", text);
	for (let i = 0; i < res.length; i++)
	{
		let stuff = res[i].Value[2];
		let closeBracketIndex = Parse.findCloseBracket(stuff, 0);
		if (closeBracketIndex < 0)
		{
			res[i] = null;
			continue;
		}
		let compare = stuff.slice(closeBracketIndex + 1).find(/^\s*>\s*0/);
		if (compare.Index < 0)
		{
			res[i] = null;
			continue;
		}
		res[i] = new Parse.DocumentElement(document, {
			From: res[i].From,
			Message: res[i].Message,
			To: res[i].From + res[i].Value[1].length + closeBracketIndex + 1 + compare.Index + compare.Result[0].length,
			Value: res[i].Value,
			DiagnosticProperties: res[i].DiagnosticProperties
		});
	}
	return res.filter(x => !!x);
}


/** Предлагаем MixId вместо Mix */
async function mixIdSuggestion(document: server.TextDocument, prepearedText: string): Promise<Parse.DocumentElement[]>
{
	let res: Parse.DocumentElement[] = [];
	let starts = prepearedText.findAll(/<Repeat[^>]+>/);
	let repeats = starts.map(x =>
	{
		return {
			Start: x,
			End: Parse.findCloseTag("<", "Repeat", ">", x.Index, prepearedText)?.Range
		}
	});
	// выкидываем вложенные
	repeats = repeats.filter(x => !!x.End);
	repeats = repeats.filter(x => !repeats.find(f => f.Start.Index < x.Start.Index && f.End.From > x.End.From));
	// ищем с Mix
	repeats.forEach(x =>
	{
		let text = prepearedText.slice(x.Start.Index + x.Start.Result[0].length, x.End.From);
		if (!text) return;
		let matches = text.findAll(/\sMix=/);
		matches.forEach(match => {
			let from = x.Start.Index + x.Start.Result[0].length + match.Index + 1;
			let el = new Parse.DocumentElement(document, {
				From: from,
				To: from + match.Result[0].length - 2,
				Message: "Возможно, внутри повтора стоит использовать MixId вместо Mix",
				Value: match.Result
			});
			res.push(el);
		});
	});
	return res;
}


//#endregion




//#region --------------------------- универсальные


/** универсальная функция для преобразования `DocumentElement[]` в `Diagnostic[]` */
async function _diagnosticElements(document: server.TextDocument, type: server.DiagnosticSeverity, preparedText: string, func: (document: server.TextDocument, prepearedText: string) => Promise<Parse.DocumentElement[]>, diagnosticId: number | string): Promise<server.Diagnostic[]>
{
	let res: server.Diagnostic[] = [];
	let elements = await func(document, preparedText);
	if (!!elements)
	{
		elements.forEach(element =>
		{
			let t = !!element.DiagnosticProperties.Type ? element.DiagnosticProperties.Type : type;
			let code = !!element.DiagnosticProperties.Code ? element.DiagnosticProperties.Code : diagnosticId;
			let diagItem = server.Diagnostic.create(element.Range, element.Message, t);
			diagItem.code = code;
			res.push(diagItem);
		});
	}
	return res;
}


async function findDuplicatedText(document: server.TextDocument, searchResults: SearchResult[], groupIndex: number, minLength: number, errText: string, groupIndent: number = -1)
{
	let res: Parse.DocumentElement[] = [];
	let filteredREsults = searchResults.filter(x => x.Result[groupIndex].length > minLength && !x.Result[groupIndex].match(/(\[c#\])|@(ID|Text|Pure|Var|Itera)/));
	let eqComparer = (result: SearchResult) => { return result.Result[groupIndex].replace(/(<!\[CDATA\[)|(\]\]>)/g, '').trim() };
	let eqTexts = filteredREsults.findDuplicates<SearchResult>((x1, x2) => eqComparer(x1) == eqComparer(x2));
	if (eqTexts.length > 0)
	{
		searchResults.filter(x => eqTexts.contains(x, el => eqComparer(el) == eqComparer(x))).forEach(header =>
		{
			let indent = groupIndent > -1 ? header.Result[groupIndent].length : 0;
			res.push(new Parse.DocumentElement(document, {
				DiagnosticProperties: { Type: server.DiagnosticSeverity.Warning, Code: ErrorCodes.duplicatedText },
				From: indent + header.Index,
				Message: errText,
				To: indent + header.Index + header.Result[groupIndex].length,
				Value: header.Result
			}));
		});
	}
	return res;
}


//#endregion
