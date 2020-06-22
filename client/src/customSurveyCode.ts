import * as vscode from 'vscode';
import { JQuery, Language } from 'tib-api';
import { SurveyListItem, SurveyListItemVars, SurveyConstantsItem } from 'tib-api/lib/surveyObjects';
import * as Formatting from './formatting';
import { Settings } from './extension';
import xlsx from 'node-xlsx';
import { getFullRange } from './extension';
import { updateFileText } from './classes';
import * as Errors from './errors';


var $ = JQuery.init();


class XmlDocumentWorker
{

	constructor(private $dom)
	{ }

	public getItemText($item): string
	{
		let res = null
		let attr = $item.attr('Text');
		let $tag = $item.find('Text');
		if (typeof attr !== 'undefined' && attr !== false) res = attr;
		else if ($tag.length > 0) res = $tag.text();
		return res;
	}

	public getItemValue($item): string
	{
		let res = null
		let attr = $item.attr('Value');
		let $tag = $item.find('Value');
		if (typeof attr !== 'undefined' && attr !== false) res = attr;
		else if ($tag.length > 0) res = $tag.text();
		return res;
	}

	public getListItemVars($item, safe = false): string[]
	{
		let vars = [];
		let varsAttr = $item.attr('Var');
		let $varsTags = $item.find('Var');
		if (!!varsAttr) vars = vars.concat(varsAttr.split(','));
		else if ($varsTags.length > 0) vars = vars.concat($.map($varsTags, v => this.$dom.find(v).text()));
		else if (safe) throw '';
		return vars;
	}


	/** Получение item с проверками */
	public getListItem(listId: string, itemId: string)
	{
		let $list = this.getList(listId);
		let $item = $list.find(`Item[Id="${itemId}"]`);
		if ($item.length == 0) throw `Элемент "${itemId}" не найден в списке ${listId}`;
		return $item;
	}


	public getListItemObject($item): XML.ListItem
	{
		return {
			id: $item.attr('Id'),
			text: this.getItemText($item),
			vars: this.getListItemVars($item),
			$element: $item
		} as XML.ListItem;
	}


	public getList(listId: string)
	{
		let $list = this.$dom.find(`List[Id="${listId}"]`);
		if ($list.length == 0) throw `Список с Id="${listId}" не найден`;
		return $list;
	}

	public getConstants()
	{
		let $consts = this.$dom.find(`Constants`);
		if ($consts.length == 0) throw `Констнанты не найдены`;
		return $consts;
	}

	public getConstantItem(itemId: string)
	{
		let $consts = this.getConstants();
		let $item = $consts.find(`Item[Id="${itemId}"]`);
		if ($item.length == 0) throw `Константа "${itemId}" не найдена`;
		return $item;
	}
	
}




export namespace XML
{
	/** Стиль отображения */
	export enum ListItemView
	{
		/** <Item Var=""><Text></Text></Iteam> */
		VarsInline,
		/** <Item><Text></Text><Var></Var></Iteam> */
		VarTagsInline,
		/** <Item>
		 * 
		 *	 <Text></Text>
		
		 *	 <Var></Var>
		
		 * </Iteam> 
		*/
		Separated
	}

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
		private worker: XmlDocumentWorker;

		constructor(private $dom)
		{
			this.worker = new XmlDocumentWorker(this.$dom);
		}

		/** Получает List по Id */
		public get(id: string): List
		{
			let $list = this.worker.getList(id);
			let items = $.map($list.find('Item'), i =>
			{
				return this.worker.getListItemObject(this.$dom.find(i));
			});
			return {
				id: $list.attr('Id'),
				items,
				$element: $list
			} as XML.List;
		}


		/** Очищает лист от Item */
		public clear(listId: string): void
		{
			let $list = this.worker.getList(listId);
			$list.find('Item').remove();
		}


		/** Должно работать быстрее, чем полный Lists.get() */
		public getItem(listId: string, itemId: string): ListItem
		{
			let $item = this.worker.getListItem(listId, itemId);			
			return this.worker.getListItemObject($item);
		}

		/** Должно работать быстрее, чем полный Lists.get() */
		public getItemText(listId: string, itemId: string): string
		{
			let $item = this.worker.getListItem(listId, itemId);
			let text = this.worker.getItemText($item);
			if (text === null) throw `Текст в элементе "${itemId}" списка "${listId}" отсутствует`;
			return text;
		}

		/** Должно работать быстрее, чем полный Lists.get() */
		public getItemVars(listId: string, itemId: string): string[]
		{
			let $item = this.worker.getListItem(listId, itemId);
			let res = [];
			try
			{
				res = this.worker.getListItemVars($item, true);
			} catch (error)
			{
				throw `В элементе "${itemId}" списка "${listId}" отсутствуют Var`;
			}
			return res;
		}

		/** Добавляет элемент в конец листа */
		public addItem(listId: string, item: ListItem, style?: ListItemView)
		{
			let $list = this.worker.getList(listId);
			let itemObj = new SurveyListItem(item.id, item.text);
			if (typeof style != 'undefined')
			{
				itemObj.SeparateVars = style == ListItemView.Separated || style == ListItemView.VarTagsInline;
				itemObj.CollapseTags = style == ListItemView.VarsInline || style == ListItemView.VarTagsInline;
			}
			if (typeof item.vars != 'undefined' && item.vars.length > 0) itemObj.Vars = new SurveyListItemVars(item.vars);
			$list.append(itemObj.ToXML()+ '\n');
		}

		/** Обновляет текст элемента */
		public setItemText(listId: string, itemId: string, text: string)
		{
			let $item = this.worker.getListItem(listId, itemId);
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
			let $item = this.worker.getListItem(listId, itemId);
			$item.removeAttr('Var');
			$item.find('Var').remove();
			let varItems = vars.map(v => `<Var>${v}</Var>`);
			$item.prepend(varItems);
		}

	}

	/** Работа с константами */
	export class DocumentConstants
	{
		private worker: XmlDocumentWorker;

		constructor(private $dom)
		{
			this.worker = new XmlDocumentWorker(this.$dom);
		}
		
		/** Получает все константы */
		public get(): Constants
		{
			let $consts = this.worker.getConstants();
			let items = $.map($consts.find('Item'), i =>
			{
				let $item = this.$dom.find(i);
				return {
					id: $item.attr('Id'),
					value: this.worker.getItemValue($item)
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
			let $item = this.worker.getConstantItem(itemId);
			let value = this.worker.getItemValue($item);
			return value;
		}

		/** Добавляет элемент в конец листа */
		public addItem(item: ConstantItem)
		{
			let $const = this.worker.getConstants();
			let itemObj = new SurveyConstantsItem(item.id, item.value);
			$const.append(itemObj.ToXML() + '\n');
		}

		/** Обновляет текст элемента */
		public setItemValue(id: string, value: string)
		{
			let $item = this.worker.getConstantItem(id);
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
	public readonly $dom;

	constructor(document: vscode.TextDocument)
	{
		this.text = document.getText();
		this.$dom = JQuery.init().XMLDOM(document.getText());
		this.applyChanges = () =>
		{
			return new Promise<void>((resolve, reject) =>
			{
				this.getText().then(text =>
				{
					vscode.window.activeTextEditor.edit(builder =>
					{
						builder.replace(getFullRange(document), text);
					}).then(() => { resolve(); });
				});
			});
		};
		this.lists = new XML.DocumentLists(this.$dom);
		this.constants = new XML.DocumentConstants(this.$dom)
	}

	/** Создаёт DocumentObjectModel из указанного файла */
	public static async loadFileAsync(path: string): Promise<DocumentObjectModel>
	{
		let doc = await vscode.workspace.openTextDocument(path);
		let dom = new DocumentObjectModel(doc);
		dom.applyChanges = () =>
		{
			return new Promise<void>((resolve, reject) =>
			{
				dom.getText().then(text =>
				{
					updateFileText(path, text, 'utf-8'); // на данный момент include в двигле работает только в utf-8
					resolve();
				});
			});
		}
		return dom;
	}

	/** Возвращает отформатированный текст документа */
	public getText(): Promise<string>
	{
		return Formatting.format(this.$dom.xml(), Language.XML, Settings, '\t', 0);
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



/** Вывод сообщений */
export namespace FeedBack
{
	export function showError(text: string)
	{
		return Errors.showError(text);
	}

	export function showWarning(text: string)
	{
		return Errors.showWarning(text);
	}

	export function showInfo(text: string)
	{
		return Errors.showInfo(text);
	}
}