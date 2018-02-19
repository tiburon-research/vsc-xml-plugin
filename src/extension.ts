'use strict';

import * as vscode from 'vscode';
import * as AutoCompleteArray from './autoComplete';
import { TibAutoCompleteItem, TibAttribute, TibMethod, InlineAttribute, CurrentTag, SurveyNode, SurveyNodes, TibMethods, TibTransform, ExtensionSettings, ContextChange, KeyedCollection, _AllowCodeTags, Language, positiveMin, logError, isScriptLanguage, logString, getFromCB } from "./classes";
import * as XML from './documentFunctions';

// константы

const _NodeStoreNames = ["Page", "Question", "Quota", "List"]; // XML теги, которые сохраняются в CurrentNodes
const _DemoPath = "T:\\=Tiburon_NEW\\!!!Проекты\\=OWN\\Deman\\Adaptive\\deman_adaptive.xml"; // путь к демке


// глобальные переменные

var inProcess = false; // во избежание рекурсий

var TibAutoCompleteList = new KeyedCollection<TibAutoCompleteItem[]>();

var codeAutoCompleteArray: TibAutoCompleteItem[] = []; // список всех для C# (все перегрузки отдельно)

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
        if (inProcess || !editor || editor.document.languageId != "tib") return;
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



    vscode.commands.registerTextEditorCommand('tib.insertTag', () => 
    {
        inProcess = true;
        vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString("[${1:u}$2]$TM_SELECTED_TEXT[/${1:u}]")).then(() => 
        {
            inProcess = false;
        });
    });

    vscode.commands.registerTextEditorCommand('tib.cdata', () => 
    {
        inProcess = true;
        var multi = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection).indexOf("\n") > -1;
        var pre = multi ? "\n\t" : " ";
        var post = multi ? "\n" : " ";
        vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString("<![CDATA[" + pre + "$TM_SELECTED_TEXT" + post + "]]>")).then(() => 
        {
            inProcess = false;
        });
    });

    vscode.commands.registerTextEditorCommand('tib.commentBlock', () => 
    {
        inProcess = true;
        vscode.window.activeTextEditor.selection = selectLines(vscode.window.activeTextEditor.document, vscode.window.activeTextEditor.selection);
        vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString("<!--#block $1 -->\n\n$0$TM_SELECTED_TEXT\n\n<!--#endblock-->")).then(() => 
        {
            inProcess = false;
        });
    });

    vscode.commands.registerTextEditorCommand('tib.transform.AnswersToItems', () => 
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

    vscode.commands.registerTextEditorCommand('tib.transform.ItemsToAnswers', () => 
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

    // комментирование блока
    vscode.commands.registerTextEditorCommand('editor.action.blockComment', () => 
    {
        let editor = vscode.window.activeTextEditor;
        // отсортированные от начала к концу выделения
        let selections = editor.selections;
        if (selections.length > 1) selections = selections.sort(function (a, b)
        {
            return editor.document.offsetAt(b.start) - editor.document.offsetAt(a.start);
        });
        // для каждого выделения
        inProcess = true;
        commentAllBlocks(editor, selections, function ()
        {
            inProcess = false;
        });
    });

    // стандартная команда для форматирования
    vscode.commands.registerTextEditorCommand('editor.action.formatDocument', () => 
    {
        let editor = vscode.window.activeTextEditor;

        let range;
        let indent;
        let tag;
        // либо весь документ
        if (editor.selection.start.isEqual(editor.selection.end))
        {
            range = getFullRange(editor);
            indent = 0;
            tag = getCurrentTag(editor.document, editor.selection.start);
        }
        else
        {
            // либо выделяем строки целиком
            let sel = selectLines(editor.document, editor.selection);
            editor.selection = sel;
            range = sel;
            tag = getCurrentTag(editor.document, sel.start);
            indent = tag.Parents.length + 1;
        }
        let text = editor.document.getText(range);
        // тут можно потом добавить язык, например, из tag.Language
        let res = XML.format(text, Language.XML, "\t", indent);
        if (!res || res.Errors.length) return;

        inProcess = true;

        editor.edit((editBuilder) =>
        {
            editBuilder.replace(range, res.Result);
        }).then(() =>
        {
            inProcess = false;
        });
    })

    vscode.commands.registerTextEditorCommand('tib.paste', () => 
    {
        inProcess = true;
        let txt = getFromCB();
        if (txt.match(/[\s\S]*\n$/)) txt = txt.replace(/\n$/,'');
        let pre = txt.split("\n");
        let lines = [];
        let editor = vscode.window.activeTextEditor;



        if (pre.length != editor.selections.length)
        {
            for (let i = 0; i < editor.selections.length; i++)
            {
                lines.push(txt);
            }
            multiLinePaste(editor, lines);
        }
        else
        {
            lines = pre.map(s => { return s.trim() });
            if (lines.filter(l => { return l.indexOf("\t") > -1; }).length == lines.length)
            {    
                vscode.window.showQuickPick(["Нет", "Да"], { placeHolder: "Разделить запятыми?" }).then(x =>
                {
                    multiLinePaste(editor, lines, x == "Да");
                });
            }
            else multiLinePaste(editor, lines);
        }
    });

    vscode.commands.registerCommand('tib.demo', () => 
    {
        //vscode.commands.executeCommand("vscode.open", vscode.Uri.file(_DemoPath));

        vscode.workspace.openTextDocument(_DemoPath).then(doc =>
        { // открываем демку (в памяти)
            let txt = doc.getText();
            vscode.workspace.openTextDocument({ language: "tib" }).then(newDoc =>
            { // создаём пустой tib-файл
                vscode.window.showTextDocument(newDoc).then(editor => 
                { // отображаем пустой
                    editor.edit(builder => 
                    { // заливаем в него демку
                        builder.insert(new vscode.Position(0, 0), txt)
                    });
                });
            })
        });
    });
}


function getData()
{
    let tibCode = AutoCompleteArray.Code.map(x => { return new TibAutoCompleteItem(x); });
    let statCS: TibAutoCompleteItem[] = [];
    for (let key in AutoCompleteArray.StaticMethods)
    {
        // добавляем сам тип в AutoComplete
        let tp = new TibAutoCompleteItem({
            Name: key,
            Kind: "Class",
            Detail: "Тип данных/класс " + key
        });
        statCS.push(tp);
        // добавляем все его статические методы
        let items: object[] = AutoCompleteArray.StaticMethods[key];
        items.forEach(item =>
        {
            let aci = new TibAutoCompleteItem(item);
            aci.Parent = key;
            aci.Kind = "Method";
            statCS.push(aci);
        });
    }

    // объединённый массив Tiburon + MSDN
    let all = tibCode.concat(statCS);

    all.forEach(element =>
    {
        let item = new TibAutoCompleteItem(element);
        if (!item.Kind || !item.Name) return;

        codeAutoCompleteArray.push(new TibAutoCompleteItem(element)); // сюда добавляем всё
        // если такого типа ещё нет, то добавляем
        if (!TibAutoCompleteList.Contains(item.Kind)) TibAutoCompleteList.AddPair(item.Kind, [item])
        else // если есть то добавляем в массив с учётом перегрузок
        {
            // ищем индекс элемента с таким же типом, именем и родителем
            let ind = TibAutoCompleteList.Item(item.Kind).findIndex(x =>
            {
                return x.Name == item.Name && (!!x.Parent && x.Parent == item.Parent || !x.Parent && !item.Parent);
            });

            if (ind < 0)
            {
                TibAutoCompleteList.Item(item.Kind).push(item);
            }
            else // добавляем в перегрузку к имеющемуся (и сам имеющийся тоже, если надо)
            {
                let len = TibAutoCompleteList.Item(item.Kind)[ind].Overloads.length;
                if (len == 0)
                {
                    let parent = TibAutoCompleteList.Item(item.Kind)[ind];
                    TibAutoCompleteList.Item(item.Kind)[ind].Overloads.push(parent);
                    len++;
                }
                TibAutoCompleteList.Item(item.Kind)[ind].Overloads.push(item);
                let doc = "Перегрузок: " + (len + 1);
                TibAutoCompleteList.Item(item.Kind)[ind].Description = doc;
                TibAutoCompleteList.Item(item.Kind)[ind].Documentation = doc;
            }
        }
    });
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
            let completionItems = [];
            let tag = getCurrentTag(document, position);
            if (tag && !tag.CSMode)
            {
                //Item
                if ("Item".indexOf(tag.Name) > -1)
                {
                    let parent;
                    for (let key in ItemSnippets)
                        if (tag.Parents.indexOf(key) > -1)
                        {
                            parent = key;
                            break;
                        }
                    if (!parent || !ItemSnippets[parent]) parent = "List";
                    let res = new vscode.SnippetString(ItemSnippets[parent].replace("Page=\"$1\"", "Page=\"${1|" + getAllPages().join(",") + "|}\""));
                    if (res)
                    {
                        let ci = new vscode.CompletionItem("Item", vscode.CompletionItemKind.Snippet);
                        let from_pos = tag.Position;
                        let range = new vscode.Range(from_pos.translate(0, 1), position);

                        ci.detail = "Структура Item для " + parent;
                        ci.insertText = res;
                        ci.additionalTextEdits = [vscode.TextEdit.replace(range, "")];
                        completionItems.push(ci);
                    }
                }
                // Answer
                else if ("Answer".indexOf(tag.Name) > -1)
                {
                    let ci = new vscode.CompletionItem("Answer", vscode.CompletionItemKind.Snippet);
                    let from_pos = tag.Position;
                    let range = new vscode.Range(from_pos.translate(0, 1), position);
                    ci.additionalTextEdits = [vscode.TextEdit.replace(range, "")];

                    if (tag.LastParent == "Repeat")
                    {
                        ci.detail = "Структура Answer в Repeat";
                        // ищем Length/Range/List
                        let txt = getPreviousText(document, position);
                        txt = txt.substr(txt.lastIndexOf("<Repeat"));
                        txt = txt.substr(0, txt.indexOf(">"));
                        let attrs = getAttributes(txt);
                        if (attrs.Contains("List"))
                            ci.insertText = new vscode.SnippetString("<Answer Id=\"${1:@ID}\"><Text>${2:@Text}</Text></Answer>");
                        else
                            ci.insertText = new vscode.SnippetString("<Answer Id=\"${1:@Itera}\"><Text>${2:@Itera}</Text></Answer>");
                        ci.documentation = ci.insertText.value;
                    }
                    else
                    {
                        ci.detail = "Структура Answer";
                        ci.insertText = new vscode.SnippetString("<Answer Id=\"${1:1}\"><Text>$2</Text></Answer>");
                        ci.documentation = ci.insertText.value;
                    }
                    completionItems.push(ci);
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
            let completionItems = [];
            let tag = getCurrentTag(document, position);
            if (tag && !tag.CSMode && !tag.Closed && AutoCompleteArray.Attributes[tag.Id] && !tag.InString)
            {
                let existAttrs = tag.attributeNames();
                AutoCompleteArray.Attributes[tag.Id].forEach(element =>
                {
                    if (existAttrs.indexOf(element.Name) < 0)
                    {
                        let attr = new TibAttribute(element);
                        let ci = attr.ToCompletionItem(function (query)
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

    //Functions, Variables, Enums, Classes, Custom Methods, C# Snippets, Types
    vscode.languages.registerCompletionItemProvider('tib', {
        provideCompletionItems(document, position, token, context)
        {
            let completionItems = [];
            let tag = getCurrentTag(document, position);
            if (!tag.CSMode) return;

            let curLine = getPreviousText(document, position, true);
            let customMethods = Methods.CompletionArray();

            if (customMethods && !tag.InCSString) completionItems = completionItems.concat(customMethods); //Custom Methods
            let str = getCurrentLineText(document, position).substr(position.character);
            if (tag.CSSingle) // добавляем snippet для $repeat
            {
                let ci = new vscode.CompletionItem("repeat", vscode.CompletionItemKind.Snippet);
                ci.detail = "Строчный repeat";
                ci.insertText = new vscode.SnippetString("repeat(${1|" + getAllLists().join(',') + "|}){${2:@ID}[${3:,}]}");
                completionItems.push(ci);
            }
            if (!tag.CSSingle && !curLine.match(/\w+\.\w*$/))
            {
                if (!tag.InCSString)
                {
                    //Functions, Variables, Enums, Classes
                    let ar: TibAutoCompleteItem[] = TibAutoCompleteList.Item("Function").concat(TibAutoCompleteList.Item("Variable"), TibAutoCompleteList.Item("Enum"), TibAutoCompleteList.Item("Class"), TibAutoCompleteList.Item("Type"), TibAutoCompleteList.Item("Struct"));
                    ar.forEach(element =>
                    {
                        if (element) completionItems.push(element.ToCompletionItem(!str.match(/\w*\(/)));
                    });
                    //C# Snippets
                    AutoCompleteArray.CSSnippets.forEach(element =>
                    {
                        let ci = new vscode.CompletionItem(element.prefix, vscode.CompletionItemKind.Snippet);
                        ci.detail = element.description;
                        ci.insertText = new vscode.SnippetString(element.body.join("\n"));
                        completionItems.push(ci);
                    });
                }
                else //node Ids
                {
                    let qt = curLine.lastIndexOf('"');
                    if (qt > -1) // от недоверия к tag.InCSString
                    {
                        let stuff = curLine.substr(0, qt);
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
                var ar: TibAutoCompleteItem[] = TibAutoCompleteList.Item("Property").concat(TibAutoCompleteList.Item("Method"), TibAutoCompleteList.Item("EnumMember"));
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
                var ar = TibAutoCompleteList.Item("Function").concat(TibAutoCompleteList.Item("Method"));
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
            // надо проверить родителя!
            let suit = codeAutoCompleteArray.filter(x =>
            {
                return x.Name == text;
            });
            for (var i = 0; i < suit.length; i++)
            {
                if (suit[i].Documentation && suit[i].Description)
                {
                    let doc = "/* " + suit[i].Description + " */\n" + suit[i].Documentation;
                    res.push({ language: "csharp", value: doc });
                }
                else
                {
                    if (suit[i].Documentation) res.push({ language: "csharp", value: suit[i].Documentation });
                    if (suit[i].Description) res.push(suit[i].Description);
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
                var result = prev.match(/<(\w+)[^>\/]*>?$/);
                // проверяем, не закрыт ли уже этот тег
                var afterFull = fullText.substr(editor.document.offsetAt(originalPosition));
                var tagOp = afterFull.indexOf("<" + result[1]);
                var tagCl = afterFull.indexOf("</" + result[1]);

                if (result && ((tagCl == -1 || tagOp > -1 && tagOp < tagCl) || result[1].match(/^(Repeat)|(Condition)|(Block)$/)))
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
    if (Settings.Item("ignoreComments")) text = XML.clearXMLComments(text);
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
    if (Settings.Item("ignoreComments")) txt = XML.clearXMLComments(txt);
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
    if (tagName != 'c#') fullText = clearFromCSTags(fullText);
    var prevText = getPreviousText(document, position);
    var res = XML.findCloseTag(opBracket, tagName, clBracket, prevText, fullText);
    if (!res || res.Length < 2) return null;
    var startPos = document.positionAt(res.From);
    var endPos = document.positionAt(res.To + 1);
    return new vscode.Range(startPos, endPos);
}


function findOpenTag(opBracket: string, tagName: string, clBracket: string, document: vscode.TextDocument, position: vscode.Position): vscode.Range
{
    var prevText = getPreviousText(document, position);
    if (tagName != 'c#') prevText = clearFromCSTags(prevText);
    var res = XML.findOpenTag(opBracket, tagName, clBracket, prevText);
    if (!res || res.Length < 2) return null;
    var startPos = document.positionAt(res.From);
    var endPos = document.positionAt(res.To + 1);
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
    /*
        нужно сохранять причину изменений, чтобы 100 раз не переделывать туда-обратно
        
        - в значениях атрибутов могут быть /, поэтому [^/>]* не подходит
        - ещё одна скобка в группе атрибутов всё вешает: ((\s*[\w-]+(=(("[^"]*")|('[^']*'))?)?)*)
        - при [обязательной кавычке после значения атрибута] не работает во время редактирования значения атрибута
        - /<(\w+)((\s*[\w-]+=(("[^"]*"?)|('[^']*'?))?)*)\s*((>)\s*(([^<]|(<(?!\/\1)[\s\S]))*))?$/   тут обязательно = после имени атрибута. Тоже не понимает при вводе атрибутов
        - /<(\w+)((\s*[\w-]+=?(("[^"]*"?)|('[^']*'?))?)*)\s*((>)\s*(([^<]|(<(?!\/\1)[\s\S]))*))?$/   при необязательном = всё виснет
        - /<(\w+)((\s*[\w-]+=(("[^"]*"?)|('[^']*'?))?)*)\s*((>)\s*(([^<]|(<(?!\/\1)[\s\S]))*))?$/   а так просто работает долго
    */

    //var res = text.match(/<(\w+)([^>]*)((>)\s*(([^<]|(<(?!\/\1)[\s\S]))*))?$/);
    let res = text.match(/<(\w+)((\s*[\w-]+=(("[^"]*"?)|('[^']*'?))?)*)\s*((>)\s*(([^<]|(<(?!\/\1)[\s\S]))*))?$/);
    const
        // группы regex    
        gr_name = 1,
        gr_attrs = 2,
        gr_after = 7,
        gr_close = 8,
        gr_body = 9;
    let nn = nodes;
    if (res && res[gr_name]) nn.push(res[gr_name]);
    if (res && res[gr_name] && res[gr_body])
    {
        let rem = res[gr_body];
        return parseTags(rem, originalText, nn, res);
    }
    else
    {// родители закончились
        nn.pop();
        let mt = res ? res : prevMatch;
        if (!mt || !mt[gr_name]) return null;
        let tag = new CurrentTag(mt[gr_name]); // inint
        let str = mt[0];
        let lastc = str.lastIndexOf("[c#");
        let clC = str.indexOf("]", lastc);
        let lastcEnd = str.lastIndexOf("[*c#");
        let isSpaced = !!mt[gr_after] && !!mt[gr_after].substr(0, mt[gr_after].indexOf("\n")).match(/^(>)[\t ]+\s*$/); // если тег отделён [\t ]+ то он не считается c#
        tag.CSSingle = !!text.match(/\$[\w\d_]+$/);
        tag.CSInline = (lastc > 0 && lastc > lastcEnd && clC > 0 && (clC < lastcEnd || lastcEnd < 0));
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

function getAttributes(str: string): KeyedCollection<string>
{
    return CurrentTag.getAttributesArray(str);
}


// весь документ
function getFullRange(editor: vscode.TextEditor): vscode.Range
{
    return new vscode.Range(0, 0, editor.document.lineCount - 1, editor.document.lineAt(editor.document.lineCount - 1).text.length);
}


// расширяет выделение до границ строк
function selectLines(document: vscode.TextDocument, selection: vscode.Selection): vscode.Selection
{
    return new vscode.Selection(
        new vscode.Position(selection.start.line, 0),
        new vscode.Position(selection.end.line, document.lineAt(selection.end.line).range.end.character)
    );
}

function commentBlock(editor: vscode.TextEditor, selection: vscode.Selection, callback: Function): void
{
    let document = editor.document;
    let text = document.getText(selection);
    let tagFrom = getCurrentTag(document, selection.start);
    let tagTo = getCurrentTag(document, selection.end);
    let langFrom = tagFrom.getLaguage();
    let langTo = tagTo.getLaguage();
    if (langFrom != langTo)
    {
        logError("Начало и конец выделенного фрагмента лежат в разных языковых областях");
        callback(false);
        return;
    }
    //let multiLine = text.indexOf("\n") > -1;
    let cStart = "<!--";
    let cEnd = "-->";
    let sel = selection;

    if (isScriptLanguage(langFrom))
    {
        cStart = "/*";
        cEnd = "*/";
    }

    let newText = text;

    // закомментировать или раскомментировать
    let lineSel = selectLines(document, selection);
    let fulLines = document.getText(lineSel);
    if (fulLines.match(new RegExp("^\\s*" + cStart + "[\\S\\s]*" + cEnd + "\\s*$")))
    {
        sel = lineSel;
        newText = fulLines.replace(new RegExp("^(\\s*)" + cStart + " ?([\\S\\s]*) ?" + cEnd + "(\\s*)$"), "$1$2$3");
    }
    else
    {
        cStart += " ";
        cEnd = " " + cEnd;
        newText = cStart + newText + cEnd;
    }
    editor.edit((editBuilder) =>
    {
        editBuilder.replace(sel, newText);
    }, { undoStopAfter: false, undoStopBefore: false }).then(() =>
    {
        callback(true);
    });
}


function commentAllBlocks(editor: vscode.TextEditor, selections: vscode.Selection[], callback: Function): void
{
    // рекурсивный вызов с уменьшением массива выделений
    commentBlock(editor, selections.pop(), function (res)
    {
        if (!res || selections.length == 0)
        {
            callback();
            return;
        }
        commentAllBlocks(editor, selections, callback);
    });
}


// замена текста
function pasteText(editor: vscode.TextEditor, selection: vscode.Selection, text: string, callback: Function): void
{
    editor.edit((editBuilder) =>
    {
        editBuilder.replace(selection, text);
    }, { undoStopAfter: false, undoStopBefore: false }).then(() =>
    {
        callback();
    });
}

// последовательная замена (вставка) текста
function multiPaste(editor: vscode.TextEditor, selections: vscode.Selection[], lines: string[], callback: Function): void
{
    pasteText(editor, selections.pop(), lines.pop(), function ()
    {
        if (selections.length == 0)
        {
            callback();
            return;
        }
        multiPaste(editor, selections, lines, callback);
    });
}


// вынесенный кусок из комманды вставки
function multiLinePaste(editor: vscode.TextEditor, lines: string[], separate: boolean = false): void
{
    if (separate) lines = lines.map(s => { return s.replace("\t", ",") });
    multiPaste(editor, editor.selections, lines, function ()
    {
        // ставим курсор в конец
        editor.selections = editor.selections.map(sel => { return new vscode.Selection(sel.end, sel.end) });
        inProcess = false;
    });
}