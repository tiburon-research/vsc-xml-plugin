'use strict';

import * as vscode from 'vscode';
import * as AutoCompleteArray from './autoComplete';
import { TibAutoCompleteItem, TibAttribute, TibMethod, InlineAttribute, CurrentTag, SurveyNode, SurveyNodes, TibMethods } from "./classes";

// константы

const _NodeStoreNames = ["Page", "Question", "Quota", "List"]; // XML теги, которые сохраняются в CurrentNodes
const _AllowCodeTags = "(Filter)|(Redirect)|(Validate)|(Methods)"; // XML теги, которые могут содержать c#


// глобальные переменные

var inProcess = false; // во избежание рекурсий

var TibAutoCompleteList = {
    Functions: [],
    Methods: [],
    Variables: [],
    Properties: [],
    Enums: [],
    EnumMembers: [],
    Classes: []
};

var codeAutoCompleteArray = [];

var link = {
    Function: "Functions",
    Method: "Methods",
    Variable: "Variables",
    Property: "Properties",
    Enum: "Enums",
    EnumMember: "EnumMembers",
    Class: "Classes"
};

var ItemSnippets = {
    List: "<Item Id=\"$1\"><Text>$2</Text></Item>",
    Quota: "<Item Page=\"$1\" Question=\"$2\" Answer=\"$3\"/>",
    Validate: "<Item Page=\"$1\" Question=\"$2\" Answer=\"$3\"/>",
    Redirect: "<Item Page=\"$1\" Question=\"$2\" Answer=\"$3\"/>",
    Filter: "<Item Page=\"$1\" Question=\"$2\" Answer=\"$3\"/>",
    Constants: "<Item Id=\"$1\"><Value>$2</Value></Item>"
}

var Methods = new TibMethods();

var CurrentNodes: SurveyNodes = new SurveyNodes();


export function activate(context: vscode.ExtensionContext)
{
    var editor = vscode.window.activeTextEditor;

    function reload()
    {
        saveMethods(editor);
        updateNodesIds(editor);
    }

    // общие дествия при старте расширения
    getData();
    makeIndent();
    autoComplete();
    hoverDocs();
    helper();
    definitions();

    // для каждого дукумента свои
    reload();

    vscode.workspace.onDidOpenTextDocument(event =>
    {
        reload();
    });

    vscode.window.onDidChangeActiveTextEditor(neweditor =>
    {
        editor = neweditor;
        reload();
    });


    vscode.workspace.onDidChangeTextDocument(event =>
    {
        var originalPosition = editor.selection.start.translate(0, 1);
        var text = editor.document.getText(new vscode.Range(new vscode.Position(0, 0), originalPosition));
        var tag = getCurrentTag(text);
        updateNodesIds(editor);
        insertAutoCloseTag(event, editor, tag, text);
        insertSpecialSnippets(event, editor, text, tag);
        saveMethods(editor);
    });

    vscode.commands.registerCommand('tib.debug', () => 
    {
        execute("http://debug.survstat.ru/Survey/Adaptive/?fileName=" + editor.document.fileName);
    });

    vscode.commands.registerCommand('tib.insertTag', () => 
    {
        editor.insertSnippet(new vscode.SnippetString("[${1:u}$2]$TM_SELECTED_TEXT[/${1:u}]"));
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
        EnumMembers: [],
        Classes: []
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
                    var parent;
                    for (let key in ItemSnippets)
                        if (tag.Parents.indexOf(key) > -1)
                        {
                            parent = key;
                            break;
                        }
                    if (!parent || !ItemSnippets[parent]) parent = "List";
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
            var curLine = getPreviousText(document, position, true);
            if (parent && !parent.Closed && AutoCompleteArray.Attributes[parent.Id] && !inString(curLine))
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

    //Functions, Variables, Enums, Classes, Custom Methods
    vscode.languages.registerCompletionItemProvider('tib', {
        provideCompletionItems(document, position, token, context)
        {
            var completionItems = [];
            var tag = getCurrentTag(getPreviousText(document, position));
            if (tag.CSMode)
            {
                var curLine = getPreviousText(document, position, true);
                var customMethods = Methods.CompletionArray();
                if (customMethods) completionItems = completionItems.concat(customMethods);
                if (!tag.CSInline && !inString(curLine))
                {
                    var ar: TibAutoCompleteItem[] = TibAutoCompleteList.Functions.concat(TibAutoCompleteList.Variables, TibAutoCompleteList.Enums, TibAutoCompleteList.Classes);
                    ar.forEach(element =>
                    {
                        completionItems.push(element.ToCompletionItem());
                    });
                }
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
            var curLine = getPreviousText(document, position, true);
            if (tag.CSMode && !inString(curLine))
            {
                var ar: TibAutoCompleteItem[] = TibAutoCompleteList.Properties.concat(TibAutoCompleteList.Methods, TibAutoCompleteList.EnumMembers);
                var lastLine = getPreviousText(document, position, true);
                ar.forEach(element =>
                {
                    var m = false;
                    if (element.Parent)
                    {
                        var reg = new RegExp(element.Parent + "\\.$");
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

    //Node Ids
    vscode.languages.registerCompletionItemProvider('tib', {
        provideCompletionItems(document, position, token, context)
        {
            var completionItems = [];
            var tag = getCurrentTag(getPreviousText(document, position));
            if (!tag) return;
            var text = getPreviousText(document, position, true);

            // Id листов
            var curAttr = text.match(/(\w+)=(["'])(\w*)$/);
            if
            (
                !tag.Closed && curAttr && tag.Name == "Repeat" && curAttr[1].toLowerCase() == "list" ||
                tag.CSMode && text.match(/CurrentSurvey\.Lists\["\w*$/)
            )
            {
                var lists = CurrentNodes.GetIds("List");
                lists.forEach(element =>
                {
                    var ci = new vscode.CompletionItem(element, vscode.CompletionItemKind.Reference);
                    ci.detail = "Id листа";
                    ci.insertText = element;
                    completionItems.push(ci);
                });
            }

            return completionItems;
        },
        resolveCompletionItem(item, token)
        {
            return item;
        }
    }, "\"", "'");
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
            var customMethods = Methods.HoverArray(text);
            if (customMethods) res = res.concat(customMethods);
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
            var res: vscode.Location;
            if (tag.CSMode && (!inString(getPreviousText(document, position, true))) || tag.CSInline)
            {
                var word = document.getText(document.getWordRangeAtPosition(position));
                if (Methods.Contains(word)) res = Methods.Item(word).GetLocation();
            }
            else
            {
                var word = document.getText(document.getWordRangeAtPosition(position, /[^'"\s]+/));;
                var enabledNodes = ["Page", "List", "Quota"];
                var ur = vscode.Uri.file(vscode.window.activeTextEditor.document.fileName);
                enabledNodes.forEach(element =>
                {
                    var item = CurrentNodes.GetItem(word, element);
                    if (item)
                    {
                        res = item.GetLocation(ur);
                        return res;
                    }
                });
            }
            return res;
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

    var isRightAngleBracket = event.contentChanges[0].text == ">";
    if (!isRightAngleBracket) return;
    var originalPosition = editor.selection.start.translate(0, 1);
    
    if (isRightAngleBracket)
    {
        var curLine = getCurrentLineText(editor.document, originalPosition);
        var prev = curLine.substr(0, editor.selection.start.character + 1);
        var after = curLine.substr(editor.selection.start.character + 1);
        var result = prev.match(/<([\w\d_]+)[^>\/]*>?$/);
        if (!result || tag.CSMode && !result[1].match(new RegExp("^(" + _AllowCodeTags + ")$"))) return;
        var closed = after.match(new RegExp("^[^<]*(<\\/)?" + result[1]));
        if (!inString(prev) && !closed)
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
        }
    }
}


function insertSpecialSnippets(event: vscode.TextDocumentChangeEvent, editor: vscode.TextEditor, text: string, tag: CurrentTag): void
{
    if (inProcess || !editor || !event || !event.contentChanges[0]) return;

    var change = event.contentChanges[0].text;
    var originalPosition = editor.selection.start.translate(0, 1);
    var curLine = getPreviousText(editor.document, editor.selection.start, true)

    // закрывание [тегов]
    var tagT = text.match(/\[([a-zA-Z][\w\d]*)([^\]\[]*)?(\/)?\]$/);
    if
    (
        change[change.length - 1] == "]" &&
        (!tag.CSMode || inString(curLine)) &&
        tag.Parents.indexOf("CustomText1") + tag.Parents.indexOf("CustomText2") == -2 &&
        tag.Name != "CustomText1" && tag.Name != "CustomText2" &&
        !!tagT &&
        !!tagT[1] &&
        !tagT[3] &&
        !tagT[1].match(/^((area)|(base)|(br)|(col)|(embed)|(hr)|(img)|(input)|(keygen)|(link)|(menuitem)|(meta)|(param)|(source)|(track)|(wbr))$/)
    )
    {
        inProcess = true;
        editor.insertSnippet(new vscode.SnippetString("$1[/" + tagT[1] + "]"), originalPosition).then(() =>
        {
            inProcess = false;
        });
    }

}


function saveMethods(editor: vscode.TextEditor): void
{
    Methods.Clear();
    var text = editor.document.getText();
    var mtd = text.match(/(<Methods)([^>]*>)([\s\S]*)(<\/Methods)/);
    if (!mtd || !mtd[3]) return;
    var reg = new RegExp(/((public)|(private)|(protected))\s*([\w\d_<>\[\],\s]+)\s+(([\w\d_]+)\s*(\([^)]*\))?)/, "g");
    var str = mtd[3];
    var m;
    while (m = reg.exec(str))
    {
        if (m && m[7])
        {
            var start = text.indexOf(m[0]);
            var isFunc = !!m[8];
            var end = text.indexOf(isFunc ? ")" : ";", start) + 1;
            var positionFrom = editor.document.positionAt(start);
            var positionTo = editor.document.positionAt(end);
            var rng = new vscode.Range(positionFrom, positionTo);
            var ur = vscode.Uri.file(editor.document.fileName);
            Methods.Add(new TibMethod(m[7], m[5] + " " + m[6].trim(), rng, ur, isFunc));
        }
    }
}

// сохранение Id
function updateNodesIds(editor: vscode.TextEditor, names?: string[])
{
    var nNames = names;
    if (!nNames) nNames = _NodeStoreNames;
    var txt = editor.document.getText();
    var reg = new RegExp("<((" + nNames.join(")|(") + "))[^>]+Id=(\"|')([^\"']+)(\"|')", "g");
    var res;
    var idIndex = nNames.length + 3;
    CurrentNodes.Clear(nNames);
    while (res = reg.exec(txt))
    {
        var pos = editor.document.positionAt(txt.indexOf(res[0]));
        var item = new SurveyNode(res[1], res[idIndex], pos);
        CurrentNodes.Add(item);
    }
}





// -------------------- доп функции


function inString(text: string): boolean
{
    return !((occurrenceCount(text, "'") % 2 === 0) && (occurrenceCount(text, "\"") % 2 === 0) && (occurrenceCount(text, "`") % 2 === 0));
}


function execute(link: string)
{
    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(link));
}


function getCurrentTag(text: string): CurrentTag
{
    var pure = text.replace(/(?:<!--)([\s\S]*?)(-->)/, "");
    pure = pure.replace(/(?:<!\[CDATA\[)([\s\S]*?)(\]\]>)/, "");
    // удаление закрытых _AllowCodeTag из остатка кода
    var reg = new RegExp("<(" + _AllowCodeTags + ")[^/>]*((/>)|(>((?![\\t ]+\\s*\n)[\\s\\S]*?)(<\\/\\1\\s*>)))", "g");
    var regEnd = new RegExp("(<(" + _AllowCodeTags + ")([^/>]*>)?)((?![\\t ]+\\s*\n)[\\s\\S]?)*$", "g");
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
        var isSpaced = !!mt[3] && !!mt[3].substr(0, mt[3].indexOf("\n")).match(/^(>)[\t ]+\s*$/); // если тег отделён [\t ]+
        tag.CSInline = !!text.match(/\$[\w\d_]+$/);
        tag.CSMode =
            mt[1] && !!mt[1].match(new RegExp(_AllowCodeTags)) && !isSpaced ||
            (lastc > str.lastIndexOf("[/c#") && lastc < lastcEnd && lastcEnd >= 0) ||
            tag.CSInline;
        if (mt[4]) tag.Closed = true;
        tag.CSMode = tag.CSMode && tag.Closed;
        tag.Parents = nn;
        tag.Position = vscode.window.activeTextEditor.document.positionAt(originalText.lastIndexOf("<" + mt[1]));
        if (mt[2]) tag.setAttributes(mt[2]);
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
    var reg = new RegExp("<(" + _AllowCodeTags + ")((?!<\\/\\1)[\\s\\S])+", "g");
    var pure_text = text.replace(reg, "");
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
