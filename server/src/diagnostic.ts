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
					{ Key: ErrorCodes.wrongSpaces, Value: getWrongSpaces }
				]
			)
		},
		{
			Type: server.DiagnosticSeverity.Warning,
			Functions: KeyedCollection.FromPairs(
				[
					{ Key: ErrorCodes.constantIds, Value: dangerousConstandIds }, // иногда оно может стать "delimitedConstant"
					{ Key: ErrorCodes.eqHeaders, Value: equalHeaders },
					{ Key: ErrorCodes.copyPastedCS, Value: copyPastedCS}
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
	let res = await Parse.getDocumentElements(document, /(\sId=("|'))(\w*[^\w'"\n@\-\(\)]\w*)+(\2)/, "Вот таким Id быть не может", prepearedText);
	for (let i = 0; i < res.length; i++)
	{
		res[i].Range = server.Range.create(translatePosition(document, res[i].Range.start, res[i].Value[1].length), translatePosition(document, res[i].Range.end, -1));
	}
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

/** Одинаковые заголовки */
async function equalHeaders(document: server.TextDocument, prepearedText: string): Promise<Parse.DocumentElement[]>
{
	let res: Parse.DocumentElement[] = [];
	let headers = prepearedText.findAll(/<Header\s*>([\s\S]+?)<\/Header\s*>/).filter(x => x.Result[1].length > 15 && !x.Result[0].match(/(\[c#\])|@/));
	let eqHeaders = headers.findDuplicates<SearchResult>((x1, x2) => x1.Result[0] == x2.Result[0]);
	if (eqHeaders.length > 0)
	{
		headers.filter(x => eqHeaders.contains(x, el => el.Result[0] == x.Result[0])).forEach(header =>
		{
			res.push(new Parse.DocumentElement(document, {
				DiagnosticProperties: { Type: server.DiagnosticSeverity.Warning, Code: ErrorCodes.eqHeaders },
				From: header.Index,
				Message: 'Найдены повторяющиеся заголовки',
				To: header.Index + header.Result[0].length,
				Value: header.Result
			}));
		});
	}
	return res;
}

/** Повторяющиеся c# вставки */
async function copyPastedCS(document: server.TextDocument, prepearedText: string): Promise<Parse.DocumentElement[]>
{
	return new Promise<Parse.DocumentElement[]>((resolve, reject) =>
	{
		let res: Parse.DocumentElement[] = [];
		let csIns = prepearedText.findAll(/\[c#[^\]]*\]([\s\S]+?)\[\/c#\s*\]/);
		let groups = csIns.groupBy<SearchResult>(x => x.Result[1]).Filter((key, value) =>
		{
			if (value.length < 4) return false;
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



//#endregion
