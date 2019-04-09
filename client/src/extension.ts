'use strict';

import * as server from 'vscode-languageserver';
import * as vscode from 'vscode';

import { CurrentTag, Language, positiveMin, isScriptLanguage, getFromClioboard, safeString, Parse, getPreviousText, translatePosition, translate, IProtocolTagFields, OnDidChangeDocumentData, pathExists, IServerDocument, IErrorLogData, fileIsLocked, lockFile, unlockFile } from "tib-api";
import { SurveyElementType } from 'tib-api/lib/surveyObjects'
import { openFileText, getContextChanges, inCDATA, ContextChange, ExtensionSettings, Path, createLockInfoFile, getLockData, getLockFilePath, removeLockInfoFile, StatusBar, ClientServerTransforms, isTib, UserData, getUserData, ICSFormatter } from "./classes";
import * as Formatting from './formatting'
import * as fs from 'fs';
import * as debug from './debug'
import { _pack, RegExpPatterns, _NodeStoreNames, _WarningLogPrefix, LogPath } from 'tib-api/lib/constants'
import * as TibDocumentEdits from './documentEdits'
import * as client from 'vscode-languageclient';
import * as path from 'path';
import { TelegramBot } from 'tib-api/lib/telegramBot';
import { TibOutput, showWarning, LogData, TibErrors } from './errors';


export { CSFormatter, _settings as Settings };


/*---------------------------------------- глобальные переменные ----------------------------------------*/
//#region


var _client: client.LanguageClient;

var _clientIsReady = false;

/** объект для управления ботом */
var _bot: TelegramBot;

// константы

/** Во избежание рекурсивыных изменений */
var _inProcess = false;

/** функция для форматирования C# из расширения Leopotam.csharpfixformat */
var CSFormatter: ICSFormatter;

/** Настройки расширения */
var _settings: ExtensionSettings;

/** флаг использования Linq */
var _useLinq = true;

/** Канал вывода */
var _outChannel = new TibOutput('tib');

var _errors: TibErrors;

/** Пути к заблокированным файлам */
var _lockedFiles: string[] = [];


var _currentStatus = new StatusBar();

/** Данные о пользователе */
var _userInfo = new UserData();

//#endregion



/*---------------------------------------- активация ----------------------------------------*/
//#region

export function activate(context: vscode.ExtensionContext)
{
    _outChannel.logToOutput("Начало активации");

    let waitFor: Promise<any>[] = [];

    // общие дествия при старте расширения
    waitFor.push(getStaticData());
    createClientConnection(context); // этого не ждём

    waitFor.push(makeIndent());
    waitFor.push(registerCommands());
    waitFor.push(registerActionCommands());


    let editor = vscode.window.activeTextEditor;

    // обновляем настройки при сохранении
    vscode.workspace.onDidChangeConfiguration(() =>
    {
        _settings.Update();
    })

    /** Документ сменился */
    async function anotherDocument(editor: vscode.TextEditor)
    {
        if (!editor || editor.document.languageId != 'tib') return;
        let documentData = ClientServerTransforms.ToServer.Document(editor.document);
        createRequest<IServerDocument, void>("anotherDocument", documentData, true);
        if (!editor.document.isUntitled)
        {
            if (isLocked(editor.document)) showLockInfo(editor.document);
            else lockDocument(editor.document, true);
        }
        checkDocument(editor);
        _inProcess = false;
    }

    waitFor.push(anotherDocument(editor));

    // смена документа
    vscode.window.onDidChangeActiveTextEditor(neweditor =>
    {
        editor = neweditor;
        anotherDocument(neweditor);
    });

    // редактирование документа
    vscode.workspace.onDidChangeTextDocument(event =>
    {
        if (_inProcess || !editor || event.document.languageId != "tib") return;

        // преобразования текста
        if (!event || !event.contentChanges.length) return;

        let documentData = ClientServerTransforms.ToServer.Document(event.document);
        let serverDocument = createServerDocument(documentData);

        let changes: ContextChange[];
        try
        {
            changes = getContextChanges(event.document, editor.selections, event.contentChanges, true);
        } catch (error)
        {
            logError("Ошибка в getContextChanges", false)
        }

        let originalPosition: vscode.Position;
        if (!!changes && changes.length > 0)
        {
            let mainChange = changes.find(x => x.Active == editor.selection.active);
            let originalPositionServer = translatePosition(serverDocument, mainChange.Start, mainChange.Change.text.length);
            originalPosition = new vscode.Position(originalPositionServer.line, originalPositionServer.character);
        }
        else // это случается при удалении или замене (в т.ч. Snippet) 
        {
            originalPosition = editor.selection.active;
        }

        let text = getPreviousText(serverDocument, originalPosition);

        let changeData: OnDidChangeDocumentData = {
            document: documentData,
            //contentChanges: event.contentChanges,
            currentPosition: originalPosition,
            previousText: text
        };

        createRequest<OnDidChangeDocumentData, CurrentTag>('onDidChangeTextDocument', changeData).then(serverTag =>
        {
            let tag = tagFromServerTag(serverTag);
            let data: ITibEditorData = {
                changes,
                tag,
                text,
                editor
            };
            _inProcess = true;
            tibEdit([insertAutoCloseTags, insertSpecialSnippets, upcaseFirstLetter], data).then(() =>
            {
                _inProcess = false;
                updateDocumentOnServer();
            });
        });
    });

    vscode.workspace.onWillSaveTextDocument(x =>
    {
        if (x.document.languageId == 'tib' && x.document.isDirty) // сохранение изменённого документа
        {
            unlockDocument(x.document);
        }
    })

    vscode.workspace.onDidSaveTextDocument(x =>
    {
        if (x.languageId == 'tib') lockDocument(x);
    });

    vscode.workspace.onDidCloseTextDocument(x =>
    {
        if (x.languageId == 'tib') unlockDocument(x, true);
    })

    Promise.all(waitFor).then(() => 
    {
        _outChannel.logToOutput("Активация клиентской части завершена");
    });

    _currentStatus.setInfoMessage("Tiburon XML Helper запущен!", 3000);
}


export function deactivate()
{
    unlockAllDocuments();
}



/** Сбор необходимых данных */
async function getStaticData()
{
    try 
    {
        // получаем информацию о пользователе
        _userInfo = getUserData();
        // сохраняем нужные значения
        _settings = new ExtensionSettings();
        if (!pathExists(LogPath)) _outChannel.logToOutput("Отчёты об ошибках сохранятся не будут. Путь недоступен.", _WarningLogPrefix);
        _useLinq = _settings.Item("useLinq");

        // получаем фунцию форматирования C#
        let csharpfixformat = vscode.extensions.all.find(x => x.id == "Leopotam.csharpfixformat");
        if (!!csharpfixformat) getCSFormatter(csharpfixformat).then(formatter => { CSFormatter = formatter });
        else _outChannel.logToOutput("Расширение 'Leopotam.csharpfixformat' не установлено, C# будет форматироваться, как простой текст", _WarningLogPrefix);

        // запускаем бота
        let dataPath = LogPath + "\\data.json";
        if (pathExists(dataPath))
        {
            let data = JSON.parse(fs.readFileSync(dataPath).toString());
            if (!!data)
            {
                _bot = new TelegramBot(data, function (res)
                {
                    if (!res) _outChannel.logToOutput("Отправка логов недоступна", _WarningLogPrefix);
                });
            }
        }

        // инициализируем errors
        _errors = new TibErrors(_bot, _outChannel);
    } catch (er)
    {
        logError("Ошибка при инициализации расширения", true)
    }
}



//#endregion



/*---------------------------------------- registerProvider ----------------------------------------*/
//#region


async function registerCommands()
{
	/*vscode.commands.registerCommand('tib.debug', () => 
	{
		execute("http://debug.survstat.ru/Survey/Adaptive/?fileName=" + editor.document.fileName);
	});*/


    // команда для тестирования на отладке
    registerCommand('tib.debugTestCommand', () => 
    {
        return new Promise<void>((resolve, reject) =>
        {
            if (_pack != "debug") return;
            // выполняем дебажный тест
            debug.test();
            resolve();
        });
    }, false);

    // выделение Answer из текста
    registerCommand('tib.getAnswers', () => 
    {
        return createElements(SurveyElementType.Answer);
    });

    // выделение Item из текста
    registerCommand('tib.getItems', () => 
    {
        return createElements(SurveyElementType.ListItem);
    });


    // выделение ближайшего <тега>
    registerCommand('tib.selectTag.closest', () => 
    {
        let editor = vscode.window.activeTextEditor;
        let document = createServerDocument(editor.document);
        let prom = editor.selections.forEachAsync(selection =>
        {
            return new Promise<vscode.Selection>((resolve) =>
            {
                getCurrentTag(editor.document, selection.active).then(tag =>
                {
                    if (!tag) return resolve();
                    let from = tag.OpenTagRange.start;
                    var cl = findCloseTag("<", tag.Name, ">", document, translatePosition(document, from, 1));
                    if (!cl) return resolve();
                    let to = cl.end;
                    let range = createSelection(from, to);
                    resolve(range);
                });
            })
        });
        prom.then(newSels => { editor.selections = newSels.filter(s => !!s); });
        return prom;
    });

    // выделение родительского <тега>
    registerCommand('tib.selectTag.global', () => 
    {
        let editor = vscode.window.activeTextEditor;
        let document = createServerDocument(editor.document);
        let prom = editor.selections.forEachAsync(selection =>
        {
            return new Promise<vscode.Selection>((resolve) =>
            {
                let txt = getPreviousText(document, selection.active);
                getCurrentTag(editor.document, selection.active, txt).then(tag =>
                {
                    if (!tag || tag.Parents.length < 1) return resolve();
                    // если это первый вложенный тег
                    let par: string;
                    let from: server.Position;
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
                    let cl = findCloseTag("<", par, ">", document, translatePosition(document, from, 1));
                    if (!cl) return resolve();
                    let to = cl.end;
                    let range = createSelection(from, to);;
                    resolve(range);
                });
            });
        });
        prom.then(newSels => { editor.selections = newSels.filter(s => !!s); });
        return prom;
    });

    // оборачивание в [тег]
    registerCommand('tib.insertTag', () => 
    {
        _inProcess = true;
        return new Promise<void>((resolve, reject) =>
        {
            vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString("[${1:u}$2]$TM_SELECTED_TEXT[/${1:u}]")).then(() => 
            {
                _inProcess = false;
                resolve();
            });
        });
    });

    registerCommand('tib.cdata', () => 
    {
        return new Promise<void>((resolve, reject) =>
        {
            try
            {
                _inProcess = true;
                let multi = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection).indexOf("\n") > -1;
                let pre = multi ? "\n" : " ";
                let post = multi ? "\n" : " ";
                vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString("<![CDATA[" + pre + "$TM_SELECTED_TEXT" + post + "]]>")).then(() => 
                {
                    _inProcess = false;
                    resolve();
                });
            } catch (error)
            {
                logError("Ошибка при оборачивании в CDATA", true);
                resolve();
            }
        });
    });

    registerCommand('tib.surveyBlock', () => 
    {
        return new Promise<void>((resolve, reject) =>
        {
            _inProcess = true;
            let newSel = selectLines(vscode.window.activeTextEditor.document, vscode.window.activeTextEditor.selection);
            if (!!newSel) vscode.window.activeTextEditor.selection = newSel;
            vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString("<!--#block $1 -->\n\n$0$TM_SELECTED_TEXT\n\n<!--#endblock-->")).then(() => 
            {
                _inProcess = false;
                resolve();
            });
        });
    });

    //Удаление айди вопроса в заголовках вопроса
    registerCommand('tib.remove.QuestionIds', () =>
    {
        return new Promise<void>((resolve, reject) =>
        {
            let editor = vscode.window.activeTextEditor;
            _currentStatus.setProcessMessage("Удаление Id из заголовков...").then(x =>
            {
                try
                {
                    let text = editor.document.getText();
                    let res = TibDocumentEdits.RemoveQuestionIds(text);
                    applyChanges(getFullRange(editor.document), res, editor).then(() =>
                    {
                        _currentStatus.removeCurrentMessage();
                        resolve();
                    });
                } catch (error)
                {
                    _currentStatus.removeCurrentMessage();
                    logError("Ошибка при удалении Id вопроса из заголовка", true)
                    resolve();
                }
                x.dispose();
            })
        });
    });

    registerCommand('tib.transform.AnswersToItems', () => 
    {
        return new Promise<void>((resolve, reject) =>
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
                multiPaste(editor, editor.selections, results).then(() => { resolve(); });
            }
            catch (error)
            {
                logError("Ошибка преобразования AnswersToItems", true);
                resolve();
            }
        });
    });

    registerCommand('tib.transform.ItemsToAnswers', () => 
    {
        return new Promise<void>((resolve, reject) =>
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
                multiPaste(editor, editor.selections, results).then(() => { resolve(); });
            }
            catch (error)
            {
                logError("Ошибка преобразования ItemsToAnswers", true);
                resolve();
            }
        });
    });


    //Отсортировать List
    registerCommand('tib.transform.SortList', () =>
    {
        return new Promise<void>((resolve, reject) =>
        {
            let editor = vscode.window.activeTextEditor;
            _currentStatus.setProcessMessage("Сортировка списка...").then(x =>
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
                        if (typeof x !== 'undefined')
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


                            applyChanges(editor.selection, res, editor, true).then(() =>
                            {
                                _currentStatus.removeCurrentMessage();
                                resolve();
                            });	  //заменяем текст
                        }
                        else resolve();
                    });
                } catch (error)
                {
                    logError("Ошибка при сортировке листа", true);
                    resolve();
                }
                x.dispose();
            });
        });
    });

    //преобразовать в список c возрастом
    registerCommand('tib.transform.ToAgeList', () =>
    {
        return new Promise<void>((resolve, reject) =>
        {
            let editor = vscode.window.activeTextEditor;
            try
            {
                let text = editor.document.getText(editor.selection);
                let res = TibDocumentEdits.ToAgeList(text);
                // TODO: убрать, когда появится принудительное форматирование многострочности
                res = res.replace(/(<((Item)|(\/List)))/g, "\n$1");
                applyChanges(editor.selection, res, editor, true).then(() => { resolve(); });
            } catch (error)
            {
                logError("Ошибка в преобразовании возрастного списка", true);
                resolve();
            }
        });
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
        return commentAllBlocks(selections);
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
        return commentAllBlocks(selections);
    });

    registerCommand('tib.paste', () => 
    {
        return new Promise<void>((resolve, reject) =>
        {
            _inProcess = true;
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
                multiLinePaste(editor, lines).then(() => { resolve(); });
            }
            else
            {
                lines = pre.map(s => { return s.trim() });
                if (lines.filter(l => { return l.indexOf("\t") > -1; }).length == lines.length)
                {
                    vscode.window.showQuickPick(["Да", "Нет"], { placeHolder: "Разделить запятыми?" }).then(x =>
                    {
                        multiLinePaste(editor, lines, x == "Да").then(() => { resolve(); });
                    });
                }
                else multiLinePaste(editor, lines).then(() => { resolve(); });
            }
        });
    });

    registerCommand('tib.demo', () => 
    {
        return new Promise<void>((resolve, reject) =>
        {
            //vscode.commands.executeCommand("vscode.open", vscode.Uri.file(_DemoPath));
            let path = _settings.Item("demoPath");
            if (!path)
            {
                logError("Невозможно получить доступ к файлу демки", true);
                return resolve();
            }
            _currentStatus.setProcessMessage("Открывается демка...").then(x =>
            {
                openFileText(path).then(() => _currentStatus.removeCurrentMessage()).then(() =>
                {
                    x.dispose();
                    resolve();
                });
            });
        });
    });

    //Создание tibXML шаблона
    registerCommand('tib.template', () =>
    {
        return new Promise<void>((resolve, reject) =>
        {
            let templatePathFolder = _settings.Item("templatePathFolder") + '\\';
            if (!templatePathFolder)
            {
                logError("Невозможно получить доступ к папке", true);
                return resolve();
            }

            let tibXMLFiles = fs.readdirSync(templatePathFolder).filter(x =>
            {
                let state = fs.statSync(templatePathFolder + x);
                return !state.isDirectory();
            })

            vscode.window.showQuickPick(tibXMLFiles, { placeHolder: "Выберите шаблон" }).then(x =>
            {
                openFileText(templatePathFolder + x);
                resolve();
            });
        });
    });

    // переключение Linq
    registerCommand('tib.linqToggle', () => 
    {
        return new Promise<void>((resolve, reject) =>
        {
            _useLinq = !_useLinq;
            vscode.window.showInformationMessage("Подстановка Linq " + (_useLinq ? "включена" : "отключена"));
            resolve();
        });
    }, false);

    vscode.languages.registerDocumentFormattingEditProvider('tib', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[]
        {
            if (!_clientIsReady) return [];
            _currentStatus.setProcessMessage("Форматирование...").then(x => 
            {
                let editor = vscode.window.activeTextEditor;
                let range;
                let indent;
                new Promise<void>((resolve, reject) =>
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
                }).then(() =>
                {
                    let text = document.getText(range);
                    Formatting.format(text, Language.XML, _settings, "\t", indent).then(
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
                            logError(er, true);
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


/** добавление отступов при нажатии enter между > и < */
async function makeIndent()
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


interface ITibEditorData
{
    changes: ContextChange[];
    editor: vscode.TextEditor;
    tag: CurrentTag;
    text: string;
}

type TibEditor = (data: ITibEditorData) => Thenable<any>[];

/** Выполняет все переданные функции по очереди */
function tibEdit(funcs: TibEditor[], data: ITibEditorData): Promise<void>
{
    return new Promise<void>((resolve) =>
    {
        (function callNext(restFuncs: TibEditor[])
        {
            if (restFuncs.length > 0)
            {
                Promise.all(restFuncs.pop()(data)).then(() =>
                {
                    callNext(restFuncs);
                });
            }
            else return resolve();
        })(funcs);
    });
}

/** автоматическое закрывание <тегов> */
function insertAutoCloseTags(data: ITibEditorData): Thenable<any>[]
{
    let res: Thenable<any>[] = [];

    if (!data.tag || !data.editor || !data.changes || data.changes.length == 0) return res;
    let fullText = data.editor.document.getText();

    // сохраняем начальное положение
    let prevSels = data.editor.selections;

    let changesCount = 0;

    // проверяем только рандомный tag (который передаётся из activate), чтобы не перегружать процесс
    // хреново но быстро
    if (!data.tag.Body || data.tag.Body.trim().length == 0 || data.tag.GetLaguage() != Language.CSharp || data.tag.InCSString())
    {
        data.changes.forEach(change =>
        {
            let originalPosition = change.Active.translate(0, 1);
            if (change.Change.text == ">")
            {
                let curLine = getCurrentLineText(data.editor.document, originalPosition);
                let prev = curLine.substr(0, change.Active.character + 1);
                let after = curLine.substr(change.Active.character + 1);
                let result = prev.match(/<(\w+)[^>\/]*>?$/);
                if (!result) return;
                // проверяем, не закрыт ли уже этот тег
                let afterFull = fullText.substr(data.editor.document.offsetAt(originalPosition));
                let tagOp = positiveMin(afterFull.indexOf("<" + result[1] + " "), afterFull.indexOf("<" + result[1] + ">"), -1);
                let tagCl = positiveMin(afterFull.indexOf("</" + result[1] + " "), afterFull.indexOf("</" + result[1] + ">"), -1);

                if ((tagCl == -1 || tagOp > -1 && tagOp < tagCl) || result[1].match(/^(Repeat)|(Condition)|(Block)$/))
                {
                    let closed = after.match(new RegExp("^[^<]*(<\\/)?" + safeString(result[1])));
                    if (!closed)
                    {
                        changesCount++;
                        let snp = data.editor.insertSnippet(new vscode.SnippetString("</" + result[1] + ">"), originalPosition, { undoStopAfter: false, undoStopBefore: false });
                        res.push(snp);
                        snp.then(() =>
                        {
                            // ожидаем конца всех изменений
                            if (changesCount <= 1)
                            {
                                data.editor.selections = prevSels;
                            }
                            else changesCount--;
                        });
                    }
                }
            }
        });
    }

    return res;
}


function insertSpecialSnippets(data: ITibEditorData): Thenable<any>[]
{
    let res: Thenable<any>[] = [];
    if (!data.tag || !data.editor || !data.changes || data.changes.length == 0) return res;

    let change = data.changes[0].Change.text;
    let positions = data.editor.selections.map(x => new vscode.Position(x.active.line, x.active.character + 1));
    let lang = data.tag.GetLaguage();


    // удаление лишней скобки
    let newPos = data.changes[0].Active.translate(0, 1);
    let nextCharRange = new vscode.Range(newPos, newPos.translate(0, 1));
    let nextChar = data.editor.document.getText(nextCharRange);
    if (nextChar == "]" && change[change.length - 1] == "]")
    {
        let results: string[] = [];
        let sels: vscode.Selection[] = [];
        data.changes.forEach(ch =>
        {
            let newPosC = ch.Active.translate(0, 1);
            let nextCharRangeC = new vscode.Selection(newPosC, newPosC.translate(0, 1));
            results.push("");
            sels.push(nextCharRangeC);
        });
        res.push(multiPaste(data.editor, sels, results));
    }

    // закрывание скобок
    // автозакрывание этих скобок отключено для языка tib, чтобы нормально закрывать теги
    if (isScriptLanguage(lang) && !data.tag.InString() && change[change.length - 1] == "[")
    {
        let snp = data.editor.insertSnippet(new vscode.SnippetString("$0]"), data.changes.map(x => x.Selection.active.translate(0, 1)));
        res.push(snp);
    }

    // закрывание [тегов]
    let tagT = data.text.match(/\[([a-zA-Z]\w*(#)?)(\s[^\]\[]*)?(\/)?\]$/);
    if
        (
        change == "]" &&
        !!tagT &&
        !!tagT[1] &&
        !tagT[4] &&
        (data.tag.GetLaguage() != Language.CSharp || data.tag.InCSString() || !!tagT[2]) &&
        (!!tagT[2] || ((data.tag.Parents.join("") + data.tag.Name).indexOf("CustomText") == -1)) &&
        !Parse.isSelfClosedTag(tagT[1])
    )
    {
        let str = tagT[2] ? "$0;[/c#]" : "$0[/" + tagT[1] + "]";
        let snp = data.editor.insertSnippet(new vscode.SnippetString(str), positions);
        res.push(snp);
    }

    return res;
}

/** Делает первую букву тега заглавной */
function upcaseFirstLetter(data: ITibEditorData): Thenable<any>[]
{
    let res: Thenable<any>[] = [];
    // если хоть одна позиция такова, то нафиг
    if (!data.tag || !data.changes || data.changes.length == 0 || !_settings.Item("upcaseFirstLetter") || data.tag.GetLaguage() != Language.XML || inCDATA(data.editor.document, data.editor.selection.active)) return res;
    let tagRegex = /(<\/?)(\w+)$/;
    let nullPosition = new vscode.Position(0, 0);
    try
    {
        let replaces: { Range: vscode.Range, Value: string }[] = [];

        data.changes.forEach(change =>
        {
            let text = data.editor.document.getText(new vscode.Range(nullPosition, change.Active));
            let lastTag = text.match(tagRegex);
            if (!lastTag) return;
            let up = lastTag[2];
            up = up[0].toLocaleUpperCase(); // делаем первую заглавной
            if (lastTag[2].length > 1) up += lastTag[2][1].toLocaleLowerCase(); // убираем вторую заглавную
            let pos = data.editor.document.positionAt(lastTag.index).translate(0, lastTag[1].length);
            let range = new vscode.Range(
                pos,
                pos.translate(0, up.length)
            );
            replaces.push({ Range: range, Value: up });
        });

        res.push(data.editor.edit(builder =>
        {
            replaces.forEach(element =>
            {
                builder.replace(element.Range, element.Value);
            });
        }));

    } catch (error)
    {
        logError("Ошибка при добавлении заглавной буквы", true);
    }
    return res;
}



//#endregion



/*---------------------------------------- доп. функции ----------------------------------------*/
//#region



/** Возвращает `null`, если тег не закрыт или SelfClosed */
function findCloseTag(opBracket: string, tagName: string, clBracket: string, document: server.TextDocument, position: server.Position): server.Range
{
    try
    {
        let fullText = document.getText();
        let prevText = getPreviousText(document, position);
        let res = Parse.findCloseTag(opBracket, tagName, clBracket, prevText, fullText);
        if (!res || !res.Range) return null;
        let startPos = document.positionAt(res.Range.From);
        let endPos = document.positionAt(res.Range.To + 1);
        return server.Range.create(startPos, endPos);
    } catch (error)
    {
        logError("Ошибка выделения закрывающегося тега", false);
    }
    return null;
}


/** getCurrentTag для debug (без try-catch) */
function __getCurrentTag(document: vscode.TextDocument, position: vscode.Position, text?: string, force = false): Promise<CurrentTag>
{
    return new Promise<CurrentTag>((resolve) =>
    {
        let fields: IProtocolTagFields = {
            uri: document.uri.toString(),
            position,
            text,
            force
        };

        createRequest<IProtocolTagFields, CurrentTag>('currentTag', fields).then(data =>
        {
            if (!data) return;
            let tag = tagFromServerTag(data);
            resolve(tag);
        });
    });
}

/** Обработка `CurrentTag`, приехавшего с сервера */
function tagFromServerTag(tag: CurrentTag): CurrentTag
{
    let newTag = ClientServerTransforms.FromServer.Tag(tag);
    if (!!_settings.Item("showTagInfo")) _currentStatus.setTagInfo(newTag);
    return newTag;
}


/** Самое главное в этом расширении */
async function getCurrentTag(document: vscode.TextDocument, position: vscode.Position, txt?: string, force = false): Promise<CurrentTag>
{
    if (_pack == "debug") return await __getCurrentTag(document, position, txt, force);

    let tag: CurrentTag;
    try
    {
        tag = await __getCurrentTag(document, position, txt, force);
    }
    catch (error)
    {
        logError("Ошибка определения положения в XML", false);
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
        logError("Ошибка получения текста текущей строки", false);
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
        logError("Ошибка при выделении элемента", false);
        return null;
    }
    return new vscode.Selection(
        new vscode.Position(selection.start.line, 0),
        new vscode.Position(selection.end.line, document.lineAt(selection.end.line).range.end.character)
    );
}


/** Возвращает закомментированный выделенный фрагмент */
async function commentBlock(editor: vscode.TextEditor, selection: vscode.Selection): Promise<string>
{
    let document = editor.document;
    let text = document.getText(selection);
    let tagFrom = await getCurrentTag(document, selection.start);
    let tagTo = await getCurrentTag(document, selection.end);
    if (!tagFrom || !tagTo)
    {
        logError("Ошибка получения границ выделения", false);
        return text;
    }
    let langFrom = tagFrom.GetLaguage();
    let langTo = tagTo.GetLaguage();
    if (langFrom != langTo)
    {
        showWarning("Начало и конец выделенного фрагмента лежат в разных языковых областях. Команда отменена.");
        return text;
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

    function checkInnerComments(text: string): boolean
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
        return text;
    }

    return newText;
}


/** Последовательное комментирование выделенных фрагментов */
function commentAllBlocks(selections: vscode.Selection[]): Promise<string[]>
{
    let editor = vscode.window.activeTextEditor;
    editor.selections = selections; // это изменённые выделения
    let result = selections.forEachAsync(selection =>
    {
        return commentBlock(editor, selection);
    });
    result.then(results => { multiPaste(editor, editor.selections, results) });
    return result;
}


/**
 * Заменяет текст
 * @param selection выделение в котором заменить текст (или позиция куда вставить)
 * @param text новый текст
 * */
function pasteText(editor: vscode.TextEditor, selection: vscode.Selection, text: string): Thenable<boolean>
{
    return editor.edit((editBuilder) =>
    {
        try
        {
            editBuilder.replace(selection, text);
        }
        catch (error)
        {
            logError("Ошибка замены текста в выделении", true);
        }
    }, { undoStopAfter: false, undoStopBefore: false })
}


/** Замена (вставка) элементов из `lines` в соответствующие выделения `selections` */
async function multiPaste(editor: vscode.TextEditor, selections: vscode.Selection[], lines: string[]): Promise<void>
{
    if (selections.length != lines.length) return showWarning('Количесво выделенных областей не совпадает с количеством вставляемых строк');

    /** функция для рекурсивной вставки */
    async function pasteLines(selections: vscode.Selection[], lines: string[])
    {
        await pasteText(editor, selections.pop(), lines.pop());
        if (selections.length > 0) await pasteLines(selections, lines);
    };

    // Сортируем оба массива так, чтобы вставлялось снизу вверх
    let sortingData = selections.orderBy((a: vscode.Selection, b: vscode.Selection) =>
    {
        let lineD = b.active.line - a.active.line;
        if (lineD != 0) return lineD;
        return b.active.character - a.active.character;
    });
    let newSelections = sortingData.Array;
    let newLines = sortingData.IndexOrder.map(i => lines[i]);

    await pasteLines(newSelections, newLines);
}


// вынесенный кусок из комманды вставки
async function multiLinePaste(editor: vscode.TextEditor, lines: string[], separate: boolean = false): Promise<void>
{
    if (separate) lines = lines.map(s => { return s.replace(/\t/g, ",") });
    await multiPaste(editor, editor.selections.sort((a, b) => { let ld = a.start.line - b.start.line; return ld == 0 ? a.start.character - b.start.character : ld; }), lines);
    // ставим курсор в конец
    editor.selections = editor.selections.map(sel => { return new vscode.Selection(sel.end, sel.end) });
}


/** сообщение (+ отчёт) об ошибке */
function logError(text: string, showErrror: boolean)
{
    let error = new Error().stack;
    let editor = vscode.window.activeTextEditor;
    let data = getLogData(editor);
    _errors.logError(text, data, error, showErrror);
}


/** Возвращает FileName+Postion+FullText */
function getLogData(edt?: vscode.TextEditor): LogData
{
    let res: LogData;
    try
    {
        let editor = edt || vscode.window.activeTextEditor;
        res = new LogData({
            UserData: _userInfo,
            FileName: editor.document.fileName,
            Postion: editor.selection.active,
            FullText: editor.document.getText()
        });
        res.UserName = _userInfo.Name;
    } catch (error)
    {
        let data = new LogData(null);
        data.add({ StackTrace: error });
        _errors.saveError("Ошибка при сборе сведений", data);
    }
    return res;
}



/** получаем функцию для форматирования C# */
async function getCSFormatter(ext: vscode.Extension<any>): Promise<ICSFormatter>
{
    if (!ext.isActive) await ext.activate();
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
    _inProcess = true;
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
            res = await Formatting.format(res, Language.XML, _settings, "\t", ind);
            return applyChanges(sel, res, editor, false);
        }
        catch (error)
        {
            logError("Ошибка при форматировании изменённого фрагмента", false);
        }
    }
    _inProcess = false;
    return res;
}



/** Проверки документа */
function checkDocument(editor: vscode.TextEditor)
{
    /* if (!_refused.enableCache && !_settings.Item("enableCache") && editor.document.lineCount > 5000)
    {
        yesNoHelper("Включить кэширование? Кеширование позволяет ускорить работу с большими документами таких функций расширения, как автозавершение, подсказки при вводе и т.д.").then((res) => 
        {
            if (res) _settings.Set("enableCache", true).then(null, (er) => { logError("Ошибка при изменении конфигурации", true) });
            else _refused.enableCache = true;
        })
    } */
}


function yesNoHelper(text: string): Promise<boolean>
{
    return new Promise<boolean>((resolve) =>
    {
        if (_settings.Item("showHelpMessages")) vscode.window.showInformationMessage(text, "Да", "Нет").then((res) =>
        {
            resolve(res == "Да");
        });
        else resolve(false);
    });
}


/** Запрещает редактирование */
function lockDocument(document: vscode.TextDocument, log = false, force = false)
{
    try
    {
        if (!_settings.Item("enableFileLock")) return;
        let noLock = (_settings.Item("doNotLockFiles") as string[]);
        let path = new Path(document.fileName);
        let docPath = path.FullPath;
        if (document.languageId == "tib" && (!fileIsLocked(docPath) || force))
        {
            if (!!noLock && noLock.contains(docPath)) return;
            lockFile(docPath);
            createLockInfoFile(path, _userInfo);
            if (!_lockedFiles.contains(docPath)) _lockedFiles.push(docPath);
            if (log) _outChannel.logToOutput(`Файл "${path.FileName}" заблокирован для других пользователей.`);
        }
    } catch (error)
    {
        logError("Не удалось заблокировать документ", true);
    }

}


/** Разрешает редактирование */
function unlockDocument(document: vscode.TextDocument, log = false)
{
    try
    {
        let path = new Path(document.fileName);
        let docPath = path.FullPath;
        if (document.languageId == "tib" && _lockedFiles.contains(docPath))
        {
            unlockFile(docPath);
            removeLockInfoFile(path);
            if (log) _outChannel.logToOutput(`Файл "${path.FileName}" разблокирован`);
            _lockedFiles.remove(docPath);
        }
    } catch (error)
    {
        logError("Не удалось разблокировать документ", true);
    }
}

/** Документ заблокирован и НЕ находится в LockedFiles */
function isLocked(document: vscode.TextDocument): boolean
{
    let docPath = new Path(document.fileName).FullPath;
    return !_lockedFiles.contains(docPath) && fileIsLocked(docPath);
}


/** разрешает редактирование всех активных документов */
function unlockAllDocuments()
{
    _lockedFiles.forEach(file =>
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
            if (data.User == _userInfo.Name)
            {
                if (data.Id == _userInfo.Id) return lockDocument(document, true, true);
                _outChannel.logToOutput(`Файл ${path.FileName} занят пользователем с таким же именем (${data.User}).`);
                yesNoHelper(`Файл ${strPath} занят пользователем ${user}. Возможно, он остался заблокированным после прерывания работы расширения. Разблокировать?`).then(res => { if (res) lockDocument(document, true, true); });
                return;
            }
        }
        message = message + user + "";
        showWarning(message);
    }
    else
    {
        _outChannel.logToOutput(`Файл ${path.FileName} открыт в режиме только для чтения. Информация не найдена.`);
        yesNoHelper(`Файл ${strPath} защищён от записи. Разрешить запись?`).then(res =>
        {
            if (res) lockDocument(document, true, true);
        });
    }
}


/** Возвращает длинный или короткий путь к файлу согласно настройке 'showFullPath' */
function getFilePathForMessage(path: string)
{
    let res = path;
    if (!_settings.Item("showFullPath")) res = new Path(path).FileName;
    return `"${res}"`;
}


/** Заменяет выделенный текст на Answers/Items */
async function createElements(elementType: SurveyElementType)
{
    try
    {
        let editor = vscode.window.activeTextEditor;
        if (editor.selections.length > 1)
        {
            showWarning('Данная команда не поддерживает мультикурсор');
            return;
        }
        let text = editor.document.getText(editor.selection);
        let res = TibDocumentEdits.createElements(text, elementType);

        _inProcess = true;
        let tag = await getCurrentTag(editor.document, editor.selection.active);
        let indent = !!tag ? tag.GetIndent() : 1;
        Formatting.format(res.value, Language.XML, _settings, "\t", indent).then(x =>
        {
            res.value = x;
            vscode.window.activeTextEditor.insertSnippet(res).then(() => { _inProcess = false });
        });
    } catch (error)
    {
        logError("Ошибка преобразования текста в XML-элементы", true);
    }
}


/** Настройка соединения с сервером */
async function createClientConnection(context: vscode.ExtensionContext)
{
    try
    {
        let serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
        let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

        let serverOptions: client.ServerOptions = {
            run: { module: serverModule, transport: client.TransportKind.ipc },
            debug: {
                module: serverModule,
                transport: client.TransportKind.ipc,
                options: debugOptions
            }
        };

        let clientOptions: client.LanguageClientOptions = {
            documentSelector: [{ scheme: 'file', language: 'tib' }, { scheme: 'untitled', language: 'tib' }]
        };

        // Create the language client and start the client.
        _client = new client.LanguageClient(
            'tib server',
            serverOptions,
            clientOptions
        );

        _client.start();
        _client.onReady().then(() =>
        {

            _client.onNotification("client.out", data =>
            {
                if (typeof data != 'string') _outChannel.logToOutput('Неправильный тип данных для логов с сервера', _WarningLogPrefix);
                _outChannel.logToOutput(data);
            });

            _client.onNotification("console.log", data =>
            {
                console.log(data);
            });

            // отчёт об ошибках
            _client.onNotification("logError", (data: IErrorLogData) =>
            {
                let logData = getLogData(vscode.window.activeTextEditor);
                logData.add({ StackTrace: data.Error });
                _errors.logError(data.Message, logData, null, !data.Silent);
            });

            // запрос документа с ссервера
            _client.onRequest('getDocument', (uri: string) =>
            {
                return new Promise<IServerDocument>((resolve, reject) =>
                {
                    vscode.workspace.openTextDocument(vscode.Uri.parse(uri)).then(doc =>
                    {
                        resolve(ClientServerTransforms.ToServer.Document(doc));
                    }, err => { reject(err) });
                });
            })

            // получен tag
            _client.onNotification("currentTag", (data: CurrentTag) =>
            {
                if (!data) return;
                // собственно, просто показываем инфу
                tagFromServerTag(data);
            });


            _clientIsReady = true;

        });
    } catch (error)
    {
        logError("Ошибка при подключении к серверной части расширения", true);
    }
}


/** Запрос к серверу */
async function createRequest<T, R>(name: string, data: T, waitForServerIsReady = false): Promise<R>
{
    if (!_clientIsReady)
    {
        if (waitForServerIsReady) await _client.onReady();
        else return undefined;
    }
    return _client.sendRequest<R>(name, data);
}


/** Отправка данных на сервер */
async function sendNotification<T>(name: string, data: T, waitForServerIsReady = false)
{
    if (!_clientIsReady)
    {
        if (waitForServerIsReady) await _client.onReady();
        else return undefined;
    }
    return _client.sendNotification(name, data);
}


function createServerDocument(document: vscode.TextDocument): server.TextDocument;
function createServerDocument(data: IServerDocument): server.TextDocument;

function createServerDocument(document: vscode.TextDocument | IServerDocument): server.TextDocument
{
    let text: string = !document['getText'] ? document['content'] : document['getText']();
    return server.TextDocument.create(document.uri.toString(), 'tib', document.version, text);
}

function createSelection(from: server.Position, to: server.Position): vscode.Selection
{
    return new vscode.Selection(new vscode.Position(from.line, from.character), new vscode.Position(to.line, to.character))
}


interface CodeActionCallback
{
    Arguments?: any[];
    Enabled: boolean;
}


type ArgumentsInvoker = ((document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext) => CodeActionCallback);

/** Создаёт комманду и CodeAction для неё */
async function createCommandActionPair(cmdName: string, actionTitle: string, commandFunction: (...args) => Promise<any>, argumentInvoker: ArgumentsInvoker): Promise<void>
{
    registerCommand(cmdName, commandFunction);
    createCodeAction(actionTitle, cmdName, argumentInvoker);
}


/** Создаёт команду для быстрых исправлений (жёлтая лампочка) */
async function createCodeAction(actionTitle: string, commandName: string, argumentInvoker: ArgumentsInvoker)
{
    vscode.languages.registerCodeActionsProvider('tib', {
        provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext)
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


/** Создаёт команды + CodeActions */
async function registerActionCommands()
{

    // транслитерация
    createCommandActionPair("tib.translateRange", "Транслитерация",
        (range: vscode.Range) => new Promise<void>((resolve, reject) =>
        {
            let editor = vscode.window.activeTextEditor;
            let text = editor.document.getText(range);
            let res = translate(text);
            editor.edit(builder =>
            {
                builder.replace(range, res);
            }).then(() => { resolve(); });
        }),
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
        (range: vscode.Range) => new Promise<void>((resolve, reject) =>
        {
            let editor = vscode.window.activeTextEditor;
            let text = editor.document.getText(range);
            let res = text;
            let matches = text.matchAll(/_([a-zA-Z@\-\(\)]?)/);
            matches.forEach(element =>
            {
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
            }).then(() => { resolve(); });
        }),
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


/** Отправка документа на сервер */
async function updateDocumentOnServer()
{
    let editor = vscode.window.activeTextEditor;
    let doc = editor.document;
    let documentData = ClientServerTransforms.ToServer.Document(doc);
    let position = ClientServerTransforms.ToServer.Position(editor.selection.active);
    let text = getPreviousText(createServerDocument(doc), position);

    let changeData: OnDidChangeDocumentData = {
        document: documentData,
        currentPosition: position,
        previousText: text
    };

    createRequest<OnDidChangeDocumentData, CurrentTag>('onDidChangeTextDocument', changeData).then(serverTag =>
    {
        tagFromServerTag(serverTag);
    });
    return sendNotification('forceDocumentUpdate', documentData);
}



/** Создаёт команду только для языка tib */
async function registerCommand(name: string, command: (...args) => Promise<any>, updateDocument = true): Promise<void>
{
    await vscode.commands.registerCommand(name, (...argArray: any[]) => 
    {
        if (!isTib()) return;
        let result = command(...argArray);
        if (updateDocument) result.then(() =>
        {
            updateDocumentOnServer();
        });
    });
}


//#endregion
