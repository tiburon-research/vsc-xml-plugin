import * as vscode from 'vscode';
import { registerCommand, KeyedCollection, ExtensionSettings, Encoding } from 'tib-classes';
import { translationArray, RegExpPatterns } from 'tib-constants';


//#region --------------------------- const type interface


const _translation = KeyedCollection.FromArrays(translationArray.rus, translationArray.eng);



interface CodeActionCallback
{
	Arguments?: any[];
	Enabled: boolean;
}


type ArgumentsInvoker = ((document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext) => CodeActionCallback);




/** Массив из всех типов диагностик */
const _AllDiagnostics: IDiagnosticType[] =
	[
		{
			Type: vscode.DiagnosticSeverity.Error,
			Functions: KeyedCollection.FromPairs(
				[
					{ Key: "wrongIds", Value: getWrongIds },
					{ Key: "longIds", Value: getLongIds },
					{ Key: "wrongXML", Value: getWrongXML },
					{ Key: "duplicatedId", Value: getDuplicatedIds }
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
	Functions: KeyedCollection<(document: vscode.TextDocument, preparedText: string) => Promise<DocumentElement[]>>;
}



//#endregion



//#region --------------------------- EXPORT



/** Возвращает все найденные предупреждения/ошибки */
export async function getDiagnosticElements(document: vscode.TextDocument, settings: ExtensionSettings): Promise<vscode.Diagnostic[]>
{
	let res: vscode.Diagnostic[] = [];
	let stack = [];
	let text = document.getText();
	if (!!settings.Item("ignoreComments")) text = Encoding.clearXMLComments(text);
	text = Encoding.clearCDATA(text);

	for (const diagnosticType of _AllDiagnostics) 
	{
		diagnosticType.Functions.forEach((name, func) =>
		{
			stack.push(_diagnosticElements(document, diagnosticType.Type, text, func, name).then(x => res = res.concat(x)));
		});
	};
	await Promise.all(stack);
	return res;
}



/** Создаёт команды + CodeActions */
export async function registerActionCommands()
{
	
	// транслитерация
	createCommandActionPair("tib.translateRange", "Транслитерация",
		(range: vscode.Range) => 
		{
			let editor = vscode.window.activeTextEditor;
			let text = editor.document.getText(range);
			let res = translate(text);
			editor.edit(builder =>
			{
				builder.replace(range, res);
			});
		},
		(doc, range, cont) =>
		{
			let en = cont.diagnostics.length > 0 && cont.diagnostics[0].code == "wrongIds";
			return {
				Enabled: en,
				Arguments: !!en ? [cont.diagnostics[0].range] : []
			}
		}
	);


	// убираем _ из констант
	createCommandActionPair("tib.replace_", "Назвать константу нормально",
		(range: vscode.Range) => 
		{
			let editor = vscode.window.activeTextEditor;
			let text = editor.document.getText(range);
			let res = text;
			let matches = text.matchAll(/_([a-zA-Z@\-\(\)]?)/);
			matches.forEach(element => {
				let search = "_";
				let repl = "";
				if (!!element[1])
				{
					search += element[1];
					repl = element[1].toLocaleUpperCase();
				}
				res = res.replace(new RegExp(search, "g"), repl);
			});
			editor.edit(builder =>
			{
				builder.replace(range, res);
			});
		},
		(doc, range, cont) =>
		{
			let en = cont.diagnostics.length > 0 && cont.diagnostics[0].code == "delimitedConstant";
			return {
				Enabled: en,
				Arguments: !!en ? [cont.diagnostics[0].range] : []
			}
		}
	);


}



//#endregion




//#region --------------------------- Функции получения ошибок


/** Id с недопустимым набором символов */
async function getWrongIds(document: vscode.TextDocument, prepearedText: string): Promise<DocumentElement[]>
{
	let res = await getDocumentElements(document, /(\sId=("|'))(\w*[^\w'"\n@\-\(\)]\w*)+(\2)/, "In english, please!", prepearedText);
	for (let i = 0; i < res.length; i++)
	{
		res[i].Range = new vscode.Range(res[i].Range.start.translate(0, res[i].Value[1].length), res[i].Range.end.translate(0, -1));
	}
	return res;
}


/** слишком длинные Id */
async function getLongIds(document: vscode.TextDocument, prepearedText: string): Promise<DocumentElement[]>
{
	let res = await getDocumentElements(document, new RegExp("<(Page|Answer|Block)(" + RegExpPatterns.SingleAttribute + ")*\\s*(Id=('|\")\\w{25,}('|\"))"), "Слишком много букв", prepearedText);
	res = res.concat(await getDocumentElements(document, new RegExp("<Question(" + RegExpPatterns.SingleAttribute + ")*\\s*(Id=('|\")\\w{33,}('|\"))"), "Слишком много букв", prepearedText));
	return res;
}


/** проверка недопустимых символов XML */
async function getWrongXML(document: vscode.TextDocument, prepearedText: string): Promise<DocumentElement[]>
{
	let res = await getDocumentElements(document, /((&(?!(lt|gt|amp|quot|apos))(\w*);?)+)|(<(?![\?\/!]?\w+)(.*))/, "Такое надо прикрывать посредством CDATA", prepearedText);
	return res;
}


/** проверка уникальности Id */
async function getDuplicatedIds(document: vscode.TextDocument, prepearedText: string): Promise<DocumentElement[]>
{
	return await getDuplicatedElementsIds(document, prepearedText);
}


//#endregion



//#region --------------------------- Функции получения предупреждений


/** Константы, начинающиеся не с того */
async function dangerousConstandIds(document: vscode.TextDocument, prepearedText: string): Promise<DocumentElement[]>
{
	let res: DocumentElement[] = [];
	let constants = await getDocumentElements(document, /(<Constants[^>]*>)([\s\S]+?)<\/Constants[^>]*>/, "", prepearedText);
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
							DiagnosticProperties:
							{
								Type: vscode.DiagnosticSeverity.Information,
								Code: "delimitedConstant"
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


//#endregion




//#region --------------------------- универсальные


/** универсальная функция для преобразования `DocumentElement[]` в `Diagnostic[]` */
async function _diagnosticElements(document: vscode.TextDocument, type: vscode.DiagnosticSeverity, preparedText: string, func: (document: vscode.TextDocument, prepearedText: string) => Promise<DocumentElement[]>, diagnosticId: number | string): Promise<vscode.Diagnostic[]>
{
	let res: vscode.Diagnostic[] = [];
	let elements = await func(document, preparedText);
	if (!!elements)
	{
		elements.forEach(element =>
		{
			let t = !!element.DiagnosticProperties.Type ? element.DiagnosticProperties.Type : type;
			let code = !!element.DiagnosticProperties.Code ? element.DiagnosticProperties.Code : diagnosticId;
			let diagItem = new vscode.Diagnostic(element.Range, element.Message, t);
			diagItem.code = code;
			res.push(diagItem);
		});
	}
	return res;
}


function createCodeAction(actionTitle: string, commandName: string, argumentInvoker: ArgumentsInvoker)
{
	vscode.languages.registerCodeActionsProvider('tib', {
		provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken)
		{
			let inner = argumentInvoker(document, range, context);
			if (!inner.Enabled) return;
			let cmd: vscode.Command =
			{
				command: commandName,
				title: actionTitle
			};
			if (!!inner.Arguments)
			{
				cmd.arguments = inner.Arguments;
			}
			let res = [cmd];
			return res;
		}
	});
}



/** Создаёт комманду и CodeAction для неё */
async function createCommandActionPair(cmdName: string, actionTitle: string, commandFunction: Function, argumentInvoker: ArgumentsInvoker): Promise<void>
{
	registerCommand(cmdName, commandFunction);
	createCodeAction(actionTitle, cmdName, argumentInvoker);
}



//#endregion



//#region --------------------------- Дополнительно


/** Транслитерация с учётом итераторов (`allowIterators`) */
function translate(input: string, allowIterators = true): string
{
	let res = "";
	let reg = allowIterators ? /[\dA-Za-z_@\-\(\)]/ : /[\dA-Za-z_]/;
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



//#endregion








export interface IDocumentElement
{
	Value: RegExpMatchArray;
	From: number;
	To: number;
	Message: string;
	/** Если задан используется для преобразования в `DiagnosticElement` */
	DiagnosticProperties?:
	{
		Type?: vscode.DiagnosticSeverity;
		Code?: string | number;
	}
}


/** Хранит информацию о расположении и тексте */
export class DocumentElement implements IDocumentElement
{
	constructor(document: vscode.TextDocument, obj: IDocumentElement)
	{
		for (const key in obj)
		{
			this[key] = obj[key];
		}
		this.Range = new vscode.Range(document.positionAt(this.From), document.positionAt(this.To));
		this.Location = new vscode.Location(document.uri, this.Range);
	}

	public Value: RegExpMatchArray;
	public From: number;
	public To: number;
	public Message: string;
	/** используется, только если задан вручную и не `null` */
	/** Если задан используется для преобразования в `DiagnosticElement` */
	DiagnosticProperties?:
		{
			Type?: vscode.DiagnosticSeverity;
			Code?: string | number;
		} = {};

	public Range: vscode.Range;
	public Location: vscode.Location;
}


/** 
 * Возвращает массив найденных `DocumentElement` 
 * 
 * Нельзя использовать флаг `g`!
 * 
 * Если задан `preparedText`, то используется он (но сначала сравнивается длина)
 * 
*/
export async function getDocumentElements(document: vscode.TextDocument, search: RegExp, errorMessage: string, preparedText: string): Promise<DocumentElement[]>
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
				From: element.index,
				To: to,
				Message: errorMessage
			}));
		});
	}
	return res;
}


/** Возвращает все повторяющиеся Id, как `DocumentElement` */
export function getDuplicatedElementsIds(document: vscode.TextDocument, prepearedText: string): Promise<DocumentElement[]>
{
	return new Promise<DocumentElement[]>((resolve, reject) =>
	{
		//let $ = initJQuery();
		let res: DocumentElement[] = [];
		/*let tagNames = ['Page', 'List', 'Question', 'Block'];
		let $dom;
		try
		{
			$dom = $.XMLDOM(prepearedText);
		} catch (error)
		{ return resolve(null) }

		if (!$dom) return resolve(res);

		let ids = new KeyedCollection<string[]>();

		// собираем все Id
		tagNames.forEach(element =>
		{
			let ar: string[] = [];
			$dom.find(element).each((i, e) => ar.push($(e).attr('Id')));
			ids.AddPair(element, ar);
		});

		ids.forEach((key, value) =>
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
					let reg = new RegExp('(<' + key + ")(" + RegExpPatterns.SingleAttribute + ")*\\s*(Id=('|\")" + d + "('|\"))");
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
									DiagnosticProperties: { Type: isWarning ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Error }
								}));
							}
						});
					}
				});
			}
		});*/

		resolve(res);
	});

}