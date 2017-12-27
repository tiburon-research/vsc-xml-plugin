import * as vscode from 'vscode';

// -------------------- классы


export class KeyedCollection<T>
{
    protected items: { [index: string]: T } = {};
    private count: number = 0;

    constructor()
    {

    }

    public Contains(key: string): boolean
    {
        return this.items.hasOwnProperty(key);
    }

    public Count(): number
    {
        return this.count;
    }

    protected AddPair(key: string, value: T)
    {
        if (!this.items.hasOwnProperty(key))
            this.count++;

        this.items[key] = value;
    }

    public Remove(key: string): T
    {
        var val = this.items[key];
        delete this.items[key];
        this.count--;
        return val;
    }

    public Item(key: string): T
    {
        return this.items[key];
    }

    public Keys(): string[]
    {
        var keySet: string[] = [];

        for (var prop in this.items)
        {
            if (this.items.hasOwnProperty(prop))
            {
                keySet.push(prop);
            }
        }

        return keySet;
    }

    public Values(): T[]
    {
        var values: T[] = [];

        for (var prop in this.items)
        {
            if (this.items.hasOwnProperty(prop))
            {
                values.push(this.items[prop]);
            }
        }

        return values;
    }

    public Clear(): void
    {
        this.items = {};
        this.count = 0;
    }

    public forEach(callback)
    {
        for (var key in this.items)
            callback(key, this.Item(key));
    }
}


/*
    для классов TibAutoCompleteItem и TibAttribute:
    Detail - краткое описание (появляется в редакторе в той же строчке)
    Description - подробное описание (появляется при клике на i (зависит от настроек))
    Documentation - кусок кода, сигнатура (показывается при наведении)
*/

export class TibAutoCompleteItem 
{
    Name: string;
    Kind;
    Detail: string = "";
    Description: string = "";
    Documentation: string = "";
    Parent: string = "";
    Overloads = [];
    ParentTag: string = "";

    constructor(obj: Object)
    {
        for (let key in obj)
            this[key] = obj[key];
    }

    ToCompletionItem(addBracket: boolean = false)
    {
        var kind: keyof typeof vscode.CompletionItemKind = this.Kind;
        var item = new vscode.CompletionItem(this.Name, vscode.CompletionItemKind[kind]);
        if (addBracket && (this.Kind == "Function" || this.Kind == "Method")) item.insertText = new vscode.SnippetString(this.Name + "($1)");
        if (this.Name == "GetInstance") console.log(item.insertText);
        var mds = new vscode.MarkdownString();
        if (this.Description) mds.value = this.Description;
        else mds.value = this.Documentation;
        item.documentation = mds;
        item.detail = this.Detail;
        return item;
    }

    ToSignatureInformation()
    {
        return new vscode.SignatureInformation(this.Documentation, new vscode.MarkdownString(this.Description));
    }
}


export class TibAttribute
{
    Name: string = "";
    Type: string = "";
    Default = null;
    AllowCode: boolean = false;
    Detail: string = "";
    Description: string = "";
    Documentation: string = "";
    Values: Array<string> = [];
    Result: ""; // callback

    constructor(obj: Object)
    {
        for (let key in obj)
            this[key] = obj[key];
    }

    ToCompletionItem(callback = null): vscode.CompletionItem
    {
        var item = new vscode.CompletionItem(this.Name, vscode.CompletionItemKind.Property);
        var snip = this.Name + "=\"";
        if (this.Values.length) snip += "${1|" + this.Values.join(",") + "|}";
        else if (callback === null || !this.Result) snip += "$1";
        else snip += callback(this.Result);
        snip += "\"";
        var res = new vscode.SnippetString(snip);

        item.detail = (this.Detail ? this.Detail : this.Name) + (this.Type ? (" (" + this.Type + ")") : "");
        var doc = "";
        if (this.Default) doc += "Значение по умолчанию: `" + this.Default + "`";
        doc += "\nПоддержка кадовых вставок: `" + (this.AllowCode ? "да" : "нет") + "`";
        item.documentation = new vscode.MarkdownString(doc);
        item.insertText = res;

        return item;
    }
}


export class TibMethod
{
    Name: string = "";
    Signature: string = "";
    Location: vscode.Range;
    Uri: vscode.Uri;
    IsFunction: boolean;

    constructor(name: string, sign: string, location: vscode.Range, uri: vscode.Uri, isFunction: boolean = false, fullString: string = "")
    {
        this.Name = name;
        this.Signature = sign;
        this.Location = location;
        this.Uri = uri;
        this.IsFunction = isFunction;
    }

    public GetLocation(): vscode.Location
    {
        return new vscode.Location(this.Uri, this.Location)
    }

    ToCompletionItem()
    {
        var item = new vscode.CompletionItem(this.Name, vscode.CompletionItemKind.Function);
        if (this.IsFunction) item.insertText = new vscode.SnippetString(this.Name + "($1)");
        var mds = new vscode.MarkdownString();
        mds.value = this.Signature;
        item.documentation = mds;
        return item;
    }

    ToHoverItem()
    {
        return { language: "csharp", value: this.Signature };
    }
}


export class TibMethods extends KeyedCollection<TibMethod>
{
    constructor()
    {
        super();
    }

    public Add(item: TibMethod)
    {
        if (!this.Contains(item.Name)) this.AddPair(item.Name, item);
    }

    CompletionArray(): vscode.CompletionItem[]
    {
        return this.Values().map(function(e)
        {
            return e.ToCompletionItem();
        });
    }

    HoverArray(word: string): any[]
    {
        return this.Values().map(function(e)
        {
            if (e.Name == word) return e.ToHoverItem();
        });
    }
}


export class InlineAttribute
{
    Name: string = "";
    Value: string = "";
    Text: string = "";

    constructor(name: string, value)
    {
        this.Name = name;
        this.Value = value as string;
        this.Text = name + "=\"" + value + "\"";
    }
}


export class CurrentTag
{
    Name: string = "";
    Id: string = ""; // отличается ПОКА только для Item - в зависимости от родителя
    Attributes: Array<InlineAttribute> = [];
    Body: string = "";
    Closed: boolean = false; // закрыт не тег, просто есть вторая скобка <Page...>
    Parents: Array<string> = [];
    LastParent: string = "";
    CSMode: boolean = false;
    CSSingle: boolean = false; //$Method()
    CSInline: boolean = false; //[c#]Method();[/c#]
    Position: vscode.Position;
    InString: boolean = false; // "body$
    InCSString: boolean = false; // "body1 [c#]Method("str$

    constructor(name: string)
    {
        this.Name = name;
        this.Id = name;
    }

    attributeNames()
    {
        return this.Attributes.map(function (e)
        {
            return e.Name;
        });
    }

    setAttributes(str: string)
    {
        var res = str.match(/\s*([\w\d]+)=(("([^"]+)?")|(('([^']+)?')))\s*/g);
        if (res)
        {
            res.forEach(element =>
            {
                var parse = element.match(/\s*([\w\d]+)=(("([^"]+)?")|(('([^']+)?')))\s*/);
                if (parse)
                {
                    this.Attributes.push(new InlineAttribute(parse[1], parse[2]));
                }
            });
        }
    }
}


export class SurveyNode
{
    constructor(type: string, id: string, pos: vscode.Position)
    {
        this.Id = id;
        this.Type = type;
        this.Position = pos;
    }

    Id: string = "";
    Type: string = "";
    Position: vscode.Position;

    GetLocation(uri: vscode.Uri): vscode.Location
    {
        return new vscode.Location(uri, this.Position);
    }
}


export class SurveyNodes extends KeyedCollection<SurveyNode[]>
{
    constructor()
    {
        super();
    }

    Add(item: SurveyNode)
    {
        if (!this.Contains(item.Type))
            this.AddPair(item.Type, [item]);
        else if (this.Item(item.Type).findIndex(x => x.Id == item.Id)) this.Item(item.Type).push(item);
    }

    GetIds(type: string): string[]
    {
        return this.Item(type).map(function (e)
        {
            return e.Id;
        });
    }

    GetItem(id: string, type?: string): SurveyNode
    {
        var nodes = this.Item(type);
        var res: SurveyNode;
        for (let i = 0; i < nodes.length; i++)
        {
            if (nodes[i].Id == id)
            {
                res = nodes[i];
                break;
            }    
        };
        return res;
    }

    Clear(names?: string[])
    {
        if (!names) super.Clear();
        else 
        names.forEach(element => {
            this.items[element] = [];
        });    
    }
    
}



export namespace TibTransform
{

    export function AnswersToItems(text: string): string
    {
        return TransformElement(text, "Answer", "Item");
    }

    export function ItemsToAnswers(text: string): string
    {
        return TransformElement(text, "Item", "Answer");
    }

    function TransformElement(text: string, from: string, to: string): string
    {
        var ar = text.split("\n");
        var res = "";
        ar.forEach(element => 
        {
            var mt = element.match(new RegExp("(\\s*)<" + from + "\\s*([^\\/>]+)((\\/>)|(>([\\s\\S]+?)<\\/" + from + ".*>))"));
            if (!mt) res += element + "\n";
            else
            {
                if (mt[1]) res += mt[1];
                res += "<" + to;
                if (mt[2])
                {
                    var id = mt[2].match(/Id=["'][^"']+["']/);
                    if (id) res += " " + id[0];
                    var txt = mt[2].match(/Text=["'][^"']*["']/);
                    if (txt) res += " " + txt[0];
                }
                res += ">";
                if (mt[6])
                {
                    var txt = mt[6].match(/<Text[^>]*>.*<\/Text\s*>/);
                    if (txt) res += txt[0];
                }
                res += "</" + to + ">\n"
            }    
        });
        return res.substr(0, res.length-1);
    }

}