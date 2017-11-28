'use strict';

import * as vscode from 'vscode';
import * as AutoCompleteArray from './autoComplete';

var inProcess = false; // во избежание рекурсий
var methodsChanged = false; // для отслеживания изменения <Methods>

var TibAutoCompleteList = {
    Functions: [],
    Methods: [],
    Variables: [],
    Properties: [],
    Enums: [],
    EnumMembers: []
};

var codeAutoCompleteArray = [];

var link = {
    Function: "Functions",
    Method: "Methods",
    Variable: "Variables",
    Property: "Properties",
    Enum: "Enums",
    EnumMember: "EnumMembers"
};

var ItemSnippets = {
    List: "<Item Id=\"$1\"><Text>$2</Text></Item>",
    Quota: "<Item Page=\"$1\" Question=\"$2\" Answer=\"$3\"/>",
    Validate: "<Item Page=\"$1\" Question=\"$2\" Answer=\"$3\"/>",
    Redirect: "<Item Page=\"$1\" Question=\"$2\" Answer=\"$3\"/>",
    Filter: "<Item Page=\"$1\" Question=\"$2\" Answer=\"$3\"/>",
    Constants: "<Item Id=\"$1\"><Value>$2</Value></Item>"
}

var Methods = {};



export function activate(context: vscode.ExtensionContext)
{
    var editor = vscode.window.activeTextEditor;

    getData();
    makeIndent();
    autoComplete();
    hoverDocs();
    helper();
    parseMethods(editor);
    definitions();

    vscode.workspace.onDidChangeTextDocument(event =>
    {
        var originalPosition = editor.selection.start.translate(0, 1);
        var text = editor.document.getText(new vscode.Range(new vscode.Position(0, 0), originalPosition));//+ event.contentChanges[0].text;
        var tag = getCurrentTag(text);
        insertAutoCloseTag(event, editor, tag, text);
        insertSpecialSnippets(event, editor, text, tag);
        saveMethods(editor, tag);
    });
}

export function deactivate()
{ }



function getData()
{
    var names = {
        Functions: [],
        Methods: [],
        Variables: [],
        Properties: [],
        Enums: [],
        EnumMembers: []
    };
    AutoCompleteArray.Code.forEach(element =>
    {
        var item = new TibAutoCompleteItem(element);
        var ind = names[link[element.Kind]].indexOf(element.Name);
        if (ind > -1)
        {
            if (!TibAutoCompleteList[link[element.Kind]][ind].Overloads) TibAutoCompleteList[link[element.Kind]][ind].Overloads = [];
            var len = len = TibAutoCompleteList[link[element.Kind]][ind].Overloads.length;
            if (len == 0)
            {
                var parent = new TibAutoCompleteItem(TibAutoCompleteList[link[element.Kind]][ind]);
                TibAutoCompleteList[link[element.Kind]][ind].Overloads.push(parent);
            }
            TibAutoCompleteList[link[element.Kind]][ind].Overloads.push(item);
            var cnt = "Перегрузок: " + TibAutoCompleteList[link[element.Kind]][ind].Overloads.length;
            TibAutoCompleteList[link[element.Kind]][ind].Description = cnt;
            TibAutoCompleteList[link[element.Kind]][ind].Documentation = cnt;
        }
        else
        {
            TibAutoCompleteList[link[element.Kind]].push(item);
            names[link[element.Kind]].push(element.Name);
        }
    });

    for (var key in link)
    {
        TibAutoCompleteList[link[key]].forEach(element =>
        {
            codeAutoCompleteArray.push(element);
        });
    }
}


// autocomplete
function autoComplete()
{
    //Item Snippets
    vscode.languages.registerCompletionItemProvider('tib', {
        provideCompletionItems(document, position, token, context)
        {
            var completionItems = [];
            var textTo = getPreviousText(document, position);
            var tag = getCurrentTag(textTo);
            if (tag && !tag.CSMode)
            {
                if ("Item".indexOf(tag.Name) > -1)
                {
                    var parent = tag.LastParent;
                    if (!ItemSnippets[parent]) parent = "List";
                    var res = new vscode.SnippetString(ItemSnippets[parent]);
                    if (res)
                    {
                        var ci = new vscode.CompletionItem("Item", vscode.CompletionItemKind.Snippet);
                        var from_pos = tag.Position;
                        var range = new vscode.Range(from_pos.translate(0, 1), position);

                        ci.detail = "Структура Item для " + parent;
                        ci.insertText = res;
                        ci.additionalTextEdits = [vscode.TextEdit.replace(range, "")];
                        completionItems.push(ci);
                    }
                }
            }
            return completionItems;
        },
        resolveCompletionItem(item, token)
        {
            return item;
        }
    });

    //Attributes
    vscode.languages.registerCompletionItemProvider('tib', {
        provideCompletionItems(document, position, token, context)
        {
            var completionItems = [];
            var parent = getCurrentTag(getPreviousText(document, position));
            if (parent && !parent.Closed && AutoCompleteArray.Attributes[parent.Id])
            {
                var existAttrs = parent.attributeNames();
                AutoCompleteArray.Attributes[parent.Id].forEach(element =>
                {
                    if (existAttrs.indexOf(element.Name) < 0)
                    {
                        var attr = new TibAttribute(element);
                        var ci = attr.ToCompletionItem();
                        completionItems.push(ci);
                    }
                });
            }
            return completionItems;
        },
        resolveCompletionItem(item, token)
        {
            return item;
        }
    }, " ");

    //Functions, Variables, Enums
    vscode.languages.registerCompletionItemProvider('tib', {
        provideCompletionItems(document, position, token, context)
        {
            var completionItems = [];
            var tag = getCurrentTag(getPreviousText(document, position));
            if (tag.CSMode)
            {
                var ar = TibAutoCompleteList.Functions.concat(TibAutoCompleteList.Variables, TibAutoCompleteList.Enums);
                ar.forEach(element =>
                {
                    completionItems.push(element.ToCompletionItem());
                });
            }
            return completionItems;
        },
        resolveCompletionItem(item, token)
        {
            return item;
        }
    });

    //Properties, Methods, EnumMembers
    vscode.languages.registerCompletionItemProvider('tib', {
        provideCompletionItems(document, position, token, context)
        {
            var completionItems = [];
            var tag = getCurrentTag(getPreviousText(document, position));
            if (tag.CSMode)
            {
                var ar = TibAutoCompleteList.Properties.concat(TibAutoCompleteList.Methods, TibAutoCompleteList.EnumMembers);
                var lastLine = getCurrentLineText(document, position);
                ar.forEach(element =>
                {
                    var m = false;
                    if (element.Parent)
                    {
                        var reg = new RegExp(element.Parent + "\\.\s*$");
                        m = !!lastLine.match(reg);
                    }
                    if (m && (!element.ParentTag || element.ParentTag == tag.Name)) completionItems.push(element.ToCompletionItem());
                });
            }
            return completionItems;
        },
        resolveCompletionItem(item, token)
        {
            return item;
        }
    }, '.');
}


function helper()
{
    vscode.languages.registerSignatureHelpProvider('tib', {
        provideSignatureHelp(document, position, token)
        {
            var sign = new vscode.SignatureHelp();
            var tag = getCurrentTag(getPreviousText(document, position));
            if (tag.CSMode)
            {
                var lastLine = getPreviousText(document, position, true);
                var ar = TibAutoCompleteList.Functions.concat(TibAutoCompleteList.Methods);
                ar.forEach(element =>
                {
                    var mtch = lastLine.match(/(?:(^)|(.*\b))([\w\d_]+)\($/);
                    if (mtch && mtch.length > 3 && element.Name.indexOf(mtch[3]) >= 0)
                    {
                        if (element.Overloads.length == 0) sign.signatures.push(element.ToSignatureInformation());
                        else element.Overloads.forEach(el =>
                        {
                            sign.signatures.push(el.ToSignatureInformation());
                        });
                    }
                });
                sign.activeSignature = 0;
            }
            return sign;
        }
    }, "(");
}


// hovers
function hoverDocs()
{
    vscode.languages.registerHoverProvider('tib', {
        provideHover(document, position, token)
        {
            var res = [];
            var tag = getCurrentTag(getPreviousText(document, position));
            if (!tag.CSMode) return;
            var range = document.getWordRangeAtPosition(position);
            var text = document.getText(range);
            for (var i = 0; i < codeAutoCompleteArray.length; i++)
            {
                var item = codeAutoCompleteArray[i] as TibAutoCompleteItem;
                if (text == item.Name)
                {
                    if (item.Overloads && item.Overloads.length > 0)
                    {
                        item.Overloads.forEach(element =>
                        {
                            if (element.Documentation) res.push({ language: "csharp", value: element.Documentation });
                            if (element.Description) res.push(element.Description);
                        });
                    }
                    else
                    {
                        if (item.Documentation) res.push({ language: "csharp", value: item.Documentation });
                        if (item.Description) res.push(item.Description);
                    }
                    break;
                }
            }
            if (res.length == 0) return;
            return new vscode.Hover(res, range);
        }
    });
}


//definitions
function definitions()
{
    vscode.languages.registerDefinitionProvider('tib', {
        provideDefinition(document, position, token)
        {
            var tag = getCurrentTag(getPreviousText(document, position));
            if (!tag.CSMode) return;
            var word = document.getText(document.getWordRangeAtPosition(position));
            if (Methods[word]) return new vscode.Location(Methods[word].Uri, Methods[word].Location);
        }
    });
}


// добавление отступов при нажатии enter между > и <
function makeIndent(): void
{
    vscode.languages.setLanguageConfiguration('tib', {
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
        onEnterRules: [
            {
                beforeText: new RegExp(`<([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)\\s*$`, 'i'),
                afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
                action: { indentAction: vscode.IndentAction.IndentOutdent }
            },
            {
                beforeText: new RegExp(`<(\\w[\\w\\d]*)([^/>]*(?!/)>)\\s*$`, 'i'),
                action: { indentAction: vscode.IndentAction.Indent }
            }
        ],
    });

}


function insertAutoCloseTag(event: vscode.TextDocumentChangeEvent, editor: vscode.TextEditor, tag: CurrentTag, text: string): void
{
    if (inProcess || !editor || !event || !event.contentChanges[0]) return;

    var isRightAngleBracket = checkLastSymbol(event.contentChanges[0], ">");
    var isSelfClosed = checkLastSymbol(event.contentChanges[0], "/");
    if (!isRightAngleBracket && !isSelfClosed) return;

    //var config = vscode.workspace.getConfiguration('tiburon-scripter');

    var selection = editor.selection;
    var originalPosition = selection.start.translate(0, 1);

    if (isSelfClosed) 
    {
        var nextChar = getNextChars(editor, originalPosition, 1);

        if (text.match(/<\w+\/$/) && nextChar !== ">")
        {
            inProcess = true;
            editor.edit((editBuilder) => 
            {
                editBuilder.insert(originalPosition, ">");
            }).then(() =>
            {
                editor.selection = moveSelectionRight(editor.selection, 1);
                inProcess = false;
            });
        }
        else
        {
            var last2chars = "";
            if (text.length > 2)
            {
                last2chars = text.substr(text.length - 2);
            }
            if (last2chars === "</") 
            {
                var closeTag = getCloseTag(text);
                if (closeTag) 
                {
                    if (nextChar === ">") 
                    {
                        closeTag = closeTag.substr(0, closeTag.length - 1);
                    }
                    inProcess = true;
                    editor.edit((editBuilder) => 
                    {
                        editBuilder.insert(originalPosition, closeTag);
                    }).then(() =>
                    {
                        if (nextChar === ">") 
                        {
                            editor.selection = moveSelectionRight(editor.selection, 1);
                        }
                        inProcess = false;
                    });
                }
            }
        }
    }

    if (isRightAngleBracket)
    {
        var curLine = getPreviousText(editor.document, originalPosition, true);
        var result = /<([a-zA-Z][a-zA-Z0-9:\-_.]*)(?:\s+[^<>]*?[^\s/<>=]+?)*?\s?(\/|>)$/.exec(curLine);
        if (result !== null && ((occurrenceCount(result[0], "'") % 2 === 0)
            && (occurrenceCount(result[0], "\"") % 2 === 0) && (occurrenceCount(result[0], "`") % 2 === 0)))
        {
            if (result[2] === ">")
            {
                inProcess = true;
                editor.edit((editBuilder) =>
                {
                    editBuilder.insert(originalPosition, "</" + result[1] + ">");
                }).then(() =>
                {
                    editor.selection = new vscode.Selection(originalPosition, originalPosition);
                    inProcess = false;
                });
            } else
            {
                inProcess = true;
                editor.edit((editBuilder) =>
                {
                    editBuilder.insert(originalPosition, ">");
                }).then(() =>
                {
                    inProcess = false;
                });
            }
        }
    }
}


function insertSpecialSnippets(event: vscode.TextDocumentChangeEvent, editor: vscode.TextEditor, text: string, tag: CurrentTag): void
{
    if (inProcess || !editor || !event || !event.contentChanges[0]) return;

    var originalPosition = editor.selection.start.translate(0, 1);
    // закрывание [тегов]
    var tagT = text.match(/\[([\w\d#]+)[^\]]*\]$/);
    if (tagT && tagT.length > 1)
    {
        if (!tag.CSMode)
        {
            inProcess = true;
            editor.insertSnippet(new vscode.SnippetString("$1[/" + tagT[1] + "]"), originalPosition.translate(0, 1)).then(() =>
            {
                inProcess = false;
            });
        }
    }

}


function saveMethods(editor: vscode.TextEditor, tag: CurrentTag): void
{
    if (tag.Name == "Methods") methodsChanged = true;
    else if (methodsChanged)
    {
        methodsChanged = false;
        parseMethods(editor);
    }
}



// -------------------- доп функции

/*function csharpNode(text: string): boolean
{
    var res = text.match(/((<(?:(Filter)|(Methods)|(Redirect)|(Validate))([^>]*>)((?!([\s\n]*<))[\s\S])+)|((?:\[c#)((?!\[\/c#)[\s\S])+))$/);
    return !!res && res.length > 0;
}*/

function parseMethods(editor: vscode.TextEditor): void
{
    var text = editor.document.getText();
    var mtd = text.match(/(<Methods)([^>]*>)([\s\S]*)(<\/Methods)/);
    if (!mtd || !mtd[3]) return;
    var reg = new RegExp(/((public)|(private)|(protected))\s*([\w\d_<>\[\],\s]+)\s+(([\w\d_]+)\s*(\([^)]*\))?)/, "g");
    var str = mtd[3];
    var m;
    Methods = {};
    while (m = reg.exec(str))
    {
        if (m && m[7])
        {
            var start = text.indexOf(m[0]);
            var end = text.indexOf( m[8] ? ")" : ";", start) + 1;
            var positionFrom = editor.document.positionAt(start);
            var positionTo = editor.document.positionAt(end);
            var rng = new vscode.Range(positionFrom, positionTo);
            var ur = vscode.Uri.file(editor.document.fileName);
            Methods[m[7]] = (new TibMethod(m[7], m[6].trim(), rng, ur));
        }
    }
}

function getCurrentTag(text: string): CurrentTag
{
    var pure = text.replace(/(?:<!--)([\s\S]*?)(-->)/, "");
    pure = pure.replace(/(?:<!\[CDATA\[)([\s\S]*?)(\]\]>)/, "");
    var code = "(Filter)|(Redirect)|(Validate)|(Methods)"; // элементы, которые могут содержать <нетеги>
    // удаление закрытых (Filter)|(Redirect)|(Validate) из остатка кода
    var reg = new RegExp("(?:<(" + code + ")[^>]*>)(?![\\s]*<[^!])[\\s\\S]*(?:<\\/\\1\\s*>)", "g");
    var regEnd = new RegExp("(<(" + code + ")([^>]*>)?)[\\s\\S]*$", "g");
    pure = pure.replace(reg, "");
    pure = pure.replace(regEnd, "$1");
    return parseTags(pure, text);
}

// рекурсивный поиск незакрытых тегов
function parseTags(text: string, originalText, nodes = [], prevMatch: RegExpMatchArray = null): CurrentTag
{
    var res = text.match(/<([\w\d]+)([^/>]*)((>)\s*(([^<]|(<(?!\/\1)[\s\S]))*))?$/);
    var nn = nodes;
    if (res) nn.push(res[1]);
    if (res && res[5])
    {
        var rem = res[3];
        return parseTags(rem, originalText, nn, res);
    }
    else
    {
        nn.pop();
        var mt = res ? res : prevMatch;
        var tag = new CurrentTag(mt[1]);
        var str = mt[0];
        var lastc = str.lastIndexOf("[c#");
        var lastcEnd = str.lastIndexOf("]");

        tag.CSMode =
            !!mt[1].match(/(Filter)|(Redirect)|(Validate)|(Methods)/) ||
            (lastc > str.lastIndexOf("[/c#") && lastc < lastcEnd && lastcEnd >= 0) ||
            !!text.match(/\$[^\s]+$/);
        tag.Parents = nn;
        tag.Position = vscode.window.activeTextEditor.document.positionAt(originalText.lastIndexOf("<" + mt[1]));
        if (mt[2]) tag.setAttributes(mt[2]);
        if (mt[4]) tag.Closed = true;
        if (mt[5]) tag.Body = mt[5];
        tag.LastParent = nn[nn.length - 1];
        if (mt[1] == "Item") tag.Id = tag.LastParent + "Item";

        return tag;
    }
}

function getCurrentLineText(document: vscode.TextDocument, position: vscode.Position): string
{
    var
        start = new vscode.Position(position.line, 0),
        end = new vscode.Position(position.line, document.lineAt(position.line).text.length);
    return document.getText(new vscode.Range(start, end));
}

function getPreviousText(document: vscode.TextDocument, position: vscode.Position, lineOnly: boolean = false): string
{
    var
        start = lineOnly ? new vscode.Position(position.line, 0) : new vscode.Position(0, 0),
        end = new vscode.Position(position.line, position.character);
    return document.getText(new vscode.Range(start, end));
}

function checkLastSymbol(contentChange: vscode.TextDocumentContentChangeEvent, symbol: string)
{
    return contentChange.text === symbol || contentChange.text.endsWith(symbol) && contentChange.range.start.character === 0
        && contentChange.range.start.line === contentChange.range.end.line
        && !contentChange.range.end.isEqual(new vscode.Position(0, 0));
}

function getNextChars(editor: vscode.TextEditor, position: vscode.Position, count: number): string
{
    var lastLine = editor.document.lineCount - 1;
    var text = editor.document.getText(new vscode.Range(position, new vscode.Position(lastLine, editor.document.lineAt(lastLine).text.length)))
    return text.substr(0, count);
}

function getCloseTag(text: string): string
{
    var regex = /<(\/?[a-zA-Z][a-zA-Z0-9:\-_.]*)(?:\s+[^<>]*?[^\s/<>=]+?)*?\s?>/g;
    var result = null;
    var stack = [];

    // не берём те теги, которые не теги (например <int> из Generic)
    var pure_text = text.replace(/<((Filter)|(Methods)|(Redirect)|(Validate))((?!<\/\1)[\s\S])+/g, "");
    while ((result = regex.exec(pure_text)) !== null)
    {
        var isStartTag = result[1].substr(0, 1) !== "/";
        var tag = isStartTag ? result[1] : result[1].substr(1);
        if (isStartTag)
        {
            stack.push(tag);
        } else if (stack.length > 0)
        {
            var lastTag = stack[stack.length - 1];
            if (lastTag === tag)
            {
                stack.pop()
            }
        }
    }
    if (stack.length > 0)
    {
        var closeTag = stack[stack.length - 1];
        if (text.substr(text.length - 2) === "</")
        {
            return closeTag + ">";
        }
        if (text.substr(text.length - 1) === "<")
        {
            return "/" + closeTag + ">";
        }
        return "</" + closeTag + ">";
    } else
    {
        return null;
    }
}

function moveSelectionRight(selection: vscode.Selection, shift: number): vscode.Selection
{
    var newPosition = selection.active.translate(0, shift);
    return new vscode.Selection(newPosition, newPosition);
}

function occurrenceCount(source: string, find: string): number
{
    return source.split(find).length - 1;
}



// -------------------- классы


/*
    для классов TibAutoCompleteItem и TibAttribute:
    Detail - краткое описание (появляется в редакторе в той же строчке)
    Description - подробное описание (появляется при клике на i (зависит от настроек))
    Documentation - кусок кода, сигнатура (показывается при наведении)
*/

class TibAutoCompleteItem 
{
    Name: string;
    Kind;
    Detail: string = "";
    Description: string = "";
    Documentation: string = "";
    Parent: string = "";
    Overloads = [];
    PrentTag: string = "";

    constructor(obj: Object)
    {
        for (let key in obj)
            this[key] = obj[key];
    }

    ToCompletionItem()
    {
        var kind: keyof typeof vscode.CompletionItemKind = this.Kind;
        var item = new vscode.CompletionItem(this.Name, vscode.CompletionItemKind[kind]);
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


class TibAttribute
{
    Name: string = "";
    Type: string = "";
    Default = null;
    AllowCode: boolean = false;
    Detail: string = "";
    Description: string = "";
    Documentation: string = "";
    Values: Array<string> = [];

    constructor(obj: Object)
    {
        for (let key in obj)
            this[key] = obj[key];
    }

    ToCompletionItem()
    {
        var item = new vscode.CompletionItem(this.Name, vscode.CompletionItemKind.Property);
        var snip = this.Name + "=\"$";
        if (this.Values.length) snip += "{1|" + this.Values.join(",") + "|}"; else snip += "1";
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


class TibMethod
{
    Name: string = "";
    Signature: string = "";
    Location: vscode.Range;
    Uri: vscode.Uri;

    constructor(name: string, sign: string, location: vscode.Range, uri: vscode.Uri)
    {
        this.Name = name;
        this.Signature = sign;
        this.Location = location;
        this.Uri = uri;
    }
}


class InlineAttribute
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


class CurrentTag
{
    Name: string = "";
    Id: string = ""; // отличается ПОКА только для Item - в зависимости от родителя
    Attributes: Array<InlineAttribute> = [];
    Body: string = "";
    Closed: boolean = false; // закрыт не тег, просто есть вторая скобка <Page...>
    Parents: Array<string> = [];
    LastParent: string = "";
    CSMode: boolean = false;
    Position: vscode.Position;

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