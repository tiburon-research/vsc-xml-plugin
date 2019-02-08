import * as vscode from 'vscode';
import * as server from 'vscode-languageserver';
import * as dateFormat from 'dateFormat';
import * as os from 'os'
import * as fs from 'fs'
import * as iconv from 'iconv-lite'
import * as shortHash from 'short-hash'
import * as winattr from 'winattr'
import { machineIdSync } from "node-machine-id"
import { bot, _LogPath, OutChannel, } from './extension'
import { _LockInfoFilePrefix } from 'tib-api/lib/constants'
import { CurrentTag, Language, KeyedCollection, ITibAttribute, Parse, translatePosition } from 'tib-api';




/** Настройки расширения */
export class ExtensionSettings extends KeyedCollection<any>
{
	constructor()
	{
		super();
		this.Update();
	}

	/** Обновляет объект настроек из файла конфигурации */
	public Update(): void
	{
		this.Config = vscode.workspace.getConfiguration('tib');
		for (let key in this.Config) this.AddPair(key.toString(), this.Config.get(key));
	}

	/** Изменяет настройки */
	public Set(key: string, value: any): Promise<void>
	{
		return new Promise<void>((resolve, reject) =>
		{
			try
			{
				this.Config.update(key, value, true).then(
					() =>
					{
						resolve();
					},
					() => reject("Ошибка при изменении параметра конфигурации")
				);
			}
			catch (error)
			{
				reject(error);
			}
		});
	}

	private Config: vscode.WorkspaceConfiguration;
}




/** Совмещённая структура ContentChangeEvent + Selection */
export class ContextChange
{
	constructor(contextChange: vscode.TextDocumentContentChangeEvent, selection: vscode.Selection)
	{
		this.Change = contextChange;
		this.Selection = selection;
		this.Start = selection.start;
		this.End = selection.end;
		this.Active = selection.active;
	}

	Start: vscode.Position;
	End: vscode.Position;
	Active: vscode.Position;
	Change: vscode.TextDocumentContentChangeEvent;
	Selection: vscode.Selection;
}


/** Возвращает совмещённую структуру из изменений и соответствующих выделений */
export function getContextChanges(document: vscode.TextDocument, selections: vscode.Selection[], changes: vscode.TextDocumentContentChangeEvent[], isBefore = false): ContextChange[]
{
	let res: ContextChange[] = [];
	try
	{
		selections.forEach(selection =>
		{
			for (let i = 0; i < changes.length; i++)
			{
				//let afterChange = isBefore ?  changes[i].range.start : translatePosition(document, changes[i].range.start, changes[i].text.length);
				let afterChange = isBefore ?  changes[i].range.start : document.positionAt(document.offsetAt(changes[i].range.start) + changes[i].text.length);
				if (selection.active.character == afterChange.character &&
					selection.active.line == afterChange.line)
				{
					res.push(new ContextChange(changes[i], selection));
					continue;
				}
			}
		});
	} catch (error)
	{
		throw error;
	}
	return res;
}



/** Открытие текста файла в новом окне */
export function openFileText(path: string): Promise<void>
{
	return new Promise<void>((resolve, reject) =>
	{
		/* vscode.workspace.openTextDocument(path).then(doc =>
		{ // открываем файл (в памяти)
			let txt = doc.getText();
			vscode.workspace.openTextDocument({ language: "tib" }).then(newDoc =>
			{ // создаём пустой tib-файл
				vscode.window.showTextDocument(newDoc).then(editor => 
				{ // отображаем пустой
					editor.edit(builder => 
					{ // заливаем в него текст
						builder.insert(new vscode.Position(0, 0), txt)
					});
				});
			})
		}); */

		let fileBuffer = fs.readFileSync(path);
		// по возможности читаем в 1251
		let text = Parse.win1251Avaliabe(fileBuffer) ? iconv.decode(fileBuffer, 'win1251') : fileBuffer.toString('utf8');
		vscode.workspace.openTextDocument({ language: "tib" }).then(newDoc =>
		{ // создаём пустой tib-файл
			if (!newDoc) return reject();
			vscode.window.showTextDocument(newDoc).then(editor => 
			{ // отображаем пустой
				if (!editor) return reject();
				editor.edit(builder => 
				{ // заливаем в него текст
					builder.insert(new vscode.Position(0, 0), text);
					resolve();
				});
			});
		})
	});
}

/** Проверка текущего положения курсора на нахождение в CDATA */
export function inCDATA(document: vscode.TextDocument, position: vscode.Position): boolean
{
	let range = new vscode.Range(new vscode.Position(0, 0), position);
	let text = document.getText(range);
	return text.lastIndexOf("<![CDATA[") > text.lastIndexOf("]]>");
}

/** проверяет язык для activeTextEditor */
function isTib()
{
	return vscode.window.activeTextEditor.document.languageId == "tib";
}


/** Создаёт команду только для языка tib */
export async function registerCommand(name: string, command: Function): Promise<void>
{
	await vscode.commands.registerCommand(name, (...args: any[]) => 
	{
		if (!isTib()) return;
		command(...args);
	});
}





export class TibAttribute extends ITibAttribute
{

	constructor(obj: Object)
	{
		super(obj);
	}

	/** `nameOnly` - не подставлять значения */
	ToCompletionItem(callback: (query: string) => string[], nameOnly = false): vscode.CompletionItem
	{
		let item = new vscode.CompletionItem(super.Name, vscode.CompletionItemKind.Property);
		let snip = this.Name;
		if (!nameOnly)
		{
			snip += '="';
			let valAr: string[];
			let auto = this.AutoValue();
			if (!auto)
			{
				valAr = this.ValueCompletitions(callback);
				if (valAr.length > 0) snip += "${1|" + valAr.join(",") + "|}";
				else snip += "$1";
			}
			else snip += auto;
			snip += '"';
		}
		let res = new vscode.SnippetString(snip);
		item.insertText = res;
		item.detail = (this.Detail ? this.Detail : this.Name) + (this.Type ? (" (" + this.Type + ")") : "");
		let doc = "";
		if (this.Default) doc += "Значение по умолчанию: `" + this.Default + "`";
		doc += "\nПоддержка кодовых вставок: `" + (this.AllowCode ? "да" : "нет") + "`";
		item.documentation = new vscode.MarkdownString(doc);
		return item;
	}

	ValueCompletitions(callback: (query: string) => string[]): string[]
	{
		if (this.Values && this.Values.length) return this.Values;
		else if (!!this.Result) return callback(this.Result);
		return [];
	}

	AutoValue(): string
	{
		if (this.Auto) return this.Auto;
		if (this.Type == "Boolean")
		{
			if (!!this.Default) return this.Default == "true" ? "false" : "true";
			return "true";
		}
		return null;
	}
}



export function logString(a?: string | number | boolean)
{
	let text = a;
	if (typeof text === typeof undefined) text = "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%";
	console.log("'" + text + "'");
}


export interface LockData
{
	User: string;
	Id: string;
}


export class StatusBar
{
	private currentStatus: vscode.Disposable;

	/** Устанавливает сообщение на время */
	public setInfoMessage(text: string, after: number): Promise<vscode.Disposable>
	{
		return this.statusMessage(text, after);
	}

	/** выводит в строку состояния информацию о текущем теге */
	public setTagInfo(tag: CurrentTag): Promise<vscode.Disposable>
	{
		let info = "";
		if (!tag) info = "";
		else
		{
			let lang = Language[tag.GetLaguage()];
			if (lang == "CSharp") lang = "C#";
			info = lang + ":\t" + tag.Parents.map(x => x.Name).concat([tag.Name]).join(" -> ");
			if (tag.Name == "Var")
			{
				let ind = tag.GetVarIndex();
				if (ind > -1) info += `[${ind}]`;
			}
		}
		return this.statusMessage(info);
	}

	/** выводит в строку состояния информацию о текущем процессе */
	public async setProcessMessage(text: string): Promise<vscode.Disposable>
	{
		this.currentStatus = await this.statusMessage(text);
		return this.currentStatus;
	}

	/** очищает строку состояния */
	public removeCurrentMessage()
	{
		if (!!this.currentStatus) this.currentStatus.dispose();
		else this.statusMessage('');
	}

	private statusMessage(text: string, after?: number): Promise<vscode.Disposable>
	{
		return new Promise<vscode.Disposable>((resolve, reject) =>
		{
			let res: vscode.Disposable;
			if (!!after) res = vscode.window.setStatusBarMessage(text, after);
			else res = vscode.window.setStatusBarMessage(text);
			setTimeout(x => { resolve(res) }, 100);
		});
	}
}


/** проверяет наличие файла/папки */
export function pathExists(path: string): boolean
{
	return fs.existsSync(path);
}


/** создаёт папку */
export function createDir(path: string)
{
	fs.mkdirSync(path);
}


/** Класс для работы с путями */
export class Path
{

	constructor(path: string)
	{
		this.originalPath = path;
	}

	/** Приведение к стандартному типу */
	public static Normalize(value: string): string
	{
		// замена слешей
		let res = value.replace(/\//, "\\");
		// убираем слеш в начале и в конце
		res = res.replace(/(^\\)|(\\$)/, '');
		// заглавная буква диска
		if (res.match(/^[a-z]:/)) res = res[0].toLocaleUpperCase() + res.slice(1);
		return res;
	}

	/** Полный путь элемента */
	public get FullPath(): string
	{
		return Path.Normalize(this.originalPath);
	}

	/** Имя файла с расширением */
	public get FileName(): string
	{
		return this.originalPath.replace(/^.+[\\\/]/, '');
	}

	/** Расширение файла */
	public get FileExt(): string
	{
		return this.originalPath.replace(/^.*\./, '').toLocaleLowerCase();
	}

	/** Объединяет в один нормальный путь */
	public static Concat(...values: string[]): string
	{
		let res = "";
		values.forEach(element => 
		{
			let val = Path.Normalize(element);
			res += val + "\\";
		});
		return res.replace(/\\$/, '');
	}

	/** Возвращает папку в которой находится текущий элемент */
	public get Directory(): string
	{
		return this.originalPath.replace(/\\[^\\]+$/, '');
	}



	private originalPath: string;

}


interface UserInfo
{
	Name: string;
	Id: string;
	IP: string;
}

// переменная для кэширования информации о пользователе
var userInfo: UserInfo =
{
	Name: null,
	Id: null,
	IP: null
}


/** Возвращаетмя пользователя */
export function getUserName()
{
	if (!!userInfo.Name) return userInfo.Name;
	return (userInfo.Name = os.userInfo().username);
}


/** Возвращает machineId */
export function getUserId()
{
	if (!!userInfo.Id) return userInfo.Id;
	return (userInfo.Id = machineIdSync());
}


/** Возвращает external Ipv4 */
export function getUserIP()
{
	if (!!userInfo.IP) return userInfo.IP;
	let ifs = os.networkInterfaces();
	for (const key in ifs)
	{
		if (!userInfo.IP && ifs.hasOwnProperty(key))
		{
			ifs[key].forEach(n =>
			{
				if (!userInfo.IP && 'IPv4' == n.family && !n.internal)
				{
					userInfo.IP = n.address;
				}
			});
		}
	}
	return userInfo.IP || "not found";
}


class ILogData
{
	FileName?: string;
	FullText?: string;
	Date?: string;
	Postion?: vscode.Position;
	CacheEnabled?: boolean;
	Version?: string;
	SurveyData?: Object;
	StackTrace?: string;
	Data?: Object;
	VSCVerion?: string;
	ActiveExtensions?: string[];
	UserData?: {
		UserIP?: string;
		UserId?: string;
	}
}

/** Данные для хранения логов */
export class LogData 
{

	constructor(data: ILogData)
	{
		if (!!data)
			for (let key in data)
				this.Data[key] = data[key];
		// дополнительно
		if (!this.Data) this.Data = {};
		if (!this.UserName) this.UserName = getUserName();
		if (!this.Data.Version) this.Data.Version = getTibVersion();
		this.Data.VSCVerion = vscode.version;
		this.Data.UserData =
			{
				UserId: getUserId(),
				UserIP: getUserIP()
			};
		this.Data.Date = (new Date()).toLocaleString('ru');
		this.Data.ActiveExtensions = vscode.extensions.all.filter(x => x.isActive && !x.id.startsWith('vscode.')).map(x => x.id);
	}

	/** добавляет элемент в отчёт */
	public add(items: ILogData): void
	{
		for (let key in items)
			this.Data[key] = items[key];
	}

	/** преобразует все данные в строку */
	public toString(): string
	{
		let res = `Error: ${this.ErrorMessage}\r\nUser: ${this.UserName}\r\n`;
		for (let key in this.Data)
		{
			switch (key)
			{
				case "FullText":
					// текст уберём в конец	
					break;
				case "SurveyData":
				case "Data":
					// разносим на отдельные строки
					res += "-------- " + key + " --------\r\n";
					for (let dataKey in this.Data[key])
					{
						res += this.stringifyData(dataKey, this.Data[key]);
					}
					res += "------------------------\r\n";
					break;
				default:
					res += this.stringifyData(key, this.Data);
			}
		}
		if (!!this.Data.FullText)
		{
			res += "______________ TEXT START _______________\r\n"
			res += this.Data.FullText;
			res += "\r\n______________ TEXT END _______________\r\n"
		}
		return res;
	}

	private stringifyData(key: string, data): string
	{
		return key + ": " + (typeof data[key] != "string" ? JSON.stringify(data[key]) : ("\"" + data[key] + "\"")) + "\r\n";
	}

	public UserName: string;
	public ErrorMessage: string;
	private Data = new ILogData();
}



/** Лог в outputChannel */
export function logToOutput(message: string, prefix = " > "): void
{
	let timeLog = "[" + dateFormat(new Date(), "hh:MM:ss.l") + "]";
	OutChannel.appendLine(timeLog + prefix + message);
}

/**
 * Создаёт лог (файл) об ошибке 
 * @param text Текст ошибки
 * @param data Данные для лога
 */
export function saveError(text: string, data: LogData)
{
	logToOutput(text, "ERROR: ");
	if (!data) data = new LogData({ Data: { Error: "Ошибка без данных" } });
	if (!pathExists(_LogPath))
	{
		sendLogMessage("У пользователя `" + data.UserName + "` не найден путь для логов:\n`" + _LogPath + "`");
		return;
	}
	// генерируем имя файла из текста ошибки и сохраняем в папке с именем пользователя
	let hash = "" + shortHash(text);
	let dir = Path.Concat(_LogPath, data.UserName);
	if (!pathExists(dir)) createDir(dir);
	let filename = Path.Concat(dir, hash + ".log");
	if (pathExists(filename)) return;
	data.ErrorMessage = text;
	fs.writeFile(filename, data.toString(), (err) =>
	{
		if (!!err) sendLogMessage(JSON.stringify(err));
		sendLogMessage("Добавлена ошибка:\n`" + text + "`\n\nПуть:\n`" + filename + "`");
	});
}


/** Показ и сохранение ошибки */
export function tibError(text: string, data: LogData, error?)
{
	showError(text);
	if (!!error) data.add({ StackTrace: error });
	saveError(text, data);
}


function sendLogMessage(text: string)
{
	if (!!bot && bot.active) bot.sendLog(text);
}



export function getTibVersion()
{
	return vscode.extensions.getExtension("TiburonResearch.tiburonscripter").packageJSON.version;
}


/** Задаёт файлу режим readonly */
export function unlockFile(path: string, log = false)
{
	winattr.setSync(path, { readonly: false });
	if (log) logToOutput(`Запись в файл ${path} разрешена`);
}


/** Снимает с файла режим readonly */
export function lockFile(path: string)
{
	if (!pathExists(path)) return;
	winattr.setSync(path, { readonly: true });
}

/** Файл в режиме readonly */
export function fileIsLocked(path: string): boolean
{
	if (!pathExists(path)) return false;
	let props = winattr.getSync(path);
	return !!props && !!props.readonly;
}


/** Делает файл hidden */
function hideFile(path: string)
{
	winattr.setSync(path, { hidden: true });
}

/** Делает файл hidden */
function showFile(path: string)
{
	winattr.setSync(path, { hidden: false });
}


/** Сохраняет файл с данными о блокировке */
export function createLockInfoFile(path: Path)
{
	if (!pathExists(path.FullPath)) return;
	let fileName = getLockFilePath(path);
	let data: LockData = {
		User: getUserName(),
		Id: getUserId()
	};
	if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
	fs.writeFileSync(fileName, JSON.stringify(data));
	hideFile(fileName);
}

/** Удаляет файл с данными о блокировке */
export function removeLockInfoFile(path: Path)
{
	let fileName = getLockFilePath(path);
	showFile(fileName);
	fs.unlinkSync(fileName);
}


/** Путь к файлу с информацией о блокировке */
export function getLockFilePath(path: Path): string
{
	let fileName = _LockInfoFilePrefix + path.FileName + ".json";
	fileName = Path.Concat(path.Directory, fileName);
	return fileName;
}


/** Получает информацию из `fileName` */
export function getLockData(fileName: string): LockData
{
	if (!pathExists(fileName)) return null;
	showFile(fileName);
	let data = fs.readFileSync(fileName).toString();
	hideFile(fileName);
	return JSON.parse(data);
}


/** Показывает сообщение об ошибке */
export function showError(text: string)
{
	vscode.window.showErrorMessage(text);
}


/** Показывает предупреждение */
export function showWarning(text: string)
{
	vscode.window.showWarningMessage(text);
}




class TelegramResult
{
	constructor(data?: string)
	{
		if (!!data) this.update(data);
	}

	/** добавление/обновлени данных */
	public update(data: string)
	{
		let obj = JSON.parse(data);
		if (!obj) return;
		for (let key in obj)
			this[key] = obj[key];
	}

	public ok: boolean = false;
	public result: Object = {};
}


export class TelegramBotData
{
	constructor(obj)
	{
		for (let key in obj)
			this[key] = obj[key];
	}

	public logIds: string[];
	public ignoreUsers: string[];
	public secret: string;
	public redirect: string;
}


export class TelegramBot
{
	constructor(obj: Object, callback?: (active: boolean) => any)
	{
		this.http = require('https');
		this.Data = new TelegramBotData(obj);

		this.check().then(res =>
		{
			this.active = res;
			callback(this.active);
		}).catch(res =>
		{
			this.active = false;
			callback(this.active);
		});
	}

	public check(): Promise<boolean>
	{
		return new Promise<boolean>((resolve, reject) =>
		{
			this.request('check').then(res =>
			{
				resolve(res.ok);
			}).catch(res =>
			{
				reject(false);
			})
		})
	}

	public sendLog(text: string): void
	{
		let curUser = getUserName();
		if (!!curUser && !!this.Data.ignoreUsers && this.Data.ignoreUsers.contains(curUser)) return;
		this.Data.logIds.forEach(id =>
		{
			this.sendMessage(id, text);
		});
	}

	public sendMessage(user: string, text: string): void
	{
		if (this.active)
		{
			let params = new KeyedCollection<string>();
			params.AddPair('to', user);
			params.AddPair('error', text);
			this.request('log', params).catch(res =>
			{
				showError("Ошибка при отправке сообщения");
			})
		}
	}

	private request(method: string, args?: KeyedCollection<string>): Promise<TelegramResult>
	{
		let result = new TelegramResult();
		return new Promise<TelegramResult>((resolve, reject) =>
		{
			try
			{
				let url = this.buildURL(method, args);
				this.http.get(url, (res) =>
				{
					res.setEncoding("utf8");
					let body = "";
					res.on("data", data =>
					{
						body += data;
					});
					res.on("end", () =>
					{
						result.update(body);
						if (!result.ok)
						{
							reject(result);
						}
						else resolve(result);
					});
				}).on('error', (e) =>
				{
					reject(result);
					// комментируем пока Telegram не восстановят
					//showError("Ошибка при отправке отчёта об ошибке =)");
				});
			}
			catch (error)
			{
				reject(result);
				showError("Ошибка обработки запроса");
			}
		});
	}

	/** url для запроса */
	private buildURL(method: string, args?: KeyedCollection<string>): string
	{
		let res = this.Data.redirect + method;
		if (!args) args = new KeyedCollection<string>();
		args.AddPair("secret", this.Data.secret);
		let params = args.Select((key, value) => encodeURIComponent(key) + '=' + encodeURIComponent(value));
		res += "?" + params.join('&');
		return res;
	}

	private http;
	/** прошла ли инициализация */
	public active = false;
	private Data: TelegramBotData;
}




/** Открыть файл в VSCode */
/* function execute(link: string)
{
	vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(link));
} */
export function openUrl(url: string): Promise<string>
{
	return new Promise<string>((resolve, reject) =>
	{
		let http = require('https');
		http.get(url, (res) =>
		{
			res.setEncoding("utf8");
			let body = "";
			res.on("data", data =>
			{
				body += data;
			});
			res.on("end", () =>
			{
				resolve(body);
			});
		}).on('error', (e) =>
		{
			let data = new LogData({
				Data: { Url: url },
				StackTrace: e
			});
			tibError("Не удалось открыть ссылку", data);
			reject();
		});
	});
}
