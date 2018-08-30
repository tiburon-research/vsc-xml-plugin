import * as vscode from 'vscode';
import { DocumentElement, getDocumentElements } from './parsing';
import { clearCDATA } from './encoding';
import { registerCommand, KeyedCollection, logString, IPair } from './classes';


const translationArray = {
	rus: ["А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "Ь", "Э", "Ю", "Я", "а", "б", "в", "г", "д", "е", "ё", "ж", "з", "и", "й", "к", "л", "м", "н", "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ы", "ь", "э", "ю", "я"],
	eng: ["A", "B", "V", "G", "D", "E", "Yo", "Zh", "Z", "I", "Y", "K", "L", "M", "N", "O", "P", "R", "S", "T", "U", "F", "H", "Ts", "Ch", "Sh", "Shch", "", "I", "", "E", "Yu", "Ya", "a", "b", "v", "g", "d", "e", "yo", "zh", "z", "i", "y", "k", "l", "m", "n", "o", "p", "r", "s", "t", "u", "f", "h", "ts", "ch", "sh", "shch", "", "i", "", "e", "yu", "ya"]
};

const _translation = KeyedCollection.FromArrays(translationArray.rus, translationArray.eng);


/** Массив из всех типов диагностик */
const _AllDiagnostics: IDiagnosticType[] =
	[
		{
			Type: vscode.DiagnosticSeverity.Error,
			Functions: KeyedCollection.FromPairs(
				[
					{ Key: "wrongIds", Value: getWrongIds },
					{ Key: "longIds", Value: getLongIds },
					{ Key: "wrongXML", Value: getWrongXML }
				]
			)
		},
		{
			Type: vscode.DiagnosticSeverity.Warning,
			Functions: KeyedCollection.FromPairs(
				[
					{ Key: "constantIds", Value: dangerousConstandIds }
				]
			)
		}
	];



/** Интерфейс для одного типа диагностики */
interface IDiagnosticType
{
	/** Тип диагностики */
	Type: vscode.DiagnosticSeverity;
	/** Массив функций для этого типа диагностики */
	Functions: KeyedCollection<(document: vscode.TextDocument) => Promise<DocumentElement[]>>;
}


/** Возвращает все найденные предупреждения/ошибки */
export function getDiagnosticElements(document: vscode.TextDocument): Promise<vscode.Diagnostic[]>
{
	return new Promise<vscode.Diagnostic[]>((resolve, reject) => {
		let res: vscode.Diagnostic[] = [];
		for (const diagnosticType of _AllDiagnostics) 
		{
			diagnosticType.Functions.forEach((name, func) =>
			{
				_diagnosticElements(document, diagnosticType.Type, func, name).then(x => res = res.concat(x));
			});
		};
		resolve(res);
	});
}



/** универсальная функция для преобразования `DocumentElement[]` в `Diagnostic[]` */
async function _diagnosticElements(document: vscode.TextDocument, type: vscode.DiagnosticSeverity, func: (document: vscode.TextDocument) => Promise<DocumentElement[]>, diagnosticId: number | string): Promise<vscode.Diagnostic[]>
{
	let res: vscode.Diagnostic[] = [];
	let elements = await func(document);
	if (!!elements)
	{
		elements.forEach(element =>
		{
			let t = element.Type !== null ? element.Type : type;
			let diagItem = new vscode.Diagnostic(element.Range, element.Message, t);
			diagItem.code = diagnosticId;
			res.push(diagItem);
		});
	}
	return res;
}



//#region Ошибки


/** Id с недопустимым набором символов */
async function getWrongIds(document: vscode.TextDocument): Promise<DocumentElement[]>
{
	let res = await getDocumentElements(document, /(\sId=("|'))(\w*[^\w'"\n@\-\(\)]\w*)+(\2)/, "In english, please!");
	for (let i = 0; i < res.length; i++)
	{
		res[i].Range = new vscode.Range(res[i].Range.start.translate(0, res[i].Value[1].length), res[i].Range.end.translate(0, -1));
	}
	res.forEach(element =>
	{
		createCodeAction("Транслитерация", "tib.translateRange", [element.Range]);
	});
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
							Value: ["_"],
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




//#region code actions


function createCodeAction(actionTitle: string, commandName: string, commandArgs: any[])
{
	let cmd: vscode.Command =
	{
		command: commandName,
		title: actionTitle,
		tooltip: 'wtf?',
		arguments: commandArgs
	};

	vscode.languages.registerCodeActionsProvider('tib', {
		provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken)
		{
			let res = [cmd];
			return res;
		}
	});
}




/** Создаёт команды для CodeActions */
export async function registeActionCommands()
{
	// транслитерация
	registerCommand('tib.translateRange', (range: vscode.Range) => 
	{
		let editor = vscode.window.activeTextEditor;
		let text = editor.document.getText(range);
		let res = translate(text);
		editor.edit(builder =>
		{
			builder.replace(range, res);
		});
	});
}


//#endregion



/** Транслитерация с учётом итераторов (`allowIterators`) */
function translate(input: string, allowIterators = true): string
{
	let res = "";
	let reg = allowIterators ? /[A-Za-z_@\-\(\)]/ : /[A-Za-z_]/;
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