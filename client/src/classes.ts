import * as vscode from 'vscode';
import * as server from 'vscode-languageserver';
import * as os from 'os'
import * as fs from 'fs'
import * as iconv from 'iconv-lite'
import { machineIdSync } from "node-machine-id"
import { _LogPath } from './extension'
import { _LockInfoFilePrefix, _pack } from 'tib-api/lib/constants'
import { CurrentTag, Language, KeyedCollection, Parse, pathExists, IServerDocument, hideFile, showFile } from 'tib-api';




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
                let afterChange = isBefore ? changes[i].range.start : document.positionAt(document.offsetAt(changes[i].range.start) + changes[i].text.length);
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
export function isTib()
{
    return vscode.window.activeTextEditor.document.languageId == "tib";
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


export class UserData
{
    Name: string;
    Id: string;
    IP: string;
}


/** Получает всю нужную информацию о пользователе */
export function getUserData(): UserData
{
    let Name = os.userInfo().username;
    let Id = machineIdSync();
    let IP = null;

    let ifs = os.networkInterfaces();
    for (const key in ifs)
    {
        if (!IP && ifs.hasOwnProperty(key))
        {
            ifs[key].forEach(n =>
            {
                if (!IP && 'IPv4' == n.family && !n.internal)
                {
                    IP = n.address;
                }
            });
        }
    }

    return { IP, Id, Name };
}



export function getTibVersion()
{
    return vscode.extensions.getExtension("TiburonResearch.tiburonscripter").packageJSON.version;
}


/** Сохраняет файл с данными о блокировке */
export function createLockInfoFile(path: Path, userData: UserData)
{
    if (!pathExists(path.FullPath)) return;
    let fileName = getLockFilePath(path);
    let data: LockData = {
        User: userData.Name,
        Id: userData.Id
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
            reject("Не удалось открыть ссылку");
        });
    });
}


export namespace ClientServerTransforms
{

    export namespace FromServer
    {
        export function Document(document: vscode.TextDocument): server.TextDocument
        {
            if (!document) return null;
            return server.TextDocument.create(document.uri.toString(), document.languageId, document.version, document.getText());
        }

        export function Selection(from: server.Position, to: server.Position): vscode.Selection
        {
            if (!from || !to) return null;
            return new vscode.Selection(new vscode.Position(from.line, from.character), new vscode.Position(to.line, to.character))
        }

        export function Position(position: server.Position): vscode.Position
        {
            if (!position) return null;
            return new vscode.Position(position.line, position.character);
        }

        export function Range(range: server.Range): vscode.Range
        {
            if (!range) return null;
            return new vscode.Range(this.Position(range.start), this.Position(range.end));
        }

        export function Tag(tag: CurrentTag): CurrentTag
        {
            if (!tag) return null;
            let newTag = new CurrentTag(tag.Name, tag.Parents); // потому что методы с сервера не приходят
            Object.assign(newTag, tag);
            return newTag;
        }
    }


    export namespace ToServer
    {
        export function Document(document: vscode.TextDocument): IServerDocument
        {
            if (!document) return null;
            return {
                uri: document.uri.toString(),
                version: document.version,
                content: document.getText()
            }
        }
    }

}