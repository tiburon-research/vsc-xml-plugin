'use strict';


import { KeyedCollection, InlineAttribute } from './classes';



class SurveyItem
{
    /** Element TagName */
    protected readonly TagName: string;
    /** Список атрибутов */
    protected Attributes = new KeyedCollection<InlineAttribute>();
    /** Дети поимённо */
    protected Children = new KeyedCollection<SurveyItem[]>();
    /** текст элемента */
    public Text: string;


    constructor(name: string, id?: string)
    {
        this.TagName = name;
        if (!!id) this.setAttr("Id", id);
    }

    /** Получение полного XML */
    public toXML(): string
    {
        let res = "<" + this.TagName;
        res += this.getAttributes() + ">";
        // получаем всё внутри рекурсивно
        if (this.Children.Count() > 0)
        {
            res += this.XMLbodyDelegate();
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
    public getAttributes(): string
    {
        let res = "";
        this.Attributes.forEach((key, value) =>
        {
            res += " " + value.Text;
        })
        return res;
    }

    /** проверяет существование атрибута */
    public attrExists(name: string): boolean
    {
        return this.Attributes.Contains(name);
    }

    /** возвращает значение атрибута */
    public attrValue(name: string): string
    {
        if (!this.attrExists(name)) return null;
        return this.Attributes.Item(name).Value;
    }

    /** задаёт значение атрибута (или создаёт новый) */
    public setAttr(name: string, value: string): void
    {
        this.Attributes.AddPair(name, new InlineAttribute(name, value));
    }

    /** обновляет значение атрибута */
    public updateAttr(name: string, transform: (val: string) => string): void
    {
        this.Attributes.UpdateValue(name, x => new InlineAttribute(name, transform(x.Value)));
    }

    /** функция преобразования дочерних элементов в XML */
    public XMLbodyDelegate(): string
    {
        let body = "";
        this.Children.forEach((name, element) =>
        {
            element.forEach(cildNode =>
            {
                body += "\n" + cildNode.toXML();
            });
        });
        // отступаем
        body = body.replace(/\n/g, "\n\t");
        body += "\n";
        return body;
    }

    /** добавляет дочерний элемент */
    public addChild(child: string | SurveyItem): void
    {
        let name = typeof child == "string" ? child : child.TagName;
        let value = typeof child == "string" ? new SurveyItem(child) : child;

        if (!this.Children.Contains(name))
            this.Children.AddPair(name, [value]);
        else this.Children.UpdateValue(name, (val) => { return val.concat([value]) });
    }

    /** возвращает полный массив детей */
    public getChildren(): SurveyItem[]
    {
        let res = [];
        this.Children.forEach((key, value) =>
        {
            res = res.concat(value);
        })
        return res;
    }
}


export class SurveyElementItem extends SurveyItem
{
    constructor(id?: string, text?: string)
    {
        super("Item", id);
        let textItem = new SurveyItem("Text");
        textItem.Text = text;
        this.addChild(textItem);
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


/** Элементы <List> */
export class SurveyListItem extends SurveyElementItem
{
    constructor(id?: string, text?: string)
    {
        super(id, text);
    }

    public Vars: SurveyListItemVars;

    /** преобразует к стандартному классу */
    public toSurveyItem(separateVars: boolean): SurveyItem
    {
        let res = new SurveyItem("Item", this.attrValue("Id"));
        // добавляем Var
        if (this.Vars.Count() > 0)
        {
            if (separateVars)
            {
                this.Vars.Items.forEach(x =>
                {
                    let Var = new SurveyItem("Var");
                    Var.Text = x;
                    res.addChild(Var);
                })
            }
            else
            {
                res.setAttr("Var", this.Vars.Items.join(","));
            }
        }
        // добавляем Text
        if (!!this.Text)
        {
            let textItem = new SurveyItem("Text");
            textItem.Text = this.Text;
            res.addChild(textItem);
        }    
        res.XMLbodyDelegate = this.XMLbodyDelegate;
        return res;
    }

    public XMLbodyDelegate(): string
    {
        let body = "";
        let childXml: string[] = []; // массив XML детей
        let separated = false;
        this.Children.forEach((name, element) =>
        {
            element.forEach(cildNode =>
            {
                let child = cildNode.toXML();
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


    constructor(id?: string)
    {
        super("List", id);
    }

    /** 
     * Добавляет новый элемент листа 
     * Если `item.Id` не задан, то генерируется автоматически
     * 
     * Возвращает Id нового элемента
    */
    public AddItem(item: SurveyListItemObject): string
    {
        let id;
        // генерируем Id автоматически
        if (!item.Id)
        {
            let items = this.Children.Item("Item");
            let itemIds = !!items ? items.map(x => Number(x.attrValue('Id'))).filter(x => !!x).sort(x => x) : [];
            if (itemIds.length == 0) id = "1";
            else id = itemIds[itemIds.length - 1] + 1;
        }
        let res = new SurveyListItem(id, item.Text);
        if (!!item.Vars && item.Vars.length > 0) res.Vars = new SurveyListItemVars(item.Vars);
        if (!!item.Text) res.Text = item.Text;
        this.addChild(res.toSurveyItem(this.VarsAsTags));
        return id;
    }

}