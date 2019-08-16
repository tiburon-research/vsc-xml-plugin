'use strict';
// ЛОГИРОВАНИЕ ОШИБОК



import { TelegramBot } from "tib-api/lib/telegramBot";
import * as vscode from 'vscode';
import * as dateFormat from 'dateFormat';
import { pathExists, createDir } from "tib-api";
import { Path, UserData, getTibVersion } from "./classes";
import * as fs from 'fs'
import * as shortHash from 'short-hash'
import { _pack, LogPath } from "tib-api/lib/constants";





interface UserLogDataFields
{
	ErrorMessage?: string;
	FullText?: string;
	Date?: string;
	Postion?: vscode.Position;
	CacheEnabled?: boolean;
	Version?: string;
	StackTrace?: string;
	Data?: Object;
	VSCVerion?: string;
	ActiveExtensions?: string[];
}


class ILogData implements UserLogDataFields
{
	FileName: string;
	UserData: UserData;

	ErrorMessage?: string;
	FullText?: string;
	Date?: string;
	Postion?: vscode.Position;
	Version?: string;
	StackTrace?: string;
	Data?: Object;
	VSCVerion?: string;
	ActiveExtensions?: string[];
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
		if (!this.Data.Version) this.Data.Version = getTibVersion();
		this.Data.VSCVerion = vscode.version;
		this.Data.Date = (new Date()).toLocaleString('ru');
		this.Data.ActiveExtensions = vscode.extensions.all.filter(x => x.isActive && !x.id.startsWith('vscode.')).map(x => x.id);
	}

	/** Lобавляет элемент в отчёт */
	public add(items: UserLogDataFields): void
	{
		for (let key in items)
			this.Data[key] = items[key];
	}

	/** преобразует все данные в строку */
	public toString(): string
	{
		let res = `Error: ${this.MessageFriendly}\r\n`;
		if (!!this.Data.ErrorMessage) res += `Message: ${this.Data.ErrorMessage}\r\n`;
		if (!!this.Data.StackTrace) res += `StackTrace: ${this.Data.StackTrace}\r\n`;
		res += `User: ${this.UserName}\r\n`;
		for (let key in this.Data)
		{
			switch (key)
			{
				case "FullText":
				case "ErrorMessage":
				case "StackTrace":
					// текст уберём в конец, а ошибку в начало
					break;
				case "SurveyData":
				case "Data":
					// разносим на отдельные строки
					let dt = ""
					for (let dataKey in this.Data[key])
					{
						dt += this.stringifyData(dataKey, this.Data[key]);
					}
					if (!!dt)
					{
						res += "-------- " + key + " --------\r\n";
						res += dt;
						res += "------------------------\r\n";
					}
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
	public MessageFriendly: string;
	private Data = new ILogData();
}



/** Класс для вывода в output channel */
export class TibOutput
{
	private outChannel: vscode.OutputChannel;

	constructor(channelName: string)
	{
		this.outChannel = vscode.window.createOutputChannel(channelName);
	}

	/** Лог в outputChannel */
	public logToOutput(message: string, prefix = " > "): void
	{
		let timeLog = "[" + dateFormat(new Date(), "hh:MM:ss.l") + "]";
		this.outChannel.appendLine(timeLog + prefix + message);
	}
}




/** Класс для логирования ошибок */
export class TibErrors
{
	constructor(private bot: TelegramBot, private outChannel: TibOutput)
	{ }

	/**
	 * Создаёт лог (файл) об ошибке и отправляет уведомление
	 * @param text Текст ошибки
	 * @param data Данные для лога
	 */
	public saveError(text: string, data: LogData)
	{
		if (!data) data = new LogData({ FileName: '-no-', UserData: { IP: '-no-', Id: '-no-', Name: '-no-' } });
		this.outChannel.logToOutput(text, "ERROR: ");
		if (!pathExists(LogPath))
		{
			this.sendLogMessage("У пользователя `" + data.UserName + "` не найден путь для логов:\n`" + LogPath + "`", data.UserName);
			return;
		}
		// генерируем имя файла из текста ошибки и сохраняем в папке с именем пользователя
		let hash = "" + shortHash(text);
		let dir = Path.Concat(LogPath, getTibVersion(), data.UserName);
		if (!pathExists(dir)) createDir(dir, true);
		let filename = Path.Concat(dir, hash + ".log");
		if (pathExists(filename)) return;
		data.MessageFriendly = text;
		fs.writeFile(filename, data.toString(), (err) =>
		{
			if (!!err) this.sendLogMessage(JSON.stringify(err), data.UserName);
			this.sendLogMessage("Добавлена ошибка:\n`" + text + "`\n\nПуть:\n`" + filename + "`", data.UserName);
		});
	}


	/** Показ и сохранение ошибки */
	logError(text: string, data: LogData, stackTrace: any, showerror: boolean, errorMessage: string)
	{
		if (_pack == "debug")
		{
			showerror = true;
			text = "debug: " + text;
		}
		if (!!stackTrace) console.log(errorMessage, stackTrace);
		if (showerror) showError(text);
		data.add({ StackTrace: stackTrace, ErrorMessage: errorMessage });
		this.saveError(text, data);
	}

	/** Отправляет лог в Telegram */
	sendLogMessage(text: string, userName: string)
	{
		if (!!this.bot) this.bot.sendLog(text, userName);
	}

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
