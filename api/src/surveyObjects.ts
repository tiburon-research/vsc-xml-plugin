'use strict';
// МОДЕЛИ XML-ЭЛЕМЕНТОВ




import { InlineAttribute } from './currentTag';
import { KeyedCollection } from './customs'
import { Parse } from '.';



export enum SurveyElementType { Item, ListItem, ConstantItem, Answer, List, Question, Page };



/** Универсальный класс для элементов XML */
export class SurveyElement
{
	/** Element TagName */
	protected readonly TagName: string;
	/** Список атрибутов */
	protected Attributes = new KeyedCollection<InlineAttribute>();
	/** Дети поимённо */
	protected Children = new KeyedCollection<SurveyElement[]>();
	/** Содержимое тэга */
	public Content: string;
	/** Оставить однострочные дочерние теги на той же строке */
	public CollapseTags = false;
	/** Хранит тип элемента (если известен) */
	public ElementType: SurveyElementType;
	/** Без отдельного закрывающегося тэга */
	public SelfClosed: boolean;


	constructor(name: string, id?: string, type?: SurveyElementType)
	{
		this.TagName = name;
		if (!!id) this.AddAttr("Id", id);
		if (!!type) this.ElementType = type;
	}

	/** Копирует элемент */
	public Clone(): SurveyElement
	{
		let res = new SurveyElement(this.TagName);

		res = Object.assign(res, this);

		res.Children.Clear();
		this.Children.ForEach((key, value) =>
		{
			value.forEach(element =>
			{
				res.AddChild(element.Clone());
			});
		});

		return res as SurveyElement;
	}

	/** Получение полного XML */
	public ToXML(): string
	{
		let res = "<" + this.TagName;
		let attrs = this.GetAttributes();
		res += attrs;
		if (this.SelfClosed)
		{
			if (this.Children.Count > 0) throw 'Свойство  не может быть установлено при наличии дочерних узлов';
			if (!!this.Content) throw 'Свойство SelfClosed не может быть установлено одновременно с Content';
			res += " />";
		}
		else
		{
			res += ">";
			// получаем всё внутри рекурсивно
			if (this.Children.Count > 0)
			{
				if (!!this.Content) throw 'Свойство Content не может быть установлено при наличии дочерних узлов';
				res += this.XMLbodyFormatter();
			}
			else if (!!this.Content)
			{
				if (this.Content.indexOf('\n') > -1)
					res += "\n" + this.Content + "\n";
				else res += this.Content;
			}
			res += "</" + this.TagName + ">";
		}
		return res;
	}

	/** возвращает XML строку атрибутов */
	public GetAttributes(): string
	{
		let res = "";
		this.Attributes.OrderBy((key, value) => key == "Id" ? 0 : 1).ForEach((key, value) =>
		{
			res += " " + value.Text;
		})
		return res;
	}

	/** проверяет существование атрибута */
	public AttrExists(name: string): boolean
	{
		return this.Attributes.ContainsKey(name);
	}

	/** возвращает значение атрибута */
	public AttrValue(name: string): string
	{
		if (!this.AttrExists(name)) return null;
		return this.Attributes.Item(name).Value;
	}

	/** Добавляет атрибут */
	public AddAttr(name: string, value: string): void
	{
		this.Attributes.AddPair(name, new InlineAttribute(name, value), false);
	}

	/** обновляет значение атрибута */
	public UpdateAttr(name: string, transform: (val: string) => string): void
	{
		this.Attributes.UpdateValue(name, x => new InlineAttribute(name, transform(x.Value)));
	}

	/** функция преобразования дочерних элементов в XML */
	protected XMLbodyFormatter(): string
	{
		if (this.CollapseTags) return this.XMLbodyFormatterCollapse();
		else return this.XMLbodyFormatterExpand();
	}

	/** Каждый тег на новой строке */
	private XMLbodyFormatterExpand(): string
	{
		let body = "";
		this.Children.ForEach((key, value) =>
		{
			value.forEach(cildNode =>
			{
				body += "\n" + cildNode.ToXML();
			});
		});
		// отступаем
		body = body.replace(/\n/g, "\n\t");
		body += "\n";
		return body;
	}

	/** Оставляем однострочные теги на той же строке */
	private XMLbodyFormatterCollapse(): string
	{
		let body = "";
		let childXml: string[] = []; // массив XML детей
		let separated = false;
		this.Children.ForEach((key, value) =>
		{
			value.forEach(cildNode =>
			{
				let child = cildNode.ToXML();
				if (child.indexOf('\n') > -1) separated = true;
				childXml.push(child);
			});
		});
		childXml.forEach(element =>
		{
			if (separated) body += '\n' + element;
			else body += element;
		});
		if (separated)
		{
			body = body.replace(/\n/g, "\n\t");
			body += "\n";
		}
		return body;
	}

	/** добавляет дочерний элемент */
	public AddChild(child: string | SurveyElement): void
	{
		let name = typeof child == "string" ? child : child.TagName;
		let value = typeof child == "string" ? new SurveyElement(child) : child;

		if (!this.Children.ContainsKey(name))
			this.Children.AddPair(name, [value]);
		else this.Children.UpdateValue(name, (val) => { return val.concat([value]) });
	}

	/** Возвращает массив дочерних тэгов с указанным именем */
	public GetChildrenByName(tagName: string): SurveyElement[]
	{
		return this.Children.Item(tagName);
	}

	/** Возвращает содержимое тэга Text */
	public GetText(): string
	{
		let children = this.GetChildrenByName("Text");
		return !!children && children.length > 0 ? children[0].Content : null;
	}

	public ToListItem(): SurveyListItem
	{
		return new SurveyListItem(this.AttrValue("Id"), this.GetText());
	}

	public ToAnswer(): SurveyAnswer
	{
		return new SurveyAnswer(this.AttrValue("Id"), this.GetText());
	}

}


/** <Item> */
export class SurveyItem extends SurveyElement
{
	constructor(id?: string, textOrValue?: string, withValue?: boolean)
	{
		super("Item", id);
		let textItem = new SurveyElement(withValue ? "Value" : "Text");
		textItem.Content = textOrValue;
		this.AddChild(textItem);
		this.ElementType = SurveyElementType.Item;
	}
}


/** список Var для SurveyListItem */
export class SurveyListItemVars
{
	constructor(varArray: string[])
	{
		varArray.forEach(element =>
		{
			this.Items.push(element);
		});
	}

	public readonly Items = new Array<string>();

	/** Добавляет Var */
	public Add(text: string): void
	{
		this.Items.push(text);
	}

	/** Возвращает указанный var */
	public Get(index: number): string
	{
		if (this.Items.length > index) return this.Items[index];
		else return undefined;
	}

	/** Возвращает количество Var */
	public Count(): number
	{
		return this.Items.length;
	}
}


/** Элементы <Item> для <List> */
export class SurveyListItem extends SurveyItem
{
	/** Коллекция Var */
	public Vars: SurveyListItemVars;
	/** Var отдельными тэгами */
	public SeparateVars: boolean;


	constructor(id?: string, text?: string)
	{
		super(id, text);
		this.CollapseTags = true;
		this.ElementType = SurveyElementType.ListItem;
	}

	/** преобразует к стандартному классу */
	public ToSurveyItem(): SurveyElement
	{
		let res = new SurveyElement("Item");
		// копируем все свойства
		res = Object.assign(res, this);

		// добавляем Var
		if (!!this.Vars && this.Vars.Count() > 0)
		{
			if (this.SeparateVars)
			{
				this.Vars.Items.forEach(x =>
				{
					let Var = new SurveyElement("Var");
					Var.Content = x;
					res.AddChild(Var);
				})
			}
			else
			{
				res.AddAttr("Var", this.Vars.Items.join(","));
			}
		}
		return res;
	}

	public ToXML(): string
	{
		return this.ToSurveyItem().ToXML();
	}

}


/** Элементы <Item> для <Constants> */
export class SurveyConstantsItem extends SurveyItem
{

	constructor(id?: string, value?: string)
	{
		super(id, value, true);
		this.CollapseTags = true;
		this.ElementType = SurveyElementType.ConstantItem;
	}

	/** преобразует к стандартному классу */
	public ToSurveyItem(separateVars: boolean): SurveyElement
	{
		let res = new SurveyElement("Item");
		// копируем все свойства
		res = Object.assign(res, this);
		return res;
	}

}


/** Объект элемента листа */
interface SurveyListItemObject
{
	Id?: string;
	Text?: string;
	Vars?: string[];
}


/** класс для <List> */
export class SurveyList extends SurveyElement
{
	/** Каждый Var - отдельный тег */
	public VarsAsTags = true;
	/** Элементы Item */
	public Items = new KeyedCollection<SurveyListItem>();


	constructor(id?: string)
	{
		super("List", id);
		this.ElementType = SurveyElementType.List;
	}

	/** 
	 * Добавляет новый элемент листа 
	 * 
	 * Если `item.Id` не задан, то генерируется автоматически
	 * 
	 * Если элемент с таким Id существует, то он будет заменён!
	 * 
	 * Возвращает Id нового элемента
	*/
	public AddItem(item: SurveyListItemObject): string
	{
		let id;
		// генерируем Id автоматически
		if (!item.Id)
		{
			let itemIds = this.Items.Keys.map(x => Number(x)).filter(x => !!x).sort(x => x);
			if (itemIds.length == 0) id = "1";
			else id = '' + (itemIds[itemIds.length - 1] + 1);
		}
		else id = item.Id;

		let res = new SurveyListItem(id, item.Text);
		res.SeparateVars = this.VarsAsTags;
		if (!!item.Vars && item.Vars.length > 0) res.Vars = new SurveyListItemVars(item.Vars);
		// предупреждаем о перезаписи
		if (this.Items.ContainsKey(id)) console.warn("Элемент '" + id + "' уже существует в листе '" + this.AttrValue("Id") + "', он будет заменён.");
		this.Items.AddPair(id, res);
		return id;
	}

	/** Добавляет список Item в лист */
	public AddItemRange(items: SurveyListItemObject[]): void
	{
		items.forEach(item => this.AddItem(item));
	}


	public ToXML(): string
	{
		// Items не числятся в Children
		this.Items.ForEach((key, value) =>
		{
			this.AddChild(value.ToSurveyItem());
		})
		return super.ToXML();
	}

}


export class SurveyAnswer extends SurveyElement
{
	constructor(id?: string, text?: string)
	{
		super("Answer", id);
		let textItem = new SurveyElement("Text");
		textItem.Content = text;
		this.AddChild(textItem);
		this.ElementType = SurveyElementType.Answer;
		this.CollapseTags = true;
	}

	/** преобразует к стандартному классу */
	public ToSurveyItem(): SurveyElement
	{
		let res = new SurveyElement("Answer");
		// копируем все свойства
		res = Object.assign(res, this);
		return res;
	}
}


export class SurveyQuestion extends SurveyElement
{
	/** Элементы Item */
	public Answers = new KeyedCollection<SurveyAnswer>();

	/** Заголовок вопроса */
	public Header: string;

	constructor(id?: string, questionType?: string)
	{
		super("Question", id);
		if (!!questionType) this.AddAttr("Type", questionType);
		this.ElementType = SurveyElementType.Question;
	}

	/** 
	 * Добавляет новый Answer 
	 * 
	 * Если `answer.Id` не задан, то генерируется автоматически
	 * 
	 * Если элемент с таким Id существует, то он будет заменён!
	 * 
	 * Возвращает Id нового элемента
	*/
	public AddAnswer(answer: SurveyAnswer): string
	{
		let id = answer.AttrValue("Id");
		// генерируем Id автоматически
		if (!id)
		{
			let answerIds = this.Answers.Keys.map(x => Number(x)).filter(x => !!x).sort(x => x);
			if (answerIds.length == 0) id = "1";
			else id = '' + (answerIds[answerIds.length - 1] + 1);
		}

		answer.UpdateAttr('Id', x => id);
		// предупреждаем о перезаписи
		if (this.Answers.ContainsKey(id)) console.warn("Ответ '" + id + "' уже существует в вопросе '" + this.AttrValue("Id") + "', он будет заменён.");
		this.Answers.AddPair(id, answer);
		return id;
	}


	public ToXML(): string
	{
		let headerTag = new SurveyElement("Header");
		headerTag.Content = this.Header;
		this.AddChild(headerTag);
		// Answers не числятся в Children
		this.Answers.ForEach((key, value) =>
		{
			this.AddChild(value.ToSurveyItem());
		})
		return super.ToXML();
	}
}

export class SurveyPage extends SurveyElement
{
	constructor(id?: string)
	{
		super("Page", id);
		this.ElementType = SurveyElementType.Page;
	}
}


export class SurveyQuestionBlock
{
	private questions: SurveyList;
	private answers: SurveyAnswer[];
	private pageId: string;
	/** Заголовок вопроса */
	public Header: string;
	public QuestionMix: string;

	constructor(pageId: string)
	{
		this.pageId = pageId;
	}

	public AddQuestions(listName: string, questions: Parse.ParsedElementObject[])
	{
		this.questions = new SurveyList(listName);
		this.questions.AddItemRange(questions);
	}

	public AddAnswers(answers: SurveyAnswer[])
	{
		this.answers = answers;
	}

	public ToUnionXml(qPrefix: string, qType: string): string
	{
		let res = '';
		res += this.questions.ToXML() + '\n\n';
		let question = this.setQuestion(qPrefix + "_dummy", qType);
		question.AddAttr('Union', '$all');
		question.Header = this.Header;
		let page = new SurveyPage(this.pageId);
		let repeat = new SurveyElement("Repeat");
		repeat.AddAttr('List', this.questions.AttrValue("Id"));
		let subQuestion = new SurveyElement("Question", qPrefix + "_@ID");
		subQuestion.AddAttr("Type", qType);
		let subQText = new SurveyElement("Text");
		subQText.Content = "@Text";
		subQText.CollapseTags = true;
		subQuestion.AddChild(subQText);
		if (!!this.QuestionMix)
		{
			question.AddAttr('MixId', this.QuestionMix);
			subQuestion.AddAttr('SyncId', '@ID');
		}
		repeat.AddChild(subQuestion);
		repeat.CollapseTags = false;
		page.AddChild(repeat);
		page.AddChild(question);
		res += page.ToXML();
		return res;
	}

	public ToQuestionBlock(qType?: string)
	{
		let res = '';
		res += this.questions.ToXML() + '\n\n';
		let qId = this.pageId + "_@ID";
		let question = this.setQuestion(qId, qType);
		question.Header = "@Text";
		let repeat = new SurveyElement("Repeat");
		repeat.AddAttr('List', this.questions.AttrValue("Id"));
		repeat.AddChild(question);
		let page = new SurveyPage(this.pageId);
		let pageHeader = new SurveyElement("Header");
		pageHeader.Content = this.Header;
		page.AddChild(pageHeader);
		if (!!this.QuestionMix)
		{
			let block = new SurveyElement('Block');
			block.SelfClosed = true;
			block.AddAttr('Items', '$repeat(' + this.questions.AttrValue("Id") + '){' + qId + '[,]}');
			block.AddAttr('MixId', this.QuestionMix);
			question.AddAttr('SyncId', '@ID');
			page.AddChild(block);
		}
		page.AddChild(repeat);
		res += page.ToXML();
		return res;
	}

	private setQuestion(id: string, qType: string)
	{
		let question = new SurveyQuestion(id, qType);
		this.answers.forEach(a =>
		{
			question.AddAnswer(a);
		});
		return question;
	}
}


export namespace Structures
{
	class DefaultElement
	{
		public Id: string;
		public Text: string;
	}

	export class ListItem extends DefaultElement
	{
		public Vars: string[] = [];
	}

	export class Answer extends DefaultElement
	{

	}
}