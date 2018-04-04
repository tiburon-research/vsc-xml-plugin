'use strict';


import { KeyedCollection, InlineAttribute } from './classes';




/** Универсальный класс для элементов XML */
export class SurveyItem
{
    /** Element TagName */
    protected readonly TagName: string;
    /** Список атрибутов */
    protected Attributes = new KeyedCollection<InlineAttribute>();
    /** Дети поимённо */
    protected Children = new KeyedCollection<SurveyItem[]>();
    /** текст элемента */
    public Text: string;
    /** Оставить однострочные дочерние теги на той же строке */
    public CollapseTags = false;


    constructor(name: string, id?: string)
    {
        this.TagName = name;
        if (!!id) this.SetAttr("Id", id);
    }

    /** Получение полного XML */
    public ToXML(): string
    {
        let res = "<" + this.TagName;
        res += this.GetAttributes() + ">";
        // получаем всё внутри рекурсивно
        if (this.Children.Count() > 0)
        {
            res += this.XMLbodyFormatter();
        }
        else if (!!this.Text)
        {
            if (this.Text.indexOf('\n') > -1)
                res += "\n" + this.Text + "\n";
            else res += this.Text;
        }
        res += "</" + this.TagName + ">";
        return res;
    }

    /** возвращает XML строку атрибутов */
    public GetAttributes(): string
    {
        let res = "";
        this.Attributes.forEach((key, value) =>
        {
            res += " " + value.Text;
        })
        return res;
    }

    /** проверяет существование атрибута */
    public AttrExists(name: string): boolean
    {
        return this.Attributes.Contains(name);
    }

    /** возвращает значение атрибута */
    public AttrValue(name: string): string
    {
        if (!this.AttrExists(name)) return null;
        return this.Attributes.Item(name).Value;
    }

    /** задаёт значение атрибута (или создаёт новый) */
    public SetAttr(name: string, value: string): void
    {
        this.Attributes.AddPair(name, new InlineAttribute(name, value));
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
        this.Children.forEach((name, element) =>
        {
            element.forEach(cildNode =>
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
        this.Children.forEach((name, element) =>
        {
            element.forEach(cildNode =>
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
    public AddChild(child: string | SurveyItem): void
    {
        let name = typeof child == "string" ? child : child.TagName;
        let value = typeof child == "string" ? new SurveyItem(child) : child;

        if (!this.Children.Contains(name))
            this.Children.AddPair(name, [value]);
        else this.Children.UpdateValue(name, (val) => { return val.concat([value]) });
    }

    /** возвращает полный массив детей */
    public GetChildren(): SurveyItem[]
    {
        let res = [];
        this.Children.forEach((key, value) =>
        {
            res = res.concat(value);
        })
        return res;
    }
}


/** <Item> */
export class SurveyElementItem extends SurveyItem
{
    constructor(id?: string, text?: string)
    {
        super("Item", id);
        let textItem = new SurveyItem("Text");
        textItem.Text = text;
        this.AddChild(textItem);
    }
}


/** список Var для SurveyListItem */
class SurveyListItemVars
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
export class SurveyListItem extends SurveyElementItem
{
    /** Коллекция Var */
    public Vars: SurveyListItemVars;


    constructor(id?: string, text?: string)
    {
        super(id, text);
        this.CollapseTags = true;
    }

    /** преобразует к стандартному классу */
    public ToSurveyItem(separateVars: boolean): SurveyItem
    {
        let res = new SurveyItem("Item");
        // копируем все свойства
        res = Object.assign(res, this);

        // добавляем Var
        if (this.Vars.Count() > 0)
        {
            if (separateVars)
            {
                this.Vars.Items.forEach(x =>
                {
                    let Var = new SurveyItem("Var");
                    Var.Text = x;
                    res.AddChild(Var);
                })
            }
            else
            {
                res.SetAttr("Var", this.Vars.Items.join(","));
            }
        }
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
export class SurveyList extends SurveyItem
{
    /** Каждый Var - отдельный тег */
    public VarsAsTags = true;
    /** Элементы Item */
    public Items = new KeyedCollection<SurveyListItem>();


    constructor(id?: string)
    {
        super("List", id);
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
            let itemIds = this.Items.Keys().map(x => Number(x)).filter(x => !!x).sort(x => x);
            if (itemIds.length == 0) id = "1";
            else id = '' + (itemIds[itemIds.length - 1] + 1);
        }
        else id = item.Id;

        let res = new SurveyListItem(id, item.Text);
        if (!!item.Vars && item.Vars.length > 0) res.Vars = new SurveyListItemVars(item.Vars);
        if (!!item.Text) res.Text = item.Text;
        // предупреждаем о перезаписи
        if (this.Items.Contains(id)) console.warn("Элемент '" + id + "' уже существует в листе '" + this.AttrValue("Id") + "', он будет заменён.");
        this.Items.AddPair(id, res);
        return id;
    }


    public ToXML(): string
    {
        // Items не числятся в Children
        this.Items.forEach((id, item) =>
        {
            this.AddChild(item.ToSurveyItem(this.VarsAsTags));
        })
        return super.ToXML();
    }

}