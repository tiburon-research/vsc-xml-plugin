'use strict';
// TELEGRAM БОТ ДЛЯ ОПОВЕЩЕНИЯ ОБ ОШИБКАХ



import { KeyedCollection } from "./index";




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
	        if (res) this.sendQueue();
	        callback(this.active);
	    }).catch(res =>
	    {
	        this.active = false;
	        callback(this.active);
	    });
	}

	/** Проверка работоспособности бота */
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

	/** 
	 * Отправка оповещения
	 * 
	 * `userName` - текущий пользователь
	 */
	public sendLog(text: string, userName: string): void
	{
	    if (!!userName && !!this.Data.ignoreUsers && this.Data.ignoreUsers.contains(userName)) return;
	    this.Data.logIds.forEach(id =>
	    {
	        this.sendMessage(id, text);
	    });
	}

	/** Отправить сообщение */
	private sendMessage(user: string, text: string): void
	{
	    if (this.active)
	    {
	        let params = new KeyedCollection<string>();
	        params.Add('to', user);
	        params.Add('error', text);
	        this.request('log', params).catch(res =>
	        {
	            throw "Ошибка при отправке сообщения";
	        })
	    }
	    else // добавляем в очередь
	    {
	        this.queue.push({ user, text });
	    }
	}

	private sendQueue()
	{
	    this.queue.forEach(msg => {
	        this.sendMessage(msg.user, msg.text);
	    });
	}

	/** Запрос к telegram API */
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
	            reject("Ошибка обработки запроса");
	        }
	    });
	}

	/** url для запроса */
	private buildURL(method: string, args?: KeyedCollection<string>): string
	{
	    let res = this.Data.redirect + method;
	    if (!args) args = new KeyedCollection<string>();
	    args.Add("secret", this.Data.secret);
	    let params = args.ToArray((key, value) => encodeURIComponent(key) + '=' + encodeURIComponent(value));
	    res += "?" + params.join('&');
	    return res;
	}

	private http;
	/** прошла ли инициализация */
	public active = false;
	private Data: TelegramBotData;
	private queue: { user: string, text: string }[] = [];
}
