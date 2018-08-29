import * as vscode from 'vscode';
import { DocumentElement, getDocumentElements } from './parsing';
import { clearCDATA, clearXMLComments } from './encoding';



/** Массив из всех типов диагностик */
const _AllDiagnostics: IDiagnosticType[] =
	[
		{
			Type: vscode.DiagnosticSeverity.Error,
			Functions: [getWrongIds, getLongIds, getWrongXML]
		},
		{
			Type: vscode.DiagnosticSeverity.Warning,
			Functions: [dangerousConstandIds]
		}
	];



/** Интерфейс для одного типа диагностики */
interface IDiagnosticType
{
	/** Тип диагностики */
	Type: vscode.DiagnosticSeverity;
	/** Массив функций для этого типа диагностики */
	Functions: ((document: vscode.TextDocument) => Promise<DocumentElement[]>)[];
}


/** Возвращает все найденные предупреждения/ошибки */
export async function getDiagnosticElements(document: vscode.TextDocument): Promise<vscode.Diagnostic[]>
{
	let res: vscode.Diagnostic[] = [];
	for (const diagnosticType of _AllDiagnostics) 
	{
		for (const func of diagnosticType.Functions)
		{
			let diagElements = await _diagnosticElements(document, diagnosticType.Type, func);
			res = res.concat(diagElements);
		};
	};
	return res;
}



/** универсальная функция для преобразования `DocumentElement[]` в `Diagnostic[]` */
async function _diagnosticElements(document: vscode.TextDocument, type: vscode.DiagnosticSeverity, func: (document: vscode.TextDocument) => Promise<DocumentElement[]>): Promise<vscode.Diagnostic[]>
{
	let res: vscode.Diagnostic[] = [];
	let elements = await func(document);
	if (!!elements)
	{
		elements.forEach(element =>
		{
			let t = element.Type !== null ? element.Type : type;
			let diagItem = new vscode.Diagnostic(element.Range, element.Message, t);
			res.push(diagItem);
		});
	}
	return res;
}



//#region Ошибки


/** Id с недопустимым набором символов */
async function getWrongIds(document: vscode.TextDocument): Promise<DocumentElement[]>
{
	let res = await getDocumentElements(document, /\sId=("|')(\w*[^\w'"\n@\-\(\)]\w*)+(\1)/, "In english, please!");
	return res;
}


/** слишком длинные Id */
async function getLongIds(document: vscode.TextDocument): Promise<DocumentElement[]>
{
	// проверять на длину можно только \w+
	let res = await getDocumentElements(document, /\sId=("|')\w{25,}(\1)/, "Слишком много букв");
	return res;
}


/** проверка недопустимых символов XML */
async function getWrongXML(document: vscode.TextDocument): Promise<DocumentElement[]>
{
	let text = clearCDATA(document.getText());
	let res = await getDocumentElements(document, /(&)|(<(?![\?\/!]?\w+)(.*))/, "Такое надо прикрывать посредством CDATA", text);
	return res;
}


//#endregion



//#region Предупреждения


/** Константы, начинающиеся не с того */
async function dangerousConstandIds(document: vscode.TextDocument): Promise<DocumentElement[]>
{
	let res: DocumentElement[] = [];
	let constants = await getDocumentElements(document, /(<Constants[^>]*>)([\s\S]+?)<\/Constants[^>]*>/, "");
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
						let wrongItem = new DocumentElement(document, {
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
						let wrongItem = new DocumentElement(document, {
							Value: [ "_" ],
							Message: "Константы с '_' не распознаются в расширении как константы ¯\\_(ツ)_/¯",
							From: from,
							To: from + item[itemIdGroup].length,
							Type: vscode.DiagnosticSeverity.Information
						});
						res.push(wrongItem);
					}
				}
			}
		}
	}

	return res;
}


//#endregion