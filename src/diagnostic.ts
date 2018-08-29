import * as vscode from 'vscode';
import { DocumentElement, getDocumentElements } from './parsing';
import { clearCDATA } from './encoding';



/** Массив из всех типов диагностик */
const _AllDiagnostics: IDiagnosticType[] =
	[
		{
			Type: vscode.DiagnosticSeverity.Error,
			Functions: [ getWrongIds, getLongIds, getWrongXML ]
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


/** Возвращает все найденные предупреждения */
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
			let diagItem = new vscode.Diagnostic(element.Range, element.Message, type);
			res.push(diagItem);
		});
	}
	return res;
}



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