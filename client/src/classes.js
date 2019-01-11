"use strict";
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
var dateFormat = require("dateFormat");
var os = require("os");
var fs = require("fs");
var shortHash = require("short-hash");
var winattr = require("winattr");
var node_machine_id_1 = require("node-machine-id");
var extension_1 = require("./extension");
var tib_constants_1 = require("tib-constants");
function logString(a) {
    var text = a;
    if (typeof text === typeof undefined)
        text = "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%";
    console.log("'" + text + "'");
}
exports.logString = logString;
var StatusBar = /** @class */ (function () {
    function StatusBar() {
    }
    /** Устанавливает сообщение на время */
    StatusBar.prototype.setInfoMessage = function (text, after) {
        return this.statusMessage(text, after);
    };
    /** выводит в строку состояния информацию о текущем теге */
    StatusBar.prototype.setTagInfo = function (tag) {
        var info = "";
        if (!tag)
            info = "";
        else {
            var lang = Language[tag.GetLaguage()];
            if (lang == "CSharp")
                lang = "C#";
            info = lang + ":\t" + tag.Parents.map(function (x) { return x.Name; }).concat([tag.Name]).join(" -> ");
            if (tag.Name == "Var") {
                var ind = tag.GetVarIndex();
                if (ind > -1)
                    info += "[" + ind + "]";
            }
        }
        return this.statusMessage(info);
    };
    /** выводит в строку состояния информацию о текущем процессе */
    StatusBar.prototype.setProcessMessage = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.statusMessage(text)];
                    case 1:
                        _a.currentStatus = _b.sent();
                        return [2 /*return*/, this.currentStatus];
                }
            });
        });
    };
    /** очищает строку состояния */
    StatusBar.prototype.removeCurrentMessage = function () {
        if (!!this.currentStatus)
            this.currentStatus.dispose();
        else
            this.statusMessage('');
    };
    StatusBar.prototype.statusMessage = function (text, after) {
        return new Promise(function (resolve, reject) {
            var res;
            if (!!after)
                res = vscode.window.setStatusBarMessage(text, after);
            else
                res = vscode.window.setStatusBarMessage(text);
            setTimeout(function (x) { resolve(res); }, 100);
        });
    };
    return StatusBar;
}());
exports.StatusBar = StatusBar;
/** проверяет наличие файла/папки */
function pathExists(path) {
    return fs.existsSync(path);
}
exports.pathExists = pathExists;
/** создаёт папку */
function createDir(path) {
    fs.mkdirSync(path);
}
exports.createDir = createDir;
/** Класс для работы с путями */
var Path = /** @class */ (function () {
    function Path(path) {
        this.originalPath = path;
    }
    /** Приведение к стандартному типу */
    Path.Normalize = function (value) {
        // замена слешей
        var res = value.replace(/\//, "\\");
        // убираем слеш в начале и в конце
        res = res.replace(/(^\\)|(\\$)/, '');
        // заглавная буква диска
        if (res.match(/^[a-z]:/))
            res = res[0].toLocaleUpperCase() + res.slice(1);
        return res;
    };
    Object.defineProperty(Path.prototype, "FullPath", {
        /** Полный путь элемента */
        get: function () {
            return Path.Normalize(this.originalPath);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Path.prototype, "FileName", {
        /** Имя файла с расширением */
        get: function () {
            return this.originalPath.replace(/^.+[\\\/]/, '');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Path.prototype, "FileExt", {
        /** Расширение файла */
        get: function () {
            return this.originalPath.replace(/^.*\./, '').toLocaleLowerCase();
        },
        enumerable: true,
        configurable: true
    });
    /** Объединяет в один нормальный путь */
    Path.Concat = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        var res = "";
        values.forEach(function (element) {
            var val = Path.Normalize(element);
            res += val + "\\";
        });
        return res.replace(/\\$/, '');
    };
    Object.defineProperty(Path.prototype, "Directory", {
        /** Возвращает папку в которой находится текущий элемент */
        get: function () {
            return this.originalPath.replace(/\\[^\\]+$/, '');
        },
        enumerable: true,
        configurable: true
    });
    return Path;
}());
exports.Path = Path;
// переменная для кэширования информации о пользователе
var userInfo = {
    Name: null,
    Id: null,
    IP: null
};
/** Возвращаетмя пользователя */
function getUserName() {
    if (!!userInfo.Name)
        return userInfo.Name;
    return (userInfo.Name = os.userInfo().username);
}
exports.getUserName = getUserName;
/** Возвращает machineId */
function getUserId() {
    if (!!userInfo.Id)
        return userInfo.Id;
    return (userInfo.Id = node_machine_id_1.machineIdSync());
}
exports.getUserId = getUserId;
/** Возвращает external Ipv4 */
function getUserIP() {
    if (!!userInfo.IP)
        return userInfo.IP;
    var ifs = os.networkInterfaces();
    for (var key in ifs) {
        if (!userInfo.IP && ifs.hasOwnProperty(key)) {
            ifs[key].forEach(function (n) {
                if (!userInfo.IP && 'IPv4' == n.family && !n.internal) {
                    userInfo.IP = n.address;
                }
            });
        }
    }
    return userInfo.IP || "not found";
}
exports.getUserIP = getUserIP;
var ILogData = /** @class */ (function () {
    function ILogData() {
    }
    return ILogData;
}());
/** Данные для хранения логов */
var LogData = /** @class */ (function () {
    function LogData(data) {
        this.Data = new ILogData();
        if (!!data)
            for (var key in data)
                this.Data[key] = data[key];
        // дополнительно
        if (!this.Data)
            this.Data = {};
        if (!this.UserName)
            this.UserName = getUserName();
        if (!this.Data.Version)
            this.Data.Version = getTibVersion();
        this.Data.VSCVerion = vscode.version;
        this.Data.UserData =
            {
                UserId: getUserId(),
                UserIP: getUserIP()
            };
        this.Data.Date = (new Date()).toLocaleString('ru');
        this.Data.ActiveExtensions = vscode.extensions.all.filter(function (x) { return x.isActive && !x.id.startsWith('vscode.'); }).map(function (x) { return x.id; });
    }
    /** добавляет элемент в отчёт */
    LogData.prototype.add = function (items) {
        for (var key in items)
            this.Data[key] = items[key];
    };
    /** преобразует все данные в строку */
    LogData.prototype.toString = function () {
        var res = "Error: " + this.ErrorMessage + "\r\nUser: " + this.UserName + "\r\n";
        for (var key in this.Data) {
            switch (key) {
                case "FullText":
                    // текст уберём в конец	
                    break;
                case "SurveyData":
                case "Data":
                    // разносим на отдельные строки
                    res += "-------- " + key + " --------\r\n";
                    for (var dataKey in this.Data[key]) {
                        res += this.stringifyData(dataKey, this.Data[key]);
                    }
                    res += "------------------------\r\n";
                    break;
                default:
                    res += this.stringifyData(key, this.Data);
            }
        }
        if (!!this.Data.FullText) {
            res += "______________ TEXT START _______________\r\n";
            res += this.Data.FullText;
            res += "\r\n______________ TEXT END _______________\r\n";
        }
        return res;
    };
    LogData.prototype.stringifyData = function (key, data) {
        return key + ": " + (typeof data[key] != "string" ? JSON.stringify(data[key]) : ("\"" + data[key] + "\"")) + "\r\n";
    };
    return LogData;
}());
exports.LogData = LogData;
/** Лог в outputChannel */
function logToOutput(message, prefix) {
    if (prefix === void 0) { prefix = " > "; }
    var timeLog = "[" + dateFormat(new Date(), "hh:MM:ss.l") + "]";
    extension_1.OutChannel.appendLine(timeLog + prefix + message);
}
exports.logToOutput = logToOutput;
/**
 * Создаёт лог (файл) об ошибке
 * @param text Текст ошибки
 * @param data Данные для лога
 */
function saveError(text, data) {
    logToOutput(text, "ERROR: ");
    if (!data)
        data = new LogData({ Data: { Error: "Ошибка без данных" } });
    if (!pathExists(extension_1._LogPath)) {
        sendLogMessage("У пользователя `" + data.UserName + "` не найден путь для логов:\n`" + extension_1._LogPath + "`");
        return;
    }
    // генерируем имя файла из текста ошибки и сохраняем в папке с именем пользователя
    var hash = "" + shortHash(text);
    var dir = Path.Concat(extension_1._LogPath, data.UserName);
    if (!pathExists(dir))
        createDir(dir);
    var filename = Path.Concat(dir, hash + ".log");
    if (pathExists(filename))
        return;
    data.ErrorMessage = text;
    fs.writeFile(filename, data.toString(), function (err) {
        if (!!err)
            sendLogMessage(JSON.stringify(err));
        sendLogMessage("Добавлена ошибка:\n`" + text + "`\n\nПуть:\n`" + filename + "`");
    });
}
exports.saveError = saveError;
/** Показ и сохранение ошибки */
function tibError(text, data, error) {
    showError(text);
    if (!!error)
        data.add({ StackTrace: error });
    saveError(text, data);
}
exports.tibError = tibError;
function sendLogMessage(text) {
    if (!!extension_1.bot && extension_1.bot.active)
        extension_1.bot.sendLog(text);
}
function getTibVersion() {
    return vscode.extensions.getExtension("TiburonResearch.tiburonscripter").packageJSON.version;
}
exports.getTibVersion = getTibVersion;
/** Задаёт файлу режим readonly */
function unlockFile(path, log) {
    if (log === void 0) { log = false; }
    winattr.setSync(path, { readonly: false });
    if (log)
        logToOutput("\u0417\u0430\u043F\u0438\u0441\u044C \u0432 \u0444\u0430\u0439\u043B " + path + " \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0430");
}
exports.unlockFile = unlockFile;
/** Снимает с файла режим readonly */
function lockFile(path) {
    if (!pathExists(path))
        return;
    winattr.setSync(path, { readonly: true });
}
exports.lockFile = lockFile;
/** Файл в режиме readonly */
function fileIsLocked(path) {
    if (!pathExists(path))
        return false;
    var props = winattr.getSync(path);
    return !!props && !!props.readonly;
}
exports.fileIsLocked = fileIsLocked;
/** Делает файл hidden */
function hideFile(path) {
    winattr.setSync(path, { hidden: true });
}
/** Делает файл hidden */
function showFile(path) {
    winattr.setSync(path, { hidden: false });
}
/** Сохраняет файл с данными о блокировке */
function createLockInfoFile(path) {
    if (!pathExists(path.FullPath))
        return;
    var fileName = getLockFilePath(path);
    var data = {
        User: getUserName(),
        Id: getUserId()
    };
    if (fs.existsSync(fileName))
        fs.unlinkSync(fileName);
    fs.writeFileSync(fileName, JSON.stringify(data));
    hideFile(fileName);
}
exports.createLockInfoFile = createLockInfoFile;
/** Удаляет файл с данными о блокировке */
function removeLockInfoFile(path) {
    var fileName = getLockFilePath(path);
    showFile(fileName);
    fs.unlinkSync(fileName);
}
exports.removeLockInfoFile = removeLockInfoFile;
/** Путь к файлу с информацией о блокировке */
function getLockFilePath(path) {
    var fileName = tib_constants_1._LockInfoFilePrefix + path.FileName + ".json";
    fileName = Path.Concat(path.Directory, fileName);
    return fileName;
}
exports.getLockFilePath = getLockFilePath;
/** Получает информацию из `fileName` */
function getLockData(fileName) {
    if (!pathExists(fileName))
        return null;
    showFile(fileName);
    var data = fs.readFileSync(fileName).toString();
    hideFile(fileName);
    return JSON.parse(data);
}
exports.getLockData = getLockData;
/** Показывает сообщение об ошибке */
function showError(text) {
    vscode.window.showErrorMessage(text);
}
exports.showError = showError;
/** Показывает предупреждение */
function showWarning(text) {
    vscode.window.showWarningMessage(text);
}
exports.showWarning = showWarning;
var TelegramResult = /** @class */ (function () {
    function TelegramResult(data) {
        this.ok = false;
        this.result = {};
        if (!!data)
            this.update(data);
    }
    /** добавление/обновлени данных */
    TelegramResult.prototype.update = function (data) {
        var obj = JSON.parse(data);
        if (!obj)
            return;
        for (var key in obj)
            this[key] = obj[key];
    };
    return TelegramResult;
}());
var TelegramBotData = /** @class */ (function () {
    function TelegramBotData(obj) {
        for (var key in obj)
            this[key] = obj[key];
    }
    return TelegramBotData;
}());
exports.TelegramBotData = TelegramBotData;
var TelegramBot = /** @class */ (function () {
    function TelegramBot(obj, callback) {
        var _this = this;
        /** прошла ли инициализация */
        this.active = false;
        this.http = require('https');
        this.Data = new TelegramBotData(obj);
        this.check().then(function (res) {
            _this.active = res;
            callback(_this.active);
        })["catch"](function (res) {
            _this.active = false;
            callback(_this.active);
        });
    }
    TelegramBot.prototype.check = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.request('check').then(function (res) {
                resolve(res.ok);
            })["catch"](function (res) {
                reject(false);
            });
        });
    };
    TelegramBot.prototype.sendLog = function (text) {
        var _this = this;
        var curUser = getUserName();
        if (!!curUser && !!this.Data.ignoreUsers && this.Data.ignoreUsers.contains(curUser))
            return;
        this.Data.logIds.forEach(function (id) {
            _this.sendMessage(id, text);
        });
    };
    TelegramBot.prototype.sendMessage = function (user, text) {
        if (this.active) {
            var params = new KeyedCollection();
            params.AddPair('to', user);
            params.AddPair('error', text);
            this.request('log', params)["catch"](function (res) {
                showError("Ошибка при отправке сообщения");
            });
        }
    };
    TelegramBot.prototype.request = function (method, args) {
        var _this = this;
        var result = new TelegramResult();
        return new Promise(function (resolve, reject) {
            try {
                var url = _this.buildURL(method, args);
                _this.http.get(url, function (res) {
                    res.setEncoding("utf8");
                    var body = "";
                    res.on("data", function (data) {
                        body += data;
                    });
                    res.on("end", function () {
                        result.update(body);
                        if (!result.ok) {
                            reject(result);
                        }
                        else
                            resolve(result);
                    });
                }).on('error', function (e) {
                    reject(result);
                    // комментируем пока Telegram не восстановят
                    //showError("Ошибка при отправке отчёта об ошибке =)");
                });
            }
            catch (error) {
                reject(result);
                showError("Ошибка обработки запроса");
            }
        });
    };
    /** url для запроса */
    TelegramBot.prototype.buildURL = function (method, args) {
        var res = this.Data.redirect + method;
        if (!args)
            args = new KeyedCollection();
        args.AddPair("secret", this.Data.secret);
        var params = args.Select(function (key, value) { return encodeURIComponent(key) + '=' + encodeURIComponent(value); });
        res += "?" + params.join('&');
        return res;
    };
    return TelegramBot;
}());
exports.TelegramBot = TelegramBot;
/** Открыть файл в VSCode */
/* function execute(link: string)
{
    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(link));
} */
function openUrl(url) {
    return new Promise(function (resolve, reject) {
        var http = require('https');
        http.get(url, function (res) {
            res.setEncoding("utf8");
            var body = "";
            res.on("data", function (data) {
                body += data;
            });
            res.on("end", function () {
                resolve(body);
            });
        }).on('error', function (e) {
            var data = new LogData({
                Data: { Url: url },
                StackTrace: e
            });
            tibError("Не удалось открыть ссылку", data);
            reject();
        });
    });
}
exports.openUrl = openUrl;
