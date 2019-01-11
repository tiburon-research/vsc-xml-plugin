'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var vscode = require("vscode");
var AutoCompleteArray = require("./autoComplete");
var tib_classes_1 = require("tib-classes");
var Encoding = require("../../modules/TibClasses/lib/encoding");
var Parse = require("../../modules/TibClasses/lib/parsing");
var Formatting = require("./formatting");
var fs = require("fs");
var TibJQuery_1 = require("./TibJQuery");
var debug = require("./debug");
//import { registerActionCommands } from './diagnostic'
var tib_constants_1 = require("tib-constants");
var surveyObjects_1 = require("./surveyObjects");
var TibDocumentEdits = require("./documentEdits");
var cache_1 = require("./cache");
var client = require("vscode-languageclient");
var path = require("path");
/*---------------------------------------- глобальные переменные ----------------------------------------*/
//#region
var _client;
var clientIsReady = false;
/** объект для управления ботом */
var bot;
exports.bot = bot;
// константы
/** Соответствие {{Elements}} и функции для получения */
var _ElementFunctions = {
    Questions: getAllQuestions,
    QuestionTypes: getQuestionTypes,
    Pages: getAllPages,
    Lists: getAllLists,
    MixIds: getAllMixIds
};
var $ = TibJQuery_1.initJQuery();
/** Во избежание рекурсивыных изменений */
var InProcess = false;
/** Путь для сохранения логов */
var _LogPath;
exports._LogPath = _LogPath;
/** функция для форматирования C# из расширения Leopotam.csharpfixformat */
var CSFormatter;
exports.CSFormatter = CSFormatter;
var TibAutoCompleteList = new tib_classes_1.KeyedCollection();
/** Список всех для C# (все перегрузки отдельно) */
var CodeAutoCompleteArray = [];
/** Список классов, типов, структу и т.д. */
var ClassTypes = [];
var Methods = new tib_classes_1.TibMethods();
/** Список Id */
var CurrentNodes = new tib_classes_1.SurveyNodes();
/** Список MixId (подставляется в значениях атрибутов) */
var MixIds = [];
/** Настройки расширения */
var Settings;
exports.Settings = Settings;
/** флаг использования Linq */
var _useLinq = true;
/** Объект для кэша объектов */
var Cache;
/** Имена документов из Include */
var Includes = [];
/** Канал вывода */
var OutChannel = vscode.window.createOutputChannel("tib");
exports.OutChannel = OutChannel;
/** Объект для хранения пользовательских выборов */
var Refused = {
    /** Отказ от включения кэша */
    enableCache: false
};
/** Пути к заблокированным файлам */
var LockedFiles = [];
var CurrentStatus = new tib_classes_1.StatusBar();
//#endregion
/*---------------------------------------- активация ----------------------------------------*/
//#region
function activate(context) {
    tib_classes_1.logToOutput("Начало активации");
    createClientConnection(context);
    var editor = vscode.window.activeTextEditor;
    // обновляем настройки при сохранении
    vscode.workspace.onDidChangeConfiguration(function (event) {
        Settings.Update();
    });
    /** Обновление документа */
    function reload(clearCache) {
        if (clearCache === void 0) { clearCache = true; }
        if (!editor || editor.document.languageId != "tib")
            return;
        try {
            if (clearCache && Cache.Active())
                Cache.Clear();
            getSurveyData(editor.document);
            diagnostic(editor.document);
        }
        catch (er) {
            logError("Ошибка при сборе информации", er);
        }
    }
    /** Документ сменился */
    function anotherDocument(needReload, editor) {
        Includes = [];
        Methods.Clear();
        CurrentNodes.Clear();
        if (!editor || editor.document.languageId != 'tib')
            return;
        if (!editor.document.isUntitled) {
            if (isLocked(editor.document))
                showLockInfo(editor.document);
            else
                lockDocument(editor.document, true);
        }
        checkDocument(editor);
        if (needReload)
            reload();
        InProcess = false;
    }
    // общие дествия при старте расширения
    getStaticData();
    makeIndent();
    autoComplete();
    hoverDocs();
    helper();
    definitions();
    registerCommands();
    //registerActionCommands();
    higlight();
    // для каждого дукумента свои
    reload(false);
    anotherDocument(false, editor);
    // смена документа
    vscode.window.onDidChangeActiveTextEditor(function (neweditor) {
        editor = neweditor;
        anotherDocument(true, neweditor);
    });
    // редактирование документа
    vscode.workspace.onDidChangeTextDocument(function (event) {
        if (InProcess || !editor || event.document.languageId != "tib")
            return;
        var originalPosition = editor.selection.start.translate(0, 1);
        var text = event.document.getText(new vscode.Range(new vscode.Position(0, 0), originalPosition));
        var tag = getCurrentTag(editor.document, originalPosition, text);
        reload(false);
        // преобразования текста
        if (!event || !event.contentChanges.length)
            return;
        var changes;
        try {
            changes = tib_classes_1.getContextChanges(editor.selections, event.contentChanges);
        }
        catch (error) {
            logError(error);
        }
        if (!changes || changes.length == 0)
            return;
        insertAutoCloseTags(changes, editor, tag);
        insertSpecialSnippets(changes, editor, text, tag);
        upcaseFirstLetter(changes, editor, tag);
    });
    vscode.workspace.onWillSaveTextDocument(function (x) {
        if (x.document.isDirty) // сохранение изменённого документа
         {
            unlockDocument(x.document);
        }
    });
    vscode.workspace.onDidSaveTextDocument(function (x) {
        lockDocument(x);
    });
    vscode.workspace.onDidCloseTextDocument(function (x) {
        unlockDocument(x, true);
    });
    tib_classes_1.logToOutput("Активация завершена");
    CurrentStatus.setInfoMessage("Tiburon XML Helper запущен!", 3000);
}
exports.activate = activate;
function deactivate() {
    unlockAllDocuments();
}
exports.deactivate = deactivate;
/** Сбор необходимых данных */
function getStaticData() {
    try {
        // сохраняем нужные значения
        exports.Settings = Settings = new tib_classes_1.ExtensionSettings();
        exports._LogPath = _LogPath = Settings.Item("logPath");
        if (!tib_classes_1.pathExists(_LogPath))
            tib_classes_1.logToOutput("Отчёты об ошибках сохранятся не будут. Путь недоступен.", tib_constants_1._WarningLogPrefix);
        _useLinq = Settings.Item("useLinq");
        Cache = new cache_1.CacheSet();
        // получаем фунцию форматирования C#
        var csharpfixformat_1 = vscode.extensions.all.find(function (x) { return x.id == "Leopotam.csharpfixformat"; });
        if (!!csharpfixformat_1) {
            if (!csharpfixformat_1.isActive)
                csharpfixformat_1.activate().then(function (a) {
                    exports.CSFormatter = CSFormatter = getCSFormatter(csharpfixformat_1);
                });
            else
                getCSFormatter(csharpfixformat_1);
        }
        else
            tib_classes_1.logToOutput("Расширение 'Leopotam.csharpfixformat' не установлено, C# будет форматироваться, как простой текст", tib_constants_1._WarningLogPrefix);
        // запускаем бота
        var dataPath = _LogPath + "\\data.json";
        if (tib_classes_1.pathExists(dataPath)) {
            var data = JSON.parse(fs.readFileSync(dataPath).toString());
            if (!!data) {
                exports.bot = bot = new tib_classes_1.TelegramBot(data, function (res) {
                    if (!res)
                        tib_classes_1.logToOutput("Отправка логов недоступна", tib_constants_1._WarningLogPrefix);
                });
            }
        }
        // получаем AutoComplete
        var tibCode = AutoCompleteArray.Code.map(function (x) { return new tib_classes_1.TibAutoCompleteItem(x); });
        var statCS_1 = [];
        var _loop_1 = function (key) {
            // добавляем сам тип в AutoComplete
            var tp = new tib_classes_1.TibAutoCompleteItem({
                Name: key,
                Kind: "Class",
                Detail: "Тип данных/класс " + key
            });
            statCS_1.push(tp);
            // и в classTypes
            ClassTypes.push(key);
            // добавляем все его статические методы
            var items = AutoCompleteArray.StaticMethods[key];
            items.forEach(function (item) {
                var aci = new tib_classes_1.TibAutoCompleteItem(item);
                aci.Parent = key;
                aci.Kind = "Method";
                statCS_1.push(aci);
            });
        };
        for (var key in AutoCompleteArray.StaticMethods) {
            _loop_1(key);
        }
        // объединённый массив Tiburon + MSDN
        var all = tibCode.concat(statCS_1);
        all.forEach(function (element) {
            var item = new tib_classes_1.TibAutoCompleteItem(element);
            if (!item.Kind || !item.Name)
                return;
            CodeAutoCompleteArray.push(new tib_classes_1.TibAutoCompleteItem(element)); // сюда добавляем всё
            // если такого типа ещё нет, то добавляем
            if (!TibAutoCompleteList.Contains(item.Kind))
                TibAutoCompleteList.AddPair(item.Kind, [item]);
            else // если есть то добавляем в массив с учётом перегрузок
             {
                // ищем индекс элемента с таким же типом, именем и родителем
                var ind = TibAutoCompleteList.Item(item.Kind).findIndex(function (x) {
                    return x.Name == item.Name && (!!x.Parent && x.Parent == item.Parent || !x.Parent && !item.Parent);
                });
                if (ind < 0) {
                    TibAutoCompleteList.Item(item.Kind).push(item);
                }
                else {
                    // добавляем в перегрузку к имеющемуся (и сам имеющийся тоже, если надо)
                    //if (!TibAutoCompleteList.Item(item.Kind)[ind].Overloads) TibAutoCompleteList.Item(item.Kind)[ind].Overloads = [];
                    var len = TibAutoCompleteList.Item(item.Kind)[ind].Overloads.length;
                    if (len == 0) {
                        var parent_1 = new tib_classes_1.TibAutoCompleteItem(TibAutoCompleteList.Item(item.Kind)[ind]);
                        TibAutoCompleteList.Item(item.Kind)[ind].Overloads.push(parent_1);
                        len++;
                    }
                    TibAutoCompleteList.Item(item.Kind)[ind].Overloads.push(item);
                    var doc = "Перегрузок: " + (len + 1);
                    TibAutoCompleteList.Item(item.Kind)[ind].Description = doc;
                    TibAutoCompleteList.Item(item.Kind)[ind].Documentation = doc;
                }
            }
        });
    }
    catch (er) {
        logError("Ошибка при инициализации расширения", er);
    }
}
//#endregion
/*---------------------------------------- registerProvider ----------------------------------------*/
//#region
function registerCommands() {
    /*vscode.commands.registerCommand('tib.debug', () =>
    {
        execute("http://debug.survstat.ru/Survey/Adaptive/?fileName=" + editor.document.fileName);
    });*/
    // команда для тестирования на отладке
    tib_classes_1.registerCommand('tib.debugTestCommand', function () {
        if (tib_constants_1._pack != "debug")
            return;
        // выполняем дебажный тест
        debug.test();
    });
    // выделение Answer из текста
    tib_classes_1.registerCommand('tib.getAnswers', function () {
        createElements(surveyObjects_1.SurveyElementType.Answer);
    });
    // выделение Item из текста
    tib_classes_1.registerCommand('tib.getItems', function () {
        createElements(surveyObjects_1.SurveyElementType.ListItem);
    });
    // выделение ближайшего <тега>
    tib_classes_1.registerCommand('tib.selectTag.closest', function () {
        var editor = vscode.window.activeTextEditor;
        var newSels = [];
        editor.selections.forEach(function (selection) {
            var tag = getCurrentTag(editor.document, selection.active);
            if (!tag)
                return;
            var from = tag.OpenTagRange.start;
            var cl = findCloseTag("<", tag.Name, ">", editor.document, from.translate(0, 1));
            if (!cl)
                return;
            var to = cl.end;
            var range = new vscode.Selection(from, to);
            newSels.push(range);
        });
        editor.selections = newSels;
    });
    // выделение родительского <тега>
    tib_classes_1.registerCommand('tib.selectTag.global', function () {
        var newSels = [];
        var editor = vscode.window.activeTextEditor;
        editor.selections.forEach(function (selection) {
            var txt = getPreviousText(editor.document, selection.active);
            var tag = getCurrentTag(editor.document, selection.active, txt);
            if (!tag || tag.Parents.length < 1)
                return;
            // если это первый вложенный тег
            var par;
            var from;
            if (tag.Parents.length == 1) {
                par = tag.Name;
                from = tag.OpenTagRange.start;
            }
            else {
                par = tag.Parents[1].Name;
                from = tag.Parents[1].OpenTagRange.start;
            }
            var cl = findCloseTag("<", par, ">", editor.document, from.translate(0, 1));
            if (!cl)
                return;
            var to = cl.end;
            var range = new vscode.Selection(from, to);
            var res = selectLines(editor.document, range);
            newSels.push(range);
        });
        editor.selections = newSels;
    });
    // оборачивание в [тег]
    tib_classes_1.registerCommand('tib.insertTag', function () {
        InProcess = true;
        vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString("[${1:u}$2]$TM_SELECTED_TEXT[/${1:u}]")).then(function () {
            InProcess = false;
        });
    });
    tib_classes_1.registerCommand('tib.cdata', function () {
        try {
            InProcess = true;
            var multi = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection).indexOf("\n") > -1;
            var pre = multi ? "\n" : " ";
            var post = multi ? "\n" : " ";
            vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString("<![CDATA[" + pre + "$TM_SELECTED_TEXT" + post + "]]>")).then(function () {
                InProcess = false;
            });
        }
        catch (error) {
            logError("Ошибка при оборачивании в CDATA");
        }
    });
    tib_classes_1.registerCommand('tib.commentBlock', function () {
        InProcess = true;
        var newSel = selectLines(vscode.window.activeTextEditor.document, vscode.window.activeTextEditor.selection);
        if (!!newSel)
            vscode.window.activeTextEditor.selection = newSel;
        vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString("<!--#block $1 -->\n\n$0$TM_SELECTED_TEXT\n\n<!--#endblock-->")).then(function () {
            InProcess = false;
        });
    });
    //Удаление айди вопроса в заголовках вопроса
    tib_classes_1.registerCommand('tib.remove.QuestionIds', function () {
        var editor = vscode.window.activeTextEditor;
        CurrentStatus.setProcessMessage("Удаление Id из заголовков...").then(function (x) {
            try {
                var text = editor.document.getText();
                var res = TibDocumentEdits.RemoveQuestionIds(text);
                applyChanges(getFullRange(editor.document), res, editor).then(function () { return CurrentStatus.removeCurrentMessage(); });
            }
            catch (error) {
                CurrentStatus.removeCurrentMessage();
                logError("Ошибка при удалении Id вопроса из заголовка", error);
            }
            x.dispose();
        });
    });
    tib_classes_1.registerCommand('tib.transform.AnswersToItems', function () {
        var editor = vscode.window.activeTextEditor;
        try {
            var results_1 = [];
            editor.selections.forEach(function (selection) {
                var text = editor.document.getText(selection);
                var res = TibDocumentEdits.AnswersToItems(text);
                results_1.push(res);
            });
            multiPaste(editor, editor.selections, results_1);
        }
        catch (error) {
            logError("Ошибка преобразования AnswersToItems", error);
        }
    });
    tib_classes_1.registerCommand('tib.transform.ItemsToAnswers', function () {
        var editor = vscode.window.activeTextEditor;
        try {
            var results_2 = [];
            editor.selections.forEach(function (selection) {
                var text = editor.document.getText(selection);
                var res = TibDocumentEdits.ItemsToAnswers(text);
                results_2.push(res);
            });
            multiPaste(editor, editor.selections, results_2);
        }
        catch (error) {
            logError("Ошибка преобразования ItemsToAnswers", error);
        }
    });
    //Отсортировать List
    tib_classes_1.registerCommand('tib.transform.SortList', function () {
        var editor = vscode.window.activeTextEditor;
        CurrentStatus.setProcessMessage("Сортировка списка...").then(function (x) {
            try {
                var sortBy = ["Id", "Text"]; //элементы сортировки
                var text_1 = editor.document.getText(editor.selection); //Берём выделенный текст
                var varCount = TibDocumentEdits.getVarCountFromList(text_1); //Получаем количество Var'ов
                for (var i = 0; i < varCount; i++) { //заполняем Var'ы
                    sortBy.push("Var(" + i + ")");
                }
                vscode.window.showQuickPick(sortBy, { placeHolder: "Сортировать по" }).then(function (x) {
                    if (typeof x !== typeof undefined) {
                        var res = void 0;
                        var attr = x;
                        if (attr.includes("Var")) {
                            var index = parseInt(attr.match(/\d+/)[0]);
                            res = TibDocumentEdits.sortListBy(text_1, "Var", index);
                        }
                        else {
                            res = TibDocumentEdits.sortListBy(text_1, x); //сортируем
                        }
                        res = res.replace(/(<((Item)|(\/List)))/g, "\n$1"); //форматируем xml
                        applyChanges(editor.selection, res, editor, true).then(function () { return CurrentStatus.removeCurrentMessage(); }); //заменяем текст
                    }
                });
            }
            catch (error) {
                logError("Ошибка при сортировке листа", error);
            }
            x.dispose();
        });
    });
    //преобразовать в список c возрастом
    tib_classes_1.registerCommand('tib.transform.ToAgeList', function () {
        var editor = vscode.window.activeTextEditor;
        try {
            var text = editor.document.getText(editor.selection);
            var res = TibDocumentEdits.ToAgeList(text);
            // TODO: убрать, когда появится принудительное форматирование многострочности
            res = res.replace(/(<((Item)|(\/List)))/g, "\n$1");
            applyChanges(editor.selection, res, editor, true);
        }
        catch (error) {
            logError("Ошибка в преобразовании возрастного списка", error);
        }
    });
    // комментирование блока
    tib_classes_1.registerCommand('editor.action.blockComment', function () {
        var editor = vscode.window.activeTextEditor;
        var selections = editor.selections;
        // отсортированные от начала к концу выделения
        if (selections.length > 1)
            selections = selections.sort(function (a, b) {
                return editor.document.offsetAt(b.active) - editor.document.offsetAt(a.active);
            });
        commentAllBlocks(selections);
    });
    // комментирование строки
    tib_classes_1.registerCommand('editor.action.commentLine', function () {
        var editor = vscode.window.activeTextEditor;
        var selections = editor.selections;
        if (selections.length > 1) {
            // отсортированные от начала к концу выделения
            selections = selections.sort(function (a, b) {
                return editor.document.offsetAt(b.active) - editor.document.offsetAt(a.active);
            });
        }
        // выделяем строки
        selections = selections.map(function (x) {
            var line = editor.document.lineAt(x.active.line);
            var from = line.range.start;
            var spaces = line.text.match(/^(\s+)\S/);
            if (!!spaces)
                from = from.translate(0, spaces[1].length);
            return new vscode.Selection(from, line.range.end);
        });
        // для каждого выделения
        //InProcess = true;
        commentAllBlocks(selections);
    });
    tib_classes_1.registerCommand('tib.paste', function () {
        InProcess = true;
        var txt = tib_classes_1.getFromClioboard();
        if (txt.match(/[\s\S]*\n$/))
            txt = txt.replace(/\n$/, '');
        var pre = txt.split("\n");
        var lines = [];
        var editor = vscode.window.activeTextEditor;
        if (pre.length != editor.selections.length) {
            for (var i = 0; i < editor.selections.length; i++) {
                lines.push(txt);
            }
            multiLinePaste(editor, lines);
        }
        else {
            lines = pre.map(function (s) { return s.trim(); });
            if (lines.filter(function (l) { return l.indexOf("\t") > -1; }).length == lines.length) {
                vscode.window.showQuickPick(["Да", "Нет"], { placeHolder: "Разделить запятыми?" }).then(function (x) {
                    multiLinePaste(editor, lines, x == "Да");
                });
            }
            else
                multiLinePaste(editor, lines);
        }
    });
    tib_classes_1.registerCommand('tib.demo', function () {
        //vscode.commands.executeCommand("vscode.open", vscode.Uri.file(_DemoPath));
        var path = Settings.Item("demoPath");
        if (!path) {
            logError("Невозможно получить доступ к файлу демки");
            return;
        }
        CurrentStatus.setProcessMessage("Открывается демка...").then(function (x) {
            tib_classes_1.openFileText(path).then(function (x) { return CurrentStatus.removeCurrentMessage(); }).then(function (res) {
                x.dispose();
            });
        });
    });
    //Создание tibXML шаблона
    tib_classes_1.registerCommand('tib.template', function () {
        var templatePathFolder = Settings.Item("templatePathFolder") + '\\';
        if (!templatePathFolder) {
            logError("Невозможно получить доступ к папке");
            return;
        }
        var tibXMLFiles = fs.readdirSync(templatePathFolder).filter(function (x) {
            var state = fs.statSync(templatePathFolder + x);
            return !state.isDirectory();
        });
        vscode.window.showQuickPick(tibXMLFiles, { placeHolder: "Выберите шаблон" }).then(function (x) {
            tib_classes_1.openFileText(templatePathFolder + x);
        });
    });
    // переключение Linq
    tib_classes_1.registerCommand('tib.linqToggle', function () {
        _useLinq = !_useLinq;
        vscode.window.showInformationMessage("Подстановка Linq " + (_useLinq ? "включена" : "отключена"));
    });
    vscode.languages.registerDocumentFormattingEditProvider('tib', {
        provideDocumentFormattingEdits: function (document) {
            CurrentStatus.setProcessMessage("Форматирование...").then(function (x) {
                var editor = vscode.window.activeTextEditor;
                var range;
                var indent;
                // либо весь документ
                if (editor.selection.start.isEqual(editor.selection.end)) {
                    range = getFullRange(document);
                    indent = 0;
                }
                else {
                    // либо выделяем строки целиком
                    var sel = selectLines(document, editor.selection);
                    editor.selection = sel;
                    range = sel;
                    var tag = getCurrentTag(document, sel.start);
                    if (!tag)
                        indent = 0;
                    else
                        indent = tag.GetIndent();
                }
                var text = document.getText(range);
                Formatting.format(text, tib_classes_1.Language.XML, Settings, "\t", indent).then(function (res) {
                    vscode.window.activeTextEditor.edit(function (builder) {
                        builder.replace(range, res);
                        x.dispose();
                    });
                }, function (er) {
                    logError(er);
                    x.dispose();
                });
            });
            // provideDocumentFormattingEdits по ходу не умеет быть async, поэтому выкручиваемся так
            return [];
        }
    });
}
/** Подсветка открывающегося и закрывающегося элементов */
function higlight() {
    // теги
    vscode.languages.registerDocumentHighlightProvider('tib', {
        provideDocumentHighlights: function (document, position) {
            var text = getPreviousText(document, position);
            var tag = getCurrentTag(document, position, text);
            if (!tag)
                return;
            var curRange = document.getWordRangeAtPosition(position);
            var word = document.getText(curRange);
            if (word == "CDATA")
                return;
            if (tag.GetLaguage() == tib_classes_1.Language.CSharp && word != 'c#')
                return; // такой костыль потому что при нахождении на [/c#] хз что там дальше и tag.CSMode == true
            var res = [];
            var fullText = document.getText();
            var after = getCurrentLineText(document, position).substr(position.character);
            var mt = text.match(/(((\[)|(<))\/?)\w*$/);
            if (!mt)
                return;
            var ind = -1;
            var range;
            switch (mt[1]) {
                case "<":
                    {
                        // открывающийся
                        var endpos = document.positionAt(fullText.indexOf(">", text.length) + 1);
                        curRange = new vscode.Range(curRange.start.translate(0, -1), endpos);
                        res.push(new vscode.DocumentHighlight(curRange));
                        // закрывающийся
                        if (!after.match(/^[^>]*\/>/) && !Parse.isSelfClosedTag(word)) {
                            range = findCloseTag("<", word, ">", document, position);
                            if (range)
                                res.push(new vscode.DocumentHighlight(range));
                        }
                        break;
                    }
                case "[":
                    {
                        // открывающийся
                        var endpos = document.positionAt(fullText.indexOf("]", text.length) + 1);
                        curRange = new vscode.Range(curRange.start.translate(0, -1), endpos);
                        res.push(new vscode.DocumentHighlight(curRange));
                        // закрывающийся
                        if (!after.match(/^[^\]]*\/\]/) && !Parse.isSelfClosedTag(word)) {
                            range = findCloseTag("[", word, "]", document, position);
                            if (range)
                                res.push(new vscode.DocumentHighlight(range));
                        }
                        break;
                    }
                case "</":
                    {
                        // закрывающийся
                        var endpos = document.positionAt(fullText.indexOf(">", text.length) + 1);
                        curRange = new vscode.Range(curRange.start.translate(0, -2), endpos);
                        res.push(new vscode.DocumentHighlight(curRange));
                        // открывающийся
                        range = findOpenTag("<", word, ">", document, position);
                        if (range)
                            res.push(new vscode.DocumentHighlight(range));
                        break;
                    }
                case "[/":
                    {
                        // закрывающийся
                        var endpos = document.positionAt(fullText.indexOf("]", text.length) + 1);
                        curRange = new vscode.Range(curRange.start.translate(0, -2), endpos);
                        res.push(new vscode.DocumentHighlight(curRange));
                        // открывающийся
                        range = findOpenTag("[", word, "]", document, position);
                        if (range)
                            res.push(new vscode.DocumentHighlight(range));
                        break;
                    }
            }
            return res;
        }
    });
    // блоки
    vscode.languages.registerDocumentHighlightProvider('tib', {
        provideDocumentHighlights: function (document, position) {
            var res = [];
            var lineText = getCurrentLineText(document, position);
            var reg = lineText.match(/<!--#(end)?block.*-->/);
            if (!reg)
                return res;
            if (reg.index > position.character || reg.index + reg[0].length < position.character)
                return res;
            var nextRange;
            var prevRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(position.line, 0));
            var prevText = document.getText(prevRange);
            if (!!reg[1]) {
                var res_1 = prevText.matchAll(/<!--#block.*-->/);
                if (!res_1 || res_1.length == 0)
                    return res_1;
                var match = res_1.last();
                nextRange = new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length));
            }
            else {
                var offset = prevText.length;
                var after_1 = document.getText().slice(offset);
                var res_2 = after_1.match(/<!--#endblock-->/);
                if (!res_2)
                    return res_2;
                nextRange = new vscode.Range(document.positionAt(offset + res_2.index), document.positionAt(offset + res_2.index + res_2[0].length));
            }
            var thisRange = new vscode.Range(new vscode.Position(position.line, reg.index), new vscode.Position(position.line, reg.index + reg[0].length));
            res.push(new vscode.DocumentHighlight(thisRange));
            res.push(new vscode.DocumentHighlight(nextRange));
            return res;
        }
    });
}
/** Автозавершения */
function autoComplete() {
    // XML Snippets
    vscode.languages.registerCompletionItemProvider('tib', {
        provideCompletionItems: function (document, position, token, context) {
            var completionItems = [];
            var tag = getCurrentTag(document, position);
            if (tag && tag.GetLaguage() == tib_classes_1.Language.XML) {
                var text = getPreviousText(document, position, true);
                // XML Features
                if (tag.OpenTagIsClosed && text.match(/\b_\w*$/)) {
                    return AutoCompleteArray.XMLFeatures.map(function (x) { return tib_classes_1.snippetToCompletitionItem(x); });
                }
                var curOpenMatch = text.match(/<(\w+)$/);
                if (!curOpenMatch)
                    return;
                var opening = curOpenMatch[1].toLocaleLowerCase();
                //Item Snippet
                if ("item".indexOf(opening) > -1) {
                    var parent_2;
                    var _loop_2 = function (key) {
                        if (!!tag.Parents.find(function (x) { return x.Name == key; })) {
                            parent_2 = key;
                            return "break";
                        }
                    };
                    for (var key in tib_constants_1.ItemSnippets) {
                        var state_1 = _loop_2(key);
                        if (state_1 === "break")
                            break;
                    }
                    if (!parent_2 || !tib_constants_1.ItemSnippets[parent_2])
                        parent_2 = "List";
                    var res = new vscode.SnippetString(extractElements(tib_constants_1.ItemSnippets[parent_2]));
                    if (res) {
                        var ci = new vscode.CompletionItem("Item", vscode.CompletionItemKind.Snippet);
                        ci.detail = "Структура Item для " + parent_2;
                        ci.insertText = res;
                        //ci.additionalTextEdits = [vscode.TextEdit.replace(range, "")];
                        completionItems.push(ci);
                    }
                }
                // Answer Snippet
                else if ("answer".indexOf(opening) > -1) {
                    var ci = new vscode.CompletionItem("Answer", vscode.CompletionItemKind.Snippet);
                    var ciS = new vscode.CompletionItem("AnswerShort", vscode.CompletionItemKind.Snippet);
                    var iterator = "1";
                    var text_2 = "$2";
                    if (tag.LastParent && tag.LastParent.Name == "Repeat") {
                        var source = tag.LastParent.getRepeatSource();
                        ci.detail = "Полная структура Answer в Repeat по " + source;
                        ciS.detail = "Краткая структура Answer в Repeat по " + source;
                        iterator = source == "List" ? "@ID" : "@Itera";
                        text_2 = source == "List" ? "@Text" : "@Itera";
                    }
                    else {
                        ci.detail = "Полная структура Answer";
                        ciS.detail = "Краткая структура Answer";
                    }
                    // полный вариант
                    ci.insertText = new vscode.SnippetString("Answer Id=\"${1:" + iterator + "}\"><Text>${2:" + text_2 + "}</Text></Answer>");
                    completionItems.push(ci);
                    // краткий вариант
                    ciS.insertText = new vscode.SnippetString("Answer Id=\"${1:" + iterator + "}\"/>");
                    completionItems.push(ciS);
                }
            }
            return completionItems;
        },
        resolveCompletionItem: function (item, token) {
            return item;
        }
    });
    //Attributes
    vscode.languages.registerCompletionItemProvider('tib', {
        provideCompletionItems: function (document, position, token, context) {
            var completionItems = [];
            var tag = getCurrentTag(document, position);
            if (!!tag && tag.GetLaguage() == tib_classes_1.Language.XML && !tag.OpenTagIsClosed && !tag.InString() && AutoCompleteArray.Attributes[tag.Id]) {
                var existAttrs_1 = tag.AttributeNames();
                var textAfter = document.getText().slice(document.offsetAt(position));
                var attrs = textAfter.match(tib_constants_1.RegExpPatterns.RestAttributes);
                var nameOnly_1 = !!textAfter.match(/^=["']/);
                var nexAttrs_1 = [];
                if (!!attrs)
                    nexAttrs_1 = tib_classes_1.CurrentTag.GetAttributesArray(attrs[0]).Keys();
                AutoCompleteArray.Attributes[tag.Id].filter(function (x) { return nexAttrs_1.indexOf(x.Name) + existAttrs_1.indexOf(x.Name) < -1; }).forEach(function (element) {
                    var attr = new tib_classes_1.TibAttribute(element);
                    var ci = attr.ToCompletionItem(function (query) {
                        return safeValsEval(query);
                    }, nameOnly_1);
                    completionItems.push(ci);
                });
            }
            return completionItems;
        },
        resolveCompletionItem: function (item, token) {
            return item;
        }
    }, " ");
    //Functions, Variables, Enums, Classes, Custom Methods, C# Snippets, Types, node Ids
    vscode.languages.registerCompletionItemProvider('tib', {
        provideCompletionItems: function (document, position, token, context) {
            var completionItems = [];
            var tag = getCurrentTag(document, position);
            if (!tag)
                return;
            var curLine = getPreviousText(document, position, true);
            var mt = curLine.match(/(#|\$)?\w*$/);
            var lang = tag.GetLaguage();
            if (!mt)
                return;
            if (lang != tib_classes_1.Language.CSharp && mt[1] != "$")
                return;
            //пропускаем объявления
            if (Parse.isMethodDefinition(curLine))
                return;
            var str = getCurrentLineText(document, position).substr(position.character);
            if (mt[1] == "$") {
                // добавляем snippet для $repeat
                var ci_1 = new vscode.CompletionItem("repeat", vscode.CompletionItemKind.Snippet);
                ci_1.detail = "Строчный repeat";
                ci_1.insertText = new vscode.SnippetString("repeat(${1|" + getAllLists().join(',') + "|}){${2:@ID}[${3:,}]}");
                completionItems.push(ci_1);
                // добавляем snippet для $place
                ci_1 = new vscode.CompletionItem("place", vscode.CompletionItemKind.Snippet);
                ci_1.detail = "Указатель на вложенный вопрос";
                ci_1.insertText = new vscode.SnippetString("place(${1|" + getAllQuestions().join(',') + "|})");
                completionItems.push(ci_1);
                // добавляем стандартные константы
                if (lang == tib_classes_1.Language.CSharp && !tag.CSSingle())
                    tib_constants_1.XMLEmbeddings.forEach(function (x) {
                        ci_1 = new vscode.CompletionItem(x.Name, vscode.CompletionItemKind.Constant);
                        if (!!x.Type)
                            ci_1.detail = x.Type;
                        ci_1.documentation = x.Title;
                        completionItems.push(ci_1);
                    });
            }
            var customMethods = Methods.CompletionArray();
            if (customMethods && !tag.InCSString())
                completionItems = completionItems.concat(customMethods); //Custom Methods
            // если начинается с $, то больше ничего не надо
            if (mt[1] == "$")
                return completionItems;
            //C# Featrues
            if (mt[1] == "#") {
                AutoCompleteArray.CSFeatures.forEach(function (element) {
                    completionItems.push(tib_classes_1.snippetToCompletitionItem(element));
                });
            }
            if (!tag.CSSingle() && !curLine.match(/\w+\.\w*$/)) {
                if (!tag.InCSString()) {
                    var ar = TibAutoCompleteList.Item("Function").concat(TibAutoCompleteList.Item("Variable"), TibAutoCompleteList.Item("Enum"), TibAutoCompleteList.Item("Class"), TibAutoCompleteList.Item("Type"), TibAutoCompleteList.Item("Struct"));
                    var adBracket_1 = !str.match(/\w*\(/);
                    ar.forEach(function (element) {
                        if (element)
                            completionItems.push(element.ToCompletionItem(adBracket_1));
                    });
                    //C# Snippets
                    AutoCompleteArray.CSSnippets.forEach(function (element) {
                        completionItems.push(tib_classes_1.snippetToCompletitionItem(element));
                    });
                }
                else //node Ids
                 {
                    var qt = curLine.lastIndexOf('"');
                    if (qt > -1) // от недоверия к tag.InCSString()
                     {
                        var stuff = curLine.substr(0, qt);
                        var match = stuff.match(/((CurrentSurvey\.Lists\[)|(Page\s*=)|(Question\s*=))\s*$/);
                        var matchResults = {
                            List: 2,
                            Page: 3,
                            Question: 4
                        };
                        if (!!match) {
                            var resultMatch = match.findIndex(function (val, index) { return index > 1 && !!val; });
                            switch (resultMatch) {
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
                            tib_constants_1._NodeStoreNames.forEach(function (name) {
                                completionItems = completionItems.concat(CurrentNodes.CompletitionItems(name));
                            });
                        }
                    }
                }
            }
            return completionItems;
        },
        resolveCompletionItem: function (item, token) {
            return item;
        }
    }, "\"", "", "$", "#");
    //Properties, Methods, EnumMembers, Linq
    vscode.languages.registerCompletionItemProvider('tib', {
        provideCompletionItems: function (document, position, token, context) {
            var completionItems = [];
            var tag = getCurrentTag(document, position);
            if (!!tag && tag.GetLaguage() == tib_classes_1.Language.CSharp && !tag.InCSString() && !tag.CSSingle()) {
                var lastLine_1 = getPreviousText(document, position, true);
                var ar = TibAutoCompleteList.Item("Property").concat(TibAutoCompleteList.Item("Method"), TibAutoCompleteList.Item("EnumMember"));
                var str = getCurrentLineText(document, position).substr(position.character);
                var needClose_1 = !str.match(/\w*\(/);
                var mt = lastLine_1.match(/(\w+)\.w*$/);
                var parent_3;
                if (!!mt && !!mt[1])
                    parent_3 = mt[1];
                ar.forEach(function (element) {
                    var m = false;
                    if (element.Parent) {
                        var reg = new RegExp(element.Parent + "\\.\\w*$");
                        m = !!lastLine_1.match(reg);
                    }
                    if (m && (!element.ParentTag || element.ParentTag == tag.Name))
                        completionItems.push(element.ToCompletionItem(needClose_1, "__" + element.Name));
                });
                // добавляем Linq
                if (lastLine_1.match(/\.\w*$/) && (!parent_3 || ClassTypes.indexOf(parent_3) == -1) && _useLinq) {
                    var linqAr = TibAutoCompleteList.Item("Method").filter(function (x) { return x.Parent == "Enumerable"; }).map(function (x) { return x.ToCompletionItem(needClose_1, "zzz" + x.Name); });
                    completionItems = completionItems.concat(linqAr);
                }
            }
            return completionItems;
        },
        resolveCompletionItem: function (item, token) {
            return item;
        }
    }, ".");
    //Значения атрибутов
    vscode.languages.registerCompletionItemProvider('tib', {
        provideCompletionItems: function (document, position, token, context) {
            var completionItems = [];
            var tag = getCurrentTag(document, position);
            if (!tag || tag.OpenTagIsClosed)
                return;
            var text = getPreviousText(document, position, true);
            //let needClose = !getCurrentLineText(document, position).substr(position.character).match(/^[\w@]*['"]/);
            var curAttr = text.match(/(\w+)=(["'])(:?\w*)$/);
            if (!curAttr)
                return;
            var atrs = AutoCompleteArray.Attributes[tag.Id];
            if (!atrs)
                return;
            var attr = atrs.find(function (e, i) {
                return e.Name == curAttr[1];
            });
            if (!attr)
                return;
            var attrT = new tib_classes_1.TibAttribute(attr);
            var vals = attrT.ValueCompletitions(function (query) {
                return safeValsEval(query);
            });
            vals.forEach(function (v) {
                var ci = new vscode.CompletionItem(v, vscode.CompletionItemKind.Enum);
                ci.insertText = v;
                completionItems.push(ci);
            });
            return completionItems;
        },
        resolveCompletionItem: function (item, token) {
            return item;
        }
    }, ":", "");
}
/** Подсказки при вводе параметров функции */
function helper() {
    vscode.languages.registerSignatureHelpProvider('tib', {
        provideSignatureHelp: function (document, position, token) {
            var tag = getCurrentTag(document, position);
            if (!tag || tag.GetLaguage() != tib_classes_1.Language.CSharp)
                return;
            var sign = new vscode.SignatureHelp();
            var lastLine = getPreviousText(document, position, true);
            //пропускаем объявления
            if (Parse.isMethodDefinition(lastLine))
                return;
            var ar = TibAutoCompleteList.Item("Function").concat(TibAutoCompleteList.Item("Method"));
            var mtch = lastLine.match(/((^)|(.*\b))(\w+)\([^\(\)]*$/);
            if (!mtch || mtch.length < 4)
                return sign;
            var reg = mtch[1].match(/(\w+)\.$/);
            var parent = !!reg ? reg[1] : null;
            ar.forEach(function (element) {
                if (element.Name == mtch[4] && (element.Kind == vscode.CompletionItemKind[vscode.CompletionItemKind.Function] || !!parent && element.Parent == parent)) {
                    if (element.Overloads.length == 0)
                        sign.signatures.push(element.ToSignatureInformation());
                    else
                        element.Overloads.forEach(function (el) {
                            sign.signatures.push(el.ToSignatureInformation());
                        });
                }
            });
            // Custom Methods
            Methods.SignatureArray(mtch[4]).forEach(function (element) {
                sign.signatures.push(element);
            });
            sign.activeSignature = 0;
            return sign;
        }
    }, "(", ",");
}
/** подсказки при наведении */
function hoverDocs() {
    vscode.languages.registerHoverProvider('tib', {
        provideHover: function (document, position, token) {
            var res = [];
            var range = document.getWordRangeAtPosition(position);
            if (!range)
                return;
            var tag = getCurrentTag(document, range.end);
            if (!tag)
                return;
            if (tag.GetLaguage() != tib_classes_1.Language.CSharp)
                return;
            var text = document.getText(range);
            var parent = null;
            var lastText = getPreviousText(document, position);
            var reg = lastText.match(/(\w+)\.\w*$/);
            if (!!reg) {
                parent = reg[1];
            }
            // надо проверить родителя: если нашёлся static, то только его, иначе всё подходящее
            var suit = CodeAutoCompleteArray.filter(function (x) { return x.Name == text; });
            var staticParens = CodeAutoCompleteArray.filter(function (x) { return x.Kind == vscode.CompletionItemKind[vscode.CompletionItemKind.Class]; }).map(function (x) { return x.Name; });
            if (staticParens.contains(parent)) {
                suit = suit.filter(function (x) {
                    return x.Name == text && (x.Parent == parent);
                });
            }
            for (var i = 0; i < suit.length; i++) {
                if (suit[i].Documentation && suit[i].Description) {
                    var doc = "/* " + suit[i].Description + " */\n" + suit[i].Documentation;
                    res.push({ language: "csharp", value: doc });
                }
                else {
                    if (suit[i].Documentation)
                        res.push({ language: "csharp", value: suit[i].Documentation });
                    if (suit[i].Description)
                        res.push(suit[i].Description);
                }
            }
            var customMethods = Methods.HoverArray(text);
            if (customMethods)
                res = res.concat(customMethods);
            if (res.length == 0)
                return;
            return new vscode.Hover(res, range);
        }
    });
}
/** Делает первую букву тега заглавной */
function upcaseFirstLetter(changes, editor, tag) {
    // если хоть одна позиция такова, то нафиг
    if (!tag || !Settings.Item("upcaseFirstLetter") || tag.GetLaguage() != tib_classes_1.Language.XML || tib_classes_1.inCDATA(editor.document, editor.selection.active))
        return;
    var tagRegex = /(<\/?)(\w+)$/;
    var nullPosition = new vscode.Position(0, 0);
    try {
        var replaces_1 = [];
        changes.forEach(function (change) {
            var text = editor.document.getText(new vscode.Range(nullPosition, change.Active));
            var lastTag = text.match(tagRegex);
            if (!lastTag)
                return;
            var up = lastTag[2];
            up = up[0].toLocaleUpperCase(); // делаем первую заглавной
            if (lastTag[2].length > 1)
                up += lastTag[2][1].toLocaleLowerCase(); // убираем вторую заглавную
            var pos = editor.document.positionAt(lastTag.index).translate(0, lastTag[1].length);
            var range = new vscode.Range(pos, pos.translate(0, up.length));
            replaces_1.push({ Range: range, Value: up });
        });
        editor.edit(function (builder) {
            replaces_1.forEach(function (element) {
                builder.replace(element.Range, element.Value);
            });
        });
    }
    catch (error) {
        logError("Ошибка при добавлении заглавной буквы", error);
    }
}
/** Подсказки и ошибки */
function diagnostic(document) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // if (document.languageId != 'tib' || !Settings.Item('enableDiagnostic')) return Diagnostics.delete(document.uri);
            getServerData('client/getDiagnostic', document);
            return [2 /*return*/];
        });
    });
}
/** Переход к определениям */
function definitions() {
    // C#
    vscode.languages.registerDefinitionProvider('tib', {
        provideDefinition: function (document, position, token) {
            var tag = getCurrentTag(document, position);
            if (!tag || tag.GetLaguage() != tib_classes_1.Language.CSharp || tag.InCSString())
                return;
            var res;
            try {
                var word = document.getText(document.getWordRangeAtPosition(position));
                if (Methods.Contains(word))
                    res = Methods.Item(word).GetLocation();
            }
            catch (error) {
                logError("Ошибка при получении определения метода", error);
            }
            return res;
        }
    });
    // XML узлы
    vscode.languages.registerDefinitionProvider('tib', {
        provideDefinition: function (document, position, token) {
            var res;
            try {
                var word_1 = document.getText(document.getWordRangeAtPosition(position));
                var enabledNodes = ["Page", "List", "Question"];
                enabledNodes.forEach(function (element) {
                    var item = CurrentNodes.GetItem(word_1, element);
                    if (item) {
                        res = item.GetLocation();
                        return res;
                    }
                });
            }
            catch (error) {
                logError("Ошибка при получении определения узла XML", error);
            }
            return res;
        }
    });
    // include
    vscode.languages.registerDefinitionProvider('tib', {
        provideDefinition: function (document, position, token) {
            var tag = getCurrentTag(document, position);
            if (!tag || tag.Name != "Include")
                return;
            var attrs = tag.GetAllAttributes(document);
            var fileName = attrs.Item("FileName");
            if (!fileName)
                return;
            fileName = applyConstants(fileName);
            var res = new vscode.Location(vscode.Uri.file(fileName), new vscode.Position(0, 0));
            return res;
        }
    });
}
/** добавление отступов при нажатии enter между > и < */
function makeIndent() {
    vscode.languages.setLanguageConfiguration('tib', {
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
        onEnterRules: [
            {
                beforeText: new RegExp("<([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)\\s*$", 'i'),
                afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
                action: { indentAction: vscode.IndentAction.IndentOutdent }
            },
            {
                beforeText: new RegExp("<(\\w[\\w\\d]*)([^/>]*(?!/)>)\\s*$", 'i'),
                action: { indentAction: vscode.IndentAction.Indent }
            },
            {
                beforeText: new RegExp("\\[(" + tib_constants_1.RegExpPatterns.SelfClosedTags + ")\\]\\s*", 'i'),
                action: { indentAction: vscode.IndentAction.None }
            },
            {
                beforeText: new RegExp("\\[([a-z]\\w*#?)([^/\\]]*(?!/)\\])\\s*", 'i'),
                afterText: /^\[\/([a-z]\w*#?)\s*\]$/i,
                action: { indentAction: vscode.IndentAction.IndentOutdent }
            },
            {
                beforeText: new RegExp("\\[([a-z]\\w*#?)([^/\\]]*(?!/)\\])\\s*$", 'i'),
                action: { indentAction: vscode.IndentAction.Indent }
            },
        ]
    });
}
/** автоматическое закрывание <тегов> */
function insertAutoCloseTags(changes, editor, tag) {
    if (!tag || InProcess || !editor)
        return;
    var fullText = editor.document.getText();
    // сохраняем начальное положение
    var prevSels = editor.selections.map(function (e) { return new vscode.Selection(e.start.translate(0, 1), e.end.translate(0, 1)); });
    var changesCount = 0;
    // проверяем только рандомный tag (который передаётся из activate), чтобы не перегружать процесс
    // хреново но быстро
    if (!tag.Body || tag.Body.trim().length == 0 || tag.GetLaguage() != tib_classes_1.Language.CSharp || tag.InCSString()) {
        changes.forEach(function (change) {
            var originalPosition = change.Active.translate(0, 1);
            if (change.Change.text == ">") {
                var curLine = getCurrentLineText(editor.document, originalPosition);
                var prev = curLine.substr(0, change.Active.character + 1);
                var after_2 = curLine.substr(change.Active.character + 1);
                var result = prev.match(/<(\w+)[^>\/]*>?$/);
                if (!result)
                    return;
                // проверяем, не закрыт ли уже этот тег
                var afterFull = fullText.substr(editor.document.offsetAt(originalPosition));
                var tagOp = tib_classes_1.positiveMin(afterFull.indexOf("<" + result[1] + " "), afterFull.indexOf("<" + result[1] + ">"), -1);
                var tagCl = tib_classes_1.positiveMin(afterFull.indexOf("</" + result[1] + " "), afterFull.indexOf("</" + result[1] + ">"), -1);
                if ((tagCl == -1 || tagOp > -1 && tagOp < tagCl) || result[1].match(/^(Repeat)|(Condition)|(Block)$/)) {
                    var closed_1 = after_2.match(new RegExp("^[^<]*(<\\/)?" + tib_classes_1.safeString(result[1])));
                    if (!closed_1) {
                        changesCount++;
                        InProcess = true;
                        editor.insertSnippet(new vscode.SnippetString("</" + result[1] + ">"), originalPosition, { undoStopAfter: false, undoStopBefore: false }).then(function () {
                            // ожидаем конца всех изменений
                            if (changesCount <= 1) {
                                editor.selections = prevSels;
                                InProcess = false;
                            }
                            else
                                changesCount--;
                        });
                    }
                }
            }
        });
    }
}
function insertSpecialSnippets(changes, editor, text, tag) {
    if (!tag || InProcess || !editor)
        return;
    var change = changes[0].Change.text;
    var positions = editor.selections.map(function (x) { return new vscode.Position(x.active.line, x.active.character + 1); });
    var lang = tag.GetLaguage();
    // удаление лишней скобки
    var newPos = changes[0].Active.translate(0, 1);
    var nextCharRange = new vscode.Range(newPos, newPos.translate(0, 1));
    var nextChar = editor.document.getText(nextCharRange);
    if (nextChar == "]" && change[change.length - 1] == "]") {
        var results_3 = [];
        var sels_1 = [];
        changes.forEach(function (ch) {
            var newPosC = ch.Active.translate(0, 1);
            var nextCharRangeC = new vscode.Selection(newPosC, newPosC.translate(0, 1));
            results_3.push("");
            sels_1.push(nextCharRangeC);
        });
        multiPaste(editor, sels_1, results_3);
    }
    // закрывание скобок
    // автозакрывание этих скобок отключено для языка tib, чтобы нормально закрывать теги
    if (tib_classes_1.isScriptLanguage(lang) && !tag.InString() && change[change.length - 1] == "[") {
        InProcess = true;
        editor.insertSnippet(new vscode.SnippetString("$0]"), changes.map(function (x) { return x.Selection.active.translate(0, 1); })).then(function () {
            InProcess = false;
        });
    }
    // закрывание [тегов]
    var tagT = text.match(/\[([a-zA-Z]\w*(#)?)(\s[^\]\[]*)?(\/)?\]$/);
    if (change == "]" &&
        !!tagT &&
        !!tagT[1] &&
        !tagT[4] &&
        (tag.GetLaguage() != tib_classes_1.Language.CSharp || tag.InCSString() || !!tagT[2]) &&
        (!!tagT[2] || ((tag.Parents.join("") + tag.Name).indexOf("CustomText") == -1)) &&
        !Parse.isSelfClosedTag(tagT[1])) {
        InProcess = true;
        var str = tagT[2] ? "$0;[/c#]" : "$0[/" + tagT[1] + "]";
        editor.insertSnippet(new vscode.SnippetString(str), positions).then(function () {
            InProcess = false;
        });
    }
}
//#endregion
/*---------------------------------------- доп. функции ----------------------------------------*/
//#region
/** Собирает данные из текущего документа и Includ'ов */
function getSurveyData(document) {
    return __awaiter(this, void 0, void 0, function () {
        var docs, includes, methods, nodes, mixIds, i, doc, _a, mets, nods, mixs, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    docs = [document.fileName];
                    includes = getIncludePaths(document.getText());
                    methods = new tib_classes_1.TibMethods();
                    nodes = new tib_classes_1.SurveyNodes();
                    mixIds = [];
                    // если Include поменялись, то обновляем все
                    if (!Includes || !Includes.equalsTo(includes)) {
                        docs = docs.concat(includes);
                        Includes = includes;
                    }
                    else // иначе обновляем только текущий документ
                     {
                        methods = Methods.Filter(function (name, element) { return element.FileName != document.fileName; });
                        nodes = CurrentNodes.FilterNodes(function (node) { return node.FileName != document.fileName; });
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 11, , 12]);
                    i = 0;
                    _b.label = 2;
                case 2:
                    if (!(i < docs.length)) return [3 /*break*/, 10];
                    if (!(docs[i] == document.fileName)) return [3 /*break*/, 3];
                    _a = document;
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, vscode.workspace.openTextDocument(docs[i])];
                case 4:
                    _a = _b.sent();
                    _b.label = 5;
                case 5:
                    doc = _a;
                    return [4 /*yield*/, tib_classes_1.getDocumentMethods(doc, Settings)];
                case 6:
                    mets = _b.sent();
                    return [4 /*yield*/, tib_classes_1.getDocumentNodeIds(doc, Settings, tib_constants_1._NodeStoreNames)];
                case 7:
                    nods = _b.sent();
                    return [4 /*yield*/, tib_classes_1.getMixIds(doc, Settings)];
                case 8:
                    mixs = _b.sent();
                    methods.AddRange(mets);
                    nodes.AddRange(nods);
                    mixIds = mixIds.concat(mixs);
                    _b.label = 9;
                case 9:
                    i++;
                    return [3 /*break*/, 2];
                case 10:
                    Methods = methods;
                    CurrentNodes = nodes;
                    MixIds = mixIds;
                    return [3 /*break*/, 12];
                case 11:
                    error_1 = _b.sent();
                    logError("Ошибка при сборе сведений о документе", error_1);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
/** Безопасное выполнение eval() */
function safeValsEval(query) {
    var res = [];
    try {
        res = eval(query);
    }
    catch (error) {
        var data = getLogData();
        data.add({ Data: { EvalString: query }, StackTrace: error });
        tib_classes_1.saveError("Не получилось выполнить eval()", data);
    }
    return res;
}
// функции для получения элементов
/** Заменяет {{Elements}} на строку для Snippet */
function extractElements(input) {
    var res = new tib_classes_1.KeyedCollection();
    var match = input.matchAll(/{{(\w+)}}/);
    if (!match || match.length == 0)
        return input;
    match.forEach(function (element) {
        if (!!_ElementFunctions[element[1]] && !res.Contains(element[1])) {
            res.AddPair(element[1], _ElementFunctions[element[1]]());
        }
    });
    var resultStr = input;
    var i = 1;
    res.forEach(function (key, value) {
        resultStr = resultStr.replace(new RegExp("{{" + key + "}}", "g"), "${" + i + "|" + value.join(",") + "|}");
        i++;
    });
    return resultStr;
}
exports.extractElements = extractElements;
function getAllPages() {
    return CurrentNodes.GetIds('Page');
}
function getAllLists() {
    return CurrentNodes.GetIds('List');
}
function getAllQuestions() {
    return CurrentNodes.GetIds('Question');
}
function getQuestionTypes() {
    return tib_constants_1.QuestionTypes;
}
function getAllMixIds() {
    return MixIds;
}
/** Возвращает `null`, если тег не закрыт или SelfClosed */
function findCloseTag(opBracket, tagName, clBracket, document, position) {
    try {
        var fullText = document.getText();
        var prevText = getPreviousText(document, position);
        var res = Parse.findCloseTag(opBracket, tagName, clBracket, prevText, fullText);
        if (!res || !res.Range)
            return null;
        var startPos = document.positionAt(res.Range.From);
        var endPos = document.positionAt(res.Range.To + 1);
        return new vscode.Range(startPos, endPos);
    }
    catch (error) {
        logError("Ошибка выделения закрывающегося тега", error);
    }
    return null;
}
function findOpenTag(opBracket, tagName, clBracket, document, position) {
    try {
        var prevText = getPreviousText(document, position);
        var res = Parse.findOpenTag(opBracket, tagName, clBracket, prevText);
        if (!res)
            return null;
        var startPos = document.positionAt(res.Range.From);
        var endPos = document.positionAt(res.Range.To + 1);
        return new vscode.Range(startPos, endPos);
    }
    catch (error) {
        logError("Ошибка выделения открывающегося тега", error);
        return null;
    }
}
/** getCurrentTag для debug (без try-catch) */
function __getCurrentTag(document, position, txt, force) {
    if (force === void 0) { force = false; }
    var tag;
    var text = txt || getPreviousText(document, position);
    // сначала пытаемся вытащить из кэша (сначала обновить, если позиция изменилась)
    if (!force) {
        if (Cache.Active()) {
            Cache.Update(document, position, text);
            tag = Cache.Tag.Get();
        }
    }
    if (!tag) {
        // собираем тег заново
        var pure = void 0;
        if (!pure)
            pure = tib_classes_1.CurrentTag.PrepareXML(text);
        var ranges = Parse.getParentRanges(document, pure);
        // где-то вне
        if (ranges.length == 0)
            tag = null; //new CurrentTag("XML");
        else {
            var parents = ranges.map(function (range) { return new tib_classes_1.SimpleTag(document, range); });
            /** Последний незакрытый тег */
            var current = parents.pop();
            tag = new tib_classes_1.CurrentTag(current, parents);
            // Заполняем поля
            var lastRange = ranges.last();
            tag.SetFields({
                StartPosition: current.OpenTagRange.start,
                StartIndex: document.offsetAt(current.OpenTagRange.start),
                PreviousText: text,
                Body: tag.OpenTagIsClosed ? document.getText(new vscode.Range(lastRange.end, position)) : undefined,
                LastParent: !!parents && parents.length > 0 ? parents.last() : undefined
            });
        }
    }
    if (!!Settings.Item("showTagInfo"))
        CurrentStatus.setTagInfo(tag);
    return tag;
}
/** Самое главное в этом расширении */
function getCurrentTag(document, position, txt, force) {
    if (force === void 0) { force = false; }
    if (tib_constants_1._pack == "debug")
        return __getCurrentTag(document, position, txt, force);
    var tag;
    try {
        tag = __getCurrentTag(document, position, txt, force);
    }
    catch (error) {
        logError("Ошибка определения положения в XML", error);
        return null;
    }
    return tag;
}
exports.getCurrentTag = getCurrentTag;
function getCurrentLineText(document, position) {
    try {
        var start = new vscode.Position(position.line, 0), end = new vscode.Position(position.line, document.lineAt(position.line).text.length);
        return document.getText(new vscode.Range(start, end));
    }
    catch (error) {
        logError("Ошибка получения текста текущей строки", error);
        return null;
    }
}
/** Получает текст от начала документа до `position` */
function getPreviousText(document, position, lineOnly) {
    if (lineOnly === void 0) { lineOnly = false; }
    try {
        var start = lineOnly ? new vscode.Position(position.line, 0) : new vscode.Position(0, 0), end = new vscode.Position(position.line, position.character);
        return document.getText(new vscode.Range(start, end));
    }
    catch (error) {
        logError("Ошибка получения текста документа", error);
        return null;
    }
}
exports.getPreviousText = getPreviousText;
/** Range всего документа */
function getFullRange(document) {
    return new vscode.Range(0, 0, document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
}
exports.getFullRange = getFullRange;
/** расширяет выделение до границ строк */
function selectLines(document, selection) {
    if (!selection) {
        logError("Ошибка при выделении элемента");
        return null;
    }
    return new vscode.Selection(new vscode.Position(selection.start.line, 0), new vscode.Position(selection.end.line, document.lineAt(selection.end.line).range.end.character));
}
/** Комментирование выделенного фрагмента */
function commentBlock(editor, selection) {
    var document = editor.document;
    var text = document.getText(selection);
    var tagFrom = getCurrentTag(document, selection.start);
    var tagTo = getCurrentTag(document, selection.end);
    if (!tagFrom || !tagTo) {
        logError("Ошибка получения границ выделения");
        return null;
    }
    var langFrom = tagFrom.GetLaguage();
    var langTo = tagTo.GetLaguage();
    if (langFrom != langTo) {
        tib_classes_1.showWarning("Начало и конец выделенного фрагмента лежат в разных языковых областях. Команда отменена.");
        return null;
    }
    var cStart = "<!--";
    var cEnd = "-->";
    if (tib_classes_1.isScriptLanguage(langFrom)) {
        cStart = "/*";
        cEnd = "*/";
    }
    var newText = text;
    //проверяем на наличие комментов внутри
    var inComReg = new RegExp("(" + tib_classes_1.safeString(cStart) + ")|(" + tib_classes_1.safeString(cEnd) + ")");
    var checkInnerComments = function (text) {
        return !text.match(inComReg);
    };
    var valid = checkInnerComments(newText);
    // если это закомментированный, до снимаем комментирование
    if (!valid && newText.match(new RegExp("^\\s*" + tib_classes_1.safeString(cStart) + "[\\S\\s]*" + tib_classes_1.safeString(cEnd) + "\\s*$"))) {
        newText = newText.replace(new RegExp("^(\\s*)" + tib_classes_1.safeString(cStart) + "( ?)([\\S\\s]*)( ?)" + tib_classes_1.safeString(cEnd) + "(\\s*)$"), "$1$3$5");
        valid = checkInnerComments(newText);
    }
    else {
        cStart += " ";
        cEnd = " " + cEnd;
        newText = cStart + newText + cEnd;
    }
    if (!valid) {
        tib_classes_1.showWarning("Внутри выделенной области уже есть комментарии. Команда отменена.");
        return null;
    }
    return newText;
    /* editor.edit((editBuilder) =>
    {
        editBuilder.replace(selection, newText);
    }, { undoStopAfter: false, undoStopBefore: false }).then(() =>
    {
        callback(true);
    }); */
}
/** Последовательное комментирование выделенных фрагментов */
function commentAllBlocks(selections) {
    var results = [];
    var editor = vscode.window.activeTextEditor;
    editor.selections = selections;
    selections.forEach(function (selection) {
        results.push(commentBlock(editor, selection));
    });
    multiPaste(editor, editor.selections, results);
}
/**
 * Заменяет текст
 * @param selection выделение в котором заменить текст (или позиция куда вставить)
 * @param text новый текст
 * @param callback по окончании
 * */
function pasteText(editor, selection, text, callback) {
    editor.edit(function (editBuilder) {
        try {
            editBuilder.replace(selection, text);
        }
        catch (error) {
            logError("Ошибка замены текста в выделении", error);
        }
    }, { undoStopAfter: false, undoStopBefore: false }).then(function () {
        callback();
    });
}
/** Последовательная замена (вставка) элементов из `lines` в соответствующие выделения `selections` */
function multiPaste(editor, selections, lines, callback) {
    pasteText(editor, selections.pop(), lines.pop(), function () {
        if (selections.length == 0) {
            if (!!callback)
                callback();
            return;
        }
        multiPaste(editor, selections, lines, callback);
    });
}
// вынесенный кусок из комманды вставки
function multiLinePaste(editor, lines, separate) {
    if (separate === void 0) { separate = false; }
    if (separate)
        lines = lines.map(function (s) { return s.replace(/\t/g, ","); });
    multiPaste(editor, editor.selections.sort(function (a, b) { var ld = a.start.line - b.start.line; return ld == 0 ? a.start.character - b.start.character : ld; }), lines, function () {
        // ставим курсор в конец
        editor.selections = editor.selections.map(function (sel) { return new vscode.Selection(sel.end, sel.end); });
        InProcess = false;
    });
}
/** сообщение (+ отчёт) об ошибке */
function logError(text, error) {
    var editor = vscode.window.activeTextEditor;
    var data = getLogData(editor);
    tib_classes_1.tibError(text, data, error);
}
exports.logError = logError;
/** Возвращает FileName+Postion+FullText */
function getLogData(edt) {
    var res;
    try {
        var editor = edt || vscode.window.activeTextEditor;
        res = new tib_classes_1.LogData({
            FileName: editor.document.fileName,
            Postion: editor.selection.active,
            FullText: editor.document.getText(),
            CacheEnabled: !!Settings.Item("enableCache")
        });
        var survObj = {
            Methods: Methods.Keys(),
            NodesLength: CurrentNodes.Keys().map(function (x) { return x + ": " + (CurrentNodes.Item(x).length || 0); }),
            MixIds: MixIds,
            Includes: Includes
        };
        res.add({ SurveyData: survObj });
    }
    catch (error) {
        var data = new tib_classes_1.LogData(null);
        data.add({ StackTrace: error });
        tib_classes_1.saveError("Ошибка при сборе сведений", data);
    }
    return res;
}
/** получаем функцию для форматирования C# */
function getCSFormatter(ext) {
    var getOptions = ext.exports['getOptions'];
    var format = ext.exports['process'];
    if (getOptions == undefined || format == undefined) {
        tib_classes_1.showWarning("Модуль форматирования C# не установлен!\nНе найдено расширения C# FixFormat. C# будет форматироваться как обычный текст.");
        return null;
    }
    return function (text) {
        var globalOptions = getOptions({});
        return format(text, globalOptions);
    };
}
/** Заменяет `range` на `text` */
function applyChanges(range, text, editor, format) {
    if (format === void 0) { format = false; }
    return __awaiter(this, void 0, void 0, function () {
        var res, sel, tag, ind, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    InProcess = true;
                    res = text;
                    // вставляем
                    return [4 /*yield*/, editor.edit(function (builder) {
                            builder.replace(range, res);
                        })];
                case 1:
                    // вставляем
                    _a.sent();
                    if (!format) return [3 /*break*/, 5];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    sel = selectLines(editor.document, editor.selection);
                    editor.selection = sel;
                    tag = getCurrentTag(editor.document, sel.start);
                    ind = !!tag ? tag.GetIndent() : 0;
                    return [4 /*yield*/, Formatting.format(res, tib_classes_1.Language.XML, Settings, "\t", ind)];
                case 3:
                    res = _a.sent();
                    return [2 /*return*/, applyChanges(sel, res, editor, false)];
                case 4:
                    error_2 = _a.sent();
                    logError("Ошибка при обновлении текста документа", error_2);
                    return [3 /*break*/, 5];
                case 5:
                    InProcess = false;
                    return [2 /*return*/, res];
            }
        });
    });
}
exports.applyChanges = applyChanges;
/** Обновляет все <Include> */
function getIncludePaths(text) {
    var reg = /<Include[\s\S]*?FileName=(("[^"]+")|('[^']+'))/;
    var txt = text;
    if (Settings.Item("ignoreComments"))
        txt = Encoding.clearXMLComments(txt);
    return txt.matchAll(reg).map(function (x) { return x[1].replace(/(^["'"])|(['"]$)/g, ''); }).filter(function (x) { return tib_classes_1.pathExists(x); });
}
/** Проверки документа */
function checkDocument(editor) {
    if (!Refused.enableCache && !Settings.Item("enableCache") && editor.document.lineCount > 5000) {
        yesNoHelper("Включить кэширование? Кеширование позволяет ускорить работу с большими документами таких функций расширения, как автозавершение, подсказки при вводе и т.д.").then(function (res) {
            if (res)
                Settings.Set("enableCache", true).then(null, function (er) { logError("Ошибка при изменении конфигурации", er); });
            else
                Refused.enableCache = true;
        });
    }
}
function yesNoHelper(text) {
    return new Promise(function (resolve) {
        if (Settings.Item("showHelpMessages"))
            vscode.window.showInformationMessage(text, "Да", "Нет").then(function (res) {
                resolve(res == "Да");
            });
        else
            resolve(false);
    });
}
/** Запрещает редактирование */
function lockDocument(document, log, force) {
    if (log === void 0) { log = false; }
    if (force === void 0) { force = false; }
    if (!Settings.Item("enableFileLock"))
        return;
    var noLock = Settings.Item("doNotLockFiles");
    var path = new tib_classes_1.Path(document.fileName);
    var docPath = path.FullPath;
    if (document.languageId == "tib" && (!tib_classes_1.fileIsLocked(docPath) || force)) {
        if (!!noLock && noLock.contains(docPath))
            return;
        tib_classes_1.lockFile(docPath);
        tib_classes_1.createLockInfoFile(path);
        if (!LockedFiles.contains(docPath))
            LockedFiles.push(docPath);
        if (log)
            tib_classes_1.logToOutput("\u0424\u0430\u0439\u043B \"" + path.FileName + "\" \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D \u0434\u043B\u044F \u0434\u0440\u0443\u0433\u0438\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439.");
    }
}
/** Разрешает редактирование */
function unlockDocument(document, log) {
    if (log === void 0) { log = false; }
    var path = new tib_classes_1.Path(document.fileName);
    var docPath = path.FullPath;
    if (document.languageId == "tib" && LockedFiles.contains(docPath)) {
        tib_classes_1.unlockFile(docPath);
        tib_classes_1.removeLockInfoFile(path);
        if (log)
            tib_classes_1.logToOutput("\u0424\u0430\u0439\u043B \"" + path.FileName + "\" \u0440\u0430\u0437\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D");
        LockedFiles.remove(docPath);
    }
}
/** Документ заблокирован и НЕ находится в LockedFiles */
function isLocked(document) {
    var docPath = new tib_classes_1.Path(document.fileName).FullPath;
    return !LockedFiles.contains(docPath) && tib_classes_1.fileIsLocked(docPath);
}
/** разрешает редактирование всех активных документов */
function unlockAllDocuments() {
    LockedFiles.forEach(function (file) {
        tib_classes_1.unlockFile(file);
        tib_classes_1.removeLockInfoFile(new tib_classes_1.Path(file));
    });
}
function showLockInfo(document) {
    var path = new tib_classes_1.Path(document.fileName);
    var lockPath = tib_classes_1.getLockFilePath(path);
    var strPath = getFilePathForMessage(document.fileName);
    if (fs.existsSync(lockPath)) {
        var data = tib_classes_1.getLockData(lockPath);
        var message = "\u0424\u0430\u0439\u043B " + strPath + " \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442 ";
        var user = "непонятно кто";
        if (!!data && !!data.User) {
            user = data.User;
            if (data.User == tib_classes_1.getUserName()) {
                if (data.Id == tib_classes_1.getUserId())
                    return lockDocument(document, true, true);
                yesNoHelper("\u0424\u0430\u0439\u043B " + strPath + " \u0437\u0430\u043D\u044F\u0442 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u043C " + user + ". \u0412\u043E\u0437\u043C\u043E\u0436\u043D\u043E, \u043E\u043D \u043E\u0441\u0442\u0430\u043B\u0441\u044F \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u043C \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u0435\u0440\u044B\u0432\u0430\u043D\u0438\u044F \u0440\u0430\u0431\u043E\u0442\u044B \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F. \u0420\u0430\u0437\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u0442\u044C?").then(function (res) { if (res)
                    lockDocument(document, true, true); });
                return;
            }
        }
        message = message + user + "";
        tib_classes_1.showWarning(message);
    }
    else {
        yesNoHelper("\u0424\u0430\u0439\u043B " + strPath + " \u0437\u0430\u0449\u0438\u0449\u0451\u043D \u043E\u0442 \u0437\u0430\u043F\u0438\u0441\u0438. \u0420\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u044C \u0437\u0430\u043F\u0438\u0441\u044C?").then(function (res) {
            if (res)
                tib_classes_1.unlockFile(document.fileName, true);
        });
    }
}
/** Возвращает длинный или короткий путь к файлу согласно настройке 'showFullPath' */
function getFilePathForMessage(path) {
    var res = path;
    if (!Settings.Item("showFullPath"))
        res = new tib_classes_1.Path(path).FileName;
    return "\"" + res + "\"";
}
/** Заменяет в строке все константы на значения */
function applyConstants(input) {
    var cons = AutoCompleteArray.PreDifinedConstants.toKeyedCollection(function (x) { return x; }).Map(function (key, value) { return new tib_classes_1.KeyValuePair('@' + key, value); });
    return input.replaceValues(cons);
}
function createElements(elementType) {
    return __awaiter(this, void 0, void 0, function () {
        var editor, text, res, tag, indent;
        return __generator(this, function (_a) {
            editor = vscode.window.activeTextEditor;
            text = editor.document.getText(editor.selection);
            res = TibDocumentEdits.createElements(text, elementType);
            InProcess = true;
            tag = getCurrentTag(editor.document, editor.selection.active);
            indent = !!tag ? tag.GetIndent() : 1;
            Formatting.format(res.value, tib_classes_1.Language.XML, Settings, "\t", indent).then(function (x) {
                res.value = x;
                vscode.window.activeTextEditor.insertSnippet(res).then(function (x) { InProcess = false; });
            });
            return [2 /*return*/];
        });
    });
}
function createClientConnection(context) {
    return __awaiter(this, void 0, void 0, function () {
        var serverModule, debugOptions, serverOptions, clientOptions;
        return __generator(this, function (_a) {
            serverModule = context.asAbsolutePath(path.join('out', 'src', 'server.js'));
            debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
            serverOptions = {
                run: { module: serverModule, transport: client.TransportKind.ipc },
                debug: {
                    module: serverModule,
                    transport: client.TransportKind.ipc,
                    options: debugOptions
                }
            };
            clientOptions = {
                documentSelector: [{ scheme: 'file', language: 'tib' }, { scheme: 'untitled', language: 'tib' }]
            };
            // Create the language client and start the client.
            _client = new client.LanguageClient('tib server', serverOptions, clientOptions);
            _client.start();
            _client.onReady().then(function () {
                _client.onNotification("server.log", function (data) {
                    if (typeof data != 'string')
                        tib_classes_1.logToOutput('Неправильный тип данных для логов с сервера', tib_constants_1._WarningLogPrefix);
                    tib_classes_1.logToOutput(data);
                });
                clientIsReady = true;
            });
            return [2 /*return*/];
        });
    });
}
function getServerData(requestName, data) {
    if (clientIsReady)
        _client.sendNotification(requestName, data);
}
