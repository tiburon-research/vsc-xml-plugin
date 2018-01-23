'use strict';

import * as vscode from 'vscode';
import * as AutoCompleteArray from './autoComplete';
import { TibAutoCompleteItem, TibAttribute, TibMethod, InlineAttribute, CurrentTag, SurveyNode, SurveyNodes, TibMethods, TibTransform, ExtensionSettings, ContextChange } from "./classes";

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
    Constants: "<Item Id=\"$1\"><Value>$2</Value></Item>",
    Split: "<Item Id=\"$1\" Text=\"http://storage.internetopros.ru/Content/t/tib_${TM_FILENAME/^(\\d+)(.*)$/$1/}/$2.jpg,${3:Описание}\"/>",
    Stat: "<Item Id=\"$1\" Name=\"${2:Total}\" Source=\"1_X,2_X,3_X\"/>"
}

var Methods = new TibMethods();

var CurrentNodes: SurveyNodes = new SurveyNodes();

var Settings = new ExtensionSettings();


export function activate(context: vscode.ExtensionContext)
{
    var editor = vscode.window.activeTextEditor;

    Settings.update(vscode.workspace.getConfiguration('tib'));

    vscode.workspace.onDidChangeConfiguration(event =>
    {
        Settings.update(vscode.workspace.getConfiguration('tib'));
    })

    function reload()
    {
        if (!editor || editor.document.languageId != "tib") return;
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
    registerCommands();
    higlight();

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
        if (!editor || editor.document.languageId != "tib") return;
        var originalPosition = editor.selection.start.translate(0, 1);
        var text = editor.document.getText(new vscode.Range(new vscode.Position(0, 0), originalPosition));
        var tag = getCurrentTag(editor.document, originalPosition, text);
        updateNodesIds(editor);
        insertAutoCloseTag(event, editor, tag, text);
        insertSpecialSnippets(event, editor, text, tag);
        saveMethods(editor);
    });
}

export function deactivate()
{ }



function registerCommands()
{
    /*vscode.commands.registerCommand('tib.debug', () => 
    {
        execute("http://debug.survstat.ru/Survey/Adaptive/?fileName=" + editor.document.fileName);
    });*/

    vscode.commands.registerCommand('tib.insertTag', () => 
    {
        inProcess = true;
        vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString("[${1:u}$2]$TM_SELECTED_TEXT[/${1:u}]")).then(() => 
        {
            inProcess = false;
        });
    });

    vscode.commands.registerCommand('tib.cdata', () => 
    {
        inProcess = true;
        vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString("<![CDATA[\n\t$TM_SELECTED_TEXT\n]]>")).then(() => 
        {
            inProcess = false;
        });
    });

    vscode.commands.registerCommand('tib.transform.AnswersToItems', () => 
    {
        inProcess = true;
        var editor = vscode.window.activeTextEditor;
        editor.edit((editBuilder) =>
        {
            var text = editor.document.getText(editor.selection);
            editBuilder.replace(editor.selection, TibTransform.AnswersToItems(text));
        }).then(() =>
        {
            inProcess = false;
        });
    });

    vscode.commands.registerCommand('tib.transform.ItemsToAnswers', () => 
    {
        inProcess = true;
        var editor = vscode.window.activeTextEditor;
        editor.edit((editBuilder) =>
        {
            var text = editor.document.getText(editor.selection);
            editBuilder.replace(editor.selection, TibTransform.ItemsToAnswers(text));
        }).then(() =>
        {
            inProcess = false;
        });
    });
}


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


// tag match higlight
function higlight()
{
    vscode.languages.registerDocumentHighlightProvider('tib', {
        provideDocumentHighlights(document, position)
        {
            var text = getPreviousText(document, position);
            var tag = getCurrentTag(document, position, text);
            var curRange = document.getWordRangeAtPosition(position);
            var word = document.getText(curRange);
            if (tag.CSMode && word != 'c#') return; // такой костыль потому что при нахождении на [/c#] хз что там дальше и tag.CSMode == true
            var res = [];
            var fullText = document.getText();
            var after = getCurrentLineText(document, position).substr(position.character);
            var mt = text.match(/(((\[)|(<))\/?)((?!CDATA)\w*)$/);

            if (!mt) return;
            var ind = -1;
            var range: vscode.Range;

            switch (mt[1])
            {
                case "<":
                    // открывающийся
                    var endpos = document.positionAt(fullText.indexOf(">", text.length) + 1);
                    curRange = new vscode.Range(curRange.start.translate(0, -1), endpos);
                    res.push(new vscode.DocumentHighlight(curRange));

                    // закрывающийся
                    if (!after.match(/^[^>]*\/>/) && !isSelfClosedTag(word))
                    {
                        range = findCloseTag("<", word, ">", document, position);
                        if (range) res.push(new vscode.DocumentHighlight(range));
                    }
                    break;

                case "[":
                    // открывающийся
                    var txt = word != "c#" ? clearFromCSTags(fullText) : fullText;
                    var endpos = document.positionAt(txt.indexOf("]", text.length) + 1);
                    curRange = new vscode.Range(curRange.start.translate(0, -1), endpos);
                    res.push(new vscode.DocumentHighlight(curRange));

                    // закрывающийся
                    if (!after.match(/^[^\]]*\/\]/) && !isSelfClosedTag(word))
                    {
                        range = findCloseTag("[", word, "]", document, position);
                        if (range) res.push(new vscode.DocumentHighlight(range));
                    }
                    break;

                case "</":
                    // закрывающийся
                    var endpos = document.positionAt(fullText.indexOf(">", text.length) + 1);
                    curRange = new vscode.Range(curRange.start.translate(0, -2), endpos);
                    res.push(new vscode.DocumentHighlight(curRange));

                    // открывающийся
                    range = findOpenTag("<", word, ">", document, position);
                    if (range) res.push(new vscode.DocumentHighlight(range));
                    break;

                case "[/":
                    // закрывающийся
                    var txt = word != "c#" ? clearFromCSTags(fullText) : fullText;
                    var endpos = document.positionAt(txt.indexOf("]", text.length) + 1);
                    curRange = new vscode.Range(curRange.start.translate(0, -2), endpos);
                    res.push(new vscode.DocumentHighlight(curRange));

                    // открывающийся
                    range = findOpenTag("[", word, "]", document, position);
                    if (range) res.push(new vscode.DocumentHighlight(range));
                    break;
            }
            return res;
        }
    })
}


// autocomplete
function autoComplete()
{
    //Item Snippets
    vscode.languages.registerCompletionItemProvider('tib', {
        provideCompletionItems(document, position, token, context)
        {
            var completionItems = [];
            var tag = getCurrentTag(document, position);
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
                    var res = new vscode.SnippetString(ItemSnippets[parent].replace("Page=\"$1\"", "Page=\"${1|" + getAllPages().join(",") + "|}\""));
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
            var tag = getCurrentTag(document, position);
            var curLine = getPreviousText(document, position, true);
            if (tag && !tag.CSMode && !tag.Closed && AutoCompleteArray.Attributes[tag.Id] && !tag.InString)
            {
                var existAttrs = tag.attributeNames();
                AutoCompleteArray.Attributes[tag.Id].forEach(element =>
                {
                    if (existAttrs.indexOf(element.Name) < 0)
                    {
                        var attr = new TibAttribute(element);
                        var ci = attr.ToCompletionItem(function (query)
                        {
                            return safeValsEval(query);
                        });
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

    //Functions, Variables, Enums, Classes, Custom Methods, C# Snippets
    vscode.languages.registerCompletionItemProvider('tib', {
        provideCompletionItems(document, position, token, context)
        {
            var completionItems = [];
            var tag = getCurrentTag(document, position);
            if (!tag.CSMode) return;

            var curLine = getPreviousText(document, position, true);
            var customMethods = Methods.CompletionArray();

            if (customMethods && !tag.InCSString) completionItems = completionItems.concat(customMethods); //Custom Methods
            var str = getCurrentLineText(document, position).substr(position.character);
            if (!tag.CSSingle && !curLine.match(/\w+\.\w*$/))
            {
                if (!tag.InCSString)
                {
                    //Functions, Variables, Enums, Classes
                    var ar: TibAutoCompleteItem[] = TibAutoCompleteList.Functions.concat(TibAutoCompleteList.Variables, TibAutoCompleteList.Enums, TibAutoCompleteList.Classes);
                    ar.forEach(element =>
                    {
                        completionItems.push(element.ToCompletionItem(!str.match(/\w*\(/)));
                    });
                    //C# Snippets
                    AutoCompleteArray.CSSnippets.forEach(element =>
                    {
                        var ci = new vscode.CompletionItem(element.prefix, vscode.CompletionItemKind.Snippet);
                        ci.detail = element.description;
                        ci.insertText = new vscode.SnippetString(element.body.join("\n"));
                        completionItems.push(ci);
                    });
                }
                else //node Ids
                {
                    var qt = curLine.lastIndexOf('"');
                    if (qt > -1) // от недоверия к tag.InCSString
                    {
                        var stuff = curLine.substr(0, qt);
                        // Lists
                        if (stuff.match(/CurrentSurvey\.Lists\[\s*$/))
                            completionItems = completionItems.concat(CurrentNodes.CompletitionItems("List"));
                        // Pages
                        if (stuff.match(/Page\s*=\s*$/))
                            completionItems = completionItems.concat(CurrentNodes.CompletitionItems("Page"));
                    }
                }
            }
            return completionItems;
        },
        resolveCompletionItem(item, token)
        {
            return item;
        }
    }, "\"", "");

    //Properties, Methods, EnumMembers
    vscode.languages.registerCompletionItemProvider('tib', {
        provideCompletionItems(document, position, token, context)
        {
            var completionItems = [];
            var tag = getCurrentTag(document, position);
            if (tag.CSMode && !tag.InCSString && !tag.CSSingle)
            {
                var ar: TibAutoCompleteItem[] = TibAutoCompleteList.Properties.concat(TibAutoCompleteList.Methods, TibAutoCompleteList.EnumMembers);
                var lastLine = getPreviousText(document, position, true);
                var str = getCurrentLineText(document, position).substr(position.character);
                ar.forEach(element =>
                {
                    var m = false;
                    if (element.Parent)
                    {
                        var reg = new RegExp(element.Parent + "\\.\\w*$");
                        m = !!lastLine.match(reg);
                    }
                    if (m && (!element.ParentTag || element.ParentTag == tag.Name)) completionItems.push(element.ToCompletionItem(!str.match(/\w*\(/)));
                });
            }
            return completionItems;
        },
        resolveCompletionItem(item, token)
        {
            return item;
        }
    }, '.');

    //Значения атрибутов
    vscode.languages.registerCompletionItemProvider('tib', {
        provideCompletionItems(document, position, token, context)
        {
            var completionItems = [];
            var tag = getCurrentTag(document, position);
            if (!tag || tag.Closed) return;
            var text = getPreviousText(document, position, true);
            var needClose = !getCurrentLineText(document, position).substr(position.character).match(/^[\w@]*['"]/);

            var curAttr = text.match(/(\w+)=(["'])(\w*)$/);
            if (!curAttr) return;

            var atrs: TibAttribute[] = AutoCompleteArray.Attributes[tag.Id];
            if (!atrs) return;

            var attr = atrs.find(function (e, i)
            {
                return e.Name == curAttr[1];
            });
            if (!attr) return;

            var attrT = new TibAttribute(attr);
            var vals = attrT.ValueCompletitions(function (query)
            {
                return safeValsEval(query);
            });
            vals.forEach(v =>
            {
                var ci = new vscode.CompletionItem(v, vscode.CompletionItemKind.Enum);
                ci.insertText = v;
                completionItems.push(ci);
            });

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
            var tag = getCurrentTag(document, position);
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
            var tag = getCurrentTag(document, position);
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
            var tag = getCurrentTag(document, position);
            var res: vscode.Location;
            if (tag.CSMode && !tag.InCSString)
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
            },
            {
                beforeText: new RegExp(`\\[([a-z]\\w*#?)([^/\\]]*(?!/)\\])\\s*`, 'i'),
                afterText: /^\[\/([a-z]\w*#?)\s*\]$/i,
                action: { indentAction: vscode.IndentAction.IndentOutdent }
            },
            {
                beforeText: new RegExp(`\\[([a-z]\\w*#?)([^/\\]]*(?!/)\\])\\s*$`, 'i'),
                action: { indentAction: vscode.IndentAction.Indent }
            },
        ],
    });

}


function insertAutoCloseTag(event: vscode.TextDocumentChangeEvent, editor: vscode.TextEditor, tag: CurrentTag, text: string): void
{
    if (inProcess || !editor || !event || !event.contentChanges.length) return;
    var changes = getContextChanges(editor.selections, event.contentChanges);
    var fullText = editor.document.getText();

    // сохраняем начальное положение
    var prevSels = editor.selections.map(function (e) { return new vscode.Selection(e.start.translate(0, 1), e.end.translate(0, 1)); });

    var changesCount = 0;

    // проверяем только рандомный tag (который передаётся из activate), чтобы не перегружать процесс
    // хреново но быстро
    if (!tag.CSMode || tag.Body == "")
    {
        changes.forEach(change =>
        {
            var originalPosition = change.Active.translate(0, 1);
            if (change.Change.text == ">")
            {
                var curLine = getCurrentLineText(editor.document, originalPosition);
                var prev = curLine.substr(0, change.Active.character + 1);
                var after = curLine.substr(change.Active.character + 1);
                var result = prev.match(/<([\w\d_]+)[^>\/]*>?$/);
                if (result)
                {
                    var closed = after.match(new RegExp("^[^<]*(<\\/)?" + result[1]));
                    if (!closed)
                    {
                        changesCount++;
                        inProcess = true;
                        editor.insertSnippet(new vscode.SnippetString("</" + result[1] + ">"), originalPosition, { undoStopAfter: false, undoStopBefore: false }).then(() =>
                        {
                            // ожидаем конца всех изменений
                            if (changesCount <= 1)
                            {
                                editor.selections = prevSels;
                                inProcess = false;
                            }
                            else changesCount--;
                        });
                    }
                }
            }
        });
    }
}


function insertSpecialSnippets(event: vscode.TextDocumentChangeEvent, editor: vscode.TextEditor, text: string, tag: CurrentTag): void
{
    if (inProcess || !editor || !event || !event.contentChanges[0]) return;

    var change = event.contentChanges[0].text;
    var originalPosition = editor.selection.start.translate(0, 1);
    var curLine = getPreviousText(editor.document, editor.selection.start, true)

    // закрывание [тегов]
    var tagT = text.match(/\[([a-zA-Z][\w\d]*(#)?)(\s[^\]\[]*)?(\/)?\]$/);
    if
    (
        change[change.length - 1] == "]" &&
        (!tag.CSMode || tag.InCSString || !!tagT && tagT[2]) &&
        (((tag.Parents.join("") + tag.Name).indexOf("CustomText") == -1) || !!tagT[2]) &&
        !!tagT &&
        !!tagT[1] &&
        !tagT[4] &&
        !isSelfClosedTag(tagT[1])
    )
    {
        inProcess = true;
        var str = tagT[2] ? "$0;[/c#]" : "$0[/" + tagT[1] + "]";
        editor.insertSnippet(new vscode.SnippetString(str), originalPosition).then(() =>
        {
            inProcess = false;
        });
    }

}


function saveMethods(editor: vscode.TextEditor): void
{
    Methods.Clear();
    var text = editor.document.getText();
    if (Settings.Item("ignoreComments")) text = clearXMLComments(text);
    var mtd = text.match(/(<Methods)([^>]*>)([\s\S]*)(<\/Methods)/);
    if (!mtd || !mtd[3]) return;
    var reg = new RegExp(/((public)|(private)|(protected))\s*([\w\d_<>\[\],\s]+)\s+(([\w\d_]+)\s*(\([^)]*\))?)/, "g");
    var str = mtd[3];
    if (Settings.Item("ignoreComments")) str = clearCSComments(str);
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
    if (Settings.Item("ignoreComments")) txt = clearXMLComments(txt);
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
    CurrentNodes.Add(new SurveyNode("Page", "pre_data", null));
}





// -------------------- доп функции

function safeValsEval(query): string[]
{
    var res = [];
    try
    {
        res = eval(query);
    }
    catch (error)
    {
        console.log(error);
    }
    return res;
}

function getAllPages(): string[]
{
    return CurrentNodes.GetIds('Page');
}

function getAllLists(): string[]
{
    return CurrentNodes.GetIds('List');
}

function findCloseTag(opBracket: string, tagName: string, clBracket: string, document: vscode.TextDocument, position: vscode.Position): vscode.Range
{
    var fullText = document.getText();
    var prevText = getPreviousText(document, position);
    var textAfter = fullText.substr(prevText.length);

    var rest = textAfter;
    if (tagName != 'c#') rest = clearFromCSTags(rest);

    var curIndex = prevText.length + rest.indexOf(clBracket);
    var op = rest.indexOf(opBracket + tagName);
    var cl = rest.indexOf(opBracket + "/" + tagName);
    if (cl < 0) return null;

    var cO = 1;
    var cC = 0;
    while (cl > -1 && ((op > -1) || (cC != cO)))
    {
        if (op < cl && op > -1)
        {
            rest = rest.substr(op + 1);
            cO++;
        }
        else if (cO != cC)
        {
            rest = rest.substr(cl + 1);
            cC++;
        }

        if (cO == cC) break;       
        op = rest.indexOf(opBracket + tagName);
        cl = rest.indexOf(opBracket + "/" + tagName);
    }

    //rest = rest.substr(cl);
    var clLast = rest.indexOf(clBracket);

    if (cl < 0 || clLast < 0) return null;
    var startPos = document.positionAt(fullText.length - rest.length - 1);
    var endPos = document.positionAt(fullText.length - rest.length + clLast + 1);

    return new vscode.Range(startPos, endPos);
}


function findOpenTag(opBracket: string, tagName: string, clBracket: string, document: vscode.TextDocument, position: vscode.Position): vscode.Range
{
    var prevText = getPreviousText(document, position);
    if (tagName != 'c#') prevText = clearFromCSTags(prevText);
    var curIndex = prevText.lastIndexOf(opBracket);
    var txt = prevText.substr(0, curIndex);
    var rest = txt;
    var op = rest.lastIndexOf(opBracket + tagName);
    var cl = rest.lastIndexOf(opBracket + "/" + tagName);
    if (op < 0) return null;

    var cO = 0;
    var cC = 1;
    while (op > -1 && ((cl > -1) || op != cl))
    {
        if (cl > op && cl > -1)
        {
            rest = rest.substr(0, cl);
            cC++;
        }
        else if (cO != cC)
        {
            rest = rest.substr(0, op);
            cO++;
        }
        if (cO == cC) break;
        op = rest.lastIndexOf(opBracket + tagName);
        cl = rest.lastIndexOf(opBracket + "/" + tagName);
    }

    //rest = rest.substr(0, rest.indexOf(clBracket, op) + 1);
    var clLast = rest.lastIndexOf(clBracket) + 1;

    if (op < 0 || clLast < 0) return null;
    var startPos = document.positionAt(rest.length);
    var endPos = document.positionAt(txt.indexOf(clBracket, rest.length + 1) + 1);
    return new vscode.Range(startPos, endPos);
}

function isSelfClosedTag(tag: string): boolean
{
    return !!tag.match(/^((area)|(base)|(br)|(col)|(embed)|(hr)|(img)|(input)|(keygen)|(link)|(menuitem)|(meta)|(param)|(source)|(track)|(wbr))$/);
}

function inString(text: string): boolean
{
    /*
    // выполняется очень долго
    var regStr = /^((([^'"]*)(("[^"]*")|('[^']*'))*)*)$/;
    return !text.match(regStr);
    */

    var rest = text.replace(/\\"/g, "  "); // убираем экранированные кавычки
    var i = positiveMin(rest.indexOf("'"), rest.indexOf("\""));
    while (rest.length > 0 && i !== null)
    {
        if (i !== null)
        {
            var ch = rest[i];
            rest = rest.substr(i + 1);
            var next = rest.indexOf(ch);
            if (next < 0) return true;
            rest = rest.substr(next + 1);
            i = positiveMin(rest.indexOf("'"), rest.indexOf("\""));
        }
    }
    return false;
}


function positiveMin(a, b)
{
    if (a < 0)
        if (b < 0) return null;
        else return b;
    else
        if (b < 0) return a;
        else return Math.min(a, b);
}


function execute(link: string)
{
    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(link));
}


function getCurrentTag(document: vscode.TextDocument, position: vscode.Position, text: string = ""): CurrentTag
{
    var text = text || getPreviousText(document, position);
    var pure = text.replace(/(?:<!--)([\s\S]*?)(-->)/g, "");
    pure = pure.replace(/(?:<!\[CDATA\[)([\s\S]*?)(\]\]>)/g, "");
    // костыль для [/c#]: убираем / чтобы в regex можно было искать [^/>]
    pure = pure.replace(/\[\/c#/g, "[*c#");
    // удаление закрытых _AllowCodeTag из остатка кода (чтобы не искать <int>)
    var reg = new RegExp("<(" + _AllowCodeTags + ")[^/>]*((/>)|(>((?![\\t ]+\\s*\n)[\\s\\S]*?)(<\\/\\1\\s*>)))", "g");
    var regEnd = new RegExp("(<(" + _AllowCodeTags + ")([^/>]*)?>)((?![\\t ]+\\s*\n)[\\s\\S]*)*$", "g");
    pure = pure.replace(reg, "");
    pure = pure.replace(regEnd, "$1");
    if (pure.match(/<\s*$/)) pure = pure.substr(0, pure.lastIndexOf("<")); // иначе regExp в parseTags работает неправильно

    var tag = parseTags(pure, text);
    if (!tag) return new CurrentTag("xml");
    var tstart = text.lastIndexOf("<" + tag.Name);
    if (tag.Closed)
    {
        tag.Body = text.substr(text.indexOf(">", tstart) + 1);
        tag.InString = tag && tag.Body && inString(tag.Body);
        // если курсор на закрывающемся теге, то это уже не CSMode
        if (tag.CSMode && !tag.CSInline && !tag.CSSingle)
        {
            var start = text.lastIndexOf("<" + tag.Name) + 2;
            var document = vscode.window.activeTextEditor.document;
            var pos = document.positionAt(start);
            var endRange = findCloseTag("<", tag.Name, ">", document, pos);
            if (endRange)
            {
                endRange = new vscode.Range(endRange.start.translate(0, 1), endRange.end);
                if (endRange.contains(document.positionAt(text.length))) tag.CSMode = false;
            }
        }
    }
    else
    {
        tag.InString = inString(text.substr(tstart));
        // добавляем атрибуты после курсора
        var after = document.getText().substr(text.length);
        var cl = after.match(/^((\s*[\w-]+=(("[^"]*")|('[^']*'))?)*)/);
        if (!!cl) tag.setAttributes(cl[1]);
    }
    if (tag.CSMode)
    {
        if (tag.CSSingle)
        {
            var rest = text.substr(text.lastIndexOf("$"));
            tag.InCSString = inString(rest);
        }
        else if (tag.CSInline)
        {
            var rest = text.substr(text.lastIndexOf("[c#"));
            rest = rest.substr(rest.indexOf("]") + 1);
            tag.InCSString = inString(rest);
        }
        else tag.InCSString = tag.InString;
    }
    return tag;
}

// рекурсивный поиск незакрытых тегов
function parseTags(text: string, originalText, nodes = [], prevMatch: RegExpMatchArray = null): CurrentTag
{
    var res = text.match(/<([\w\d]+)([^/>]*)((>)\s*(([^<]|(<(?!\/\1)[\s\S]))*))?$/);
    const
        // группы regex    
        gr_name = 1,
        gr_attrs = 2,
        gr_after = 3,
        gr_close = 4,
        gr_body = 5;
    /*var res = text.match(/<([\w\d]+)(\s*(\w+=?(("[^"]*")|('[^']*'))?)?)*((>)\s*(([^<]|(<(?!\/\1)[\s\S]))*))?$/);
    const
        // группы regex    
        gr_name = 1,
        gr_attrs = 2,
        gr_after = 7,
        gr_close = 8,
        gr_body = 9;*/
    var nn = nodes;
    if (res && res[gr_name]) nn.push(res[gr_name]);
    if (res && res[gr_name] && res[gr_body])
    {
        var rem = res[gr_body];
        return parseTags(rem, originalText, nn, res);
    }
    else
    {// родители закончились
        nn.pop();
        var mt = res ? res : prevMatch;
        if (!mt || !mt[gr_name]) return null;
        var tag = new CurrentTag(mt[gr_name]); // inint
        var str = mt[0];
        var lastc = str.lastIndexOf("[c#");
        var lastcEnd = str.lastIndexOf("[*c#");
        var isSpaced = !!mt[gr_after] && !!mt[gr_after].substr(0, mt[gr_after].indexOf("\n")).match(/^(>)[\t ]+\s*$/); // если тег отделён [\t ]+ то он не считается c#
        tag.CSSingle = !!text.match(/\$[\w\d_]+$/);
        tag.CSInline = (lastc > 0 && lastc > lastcEnd);
        tag.CSMode =
            tag.CSInline ||
            tag.CSSingle ||
            mt[gr_name] && !!mt[gr_name].match(new RegExp(_AllowCodeTags)) && !isSpaced;
        if (mt[gr_close]) tag.Closed = true;
        tag.CSMode = tag.CSMode && (tag.Closed || tag.CSSingle || tag.CSInline);
        tag.Parents = nn;
        tag.Position = vscode.window.activeTextEditor.document.positionAt(originalText.lastIndexOf("<" + mt[gr_name]));
        if (mt[gr_attrs]) tag.setAttributes(mt[gr_attrs]);
        if (mt[gr_body]) tag.Body = mt[gr_body];
        tag.LastParent = nn[nn.length - 1];
        if (mt[gr_name] == "Item") tag.Id = tag.LastParent + "Item"; //специально для Item разных родителей
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

function moveSelectionRight(selection: vscode.Selection, shift: number): vscode.Selection
{
    var newPosition = selection.active.translate(0, shift);
    return new vscode.Selection(newPosition, newPosition);
}

function occurrenceCount(source: string, find: string): number
{
    return source.split(find).length - 1;
}

// костыль для неучитывания c# вставок
function clearFromCSTags(text: string): string
{
    return text.replace(/\[c#([^\]]*)\]([\s\S]+?)\[\/c#([^\]]*)\]/g, "*c#$1*$2*/c#$3*");
}

function clearXMLComments(txt: string): string
{
    var mt = txt.match(/<!--([\s\S]+?)-->/g);
    var res = txt;
    var rep = "";
    if (!mt) return txt;
    mt.forEach(element =>
    {
        rep = element.replace(/./g, ' ');
        res = res.replace(element, rep);
    });
    return res;
}

function clearCSComments(txt: string): string
{
    var mt = txt.match(/\/\*([\s\S]+?)\*\//g);
    var res = txt;
    var rep = "";
    if (!mt) return txt;
    mt.forEach(element =>
    {
        rep = element.replace(/./g, ' ');
        res = res.replace(element, rep);
    });
    return res;
}


function getContextChanges(selections: vscode.Selection[], changes: vscode.TextDocumentContentChangeEvent[]): ContextChange[]
{
    var res: ContextChange[] = [];
    selections.forEach(selection =>
    {
        for (var i = 0; i < changes.length; i++)
        {
            if (selection.start.character == changes[i].range.start.character &&
                selection.start.line == changes[i].range.start.line)
            {
                res.push(new ContextChange(changes[i], selection));
                continue;
            }
        }
    });
    return res;
}