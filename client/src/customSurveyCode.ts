import * as vscode from 'vscode';
import { JQuery } from 'tib-api';
import { SurveyListItem, SurveyListItemVars, SurveyConstantsItem } from 'tib-api/lib/surveyObjects';
import xlsx from 'node-xlsx';


var $ = JQuery.init();
var $dom;


function __getItemText($item): string
{
	let res = null
	let attr = $item.attr('Text');
	let $tag = $item.find('Text');
	if (typeof attr !== 'undefined' && attr !== false) res = attr;
	else if ($tag.length > 0) res = $tag.text();
	return res;
}

function __getItemValue($item): string
{
	let res = null
	let attr = $item.attr('Value');
	let $tag = $item.find('Value');
	if (typeof attr !== 'undefined' && attr !== false) res = attr;
	else if ($tag.length > 0) res = $tag.text();
	return res;
}

function __getListItemVars($item, safe = false): string[]
{
	let vars = [];
	let varsAttr = $item.attr('Var');
	let $varsTags = $item.find('Var');
	if (!!varsAttr) vars = vars.concat(varsAttr.split(','));
	else if ($varsTags.length > 0) vars = vars.concat($.map($varsTags, v => $dom.find(v).text()));
	else if (safe) throw '';
	return vars;
}


/** Получение item с проверками */
function __getListItem(listId: string, itemId: string)
{
	let $list = __getList(listId);
	let $item = $list.find(`Item[Id="${itemId}"]`);
	if ($item.length == 0) throw `Элемент "${itemId}" не найден в списке ${listId}`;
	return $item;
}


function __getList(listId: string)
{
	let $list = $dom.find(`List[Id="${listId}"]`);
	if ($list.length == 0) throw `Список с Id="${listId}" не найден`;
	return $list;
}

function __getConstants()
{
	let $consts = $dom.find(`Constants`);
	if ($consts.length == 0) throw `Констнанты не найдены`;
	return $consts;
}

function __getConstantItem(itemId: string)
{
	let $consts = __getConstants();
	let $item = $consts.find(`Item[Id="${itemId}"]`);
	if ($item.length == 0) throw `Константа "${itemId}" не найдена`;
	return $item;
}



namespace XML
{
	export class List
	{
		public readonly id: string;
		public readonly items: ListItem[];
		/** Представление JQuery */
		public $element;
	}

	export class ListItem
	{
		public readonly id: string;
		public readonly text: string;
		public readonly vars?: string[];
		/** Представление JQuery */
		public $element;
	}

	export class Constants
	{
		public readonly items: ConstantItem[];
		/** Представление JQuery */
		public $element;
	}

	export class ConstantItem
	{
		public readonly id: string;
		public readonly value: string;
		/** Представление JQuery */
		public $element;
	}

	

	/** Работа с листами */
	export class DocumentLists
	{
		constructor(private $dom)
		{ }

		/** Получает List по Id */
		public get(id: string): List
		{
			let $list = __getList(id);
			let items = $.map($list.find('Item'), i =>
			{
				let $item = $dom.find(i);
				return {
					id: $item.attr('Id'),
					text: __getItemText($item),
					vars: __getListItemVars($item),
					$element: $item
				} as XML.ListItem;
			})
			return {
				id: $list.attr('Id'),
				items,
				$element: $list
			} as XML.List;
		}

		/** Должно работать быстрее, чем полный Lists.get() */
		public getItemText(listId: string, itemId: string): string
		{
			let $item = __getListItem(listId, itemId);
			let text = __getItemText($item);
			if (text === null) throw `Текст в элементе "${itemId}" списка "${listId}" отсутствует`;
			return text;
		}

		/** Должно работать быстрее, чем полный Lists.get() */
		public getItemVars(listId: string, itemId: string): string[]
		{
			let $item = __getListItem(listId, itemId);
			let res = [];
			try
			{
				res = __getListItemVars($item, true);
			} catch (error)
			{
				throw `В элементе "${itemId}" списка "${listId}" отсутствуют Var`;
			}
			return res;
		}

		/** Добавляет элемент в конец листа */
		public addItem(listId: string, item: ListItem)
		{
			let $list = __getList(listId);
			let itemObj = new SurveyListItem(item.id, item.text);
			if (typeof item.vars != 'undefined' && item.vars.length > 0) itemObj.Vars = new SurveyListItemVars(item.vars);
			$list.append(itemObj.ToXML());
		}

		/** Обновляет текст элемента */
		public setItemText(listId: string, itemId: string, text: string)
		{
			let $item = __getListItem(listId, itemId);
			let attr = $item.attr('Text');
			if (typeof attr != 'undefined' && attr !== false)
				$item.attr('Text', text);
			else
			{
				let $text = $item.find('Text');
				if ($text.length == 0) $item.append(`<Text>${text}</Text>`);
				else $text.text(text);
			}
		}

		/** Обновляет Var */
		public setItemVars(listId: string, itemId: string, vars: string[])
		{
			let $item = __getListItem(listId, itemId);
			$item.removeAttr('Var');
			$item.find('Var').remove();
			let varItems = vars.map(v => `<Var>${v}</Var>`);
			$item.prepend(varItems);
		}

	}

	export class DocumentConstants
	{
		constructor(private $dom)
		{ }
		
		/** Получает все константы */
		public get(): Constants
		{
			let $consts = __getConstants();
			let items = $.map($consts.find('Item'), i =>
			{
				let $item = $dom.find(i);
				return {
					id: $item.attr('Id'),
					value: __getItemValue($item)
				} as XML.ConstantItem;
			})
			return {
				items,
				$element: $consts
			} as XML.Constants;
		}
		
		/** Получает значение константы */
		public getItemValue(itemId: string): string
		{
			let $item = __getConstantItem(itemId);
			let value = __getItemValue($item);
			return value;
		}

		/** Добавляет элемент в конец листа */
		public addItem(item: ConstantItem)
		{
			let $const = __getConstants();
			let itemObj = new SurveyConstantsItem(item.id, item.value);
			$const.append(itemObj.ToXML());
		}

		/** Обновляет текст элемента */
		public setItemValue(id: string, value: string)
		{
			let $item = __getConstantItem(id);
			let attr = $item.attr('Value');
			if (typeof attr != 'undefined' && attr !== false)
				$item.attr('Value', value);
			else
			{
				let $value = $item.find('Value');
				if ($value.length == 0) $item.append(`<Value>${value}</Value>`);
				else $value.text(value);
			}
		}
	}
}




/** Реализует удобную работу с документом tib-xml */
export class DocumentObjectModel
{
	constructor(private document: vscode.TextDocument, dom: any, f: (s: string) => Promise<void>)
	{
		this.text = document.getText();
		$dom = dom;
		this.applyChanges = () => { return f($dom.xml()); };
		this.lists = new XML.DocumentLists($dom);
		this.constants = new XML.DocumentConstants($dom)
	}

	/** Полный текст документа */
	public text: string;
	/** Объект для работы с листами */
	public lists: XML.DocumentLists;
	/** Объект для работы с константами */
	public constants: XML.DocumentConstants;
	/** Применяет к документу внесённые изменения */
	public applyChanges: () => Promise<void>;

}