'use strict'
import * as server from 'vscode-languageserver';
import { Encoding, Parse, ErrorCodes } from 'tib-api';
import { RegExpPatterns } from 'tib-api/lib/constants';
import { logError, consoleLog } from './server';
import { SurveyData, SurveyNode } from 'tib-api/lib/surveyData';
import { KeyedCollection } from '@vsc-xml-plugin/common-classes/keyedCollection';
import { SearchResult } from '@vsc-xml-plugin/extensions';


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
				{ Key: ErrorCodes.wrongQuotes, Value: wrongQuots },
				{ Key: ErrorCodes.exportLabelsWithCS, Value: wrongExportLabel }
			]
		)
	},
	{
		Type: server.DiagnosticSeverity.Warning,
		Functions: KeyedCollection.FromPairs(
			[
				{ Key: ErrorCodes.constantIds, Value: dangerousConstandIds }, // иногда оно может стать "delimitedConstant"+Information
				{ Key: ErrorCodes.notImperative, Value: notImperativeQuestions },
				{ Key: ErrorCodes.oldCustomMethods, Value: oldRangeMethods },
				{ Key: ErrorCodes.notDigitalAnswerIds, Value: notDigitalAnswerIds },
				{ Key: ErrorCodes.metaNotProhibited, Value: metaNotProhibited}
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


interface IDiagnosticFunctionData
{
	document: server.TextDocument;
	/** Текст документа без XML-комментариев */
	text: string;
	/** Текст без XML-комментариев и CDATA */
	preparedText: string
	surveyData: SurveyData;
}

/** Интерфейс для одного типа диагностики */
interface IDiagnosticType
{
	/** Тип диагностики */
	Type: server.DiagnosticSeverity;
	/** Массив функций для этого типа диагностики */
	Functions: KeyedCollection<(data: IDiagnosticFunctionData) => Promise<Parse.DocumentElement[]>>;
}



//#endregion



//#region --------------------------- EXPORT



/** Возвращает все найденные предупреждения/ошибки */
export async function getDiagnosticElements(document: server.TextDocument, surveyData: SurveyData): Promise<server.Diagnostic[]>
{
	let res: server.Diagnostic[] = [];
	try
	{
		let stack = [];
		let text = document.getText();
		text = Encoding.clearXMLComments(text);
		let preparedText = Encoding.clearCDATA(text);
		let data: IDiagnosticFunctionData = {
			document,
			text,
			preparedText,
			surveyData
		}
		for (const diagnosticType of _AllDiagnostics) 
		{
			diagnosticType.Functions.ForEach((name, func) =>
			{
				stack.push(_diagnosticElements(data, diagnosticType.Type, func, name).then(x => res = res.concat(x)));
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
async function getWrongIds(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	let { document, preparedText } = data;
	let res = await Parse.getDocumentElements(document, /(\sId=("|'))(\w*[^\w'"\n@\-\(\)]\w*)/, "Вот таким Id быть не может", preparedText, null, 1);
	return res;
}


/* function getIdElementFromSurveyNode(document: server.TextDocument, node: SurveyNode): Parse.DocumentElement
{
	let text = document.getText();
	let from = document.offsetAt(node.Position);
	let start = text.find(/\sId=('|")/, from);
	if (start.Index > -1)
	{
		from = start.Index + start.Result[0].length;
		let to = text.indexOf(start.Result[1], from + 1);
		return new Parse.DocumentElement(document, {
			From: from,
			To: to,
			Message: "Слишком много букв",
			Value: text.slice(from, to).match(/.+/)
		});
	}
} */

/** слишком длинные Id */
async function getLongIds(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	//let log = new Watcher("longIds", true).CreateLogger();
	//log('start');
	let { document, surveyData, preparedText } = data;
	let res: Parse.DocumentElement[] = [];

	/* этот код почему-то работает дольше
	let proms: Promise<void>[] = [];
	let questions = surveyData.CurrentNodes.Item("Question");
	let other = surveyData.CurrentNodes.Filter((key, value) => ['Page', 'Answer,', 'Block'].contains(key));
	if (!!questions)
	{
		proms.push(new Promise<void>((resolve, reject) =>
		{
			let longQuestions = questions.filter(x => x.Id.length > 25).map(x => getIdElementFromSurveyNode(document, x));
			res = res.concat(longQuestions);
			resolve();
		}));
	}
	other.ForEach((key, value) =>
	{
		proms.push(new Promise<void>((resolve, reject) =>
		{
			let longIds = value.filter(x => x.Id.length > 33).map(x => getIdElementFromSurveyNode(document, x));
			res = res.concat(longIds);
			resolve();
		}));
		
	});
	await Promise.all(proms);*/

	res = res.concat(await Parse.getDocumentElements(document, new RegExp("<(Page|Answer|Block)(" + RegExpPatterns.SingleAttribute + ")*\\s*(Id=('|\")\\w{25,}('|\"))"), "Слишком много букв", preparedText));
	res = res.concat(await Parse.getDocumentElements(document, new RegExp("<Question(" + RegExpPatterns.SingleAttribute + ")*\\s*(Id=('|\")\\w{33,}('|\"))"), "Слишком много букв", preparedText));
	//log('end');
	return res;
}


/** проверка недопустимых символов XML */
async function getWrongXML(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	let { document, preparedText } = data;
	let res: Parse.DocumentElement[] = [];
	res = res.concat(await Parse.getDocumentElements(document, /(&(?!(lt|gt|amp|quot|apos))(\w*);?)+/, "Такое надо прикрывать посредством CDATA", preparedText)); // &
	res = res.concat(await Parse.getDocumentElements(document, /<((?![?\/!]|\w)(.*))/, "Тут, вроде, CDATA надо", preparedText)); // <
	return res;
}

/** проверка недопустимых пробелов в XML */
async function getWrongSpaces(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	let { document, preparedText } = data;
	let res: Parse.DocumentElement[] = [];
	res = res.concat(await Parse.getDocumentElements(document, RegExpPatterns.wrongSpaseChars, "Недопустимый символ (может маскироваться под пробел или вообще под ничего)", preparedText, { Code: ErrorCodes.wrongSpaces })); // 0xA0
	return res;
}


/** проверка уникальности Id */
async function getDuplicatedIds(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	let { document, preparedText } = data;
	return await Parse.getDuplicatedElementsIds(document, preparedText);
}

/** временная проверка миксов в Repeat и родителях */
async function getWrongMixes(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	let { document, preparedText } = data;
	return await Parse.getWrongMixedElements(document, preparedText);
}


async function getCsInAutoSplit(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	let { document, preparedText } = data;
	return await Parse.getCsInAutoSplit(document, preparedText);
}


async function wrongQuots(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	let { document, preparedText } = data;
	let res: Parse.DocumentElement[] = [];
	let ins = preparedText.findAll(/(\w+=)("|')([^'"]*\[c#.+?\[\/c#\s*\][^'"]*)\2/);
	ins.forEach(element => {
		if (element.Result[3].includes(element.Result[2]))
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


export async function wrongExportLabel(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	let res: Parse.DocumentElement[] = [];
	let labelsWithCS = data.surveyData.ExportLabels.filter(x => !!x.Value.match(/(\[c#\])|(\$(?!repeat\()\w+\()/));
	labelsWithCS.forEach(label =>
	{
		let obj: Parse.IDocumentElement = {
			From: data.document.offsetAt(label.Range.start),
			To: data.document.offsetAt(label.Range.end),
			Value: label.Value.match(/^[\s\S]+$/),
			Message: "ExportLabel не может содержать кодовые вставки"
		};
		res.push(new Parse.DocumentElement(data.document, obj));
	});
	return res;
}

//#endregion




//#region --------------------------- Функции получения предупреждений


/** Константы, начинающиеся не с того */
async function dangerousConstandIds(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	let { document, preparedText } = data;
	let res: Parse.DocumentElement[] = [];
	let constants = await Parse.getDocumentElements(document, /(<Constants[^>]*>)([\s\S]+?)<\/Constants[^>]*>/, "", preparedText);
	const itemsGroup = 2;
	const constTagGroup = 1;
	const regStart = /^(ID|Text|Pure|Itera|Var|AnswerExists|CompanyProhibited|ProductProhibited)/;
	const regItem = /(<Item[^>]*Id=("|'))([^"'\n]+)(\2)/;
	const itemPreGroup = 1;
	const itemIdGroup = 3;

	if (!!constants && constants.length > 0)
	{
		for (const constantTag of constants)
		{
			let items = constantTag.Value[itemsGroup].findAll(regItem);
			if (!!items && items.length > 0)
			{
				for (const item of items)
				{
					if (!item.Result) continue;
					let match = regStart.exec(item.Result[itemIdGroup]);
					if (!!match)
					{
						let from = constantTag.From + constantTag.Value[constTagGroup].length + item.Index + item.Result[itemPreGroup].length;
						let wrongItem = new Parse.DocumentElement(document, {
							Value: match,
							Message: `Не стоит начинать Id константы с "${match[0]}"`,
							From: from,
							To: from + match[0].length
						});
						res.push(wrongItem);
					}
					let _ = item.Result[itemIdGroup].indexOf("_");
					if (_ > -1)
					{
						let from = constantTag.From + constantTag.Value[constTagGroup].length + item.Index + item.Result[itemPreGroup].length;
						let wrongItem = new Parse.DocumentElement(document, {
							Value: ["_"],
							Message: "Константы с '_' не распознаются в расширении как константы",
							From: from,
							To: from + item.Result[itemIdGroup].length,
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
async function notImperativeQuestions(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	let { document, preparedText } = data;
	let res = await Parse.getDocumentElements(document, /(<Question[^>]+)(Imperative=('|")false(\3))/, "Риторический вопрос detected", preparedText, { Type: server.DiagnosticSeverity.Warning }, 1);
	return res;
}



/** Наличие устаревших пользовательских методов */
async function oldRangeMethods(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	let res: Parse.DocumentElement[] = [];
	let methods = data.surveyData.Methods;
	let setRanges = methods.Item("SetRanges");
	if (!!setRanges)
	{
		let location = setRanges.GetLocation().range;
		let obj: Parse.IDocumentElement = {
			From: data.document.offsetAt(location.start),
			To: data.document.offsetAt(location.end),
			Value: setRanges.Signature.match(/^[\s\S]+$/),
			Message: "Метод SetRanges больше не нужен для вопросов с ранжированием"
		}
		res.push(new Parse.DocumentElement(data.document, obj));
	}
	return res;
}

/** AnswerId, который включает в себя что-то кроме цифр */
async function notDigitalAnswerIds(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	let res = await Parse.getDocumentElements(data.document, new RegExp("<((Answer)(" + RegExpPatterns.SingleAttribute + ")*\\s*)(Id=('|\")\\d*[^\\d'\"]+\\d*('|\"))"), "Id ответа лучше не делать буквенным", data.preparedText, null, 1);
	return res.filter(x => !x.Value[0].match(/\sId=("|')\w*@\w*\1/));
}


/** Запрещённая Meta */
async function metaNotProhibited(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	let res: Parse.DocumentElement[] = [];
	const { document, preparedText } = data;
	const keyWords = /(Product|Company)Prohibited/;
	const prohibitedTexts = /(Инстаграм|Instagram|Фейсбук|Facebook|(\bМета\b)|(\bMeta\b))/i;
	const pages = preparedText.findAll(/(<Page[^>]+>)([\s\S]+?)<\/Page/);
	const listItems = preparedText
		.findAll(/(<List[^>]+>)([\s\S]+?)<\/List/)
		.map(l =>
			l.Result[2]
				.findAll(/(<Text[^>]*>)([\s\S]+?)<\/Text/)
				.map(t => ({ Result: t.Result, Index: l.Index + t.Index + l.Result[1].length } as SearchResult))
		);
	const listItemsText: SearchResult[] = [].concat(...listItems);
	[...pages, ...listItemsText].forEach((tag: SearchResult) =>
	{
		const tagContent = tag.Result[2];
		const prohibited = tagContent?.find(prohibitedTexts);
		if (!!prohibited?.Result && !tagContent?.match(keyWords))
		{
			const from = tag.Index + prohibited.Index + tag.Result[1].length;
			res.push(new Parse.DocumentElement(document, {
				From: from,
				Message: "Возможно пропущена сноска про запрещённую организацию. Используйте константу @ProductProhibited или @CompanyProhibited",
				To: from + prohibited.Result[0].length,
				Value: prohibited.Result
			}));
		}
	});
	
	return res;
}


//#endregion




//#region --------------------------- Функции получения подсказок


/** Одинаковые заголовки */
async function equalTexts(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	let { document, text } = data;
	let res: Parse.DocumentElement[] = [];
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
function copyPastedCS(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	let { document, preparedText } = data;
	return new Promise<Parse.DocumentElement[]>((resolve, reject) =>
	{
		let res: Parse.DocumentElement[] = [];
		let csIns = preparedText.findAll(/\[c#[^\]]*\]([\s\S]+?)\[\/c#\s*\]/);
		let groups = csIns.groupBy(x => x.Result[1]).Filter((key, value) =>
		{
			if (value.length < 5) return false;
			if (key.findAll(/\w{5,}\(/).length > 1) return true; // проверяем количество вызываемых методов
			if (key.findAll(/\+|(\|\|)|(\&\&)/).length > 2) return true; // проверяем количество операторов (самых частых)
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
async function linqHelper(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	let { document, text } = data;
	// ищем Count() > 0
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
async function mixIdSuggestion(data: IDiagnosticFunctionData): Promise<Parse.DocumentElement[]>
{
	let { document, preparedText } = data;
	preparedText = Encoding.clearCSContents(preparedText);
	let res: Parse.DocumentElement[] = [];
	let starts = preparedText.findAll(/<Repeat[^>]+>/);
	let repeats = starts.map(x =>
	{
		return {
			Start: x,
			End: Parse.findCloseTag("<", "Repeat", ">", x.Index, preparedText, false)?.Range
		}
	});
	// выкидываем вложенные
	repeats = repeats.filter(x => !!x.End);
	repeats = repeats.filter(x => !repeats.find(f => f.Start.Index < x.Start.Index && f.End.From > x.End.From));
	// ищем с Mix
	repeats.forEach(x =>
	{
		let text = preparedText.slice(x.Start.Index + x.Start.Result[0].length, x.End.From);
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
async function _diagnosticElements(data: IDiagnosticFunctionData, type: server.DiagnosticSeverity, func: (data: IDiagnosticFunctionData) => Promise<Parse.DocumentElement[]>, diagnosticId: number | string): Promise<server.Diagnostic[]>
{
	let res: server.Diagnostic[] = [];
	let elements = await func(data);
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
	let eqTexts = filteredREsults.findDuplicates((x1, x2) => eqComparer(x1) == eqComparer(x2));
	if (eqTexts.length > 0)
	{
		searchResults.filter(x => !!eqTexts.find(el => eqComparer(el) == eqComparer(x))).forEach(header =>
		{
			let indent = groupIndent > -1 ? header.Result[groupIndent].length : 0;
			res.push(new Parse.DocumentElement(document, {
				DiagnosticProperties: { Code: ErrorCodes.duplicatedText },
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
