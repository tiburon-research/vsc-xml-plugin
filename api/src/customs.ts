'use strict';
// УНИВЕРСАЛЬНОЕ



import * as fs from 'fs'
import { URI as Uri } from 'vscode-uri'
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


/** Подготовленная для Snippet строка */
export function safeSnippet(text: string): string
{
	if (!text) return '';
	return text.replace(/\$/g, "\\$");
}
