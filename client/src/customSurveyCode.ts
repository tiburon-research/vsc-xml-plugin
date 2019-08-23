import * as vscode from 'vscode';
import { JQuery } from 'tib-api';
import { SurveyListItem, SurveyListItemVars } from 'tib-api/lib/surveyObjects';


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

function __getListItemVars($item, safe = false): string[]
{
	let vars = [];
	let varsAttr = $item.attr('Var');
	let $varsTags = $item.find('Var');
	if (!!varsAttr) vars = vars.concat(varsAttr.split(','));
	else if ($varsTags.length > 0) vars = vars.concat($.map($varsTags, v => $(v).text()));
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


function __replaceAllText(text: string)
{
	vscode.window.activeTextEditor.edit(builder =>
	{
		builder.replace
	})
}



namespace XML
{
	export class ListItem
	{
		readonly id: string;
		readonly text: string;
		readonly vars?: string[];
	}

	export class List
	{
		readonly id: string;
		readonly items: ListItem[];
	}

	/** Работа с листами */
	export class Lists
	{
		constructor(private $dom)
		{ }

		/** Получает List по Id */
		public get(id: string): List
		{
			let $list = __getList(id);
			let items = $.map($list.find('Item'), i =>
			{
				let $item = $(i);
				return {
					id: $item.attr('Id'),
					text: __getItemText($item),
					vars: __getListItemVars($item)
				} as XML.ListItem;
			})
			return {
				id: $list.attr('Id'),
				items
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
}




/** Реализует удобную работу с документом tib-xml */
export class DocumentObjectModel
{
	/** Полный текст документа */
	public text: string;
	/** Объект для работы с листами */
	public lists: XML.Lists;
	/** Применяет к документу внесённые изменения */
	public applyChanges: () => Promise<void>;

	constructor(private document: vscode.TextDocument, f: (s: string) => Promise<void>)
	{
		this.text = document.getText();
		$dom = $.XMLDOM(this.text);
		this.applyChanges = () => { return f($dom.xml()); };
		this.lists = new XML.Lists($dom);
	}

}