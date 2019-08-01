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
export function createDir(path: string, createWholePath = false)
{
	if (createWholePath)
	{
		let delimiter = '\\';
		if (path.indexOf(delimiter) < 0) delimiter = '/';
		let folders = path.split(delimiter);
		if (folders.length == 0) throw "Не удалось распознать путь";
		let prevPath = '';
		folders.forEach(f =>
		{
			prevPath += f + delimiter;
			if (!pathExists(prevPath)) fs.mkdirSync(prevPath);
		});
	}
	else fs.mkdirSync(path);
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
	
	constructor()
	{ }

	private _keys: string[] = [];
	private _values: T[] = [];

	private _getindex(key: string): number
	{
		return this._keys.indexOf(key);
	}


	/** Массив ключей */
	public get Keys(): string[] { return this._keys; };
	/** Массив значений */
	public get Values(): T[] { return this._values; };
	/** Количество элементов */
	public get Count(): number { return this._keys.length; };


	/** Возвращает элемент по ключу */
	public Item(key: string): T
	{
		let res: T = undefined;
		let ind = this._getindex(key);
		if (ind > -1) res = this._values[ind];
		return res;
	}


	/** 
	 * Добавляет или заменяет
	 * 
	 * `ignoreDuplicates` - заменять дублирующиеся элементы (если false, то будет ошибка)
	*/
	public Add(key: string, value: T, ignoreDuplicates = true)
	{
		let index = this._getindex(key);
		if (index > -1)
		{
			if (!ignoreDuplicates) throw "Элемент с таким ключом уже содержится в коллекции!";
			this._values[index] = value;
		}
		this._keys.push(key);
		this._values.push(value);
	}


	/** 
	 * Добавляет или заменяет
	 * 
	 * `ignoreDuplicates` - заменять дублирующиеся элементы (если false, то будет ошибка)
	*/
	public AddElement(element: KeyValuePair<T>, ignoreDuplicates = false)
	{
		this.Add(element.Key, element.Value, ignoreDuplicates);
	}


	/** Удаляет элемент и возвращает его */
	public Remove(key: string): T
	{
		let index = this._getindex(key);
		let val: T;
		if (index > -1)
		{
			this._keys.splice(index, 1);
			val = this._values.splice(index, 1)[0];
		}
		return val;
	}


	/** Очищает всю коллекцию */
	public Clear(): void
	{
		this._keys = [];
		this._values = [];
	}


	/** Обход элементов */
	public ForEach(callback: (key: string, val: T) => any)
	{
		for (let i = 0; i < this._keys.length; i++) {
			callback(this._keys[i], this._values[i]);
		}
	}


	/** Преобразует коллекцию в объект */
	public ToSimpleObject(): { [index: string]: T }
	{
		let res: { [index: string]: T } = {};
		this.ForEach((key, value) => { res[key] = value });
		return res;
	}


	/** Создаёт коллекцию из объекта */
	public static FromObject<T>(obj: { [index: string]: T }): KeyedCollection<T>
	{
		let res = new KeyedCollection<T>();
		for (let key in obj)
		{
			if (obj.hasOwnProperty(key)) res.Add(key, obj[key]);
		}
		return res;
	}


	/** Создаёт коллекцию из массивов ключей и значений */
	public static FromArrays<T>(keys: string[], values: T[]): KeyedCollection<T>
	{
		if (keys.length != values.length) throw "Количества ключей и значений отличаются";
		let res = new KeyedCollection<T>();
		res._keys = keys;
		res._values = values;
		return res;
	}


	/** Создаёт коллекцию из массива пар */
	public static FromPairs<T>(pairs: IPair<T>[]): KeyedCollection<T>
	{
		let res = new KeyedCollection<T>();
		pairs.forEach(pair =>
		{
			res.Add(pair.Key, pair.Value);
		});
		return res;
	}


	/** Проверка поэлементно */
	public Find(filter: (key: string, val: T) => boolean): KeyValuePair<T>
	{
		let res: KeyValuePair<T>;
		this.ForEach((key, value) =>
		{
			if (filter(key, value)) return res = new KeyValuePair(key, value);
		});
		return res;
	}


	/** Проверяет наличие ключа */
	public ContainsKey(key: string): boolean
	{
		return this._getindex(key) > -1;
	}
	

	/** Фильтрует набор */
	protected Filter(filter: (key: string, value: T) => boolean): KeyedCollection<T>
	{
		let res = new KeyedCollection<T>();
		this.ForEach((key, value) =>
		{
			if (filter(key, value)) res.Add(key, value);
		});
		return res;
	}


	/** Обновляет значение элемента по ключу */
	public UpdateValue(key: string, transform: (value: T) => T): void
	{
		this.Add(key, transform(this.Item(key)), true);
	}

	
	/** Добавляет диапазон значений */
	public AddRange(range: KeyedCollection<T>): void
	{
		range.ForEach((key, value) =>
		{
			this.Add(key, value);
		})
	}


	/** 
	 * Преобразует коллекцию в массив
	 * 
	 * `clearNull` - очищать ли по проверке !!element
	*/
	public ToArray<Q>(filter: (key: string, value: T) => Q, clearNull = false): Q[]
	{
		let res: Q[] = [];
		this.ForEach((key, value) =>
		{
			let item = filter(key, value);
			if (!clearNull || !!item) res.push(item);
		});
		return res;
	}


	/** Преобразует коллекцию в новую */
	public Select<Q>(func: (key: string, value: T) => KeyValuePair<Q>): KeyedCollection<Q>
	{
		let res = new KeyedCollection<Q>();
		this.ForEach((key, value) =>
		{
			res.AddElement(func(key, value));
		});
		return res;
	}


	/** Возвращает отсортированный массив пар */
	public OrderBy(func: (key: string, value: T) => number): KeyedCollection<T>
	{
		let res = new KeyedCollection<T>();
		let sortedAr: KeyValuePair<T>[] = this.ToArray((key, value) => { return new KeyValuePair(key, value) });
		sortedAr = sortedAr.sort(x => func(x.Key, x.Value));
		sortedAr.forEach(element =>
		{
			res.AddElement(element);
		});
		return res;
	}

}
