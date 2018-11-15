'use strict';

import * as vscode from 'vscode';
import * as AutoCompleteArray from './autoComplete';
import { TibAutoCompleteItem, TibAttribute, CurrentTag, SurveyNodes, TibMethods, ExtensionSettings, KeyedCollection, Language, positiveMin, isScriptLanguage, getFromClioboard, snippetToCompletitionItem, pathExists, LogData, saveError, safeString, showWarning, TelegramBot, SimpleTag, openFileText, getDocumentMethods, getDocumentNodeIds, logToOutput, tibError, lockFile, unlockFile, fileIsLocked, showError, Path, createLockInfoFile, getLockData, getLockFilePath, removeLockInfoFile, getUserName, StatusBar, getUserId, KeyValuePair, getMixIds, getContextChanges, inCDATA, registerCommand, logString, ContextChange } from "./classes";
import * as Encoding from './encoding'
import * as Parse from './parsing'
import * as Formatting from './formatting'
import * as fs from 'fs';
import { initJQuery } from './TibJQuery'
import * as debug from './debug'
import { getDiagnosticElements, registerActionCommands } from './diagnostic'
import { ItemSnippets, _pack, RegExpPatterns, _NodeStoreNames, _WarningLogPrefix, QuestionTypes, XMLEmbeddings } from './constants'
import { SurveyElementType } from './surveyObjects';
import * as TibDocumentEdits from './documentEdits'
import { CacheSet } from './cache'
import { TaskList } from './asyncExecuter';



export { bot, CSFormatter, logError, OutChannel, _LogPath, Settings };


/*---------------------------------------- глобальные переменные ----------------------------------------*/
//#region


/** объект для управления ботом */
var bot: TelegramBot;

// константы

/** Соответствие {{Elements}} и функции для получения */
const _ElementFunctions = {
	Questions: getAllQuestions,
	QuestionTypes: getQuestionTypes,
	Pages: getAllPages,
	Lists: getAllLists,
	MixIds: getAllMixIds
};

/** Путь для сохранения логов */
var _LogPath: string;

/** функция для форматирования C# из расширения Leopotam.csharpfixformat */
var CSFormatter: (text: string) => Promise<string>;

var TibAutoCompleteList = new KeyedCollection<TibAutoCompleteItem[]>();

/** Список всех для C# (все перегрузки отдельно) */
var CodeAutoCompleteArray: TibAutoCompleteItem[] = [];

/** Список классов, типов, структу и т.д. */
var ClassTypes: string[] = [];

var Methods = new TibMethods();

/** Список Id */
var CurrentNodes: SurveyNodes = new SurveyNodes();

/** Список MixId (подставляется в значениях атрибутов) */
var MixIds: string[] = [];

/** Настройки расширения */
var Settings: ExtensionSettings;

/** флаг использования Linq */
var _useLinq = true;

/** Объект для кэша объектов */
var Cache: CacheSet;

/** Имена документов из Include */
var Includes: string[] = [];

/** Канал вывода */
var OutChannel = vscode.window.createOutputChannel("tib");

/** Объект для хранения пользовательских выборов */
var Refused = {
	/** Отказ от включения кэша */
	enableCache: false
}

/** Пути к заблокированным файлам */
var LockedFiles: string[] = [];


var CurrentStatus = new StatusBar();


var Diagnostics = vscode.languages.createDiagnosticCollection('tib_diagnostic');

var TaskQueue = new TaskList();

//#endregion



/*---------------------------------------- активация ----------------------------------------*/
//#region

export function activate(context: vscode.ExtensionContext)
{
	logToOutput("Начало активации");
	let editor = vscode.window.activeTextEditor;

	// обновляем настройки при сохранении
	vscode.workspace.onDidChangeConfiguration(event =>
	{
		Settings.Update();
	})

	/** Обновление документа */
	function reload(clearCache = true): Promise<void>
	{
		return new Promise<void>((resolve, reject) =>
		{
			if (!editor || editor.document.languageId != "tib") return resolve();
			let promises: Promise<any>[] = [];
			try
			{
				if (clearCache && Cache.Active()) Cache.Clear();
				promises.push(getSurveyData(editor.document)); // этого надо дождаться
				diagnostic(editor.document); // а с этим хрен
			} catch (er)
			{
				logError("Ошибка при сборе информации", er);
				resolve();
			}
			Promise.all(promises).then(() => { resolve(); });
		});
	}

	/** Документ сменился */
	function anotherDocument(needReload: boolean, editor: vscode.TextEditor)
	{
		Includes = [];
		Methods.Clear();
		CurrentNodes.Clear();
		if (!editor || editor.document.languageId != 'tib') return;
		if (!editor.document.isUntitled)
		{
			if (isLocked(editor.document)) showLockInfo(editor.document);
			else lockDocument(editor.document, true);
		}
		checkDocument(editor);
		if (needReload) reload();
	}

	// общие действия при старте расширения
	getStaticData();
	makeIndent();
	autoComplete();
	hoverDocs();
	helper();
	definitions();
	registerCommands();
	registerActionCommands();
	higlight();

	// для каждого документа свои
	reload(false);
	anotherDocument(false, editor);

	// смена документа
	vscode.window.onDidChangeActiveTextEditor(neweditor =>
	{
		editor = neweditor;
		anotherDocument(true, neweditor);
	});

	// редактирование документа
	vscode.workspace.onDidChangeTextDocument(event =>
	{
		CurrentStatus.setStatusItem("[tib busy]").then(() =>
		{
			let prom = new Promise<void>((resolve, reject) =>
			{
				if (!editor || event.document.languageId != "tib") return resolve();
				let originalPosition = editor.selection.start;
				let text = event.document.getText(new vscode.Range(new vscode.Position(0, 0), originalPosition));
				let tagPromise = getCurrentTag(editor.document, originalPosition, text);
				let reloadPromise = reload(false);
				TaskQueue.Add(tagPromise);
				Promise.all([tagPromise, reloadPromise]).then(([tag, x]) =>
				{
					// преобразования текста
					if (!event || !event.contentChanges.length) return resolve();
					let changes = getContextChanges(event.document, editor.selections, event.contentChanges);
					if (!changes || changes.length == 0) return resolve();
					TaskQueue.Add(insertAutoCloseTags(changes, editor, tag));
					TaskQueue.Add(insertSpecialSnippets(changes, editor, text, tag));
					TaskQueue.Add(upcaseFirstLetter(changes, editor, tag));
					TaskQueue.ResultPromise().then(() => { resolve(); });
				});
			});
			prom.then(() => { CurrentStatus.removeStatusItem(); });
		});
	});

	vscode.workspace.onWillSaveTextDocument(x =>
	{
		if (x.document.isDirty) // сохранение изменённого документа
		{
			unlockDocument(x.document);
		}
	})

	vscode.workspace.onDidSaveTextDocument(x =>
	{
		lockDocument(x);
	});

	vscode.workspace.onDidCloseTextDocument(x =>
	{
		unlockDocument(x, true);
	})

	logToOutput("Активация завершена");
	CurrentStatus.setInfoMessage("Tiburon XML Helper запущен!", 3000);
}


export function deactivate()
{
	unlockAllDocuments();
}



/** Сбор необходимых данных */
function getStaticData()
{
	try 
	{
		// сохраняем нужные значения
		Settings = new ExtensionSettings();
		_LogPath = Settings.Item("logPath");
		if (!pathExists(_LogPath)) logToOutput("Отчёты об ошибках сохранятся не будут. Путь недоступен.", _WarningLogPrefix);
		_useLinq = Settings.Item("useLinq");
		Cache = new CacheSet();

		// получаем фунцию форматирования C#
		let csharpfixformat = vscode.extensions.all.find(x => x.id == "Leopotam.csharpfixformat");
		if (!!csharpfixformat)
		{
			if (!csharpfixformat.isActive) csharpfixformat.activate().then(function (a)
			{
				CSFormatter = getCSFormatter(csharpfixformat);
			});
			else getCSFormatter(csharpfixformat);
		}
		else logToOutput("Расширение 'Leopotam.csharpfixformat' не установлено, C# будет форматироваться, как простой текст", _WarningLogPrefix);

		// запускаем бота
		let dataPath = _LogPath + "\\data.json";
		if (pathExists(dataPath))
		{
			let data = JSON.parse(fs.readFileSync(dataPath).toString());
			if (!!data)
			{
				bot = new TelegramBot(data, function (res)
				{
					if (!res) logToOutput("Отправка логов недоступна", _WarningLogPrefix);
				});
			}
		}

		// получаем AutoComplete
		let tibCode = AutoCompleteArray.Code.map(x => { return new TibAutoCompleteItem(x); });
		let statCS: TibAutoCompleteItem[] = [];
		for (let key in AutoCompleteArray.StaticMethods)
		{
			// добавляем сам тип в AutoComplete
			let tp = new TibAutoCompleteItem({
				Name: key,
				Kind: "Class",
				Detail: "Тип данных/класс " + key
			});
			statCS.push(tp);
			// и в classTypes
			ClassTypes.push(key);
			// добавляем все его статические методы
			let items: object[] = AutoCompleteArray.StaticMethods[key];
			items.forEach(item =>
			{
				let aci = new TibAutoCompleteItem(item);
				aci.Parent = key;
				aci.Kind = "Method";
				statCS.push(aci);
			});
		}

		// объединённый массив Tiburon + MSDN
		let all = tibCode.concat(statCS);

		all.forEach(element =>
		{
			let item = new TibAutoCompleteItem(element);
			if (!item.Kind || !item.Name) return;

			CodeAutoCompleteArray.push(new TibAutoCompleteItem(element)); // сюда добавляем всё
			// если такого типа ещё нет, то добавляем
			if (!TibAutoCompleteList.Contains(item.Kind)) TibAutoCompleteList.AddPair(item.Kind, [item])
			else // если есть то добавляем в массив с учётом перегрузок
			{
				// ищем индекс элемента с таким же типом, именем и родителем
				let ind = TibAutoCompleteList.Item(item.Kind).findIndex(x =>
				{
					return x.Name == item.Name && (!!x.Parent && x.Parent == item.Parent || !x.Parent && !item.Parent);
				});

				if (ind < 0)
				{
					TibAutoCompleteList.Item(item.Kind).push(item);
				}
				else
				{
					// добавляем в перегрузку к имеющемуся (и сам имеющийся тоже, если надо)
					//if (!TibAutoCompleteList.Item(item.Kind)[ind].Overloads) TibAutoCompleteList.Item(item.Kind)[ind].Overloads = [];
					let len = TibAutoCompleteList.Item(item.Kind)[ind].Overloads.length;
					if (len == 0)
					{
						let parent = new TibAutoCompleteItem(TibAutoCompleteList.Item(item.Kind)[ind]);
						TibAutoCompleteList.Item(item.Kind)[ind].Overloads.push(parent);
						len++;
					}
					TibAutoCompleteList.Item(item.Kind)[ind].Overloads.push(item);
					let doc = "Перегрузок: " + (len + 1);
					TibAutoCompleteList.Item(item.Kind)[ind].Description = doc;
					TibAutoCompleteList.Item(item.Kind)[ind].Documentation = doc;
				}
			}
		});
	} catch (er)
	{
		logError("Ошибка при инициализации расширения", er);
	}
}



//#endregion



/*---------------------------------------- registerProvider ----------------------------------------*/
//#region


function registerCommands()
{
	/*vscode.commands.registerCommand('tib.debug', () => 
	{
		execute("http://debug.survstat.ru/Survey/Adaptive/?fileName=" + editor.document.fileName);
	});*/


	// команда для тестирования на отладке
	registerCommand('tib.debugTestCommand', () => 
	{
		if (_pack != "debug") return;

		// выполняем дебажный тест
		debug.test();
	});

	// стандартное сохранение файла
	registerCommand('workbench.action.files.save', () => 
	{
		CurrentStatus.setProcessMessage("Ожидание завершения выполнения операций...").then(x =>
		{
			TaskQueue.ResultPromise().then(() =>
			{
				vscode.window.activeTextEditor.document.save().then(() =>
				{
					x.dispose();
				});
			});
		});
	});

	// выделение Answer из текста
	registerCommand('tib.getAnswers', () => 
	{
		createElements(SurveyElementType.Answer);
	});

	// выделение Item из текста
	registerCommand('tib.getItems', () => 
	{
		createElements(SurveyElementType.ListItem);
	});


	// выделение ближайшего <тега>
	registerCommand('tib.selectTag.closest', async function ()
	{
		let editor = vscode.window.activeTextEditor;
		let newSels: vscode.Selection[] = [];
		for (const selection of editor.selections)
		{
			let tag = await getCurrentTag(editor.document, selection.active);
			if (!tag) return;
			let from = tag.OpenTagRange.start;
			let cl = findCloseTag("<", tag.Name, ">", editor.document, from.translate(0, 1));
			if (!cl) return;
			let to = cl.end;
			let range = new vscode.Selection(from, to);
			newSels.push(range);
		};
		editor.selections = newSels;
	});

	// выделение родительского <тега>
	registerCommand('tib.selectTag.global', async function ()
	{
		let newSels: vscode.Selection[] = [];
		let editor = vscode.window.activeTextEditor;
		for (const selection of editor.selections)
		{
			let txt = getPreviousText(editor.document, selection.active);
			let tag = await getCurrentTag(editor.document, selection.active, txt);
			if (!tag || tag.Parents.length < 1) return;
			// если это первый вложенный тег
			let par: string;
			let from: vscode.Position;
			if (tag.Parents.length == 1)
			{
				par = tag.Name;
				from = tag.OpenTagRange.start;
			}
			else
			{
				par = tag.Parents[1].Name;
				from = tag.Parents[1].OpenTagRange.start;
			}
			let cl = findCloseTag("<", par, ">", editor.document, from.translate(0, 1));
			if (!cl) return;
			let to = cl.end;
			let range = new vscode.Selection(from, to);
			newSels.push(range);
		};
		editor.selections = newSels;
	});

	// оборачивание в [тег]
	registerCommand('tib.insertTag', () => 
	{
		vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString("[${1:u}$2]$TM_SELECTED_TEXT[/${1:u}]"));
	});

	registerCommand('tib.cdata', () => 
	{
		try
		{
			let multi = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection).indexOf("\n") > -1;
			let pre = multi ? "\n" : " ";
			let post = multi ? "\n" : " ";
			vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString("<![CDATA[" + pre + "$TM_SELECTED_TEXT" + post + "]]>"));
		} catch (error)
		{
			logError("Ошибка при оборачивании в CDATA");
		}
	});

	registerCommand('tib.commentBlock', () => 
	{
		let newSel = selectLines(vscode.window.activeTextEditor.document, vscode.window.activeTextEditor.selection);
		if (!!newSel) vscode.window.activeTextEditor.selection = newSel;
		vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString("<!--#block $1 -->\n\n$0$TM_SELECTED_TEXT\n\n<!--#endblock-->"));
	});

	//Удаление айди вопроса в заголовках вопроса
	registerCommand('tib.remove.QuestionIds', () =>
	{
		let editor = vscode.window.activeTextEditor;
		CurrentStatus.setProcessMessage("Удаление Id из заголовков...").then(x =>
		{
			try
			{
				let text = editor.document.getText();
				let res = TibDocumentEdits.RemoveQuestionIds(text);
				applyChanges(getFullRange(editor.document), res, editor).then(() => CurrentStatus.removeCurrentMessage());
			} catch (error)
			{
				CurrentStatus.removeCurrentMessage();
				logError("Ошибка при удалении Id вопроса из заголовка", error);
			}
			x.dispose();
		})
	});

	registerCommand('tib.transform.AnswersToItems', () => 
	{
		let editor = vscode.window.activeTextEditor;
		try
		{
			let results: string[] = [];
			editor.selections.forEach(selection =>
			{
				let text = editor.document.getText(selection);
				let res = TibDocumentEdits.AnswersToItems(text);
				results.push(res);
			});
			multiPaste(editor, editor.selections, results);
		}
		catch (error)
		{
			logError("Ошибка преобразования AnswersToItems", error);
		}
	});

	registerCommand('tib.transform.ItemsToAnswers', () => 
	{
		let editor = vscode.window.activeTextEditor;
		try
		{
			let results: string[] = [];
			editor.selections.forEach(selection =>
			{
				let text = editor.document.getText(selection);
				let res = TibDocumentEdits.ItemsToAnswers(text);
				results.push(res);
			});
			multiPaste(editor, editor.selections, results);
		}
		catch (error)
		{
			logError("Ошибка преобразования ItemsToAnswers", error);
		}
	});


	//Отсортировать List
	registerCommand('tib.transform.SortList', () =>
	{
		let editor = vscode.window.activeTextEditor;
		CurrentStatus.setProcessMessage("Сортировка списка...").then(x =>
		{
			try
			{
				let sortBy = ["Id", "Text"];		//элементы сортировки

				let text = editor.document.getText(editor.selection);			   //Берём выделенный текст
				let varCount = TibDocumentEdits.getVarCountFromList(text);		  //Получаем количество Var'ов

				for (let i = 0; i < varCount; i++)
				{	  //заполняем Var'ы
					sortBy.push("Var(" + i + ")");
				}

				vscode.window.showQuickPick(sortBy, { placeHolder: "Сортировать по" }).then(x =>
				{

					if (typeof x !== typeof undefined)
					{

						let res;
						let attr = x;

						if (attr.includes("Var"))
						{
							let index = parseInt(attr.match(/\d+/)[0]);
							res = TibDocumentEdits.sortListBy(text, "Var", index);
						} else
						{
							res = TibDocumentEdits.sortListBy(text, x);		 //сортируем
						}

						res = res.replace(/(<((Item)|(\/List)))/g, "\n$1");	 //форматируем xml


						applyChanges(editor.selection, res, editor, true).then(() => CurrentStatus.removeCurrentMessage());	  //заменяем текст
					}
				});
			} catch (error)
			{
				logError("Ошибка при сортировке листа", error);
			}
			x.dispose();
		});
	});

	//преобразовать в список c возрастом
	registerCommand('tib.transform.ToAgeList', () =>
	{
		let editor = vscode.window.activeTextEditor;

		try
		{
			let text = editor.document.getText(editor.selection);
			let res = TibDocumentEdits.ToAgeList(text);
			// TODO: убрать, когда появится принудительное форматирование многострочности
			res = res.replace(/(<((Item)|(\/List)))/g, "\n$1");
			applyChanges(editor.selection, res, editor, true);
		} catch (error)
		{
			logError("Ошибка в преобразовании возрастного списка", error);
		}
	});

	// комментирование блока
	registerCommand('editor.action.blockComment', () => 
	{
		let editor = vscode.window.activeTextEditor;
		let selections = editor.selections;
		// отсортированные от начала к концу выделения
		if (selections.length > 1) selections = selections.sort(function (a, b)
		{
			return editor.document.offsetAt(b.active) - editor.document.offsetAt(a.active);
		});
		commentAllBlocks(selections);
	});

	// комментирование строки
	registerCommand('editor.action.commentLine', () => 
	{
		let editor = vscode.window.activeTextEditor;
		let selections = editor.selections;

		if (selections.length > 1)
		{
			// отсортированные от начала к концу выделения
			selections = selections.sort(function (a, b)
			{
				return editor.document.offsetAt(b.active) - editor.document.offsetAt(a.active);
			});
		}
		// выделяем строки
		selections = selections.map(x =>
		{
			let line = editor.document.lineAt(x.active.line);
			let from = line.range.start;
			let spaces = line.text.match(/^(\s+)\S/);
			if (!!spaces) from = from.translate(0, spaces[1].length);
			return new vscode.Selection(from, line.range.end);
		});
		// для каждого выделения
		//InProcess = true;
		commentAllBlocks(selections);
	});

	registerCommand('tib.paste', () => 
	{
		let txt = getFromClioboard();
		if (txt.match(/[\s\S]*\n$/)) txt = txt.replace(/\n$/, '');
		let pre = txt.split("\n");
		let lines = [];
		let editor = vscode.window.activeTextEditor;

		if (pre.length != editor.selections.length)
		{
			for (let i = 0; i < editor.selections.length; i++)
			{
				lines.push(txt);
			}
			multiLinePaste(editor, lines);
		}
		else
		{
			lines = pre.map(s => { return s.trim() });
			if (lines.filter(l => { return l.indexOf("\t") > -1; }).length == lines.length)
			{
				vscode.window.showQuickPick(["Да", "Нет"], { placeHolder: "Разделить запятыми?" }).then(x =>
				{
					multiLinePaste(editor, lines, x == "Да");
				});
			}
			else multiLinePaste(editor, lines);
		}
	});

	registerCommand('tib.demo', () => 
	{
		//vscode.commands.executeCommand("vscode.open", vscode.Uri.file(_DemoPath));
		let path = Settings.Item("demoPath");
		if (!path)
		{
			logError("Невозможно получить доступ к файлу демки");
			return;
		}
		CurrentStatus.setProcessMessage("Открывается демка...").then(x =>
		{
			openFileText(path).then(x => CurrentStatus.removeCurrentMessage()).then(res =>
			{
				x.dispose();
			});
		});
	});

	//Создание tibXML шаблона
	registerCommand('tib.template', () =>
	{
		let templatePathFolder = Settings.Item("templatePathFolder") + '\\';
		if (!templatePathFolder)
		{
			logError("Невозможно получить доступ к папке");
			return;
		}

		let tibXMLFiles = fs.readdirSync(templatePathFolder).filter(x =>
		{
			let state = fs.statSync(templatePathFolder + x);
			return !state.isDirectory();
		})

		vscode.window.showQuickPick(tibXMLFiles, { placeHolder: "Выберите шаблон" }).then(x =>
		{
			openFileText(templatePathFolder + x);
		});
	});

	// переключение Linq
	registerCommand('tib.linqToggle', () => 
	{
		_useLinq = !_useLinq;
		vscode.window.showInformationMessage("Подстановка Linq " + (_useLinq ? "включена" : "отключена"))
	});

	vscode.languages.registerDocumentFormattingEditProvider('tib', {
		provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[]
		{
			CurrentStatus.setProcessMessage("Форматирование...").then(x => 
			{
				let editor = vscode.window.activeTextEditor;
				let range;
				let indent;

				let allDone = new Promise<void>((resolve, reject) =>
				{
					// либо весь документ
					if (editor.selection.start.isEqual(editor.selection.end))
					{
						range = getFullRange(document);
						indent = 0;
						resolve();
					}
					else
					{
						// либо выделяем строки целиком
						let sel = selectLines(document, editor.selection);
						editor.selection = sel;
						range = sel;
						getCurrentTag(document, sel.start).then(tag =>
						{
							if (!tag) indent = 0;
							else indent = tag.GetIndent();
							resolve();
						})
					}
				});

				allDone.then(() =>
				{
					let text = document.getText(range);
					Formatting.format(text, Language.XML, Settings, "\t", indent).then(
						(res) => 
						{
							vscode.window.activeTextEditor.edit(builder =>
							{
								builder.replace(range, res);
								x.dispose();
							})
						},
						(er) =>
						{
							logError(er);
							x.dispose();
						}
					)
				});


			});
			// provideDocumentFormattingEdits по ходу не умеет быть async, поэтому выкручиваемся так
			return [];
		}
	});
}




/** Подсветка открывающегося и закрывающегося элементов */
function higlight()
{
	// теги
	vscode.languages.registerDocumentHighlightProvider('tib', {
		async provideDocumentHighlights(document, position)
		{
			let text = getPreviousText(document, position);
			let tag = await getCurrentTag(document, position, text);
			if (!tag) return;
			let curRange = document.getWordRangeAtPosition(position);
			let word = document.getText(curRange);
			if (word == "CDATA") return;
			if (tag.GetLaguage() == Language.CSharp && word != 'c#') return; // такой костыль потому что при нахождении на [/c#] хз что там дальше и tag.CSMode == true
			let res = [];
			let fullText = document.getText();
			let after = getCurrentLineText(document, position).substr(position.character);
			let mt = text.match(/(((\[)|(<))\/?)\w*$/);

			if (!mt) return;
			let ind = -1;
			let range: vscode.Range;

			switch (mt[1])
			{
				case "<":
					{
						// открывающийся
						let endpos = document.positionAt(fullText.indexOf(">", text.length) + 1);
						curRange = new vscode.Range(curRange.start.translate(0, -1), endpos);
						res.push(new vscode.DocumentHighlight(curRange));

						// закрывающийся
						if (!after.match(/^[^>]*\/>/) && !Parse.isSelfClosedTag(word))
						{
							range = findCloseTag("<", word, ">", document, position);
							if (range) res.push(new vscode.DocumentHighlight(range));
						}
						break;
					}
				case "[":
					{
						// открывающийся
						let endpos = document.positionAt(fullText.indexOf("]", text.length) + 1);
						curRange = new vscode.Range(curRange.start.translate(0, -1), endpos);
						res.push(new vscode.DocumentHighlight(curRange));

						// закрывающийся
						if (!after.match(/^[^\]]*\/\]/) && !Parse.isSelfClosedTag(word))
						{
							range = findCloseTag("[", word, "]", document, position);
							if (range) res.push(new vscode.DocumentHighlight(range));
						}
						break;
					}
				case "</":
					{
						// закрывающийся
						let endpos = document.positionAt(fullText.indexOf(">", text.length) + 1);
						curRange = new vscode.Range(curRange.start.translate(0, -2), endpos);
						res.push(new vscode.DocumentHighlight(curRange));

						// открывающийся
						range = findOpenTag("<", word, ">", document, position);
						if (range) res.push(new vscode.DocumentHighlight(range));
						break;
					}
				case "[/":
					{
						// закрывающийся
						let endpos = document.positionAt(fullText.indexOf("]", text.length) + 1);
						curRange = new vscode.Range(curRange.start.translate(0, -2), endpos);
						res.push(new vscode.DocumentHighlight(curRange));

						// открывающийся
						range = findOpenTag("[", word, "]", document, position);
						if (range) res.push(new vscode.DocumentHighlight(range));
						break;
					}
			}
			return res;
		}
	})

	// блоки
	vscode.languages.registerDocumentHighlightProvider('tib', {
		provideDocumentHighlights(document, position)
		{
			let res = [];
			let lineText = getCurrentLineText(document, position);
			let reg = lineText.match(/<!--#(end)?block.*-->/);
			if (!reg) return res;
			if (reg.index > position.character || reg.index + reg[0].length < position.character) return res;
			let nextRange: vscode.Range;

			let prevRange = new vscode.Range(
				new vscode.Position(0, 0),
				new vscode.Position(position.line, 0)
			);
			let prevText = document.getText(prevRange);

			if (!!reg[1])
			{
				let res = prevText.matchAll(/<!--#block.*-->/);
				if (!res || res.length == 0) return res;

				let match = res.last();
				nextRange = new vscode.Range(
					document.positionAt(match.index),
					document.positionAt(match.index + match[0].length)
				);
			}
			else
			{
				let offset = prevText.length;
				let after = document.getText().slice(offset);
				let res = after.match(/<!--#endblock-->/);
				if (!res) return res;

				nextRange = new vscode.Range(
					document.positionAt(offset + res.index),
					document.positionAt(offset + res.index + res[0].length)
				);
			}

			let thisRange = new vscode.Range(
				new vscode.Position(position.line, reg.index),
				new vscode.Position(position.line, reg.index + reg[0].length)
			);

			res.push(new vscode.DocumentHighlight(thisRange));
			res.push(new vscode.DocumentHighlight(nextRange));
			return res;
		}
	})
}



/** Автозавершения */
function autoComplete()
{
	// XML Snippets
	vscode.languages.registerCompletionItemProvider('tib', {
		async provideCompletionItems(document, position, token, context)
		{
			let completionItems = [];
			let tag = await getCurrentTag(document, position);
			if (tag && tag.GetLaguage() == Language.XML)
			{
				let text = getPreviousText(document, position, true);

				// XML Features
				if (tag.OpenTagIsClosed && text.match(/\b_\w*$/))
				{
					return AutoCompleteArray.XMLFeatures.map(x => snippetToCompletitionItem(x));
				}

				let curOpenMatch = text.match(/<(\w+)$/);
				if (!curOpenMatch) return;
				let opening = curOpenMatch[1].toLocaleLowerCase();

				//Item Snippet
				if ("item".indexOf(opening) > -1)
				{
					let parent;
					for (let key in ItemSnippets)
						if (!!tag.Parents.find(x => x.Name == key))
						{
							parent = key;
							break;
						}
					if (!parent || !ItemSnippets[parent]) parent = "List";
					let res = new vscode.SnippetString(extractElements(ItemSnippets[parent]));
					if (res)
					{
						let ci = new vscode.CompletionItem("Item", vscode.CompletionItemKind.Snippet);
						ci.detail = "Структура Item для " + parent;
						ci.insertText = res;
						//ci.additionalTextEdits = [vscode.TextEdit.replace(range, "")];
						completionItems.push(ci);
					}
				}
				// Answer Snippet
				else if ("answer".indexOf(opening) > -1)
				{
					let ci = new vscode.CompletionItem("Answer", vscode.CompletionItemKind.Snippet);
					let ciS = new vscode.CompletionItem("AnswerShort", vscode.CompletionItemKind.Snippet);

					let iterator = "1";
					let text = "$2";

					if (tag.LastParent && tag.LastParent.Name == "Repeat")
					{
						let source = tag.LastParent.getRepeatSource();
						ci.detail = "Полная структура Answer в Repeat по " + source;
						ciS.detail = "Краткая структура Answer в Repeat по " + source;
						iterator = source == "List" ? "@ID" : "@Itera";
						text = source == "List" ? "@Text" : "@Itera";
					}
					else
					{
						ci.detail = "Полная структура Answer";
						ciS.detail = "Краткая структура Answer";
					}
					// полный вариант
					ci.insertText = new vscode.SnippetString("Answer Id=\"${1:" + iterator + "}\"><Text>${2:" + text + "}</Text></Answer>");
					completionItems.push(ci);
					// краткий вариант
					ciS.insertText = new vscode.SnippetString("Answer Id=\"${1:" + iterator + "}\"/>");
					completionItems.push(ciS);
				}
			}
			return completionItems;
		},
		resolveCompletionItem(item, token)
		{
			return item;
		}
	});

	//Attributes
	vscode.languages.registerCompletionItemProvider('tib', {
		async provideCompletionItems(document, position, token, context)
		{
			let completionItems = [];
			let tag = await getCurrentTag(document, position);
			if (!!tag && tag.GetLaguage() == Language.XML && !tag.OpenTagIsClosed && !tag.InString() && AutoCompleteArray.Attributes[tag.Id])
			{
				let existAttrs = tag.AttributeNames();
				let textAfter = document.getText().slice(document.offsetAt(position));
				let attrs = textAfter.match(RegExpPatterns.RestAttributes);
				let nameOnly = !!textAfter.match(/^=["']/);
				let nexAttrs: string[] = [];
				if (!!attrs) nexAttrs = CurrentTag.GetAttributesArray(attrs[0]).Keys();
				AutoCompleteArray.Attributes[tag.Id].filter(x => nexAttrs.indexOf(x.Name) + existAttrs.indexOf(x.Name) < -1).forEach(element =>
				{
					let attr = new TibAttribute(element);
					let ci = attr.ToCompletionItem(function (query)
					{
						return safeValsEval(query);
					}, nameOnly);
					completionItems.push(ci);
				});
			}
			return completionItems;
		},
		resolveCompletionItem(item, token)
		{
			return item;
		}
	}, " ");

	//Functions, Variables, Enums, Classes, Custom Methods, C# Snippets, Types, node Ids
	vscode.languages.registerCompletionItemProvider('tib', {
		async provideCompletionItems(document, position, token, context)
		{
			let completionItems: vscode.CompletionItem[] = [];
			let tag = await getCurrentTag(document, position);
			if (!tag) return;

			let curLine = getPreviousText(document, position, true);
			let mt = curLine.match(/(#|\$)?\w*$/);
			let lang = tag.GetLaguage();
			if (!mt) return;
			if (lang != Language.CSharp && mt[1] != "$") return;

			//пропускаем объявления
			if (Parse.isMethodDefinition(curLine)) return;

			let str = getCurrentLineText(document, position).substr(position.character);
			if (mt[1] == "$")
			{
				// добавляем snippet для $repeat
				let ci = new vscode.CompletionItem("repeat", vscode.CompletionItemKind.Snippet);
				ci.detail = "Строчный repeat";
				ci.insertText = new vscode.SnippetString("repeat(${1|" + getAllLists().join(',') + "|}){${2:@ID}[${3:,}]}");
				completionItems.push(ci);
				// добавляем snippet для $place
				ci = new vscode.CompletionItem("place", vscode.CompletionItemKind.Snippet);
				ci.detail = "Указатель на вложенный вопрос";
				ci.insertText = new vscode.SnippetString("place(${1|" + getAllQuestions().join(',') + "|})");
				completionItems.push(ci);
				// добавляем стандартные константы
				if (lang == Language.CSharp && !tag.CSSingle()) XMLEmbeddings.forEach(x =>
				{
					ci = new vscode.CompletionItem(x.Name, vscode.CompletionItemKind.Constant);
					if (!!x.Type) ci.detail = x.Type;
					ci.documentation = x.Title;
					completionItems.push(ci);
				});
			}

			let customMethods = Methods.CompletionArray();
			if (customMethods && !tag.InCSString()) completionItems = completionItems.concat(customMethods); //Custom Methods

			// если начинается с $, то больше ничего не надо
			if (mt[1] == "$") return completionItems;

			//C# Featrues
			if (mt[1] == "#")
			{
				AutoCompleteArray.CSFeatures.forEach(element =>
				{
					completionItems.push(snippetToCompletitionItem(element));
				});
			}

			if (!tag.CSSingle() && !curLine.match(/\w+\.\w*$/))
			{
				if (!tag.InCSString())
				{
					let ar: TibAutoCompleteItem[] = TibAutoCompleteList.Item("Function").concat(TibAutoCompleteList.Item("Variable"), TibAutoCompleteList.Item("Enum"), TibAutoCompleteList.Item("Class"), TibAutoCompleteList.Item("Type"), TibAutoCompleteList.Item("Struct"));
					let adBracket = !str.match(/\w*\(/);
					ar.forEach(element =>
					{
						if (element) completionItems.push(element.ToCompletionItem(adBracket));
					});
					//C# Snippets
					AutoCompleteArray.CSSnippets.forEach(element =>
					{
						completionItems.push(snippetToCompletitionItem(element));
					});
				}
				else //node Ids
				{
					let qt = curLine.lastIndexOf('"');
					if (qt > -1) // от недоверия к tag.InCSString()
					{
						let stuff = curLine.substr(0, qt);
						let match = stuff.match(/((CurrentSurvey\.Lists\[)|(Page\s*=)|(Question\s*=))\s*$/);
						const matchResults =
						{
							List: 2,
							Page: 3,
							Question: 4
						};
						if (!!match)
						{
							let resultMatch = match.findIndex((val, index) => { return index > 1 && !!val; });
							switch (resultMatch)
							{
								case matchResults.List:
									completionItems = completionItems.concat(CurrentNodes.CompletitionItems("List"));
									break;

								case matchResults.Page:
									completionItems = completionItems.concat(CurrentNodes.CompletitionItems("Page"));
									break;

								case matchResults.Question:
									completionItems = completionItems.concat(CurrentNodes.CompletitionItems("Question"));
									break;

								default:
									break;
							}
						}
						else // всё подряд
						{
							_NodeStoreNames.forEach(name =>
							{
								completionItems = completionItems.concat(CurrentNodes.CompletitionItems(name));
							});
						}
					}
				}
			}
			return completionItems;
		},
		resolveCompletionItem(item, token)
		{
			return item;
		}
	}, "\"", "", "$", "#");

	//Properties, Methods, EnumMembers, Linq
	vscode.languages.registerCompletionItemProvider('tib', {
		async provideCompletionItems(document, position, token, context)
		{
			let completionItems = [];
			let tag = await getCurrentTag(document, position);
			if (!!tag && tag.GetLaguage() == Language.CSharp && !tag.InCSString() && !tag.CSSingle())
			{
				let lastLine = getPreviousText(document, position, true);
				let ar: TibAutoCompleteItem[] = TibAutoCompleteList.Item("Property").concat(TibAutoCompleteList.Item("Method"), TibAutoCompleteList.Item("EnumMember"));
				let str = getCurrentLineText(document, position).substr(position.character);
				let needClose = !str.match(/\w*\(/);
				let mt = lastLine.match(/(\w+)\.w*$/);
				let parent: string;
				if (!!mt && !!mt[1]) parent = mt[1];
				ar.forEach(element =>
				{
					let m = false;
					if (element.Parent)
					{
						let reg = new RegExp(element.Parent + "\\.\\w*$");
						m = !!lastLine.match(reg);
					}
					if (m && (!element.ParentTag || element.ParentTag == tag.Name)) completionItems.push(element.ToCompletionItem(needClose, "__" + element.Name));
				});
				// добавляем Linq
				if (lastLine.match(/\.\w*$/) && (!parent || ClassTypes.indexOf(parent) == -1) && _useLinq)
				{
					let linqAr = TibAutoCompleteList.Item("Method").filter(x => x.Parent == "Enumerable").map(x => x.ToCompletionItem(needClose, "zzz" + x.Name));
					completionItems = completionItems.concat(linqAr);
				}
			}
			return completionItems;
		},
		resolveCompletionItem(item, token)
		{
			return item;
		}
	}, ".");

	//Значения атрибутов
	vscode.languages.registerCompletionItemProvider('tib', {
		async provideCompletionItems(document, position, token, context)
		{
			let completionItems = [];
			let tag = await getCurrentTag(document, position);
			if (!tag || tag.OpenTagIsClosed) return;
			let text = getPreviousText(document, position, true);
			//let needClose = !getCurrentLineText(document, position).substr(position.character).match(/^[\w@]*['"]/);

			let curAttr = text.match(/(\w+)=(["'])(:?\w*)$/);
			if (!curAttr) return;

			let atrs: TibAttribute[] = AutoCompleteArray.Attributes[tag.Id];
			if (!atrs) return;

			let attr = atrs.find(function (e, i)
			{
				return e.Name == curAttr[1];
			});
			if (!attr) return;


			let attrT = new TibAttribute(attr);
			let vals = attrT.ValueCompletitions(function (query)
			{
				return safeValsEval(query);
			});
			vals.forEach(v =>
			{
				let ci = new vscode.CompletionItem(v, vscode.CompletionItemKind.Enum);
				ci.insertText = v;
				completionItems.push(ci);
			});
			return completionItems;
		},
		resolveCompletionItem(item, token)
		{
			return item;
		}
	}, ":", "");
}



/** Подсказки при вводе параметров функции */
function helper()
{
	vscode.languages.registerSignatureHelpProvider('tib', {
		async provideSignatureHelp(document, position, token)
		{
			let tag = await getCurrentTag(document, position);
			if (!tag || tag.GetLaguage() != Language.CSharp) return;
			let sign = new vscode.SignatureHelp();
			let lastLine = getPreviousText(document, position, true);
			//пропускаем объявления
			if (Parse.isMethodDefinition(lastLine)) return;
			let ar = TibAutoCompleteList.Item("Function").concat(TibAutoCompleteList.Item("Method"));
			let mtch = lastLine.match(/((^)|(.*\b))(\w+)\([^\(\)]*$/);
			if (!mtch || mtch.length < 4) return sign;
			let reg = mtch[1].match(/(\w+)\.$/);
			let parent = !!reg ? reg[1] : null;
			ar.forEach(element =>
			{
				if (element.Name == mtch[4] && (element.Kind == vscode.CompletionItemKind[vscode.CompletionItemKind.Function] || !!parent && element.Parent == parent))
				{
					if (element.Overloads.length == 0) sign.signatures.push(element.ToSignatureInformation());
					else element.Overloads.forEach(el =>
					{
						sign.signatures.push(el.ToSignatureInformation());
					});
				}
			});
			// Custom Methods
			Methods.SignatureArray(mtch[4]).forEach(element =>
			{
				sign.signatures.push(element);
			});
			sign.activeSignature = 0;
			return sign;
		}
	}, "(", ",");
}



/** подсказки при наведении */
function hoverDocs()
{
	vscode.languages.registerHoverProvider('tib', {
		async provideHover(document, position, token)
		{
			let res = [];
			let range = document.getWordRangeAtPosition(position);
			if (!range) return;
			let tag = await getCurrentTag(document, range.end);
			if (!tag) return;
			if (tag.GetLaguage() != Language.CSharp) return;
			let text = document.getText(range);
			let parent = null;
			let lastText = getPreviousText(document, position);
			let reg = lastText.match(/(\w+)\.\w*$/);
			if (!!reg)
			{
				parent = reg[1];
			}
			// надо проверить родителя: если нашёлся static, то только его, иначе всё подходящее
			let suit = CodeAutoCompleteArray.filter(x => x.Name == text);
			let staticParens = CodeAutoCompleteArray.filter(x => x.Kind == vscode.CompletionItemKind[vscode.CompletionItemKind.Class]).map(x => x.Name);
			if (staticParens.contains(parent))
			{
				suit = suit.filter(x =>
				{
					return x.Name == text && (x.Parent == parent);
				});
			}

			for (let i = 0; i < suit.length; i++)
			{
				if (suit[i].Documentation && suit[i].Description)
				{
					let doc = "/* " + suit[i].Description + " */\n" + suit[i].Documentation;
					res.push({ language: "csharp", value: doc });
				}
				else
				{
					if (suit[i].Documentation) res.push({ language: "csharp", value: suit[i].Documentation });
					if (suit[i].Description) res.push(suit[i].Description);
				}
			}
			let customMethods = Methods.HoverArray(text);
			if (customMethods) res = res.concat(customMethods);
			if (res.length == 0) return;
			return new vscode.Hover(res, range);
		}
	});
}


/** Делает первую букву тега заглавной */
function upcaseFirstLetter(changes: ContextChange[], editor: vscode.TextEditor, tag: CurrentTag): Promise<void>
{
	return new Promise<void>((resolve, reject) =>
	{
		// если хоть одна позиция такова, то нафиг
		if (!tag || !Settings.Item("upcaseFirstLetter") || tag.GetLaguage() != Language.XML || inCDATA(editor.document, editor.selection.active)) return resolve();
		let tagRegex = /(<\/?)([a-z]\w*)$/;
		let nullPosition = new vscode.Position(0, 0);
		try
		{
			let replaces: { Range: vscode.Range, Value: string }[] = [];

			changes.forEach(change =>
			{
				let text = editor.document.getText(new vscode.Range(nullPosition, change.Active));
				let lastTag = text.match(tagRegex);
				if (!lastTag) return;
				let up = lastTag[2];
				up = up[0].toLocaleUpperCase(); // делаем первую заглавной
				if (lastTag[2].length > 1) up += lastTag[2][1].toLocaleLowerCase(); // убираем вторую заглавную
				let pos = editor.document.positionAt(lastTag.index).translate(0, lastTag[1].length);
				let range = new vscode.Range(
					pos,
					pos.translate(0, up.length)
				);
				replaces.push({ Range: range, Value: up });
			});

			editor.edit(builder =>
			{
				replaces.forEach(element =>
				{
					builder.replace(element.Range, element.Value);
				});
			}).then(() => { resolve() }, () => { reject() });

		} catch (error)
		{
			logError("Ошибка при добавлении заглавной буквы", error);
			reject();
		}
	});
}


/** Подсказки и ошибки */
async function diagnostic(document: vscode.TextDocument)
{
	if (document.languageId != 'tib' || !Settings.Item('enableDiagnostic')) return Diagnostics.delete(document.uri);
	let res = await getDiagnosticElements(document);
	Diagnostics.delete(document.uri);
	if (!!res) Diagnostics.set(document.uri, res);
}


/** Переход к определениям */
function definitions()
{
	// C#
	vscode.languages.registerDefinitionProvider('tib', {
		async provideDefinition(document, position, token)
		{
			let tag = await getCurrentTag(document, position);
			if (!tag || tag.GetLaguage() != Language.CSharp || tag.InCSString()) return;
			let res: vscode.Location;
			try
			{
				let word = document.getText(document.getWordRangeAtPosition(position));
				if (Methods.Contains(word)) res = Methods.Item(word).GetLocation();
			} catch (error)
			{
				logError("Ошибка при получении определения метода", error);
			}
			return res;
		}
	});

	// XML узлы
	vscode.languages.registerDefinitionProvider('tib', {
		provideDefinition(document, position, token)
		{
			let res: vscode.Location;
			try
			{
				let word = document.getText(document.getWordRangeAtPosition(position));
				let enabledNodes = ["Page", "List", "Question"];
				enabledNodes.forEach(element =>
				{
					let item = CurrentNodes.GetItem(word, element);
					if (item)
					{
						res = item.GetLocation();
						return res;
					}
				});
			} catch (error)
			{
				logError("Ошибка при получении определения узла XML", error);
			}
			return res;
		}
	});

	// include
	vscode.languages.registerDefinitionProvider('tib', {
		async provideDefinition(document, position, token)
		{
			let tag = await getCurrentTag(document, position);
			if (!tag || tag.Name != "Include") return;
			let attrs = tag.GetAllAttributes(document);
			let fileName = attrs.Item("FileName");
			if (!fileName) return;
			fileName = applyConstants(fileName);
			let res = new vscode.Location(vscode.Uri.file(fileName), new vscode.Position(0, 0));
			return res;
		}
	});
}


/** добавление отступов при нажатии enter между > и < */
function makeIndent(): void
{
	vscode.languages.setLanguageConfiguration('tib', {
		wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
		onEnterRules: [
			{
				beforeText: new RegExp(`<([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)\\s*$`, 'i'),
				afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
				action: { indentAction: vscode.IndentAction.IndentOutdent }
			},
			{
				beforeText: new RegExp(`<(\\w[\\w\\d]*)([^/>]*(?!/)>)\\s*$`, 'i'),
				action: { indentAction: vscode.IndentAction.Indent }
			},
			{
				beforeText: new RegExp("\\[(" + RegExpPatterns.SelfClosedTags + ")\\]\\s*", 'i'),
				action: { indentAction: vscode.IndentAction.None }
			},
			{
				beforeText: new RegExp(`\\[([a-z]\\w*#?)([^/\\]]*(?!/)\\])\\s*`, 'i'),
				afterText: /^\[\/([a-z]\w*#?)\s*\]$/i,
				action: { indentAction: vscode.IndentAction.IndentOutdent }
			},
			{
				beforeText: new RegExp(`\\[([a-z]\\w*#?)([^/\\]]*(?!/)\\])\\s*$`, 'i'),
				action: { indentAction: vscode.IndentAction.Indent }
			},
		],
	});

}


/** автоматическое закрывание <тегов> */
function insertAutoCloseTags(changes: ContextChange[], editor: vscode.TextEditor, tag: CurrentTag): Promise<void>
{
	return new Promise<void>((resolve, reject) =>
	{
		if (!tag || !editor) return resolve();
		let fullText = editor.document.getText();

		// сохраняем начальное положение
		let prevSels = editor.selections.map(function (e) { return new vscode.Selection(e.start.translate(0, 1), e.end.translate(0, 1)); });

		let changesCount = 0;

		// проверяем только рандомный tag (который передаётся из activate), чтобы не перегружать процесс
		// хреново но быстро
		if (!tag.Body || tag.Body.trim().length == 0 || tag.GetLaguage() != Language.CSharp || tag.InCSString())
		{
			let promises: Thenable<void>[] = [];
			changes.forEach(change =>
			{
				let originalPosition = change.Active.translate(0, 1);
				if (change.Change.text == ">")
				{
					let curLine = getCurrentLineText(editor.document, originalPosition);
					let prev = curLine.substr(0, change.Active.character + 1);
					let after = curLine.substr(change.Active.character + 1);
					let result = prev.match(/<(\w+)[^>\/]*>?$/);
					if (!result) return;
					// проверяем, не закрыт ли уже этот тег
					let afterFull = fullText.substr(editor.document.offsetAt(originalPosition));
					let tagOp = positiveMin(afterFull.indexOf("<" + result[1] + " "), afterFull.indexOf("<" + result[1] + ">"), -1);
					let tagCl = positiveMin(afterFull.indexOf("</" + result[1] + " "), afterFull.indexOf("</" + result[1] + ">"), -1);

					if ((tagCl == -1 || tagOp > -1 && tagOp < tagCl) || result[1].match(/^(Repeat)|(Condition)|(Block)$/))
					{
						let closed = after.match(new RegExp("^[^<]*(<\\/)?" + safeString(result[1])));
						if (!closed)
						{
							changesCount++;
							promises.push(editor.insertSnippet(new vscode.SnippetString("</" + result[1] + ">"), originalPosition, { undoStopAfter: false, undoStopBefore: false }).then(() =>
							{
								// ожидаем конца всех изменений
								if (changesCount <= 1)
								{
									editor.selections = prevSels;
								}
								else changesCount--;
							}));
						}
					}
				}
			});
			Promise.all(promises).then(() => { resolve() });
		}
	});
}


function insertSpecialSnippets(changes: ContextChange[], editor: vscode.TextEditor, text: string, tag: CurrentTag): Promise<void>
{
	return new Promise<void>((resolve, reject) =>
	{
		let promises: Thenable<any>[] = [];

		if (!tag || !editor || !changes || changes.length == 0) return resolve();

		let change = changes[0].Change.text;
		let positions = editor.selections.map(x => new vscode.Position(x.active.line, x.active.character + 1));
		let lang = tag.GetLaguage();

		// удаление лишней скобки
		let newPos = changes[0].Active.translate(0, 1);
		let nextCharRange = new vscode.Range(newPos, newPos.translate(0, 1));
		let nextChar = editor.document.getText(nextCharRange);
		if (nextChar == "]" && change[change.length - 1] == "]")
		{
			let results: string[] = [];
			let sels: vscode.Selection[] = [];
			changes.forEach(ch =>
			{
				let newPosC = ch.Active.translate(0, 1);
				let nextCharRangeC = new vscode.Selection(newPosC, newPosC.translate(0, 1));
				results.push("");
				sels.push(nextCharRangeC);
			});
			promises.push(multiPaste(editor, sels, results));
		}

		// закрывание скобок
		// автозакрывание этих скобок отключено для языка tib, чтобы нормально закрывать теги
		if (isScriptLanguage(lang) && !tag.InString() && change[change.length - 1] == "[")
		{
			promises.push(editor.insertSnippet(new vscode.SnippetString("$0]"), changes.map(x => x.Selection.active.translate(0, 1))));
		}

		// закрывание [тегов]
		let tagT = text.match(/\[([a-zA-Z]\w*(#)?)(\s[^\]\[]*)?(\/)?\]$/);
		if
		(
			change == "]" &&
			!!tagT &&
			!!tagT[1] &&
			!tagT[4] &&
			(tag.GetLaguage() != Language.CSharp || tag.InCSString() || !!tagT[2]) &&
			(!!tagT[2] || ((tag.Parents.join("") + tag.Name).indexOf("CustomText") == -1)) &&
			!Parse.isSelfClosedTag(tagT[1])
		)
		{
			let str = tagT[2] ? "$0;[/c#]" : "$0[/" + tagT[1] + "]";
			promises.push(editor.insertSnippet(new vscode.SnippetString(str), positions));
		}

		Promise.all(promises).then(x => { resolve() });
	});
}


//#endregion



/*---------------------------------------- доп. функции ----------------------------------------*/
//#region


/** Собирает данные из текущего документа и Includ'ов */
function getSurveyData(document: vscode.TextDocument): Promise<void>
{
	return new Promise<void>((resolve, reject) =>
	{
		let docs = [document.fileName];
		let includes = getIncludePaths(document.getText());
		let methods = new TibMethods();
		let nodes = new SurveyNodes();
		let mixIds: string[] = [];
		// если Include поменялись, то обновляем все
		if (!Includes || !Includes.equalsTo(includes))
		{
			docs = docs.concat(includes);
			Includes = includes;
		}
		else // иначе обновляем только текущий документ
		{
			methods = Methods.Filter((name, element) => element.FileName != document.fileName);
			nodes = CurrentNodes.FilterNodes((node) => node.FileName != document.fileName);
		}

		try
		{
			let promises: Promise<any>[] = [];
			for (let i = 0; i < docs.length; i++)
			{
				// либо этот, либо надо открыть
				new Promise<vscode.TextDocument>((resolveDoc, rejectDoc) =>
				{
					if (docs[i] == document.fileName) return resolveDoc(document);
					vscode.workspace.openTextDocument(docs[i]).then(doc => { resolveDoc(doc) });
				}).then(doc =>
				{
					promises.push(getDocumentMethods(doc, Settings).then(mets => 
					{
						methods.AddRange(mets);
						Methods = methods;
					}));

					promises.push(getDocumentNodeIds(doc, Settings).then(nods =>
					{
						nodes.AddRange(nods);
						CurrentNodes = nodes;
					}));

					promises.push(getMixIds(doc, Settings).then(mixs =>
					{
						mixIds = mixIds.concat(mixs);
						MixIds = mixIds;
					}));
				});
			}
			Promise.all(promises).then(() => { resolve(); });
		} catch (error)
		{
			logError("Ошибка при сборе сведений о документе", error);
			resolve();
		}
	});
}


/** Безопасное выполнение eval() */
function safeValsEval(query: string): string[]
{
	let res = [];
	try
	{
		res = eval(query);
	}
	catch (error)
	{
		let data = getLogData();
		data.add({ Data: { EvalString: query }, StackTrace: error });
		saveError("Не получилось выполнить eval()", data);
	}
	return res;
}



// функции для получения элементов

/** Заменяет {{Elements}} на строку для Snippet */
export function extractElements(input: string): string
{
	let res = new KeyedCollection<string[]>();
	let match = input.matchAll(/{{(\w+)}}/);
	if (!match || match.length == 0) return input;
	match.forEach(element =>
	{
		if (!!_ElementFunctions[element[1]] && !res.Contains(element[1]))
		{
			res.AddPair(element[1], _ElementFunctions[element[1]]());
		}
	});
	let resultStr = input;
	let i = 1;
	res.forEach((key, value) =>
	{
		resultStr = resultStr.replace(new RegExp("{{" + key + "}}", "g"), "${" + i + "|" + value.join(",") + "|}");
		i++;
	});
	return resultStr;
}

function getAllPages(): string[]
{
	return CurrentNodes.GetIds('Page');
}

function getAllLists(): string[]
{
	return CurrentNodes.GetIds('List');
}

function getAllQuestions(): string[]
{
	return CurrentNodes.GetIds('Question');
}

function getQuestionTypes(): string[]
{
	return QuestionTypes;
}

function getAllMixIds(): string[]
{
	return MixIds;
}




/** Возвращает `null`, если тег не закрыт или SelfClosed */
function findCloseTag(opBracket: string, tagName: string, clBracket: string, document: vscode.TextDocument, position: vscode.Position): vscode.Range
{
	try
	{
		let fullText = document.getText();
		let prevText = getPreviousText(document, position);
		let res = Parse.findCloseTag(opBracket, tagName, clBracket, prevText, fullText);
		if (!res || !res.Range) return null;
		let startPos = document.positionAt(res.Range.From);
		let endPos = document.positionAt(res.Range.To + 1);
		return new vscode.Range(startPos, endPos);
	} catch (error)
	{
		logError("Ошибка выделения закрывающегося тега", error);
	}
	return null;
}


function findOpenTag(opBracket: string, tagName: string, clBracket: string, document: vscode.TextDocument, position: vscode.Position): vscode.Range
{
	try
	{
		let prevText = getPreviousText(document, position);
		let res = Parse.findOpenTag(opBracket, tagName, clBracket, prevText);
		if (!res) return null;
		let startPos = document.positionAt(res.Range.From);
		let endPos = document.positionAt(res.Range.To + 1);
		return new vscode.Range(startPos, endPos);
	} catch (error)
	{
		logError("Ошибка выделения открывающегося тега", error);
		return null;
	}
}


/** getCurrentTag для debug (без try-catch) */
async function __getCurrentTag(document: vscode.TextDocument, position: vscode.Position, txt?: string, force = false): Promise<CurrentTag>
{
	let tag: CurrentTag;
	let text = txt || getPreviousText(document, position);

	// сначала пытаемся вытащить из кэша (сначала обновить, если позиция изменилась)
	if (!force)
	{
		if (Cache.Active())
		{
			Cache.Update(document, position, text);
			tag = Cache.Tag.Get();
		}
	}

	if (!tag)
	{
		// собираем тег заново
		let pure: string;
		if (!pure) pure = CurrentTag.PrepareXML(text);
		let ranges = await Parse.getParentRanges(document, pure);
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
				Body: tag.OpenTagIsClosed ? document.getText(new vscode.Range(lastRange.end, position)) : undefined,
				LastParent: !!parents && parents.length > 0 ? parents.last() : undefined
			});
		}
	}
	if (!!Settings.Item("showTagInfo")) CurrentStatus.setTagInfo(tag);
	return tag;
}


/** Самое главное в этом расширении */
export async function getCurrentTag(document: vscode.TextDocument, position: vscode.Position, txt?: string, force = false): Promise<CurrentTag>
{
	//return null;
	if (_pack == "debug") return __getCurrentTag(document, position, txt, force);

	let tag: CurrentTag;
	try
	{
		tag = await __getCurrentTag(document, position, txt, force);
	}
	catch (error)
	{
		logError("Ошибка определения положения в XML", error);
		return null;
	}
	return tag;
}



function getCurrentLineText(document: vscode.TextDocument, position: vscode.Position): string
{
	try
	{
		let
			start = new vscode.Position(position.line, 0),
			end = new vscode.Position(position.line, document.lineAt(position.line).text.length);
		return document.getText(new vscode.Range(start, end));
	} catch (error)
	{
		logError("Ошибка получения текста текущей строки", error);
		return null;
	}

}


/** Получает текст от начала документа до `position` */
export function getPreviousText(document: vscode.TextDocument, position: vscode.Position, lineOnly: boolean = false): string
{
	try
	{
		let
			start = lineOnly ? new vscode.Position(position.line, 0) : new vscode.Position(0, 0),
			end = new vscode.Position(position.line, position.character);
		return document.getText(new vscode.Range(start, end));
	} catch (error)
	{
		logError("Ошибка получения текста документа", error);
		return null;
	}
}



/** Range всего документа */
export function getFullRange(document: vscode.TextDocument): vscode.Range
{
	return new vscode.Range(0, 0, document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
}


/** расширяет выделение до границ строк */
function selectLines(document: vscode.TextDocument, selection: vscode.Selection): vscode.Selection
{
	if (!selection)
	{
		logError("Ошибка при выделении элемента");
		return null;
	}
	return new vscode.Selection(
		new vscode.Position(selection.start.line, 0),
		new vscode.Position(selection.end.line, document.lineAt(selection.end.line).range.end.character)
	);
}


/** Комментирование выделенного фрагмента */
async function commentBlock(editor: vscode.TextEditor, selection: vscode.Selection): Promise<string>
{
	let document = editor.document;
	let text = document.getText(selection);
	let tagFrom = await getCurrentTag(document, selection.start);
	let tagTo = await getCurrentTag(document, selection.end);
	if (!tagFrom || !tagTo)
	{
		logError("Ошибка получения границ выделения");
		return null;
	}
	let langFrom = tagFrom.GetLaguage();
	let langTo = tagTo.GetLaguage();
	if (langFrom != langTo)
	{
		showWarning("Начало и конец выделенного фрагмента лежат в разных языковых областях. Команда отменена.");
		return null;
	}

	let cStart = "<!--";
	let cEnd = "-->";

	if (isScriptLanguage(langFrom))
	{
		cStart = "/*";
		cEnd = "*/";
	}
	let newText = text;

	//проверяем на наличие комментов внутри
	let inComReg = new RegExp("(" + safeString(cStart) + ")|(" + safeString(cEnd) + ")");
	let checkInnerComments = function (text: string): boolean
	{
		return !text.match(inComReg);
	}

	let valid = checkInnerComments(newText);

	// если это закомментированный, до снимаем комментирование
	if (!valid && newText.match(new RegExp("^\\s*" + safeString(cStart) + "[\\S\\s]*" + safeString(cEnd) + "\\s*$")))
	{
		newText = newText.replace(new RegExp("^(\\s*)" + safeString(cStart) + "( ?)([\\S\\s]*)( ?)" + safeString(cEnd) + "(\\s*)$"), "$1$3$5");
		valid = checkInnerComments(newText);
	}
	else
	{
		cStart += " ";
		cEnd = " " + cEnd;
		newText = cStart + newText + cEnd;
	}

	if (!valid)
	{
		showWarning("Внутри выделенной области уже есть комментарии. Команда отменена.");
		return null;
	}

	return newText;
}


/** Последовательное комментирование выделенных фрагментов */
async function commentAllBlocks(selections: vscode.Selection[]): Promise<void>
{
	let results: string[] = [];
	let editor = vscode.window.activeTextEditor;
	editor.selections = selections;
	for (let selection of selections)
	{
		results.push(await commentBlock(editor, selection));
	};
	multiPaste(editor, editor.selections, results);
}


/**
 * Заменяет текст
 * @param selection выделение в котором заменить текст (или позиция куда вставить)
 * @param text новый текст
 * @param callback по окончании
 * */
/* function pasteText(editor: vscode.TextEditor, selection: vscode.Selection, text: string, callback: Function)
{
	return editor.edit((editBuilder) =>
	{
		try
		{
			editBuilder.replace(selection, text);
		}
		catch (error)
		{
			logError("Ошибка замены текста в выделении", error);
		}
	}, { undoStopAfter: false, undoStopBefore: false }).then(() =>
	{
		callback();
	});
} */


/** Последовательная замена (вставка) элементов из `lines` в соответствующие выделения `selections` */
function multiPaste(editor: vscode.TextEditor, selections: vscode.Selection[], lines: string[], callback?: Function)
{
	/* pasteText(editor, selections.pop(), lines.pop(), function ()
	{
		if (selections.length == 0)
		{
			if (!!callback) callback();
			return;
		}
		multiPaste(editor, selections, lines, callback);
	}); */
	return editor.edit(editBuilder =>
	{
		for (let i = 0; i < selections.length; i++)
		{
			editBuilder.replace(selections[i], lines[i]);
		}
	});
}


// вынесенный кусок из комманды вставки
function multiLinePaste(editor: vscode.TextEditor, lines: string[], separate: boolean = false): void
{
	if (separate) lines = lines.map(s => { return s.replace(/\t/g, ",") });
	multiPaste(editor, editor.selections.sort((a, b) => { let ld = a.start.line - b.start.line; return ld == 0 ? a.start.character - b.start.character : ld; }), lines, function ()
	{
		// ставим курсор в конец
		editor.selections = editor.selections.map(sel => { return new vscode.Selection(sel.end, sel.end) });
	});
}


/** сообщение (+ отчёт) об ошибке */
function logError(text: string, error?)
{
	let editor = vscode.window.activeTextEditor;
	let data = getLogData(editor);
	tibError(text, data, error);
}


/** Возвращает FileName+Postion+FullText */
function getLogData(edt?: vscode.TextEditor): LogData
{
	let res: LogData;
	try
	{
		let editor = edt || vscode.window.activeTextEditor;
		res = new LogData({
			FileName: editor.document.fileName,
			Postion: editor.selection.active,
			FullText: editor.document.getText(),
			CacheEnabled: !!Settings.Item("enableCache")
		});
		let survObj = {
			Methods: Methods.Keys(),
			NodesLength: CurrentNodes.Keys().map(x => x + ": " + (CurrentNodes.Item(x).length || 0)),
			MixIds: MixIds,
			Includes: Includes
		};
		res.add({ SurveyData: survObj });
	} catch (error)
	{
		let data = new LogData(null);
		data.add({ StackTrace: error });
		saveError("Ошибка при сборе сведений", data);
	}
	return res;
}



/** получаем функцию для форматирования C# */
function getCSFormatter(ext: vscode.Extension<any>): (source: string) => Promise<string>
{
	const getOptions = ext.exports['getOptions'];
	const format: (txt: string, opts?) => Promise<string> = ext.exports['process'];
	if (getOptions == undefined || format == undefined)
	{
		showWarning("Модуль форматирования C# не установлен!\nНе найдено расширения C# FixFormat. C# будет форматироваться как обычный текст.");
		return null;
	}
	return (text: string) =>
	{
		let globalOptions = getOptions({});
		return format(text, globalOptions);
	}
}


/** Заменяет `range` на `text` */
export async function applyChanges(range: vscode.Range, text: string, editor: vscode.TextEditor, format = false): Promise<string>
{
	let res = text;
	// вставляем
	await editor.edit(builder =>
	{
		builder.replace(range, res);
	});
	// форматируем
	if (format)
	{
		try
		{
			let sel = selectLines(editor.document, editor.selection);
			editor.selection = sel;
			let tag = await getCurrentTag(editor.document, sel.start);
			let ind = !!tag ? tag.GetIndent() : 0;
			res = await Formatting.format(res, Language.XML, Settings, "\t", ind);
			return applyChanges(sel, res, editor, false);
		}
		catch (error)
		{
			logError("Ошибка при обновлении текста документа", error);
		}
	}
	return res;
}


/** Обновляет все <Include> */
function getIncludePaths(text: string): string[]
{
	let reg = /<Include[\s\S]*?FileName=(("[^"]+")|('[^']+'))/;
	let txt = text;
	if (Settings.Item("ignoreComments")) txt = Encoding.clearXMLComments(txt);
	return txt.matchAll(reg).map(x => x[1].replace(/(^["'"])|(['"]$)/g, '')).filter(x => pathExists(x));
}


/** Проверки документа */
function checkDocument(editor: vscode.TextEditor)
{
	if (!Refused.enableCache && !Settings.Item("enableCache") && editor.document.lineCount > 5000)
	{
		yesNoHelper("Включить кэширование? Кеширование позволяет ускорить работу с большими документами таких функций расширения, как автозавершение, подсказки при вводе и т.д.").then((res) => 
		{
			if (res) Settings.Set("enableCache", true).then(null, (er) => { logError("Ошибка при изменении конфигурации", er); });
			else Refused.enableCache = true;
		})
	}
}


function yesNoHelper(text: string): Promise<boolean>
{
	return new Promise<boolean>((resolve) =>
	{
		if (Settings.Item("showHelpMessages")) vscode.window.showInformationMessage(text, "Да", "Нет").then((res) =>
		{
			resolve(res == "Да");
		});
		else resolve(false);
	});
}


/** Запрещает редактирование */
function lockDocument(document: vscode.TextDocument, log = false, force = false)
{
	let noLock = (Settings.Item("doNotLockFiles") as string[]);
	let path = new Path(document.fileName);
	let docPath = path.FullPath;
	if (document.languageId == "tib" && (!fileIsLocked(docPath) || force))
	{
		if (!!noLock && noLock.contains(docPath)) return;
		lockFile(docPath);
		createLockInfoFile(path);
		if (!LockedFiles.contains(docPath)) LockedFiles.push(docPath);
		if (log) logToOutput(`Файл "${path.FileName}" заблокирован для других пользователей.`);
	}
}


/** Разрешает редактирование */
function unlockDocument(document: vscode.TextDocument, log = false)
{
	let path = new Path(document.fileName);
	let docPath = path.FullPath;
	if (document.languageId == "tib" && LockedFiles.contains(docPath))
	{
		unlockFile(docPath);
		removeLockInfoFile(path);
		if (log) logToOutput(`Файл "${path.FileName}" разблокирован`);
		LockedFiles.remove(docPath);
	}
}

/** Документ заблокирован и НЕ находится в LockedFiles */
function isLocked(document: vscode.TextDocument): boolean
{
	let docPath = new Path(document.fileName).FullPath;
	return !LockedFiles.contains(docPath) && fileIsLocked(docPath);
}


/** разрешает редактирование всех активных документов */
function unlockAllDocuments()
{
	LockedFiles.forEach(file =>
	{
		unlockFile(file);
		removeLockInfoFile(new Path(file));
	});
}


function showLockInfo(document: vscode.TextDocument)
{
	let path = new Path(document.fileName);
	let lockPath = getLockFilePath(path);
	let strPath = getFilePathForMessage(document.fileName);
	if (fs.existsSync(lockPath))
	{
		let data = getLockData(lockPath);
		let message = `Файл ${strPath} использует `;
		let user = "непонятно кто";
		if (!!data && !!data.User)
		{
			user = data.User;
			if (data.User == getUserName())
			{
				if (data.Id == getUserId()) return lockDocument(document, true, true);
				yesNoHelper(`Файл ${strPath} занят пользователем ${user}. Возможно, он остался заблокированным после прерывания работы расширения. Разблокировать?`).then(res => { if (res) lockDocument(document, true, true) });
				return;
			}
		}
		message = message + user + "";
		showWarning(message);
	}
	else
	{
		yesNoHelper(`Файл ${strPath} защищён от записи. Разрешить запись?`).then(res =>
		{
			if (res) unlockFile(document.fileName, true);
		});
	}
}


/** Возвращает длинный или короткий путь к файлу согласно настройке 'showFullPath' */
function getFilePathForMessage(path: string)
{
	let res = path;
	if (!Settings.Item("showFullPath")) res = new Path(path).FileName;
	return `"${res}"`;
}


/** Заменяет в строке все константы на значения */
function applyConstants(input: string): string
{
	let cons = AutoCompleteArray.PreDifinedConstants.toKeyedCollection(x => x).Map((key, value) => new KeyValuePair<string>('@' + key, value));
	return input.replaceValues(cons);
}


async function createElements(elementType: SurveyElementType)
{
	let editor = vscode.window.activeTextEditor;
	let text = editor.document.getText(editor.selection);
	let res = TibDocumentEdits.createElements(text, elementType);
	let tag = await getCurrentTag(editor.document, editor.selection.active);
	let indent = !!tag ? tag.GetIndent() : 1;
	Formatting.format(res.value, Language.XML, Settings, "\t", indent).then(x =>
	{
		res.value = x;
		vscode.window.activeTextEditor.insertSnippet(res);
	});
}



//#endregion
