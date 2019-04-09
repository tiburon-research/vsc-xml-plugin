'use strict';
// УНИВЕРСАЛЬНОЕ



import * as fs from 'fs'
import Uri from 'vscode-uri'
import * as clipboard from "clipboardy"
//import * as winattr from 'winattr'
import * as process from 'child_process'



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

/** Преобразует путь в URI */
export function uriFromName(path: string): string
{
    return Uri.file(path).toString()
}


/** Задаёт файлу режим readonly */
export function unlockFile(path: string)
{
    //winattr.setSync(path, { readonly: false });
    //fs.chmodSync(path, '666');
    process.execSync(`attrib -r "${path}"`);
}


/** Снимает с файла режим readonly */
export function lockFile(path: string)
{
    if (!pathExists(path)) return;
    //winattr.setSync(path, { readonly: true });
    //fs.chmodSync(path, '444');
    process.execSync(`attrib +r "${path}"`);
}

/** Файл в режиме readonly */
export function fileIsLocked(path: string): boolean
{
    if (!pathExists(path)) return false;
    //let props = winattr.getSync(path);
    let a = fs.statSync(path);
    let readOnly = (a.mode & parseInt('777', 8)).toString(8) == '444';
    return readOnly;
    //return !!props && !!props.readonly;
}


/** Делает файл hidden */
export function hideFile(path: string)
{
    process.execSync(`attrib +h "${path}"`);
    //winattr.setSync(path, { hidden: true });
}

/** Снимает свойство hidden с файла */
export function showFile(path: string)
{
    process.execSync(`attrib -h "${path}"`);
    //winattr.setSync(path, { hidden: false });
}


/** возвращает минимальное неотрицательное или `negative` (= null), если нет таких */
export function positiveMin(a, b, negative: any = null)
{
    let neg = null;
    if (typeof negative !== typeof null) neg = negative;

    if (a < 0)
        if (b < 0) return neg;
        else return b;
    else
        if (b < 0) return a;
        else return Math.min(a, b);
}


/** записывает данные в буфер обмена */
export function copyToClipboard(text: string)
{
    clipboard.writeSync(text);
}


/** получает данные из буфера обмена */
export function getFromClioboard(): string
{
    return clipboard.readSync();
}


/** Подготовленная для RegExp строка */
export function safeString(text: string): string
{
    if (!text) return '';
    return text.replace(/[\|\\\{\}\(\)\[\]\^\$\+\*\?\.\/]/g, "\\$&");
}


/** Пара ключ-значение */
export interface IPair<T>
{
    Key: string;
    Value: T;
}


/** Элемент `KeyedCollection` */
export class KeyValuePair<T> implements IPair<T>
{
    constructor(key: string, value: T)
    {
        this.Key = key;
        this.Value = value;
    }

    Key: string;
    Value: T;
}


export class KeyedCollection<T>
{
    protected items: { [index: string]: T } = {};
    private count: number = 0;

    constructor()
    {
    }

    /** Создаёт коллекцию из массивов ключей и значений */
    public static FromArrays<T>(keys: string[], values: T[]): KeyedCollection<T>
    {
        if (keys.length != values.length) throw "Количества ключей и значений отличаются";
        let res = new KeyedCollection<T>();
        for (let i = 0; i < keys.length; i++)
        {
            res.AddPair(keys[i], values[i]);
        }
        return res;
    }

    /** Создаёт коллекцию из массива `IPair` */
    public static FromPairs<T>(pairs: IPair<T>[]): KeyedCollection<T>
    {
        let res = new KeyedCollection<T>();
        pairs.forEach(pair =>
        {
            res.AddPair(pair.Key, pair.Value);
        });
        return res;
    }

    /** Проверяет наличие ключа */
    public Contains(key: string): boolean
    {
        return this.items.hasOwnProperty(key);
    }

    public Count(): number
    {
        return this.count;
    }

    public AddElement(element: KeyValuePair<T>)
    {
        this.AddPair(element.Key, element.Value);
    }

    /** Добавляет или заменяет */
    public AddPair(key: string, value: T)
    {
        if (!this.items.hasOwnProperty(key))
            this.count++;

        this.items[key] = value;
    }

    public Remove(key: string): T
    {
        let val = this.items[key];
        delete this.items[key];
        this.count--;
        return val;
    }

    public Item(key: string): T
    {
        return this.items[key];
    }

    /** массив ключей */
    public Keys(): string[]
    {
        let keySet: string[] = [];

        for (let prop in this.items)
        {
            if (this.items.hasOwnProperty(prop))
            {
                keySet.push(prop);
            }
        }

        return keySet;
    }

    /** массив значений */
    public Values(): T[]
    {
        let values: T[] = [];

        for (let prop in this.items)
        {
            if (this.items.hasOwnProperty(prop))
            {
                values.push(this.items[prop]);
            }
        }

        return values;
    }

    /** Очищает всю коллекцию */
    public Clear(): void
    {
        this.items = {};
        this.count = 0;
    }

    /** обход элементов */
    public ForEach(callback: (key: string, val: T) => any)
    {
        for (let key in this.items)
            callback(key, this.Item(key));
    }

	/** 
	 * преобразует набор 
	 * @param clearNull очищать ли по проверке (!!element)
	*/
    public Select(filter: (key: string, value: T) => any, clearNull = false): any[]
    {
        let res = [];
        this.ForEach((key, value) =>
        {
            let item = filter(key, value);
            if (!clearNull || !!item) res.push(item);
        });
        return res;
    }

    /** Фильтрует набор */
    protected Filter(filter: (key: string, value: T) => boolean): KeyedCollection<T>
    {
        let res = new KeyedCollection<T>();
        this.ForEach((key, value) =>
        {
            if (filter(key, value)) res.AddPair(key, value);
        });
        return res;
    }

    /** Обновляет значение элемента по ключу */
    public UpdateValue(key: string, transform: (value: T) => T): void
    {
        this.AddPair(key, transform(this.Item(key)));
    }

    /** Добавляет диапазон значений */
    public AddRange(range: KeyedCollection<T>): void
    {
        range.ForEach((key, value) =>
        {
            this.AddPair(key, value);
        })
    }

    /** Преобразует коллекцию в новую */
    public Map(func: (key: string, value: T) => KeyValuePair<any>): KeyedCollection<T>
    {
        let res = new KeyedCollection<T>();
        this.ForEach((key, value) =>
        {
            res.AddElement(func(key, value));
        });
        return res;
    }

    /** Преобразует коллекцию в массив */
    public ToArray(func: (element: KeyValuePair<T>) => any): any[]
    {
        let ar: KeyValuePair<T>[] = [];
        this.ForEach((key, value) => { ar.push(new KeyValuePair(key, value)); });
        return ar.map(func);
    }


    /** Возвращает отсортированную массив пар */
    public OrderBy(func: (x: KeyValuePair<T>) => number): KeyValuePair<T>[]
    {
        let res: KeyValuePair<T>[] = [];
        let sortedAr: KeyValuePair<T>[] = this.ToArray(x => x);
        sortedAr = sortedAr.sort(x => func(x));
        sortedAr.forEach(element =>
        {
            res.push(element);
        });
        return res;
    }

}


export class OrderedCollection<T>
{
    private items: KeyValuePair<T>[] = [];
    private keys: string[] = [];


    constructor()
    { }

    private _addKey(key: string)
    {
        this.keys.push(key);
    }

    protected _getIndex(key: string)
    {
        return this.keys.indexOf(key);
    }



    public Get(key: string): T
    {
        let ind = this._getIndex(key);
        if (ind < 0) throw `Ключ "${key}" отсутствует в коллекции`;
        return this.items[ind].Value;
    }


    public Add(key: string, item: T)
    {
        let ind = this._getIndex(key);
        if (ind > -1) throw `Ключ ${key} уже присутствует в коллекции`;
        this._addKey(key)
        this.items.push(new KeyValuePair(key, item));
    }

    public get Count(): number
    {
        return this.items.length;
    }

    public Clear()
    {
        this.items = [];
        this.keys = [];
    }

    public ForEach(callbackfn: (value: KeyValuePair<T>, index: number, array: KeyValuePair<T>[]) => void, thisArg?: any)
    {
        this.items.forEach(callbackfn, thisArg);
    }

    public Contains(key: string): boolean
    {
        return this._getIndex(key) > -1;
    }

    /** Обновляет старое значение `val` по ключу `key` */
    public UpdateValue(key: string, func: (val: T) => T)
    {
        let ind = this._getIndex(key);
        if (ind < 0) throw `Ключ "${key}" не найден в коллекции`;
        this.items[ind].Value = func(this.items[ind].Value);
    }

    public Remove(key: string): T
    {
        let ind = this._getIndex(key);
        if (ind < 0) return undefined;
        this.keys.remove(key);
        let val = this.items[ind].Value;
        this.items = this.items.splice(ind, 1);
        return val;
    }


    public Keys(): string[]
    {
        return this.keys;
    }


    public ToArray(func: (T) => any): any[]
    {
        return this.items.map(x => func(x));
    }
}