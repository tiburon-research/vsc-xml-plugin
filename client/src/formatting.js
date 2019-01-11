'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var classes_1 = require("./classes");
var beautify = require("js-beautify");
var cssbeautify = require("cssbeautify");
var extension_1 = require("./extension");
var parsing_1 = require("../../modules/TibClasses/lib/parsing");
var encoding_1 = require("../../modules/TibClasses/lib/encoding");
var constants_1 = require("./constants");
var _settings;
var FormatResult = /** @class */ (function () {
    function FormatResult() {
        this.Result = "";
    }
    return FormatResult;
}());
exports.FormatResult = FormatResult;
// выбираем функцию форматирования по Language
function LanguageFunction(language) {
    var func;
    switch (language) {
        case classes_1.Language.PlainText:
            func = formatPlainText;
            break;
        case classes_1.Language.JS:
            func = formatJS;
            break;
        case classes_1.Language.CSS:
            func = formatCSS;
            break;
        case classes_1.Language.CSharp:
            func = formatCSharp;
            break;
        default:
            func = formatXML;
            break;
    }
    return func;
}
/*
    XML форматируем сами, CSS и JS с помощью beautify, C# с помощью расширения Leopotam.csharpfixformat или как PlainText
    для beautify: т.к. у нас везде бывает [c#], то добавляем костыли:
        - перед форматированием присваиваем (прям в тексте) всем c# вставкам свой Id
        - сохраняем их в первозданном виде в коллекцию согласно Id
        - форматируем всё
        - возвращаем c# вставки по Id
*/
/** Форматирование согласно языку */
function format(text, language, settings, tab, indent) {
    if (tab === void 0) { tab = "\t"; }
    if (indent === void 0) { indent = 0; }
    return new Promise(function (resolve, reject) {
        _settings = settings;
        var txt = text;
        if (language == classes_1.Language.XML)
            txt = preFormatXML(text);
        LanguageFunction(language)(txt, tab, indent).then(function (res) {
            if (!res.Error) {
                // дополнительная (одноразовая) постобработка XML
                if (language == classes_1.Language.XML)
                    res = postFormatXML(res);
                // пока не будет работать стабильно проверяем целостность текста
                var hash = text.replace(constants_1.RegExpPatterns.FormattingHash, '');
                if (res.Result.replace(constants_1.RegExpPatterns.FormattingHash, '') != hash) {
                    res.Error = "Результат форматирования не прошёл проверку на целостность текста";
                    reject(res.Error);
                }
                else
                    resolve(res.Result);
            }
            else
                reject(res.Error);
        });
    });
}
exports.format = format;
function formatXML(text, tab, indent) {
    if (tab === void 0) { tab = "\t"; }
    if (indent === void 0) { indent = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var res, ind, decl, oldText, tags, newText, i, tag, body, formattedBody, openTag, closeTag, oldFull, before_1, after_1, newFul, tmpRes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    res = new FormatResult();
                    res.Result = text;
                    ind = tab.repeat(indent);
                    decl = parsing_1.ReplaceXMLDeclaration(text);
                    oldText = decl.Result;
                    tags = parsing_1.get1LevelNodes(oldText);
                    newText = oldText;
                    if (!(tags.length == 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, formatPlainText(oldText, tab, indent)];
                case 1:
                    res = _a.sent();
                    return [3 /*break*/, 11];
                case 2:
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < tags.length)) return [3 /*break*/, 9];
                    tag = tags[i];
                    if (!!res.Error)
                        return [3 /*break*/, 8]; // если ошибка уже есть, то пропускаем всё
                    body = oldText.slice(tag.Body.From, tag.Body.To);
                    formattedBody = body;
                    openTag = oldText.slice(tag.OpenTag.From, tag.OpenTag.To);
                    closeTag = tag.Closed ? oldText.slice(tag.CloseTag.From, tag.CloseTag.To) : "";
                    oldFull = oldText.slice(tag.FullLines.From, tag.FullLines.To);
                    if (!oldFull)
                        return [3 /*break*/, 8];
                    before_1 = oldText.slice(tag.FullLines.From, tag.OpenTag.From);
                    after_1 = oldText.slice(tag.CloseTag.To, tag.FullLines.To);
                    newFul = void 0;
                    // форматируем то, что вне тега на тех же строках\
                    if (!before_1.match(/^\s*$/))
                        before_1 = before_1.replace(/^\s*(\S.*)\s*/, '$1\n');
                    else
                        before_1 = '';
                    if (!after_1.match(/^\s*$/))
                        after_1 = after_1.replace(/^\s*(\S.*)\s*/, ' $1');
                    else
                        after_1 = '';
                    if (!!body.match(/^\s*$/)) return [3 /*break*/, 6];
                    if (!tag.Multiline) return [3 /*break*/, 5];
                    // убираем лишние пробелы/переносы
                    formattedBody = formattedBody.replace(/^\s*?(([\t ]*)(\S[\s\S]*\S))\s*$/, "$2$3");
                    return [4 /*yield*/, formatBody(formattedBody, tab, indent + 1, tag.Language)];
                case 4:
                    tmpRes = _a.sent();
                    if (!!tmpRes.Error) {
                        res.Error = "Ошибка при форматировании тега" + (!!tag && !!tag.Name ? (" " + tag.Name) : "") + ":\n" + tmpRes.Error;
                        return [3 /*break*/, 8];
                    }
                    formattedBody = "\n" + tmpRes.Result + "\n";
                    _a.label = 5;
                case 5:
                    // отступ для AllowCode fake
                    if (!tag.IsAllowCodeTag && !tag.SelfClosed && tag.Name.match(new RegExp("^" + constants_1.RegExpPatterns.AllowCodeTags + "$")) && !formattedBody.match(/^[\t ]/))
                        formattedBody = " " + formattedBody;
                    if (tag.Closed && !tag.SelfClosed)
                        closeTag = (tag.Multiline ? ind : "") + closeTag;
                    return [3 /*break*/, 7];
                case 6:
                    formattedBody = "";
                    _a.label = 7;
                case 7:
                    // формируем результат
                    newFul = before_1 + ind + formatTag(openTag) + formattedBody + formatTag(closeTag) + after_1;
                    newText = newText.replace(oldFull, newFul);
                    _a.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 3];
                case 9:
                    ;
                    if (!!res.Error) return [3 /*break*/, 11];
                    return [4 /*yield*/, formatBetweenTags(newText, tab, indent)];
                case 10:
                    res = _a.sent();
                    _a.label = 11;
                case 11:
                    if (!!decl.Declaration)
                        res.Result = decl.Declaration + res.Result;
                    return [2 /*return*/, res];
            }
        });
    });
}
/** Форматирование Внутренности тега */
function formatBody(text, tab, indent, lang) {
    if (indent === void 0) { indent = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var res, newText, cs, del, ind;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    res = new FormatResult();
                    newText = text;
                    del = encoding_1.getReplaceDelimiter(text);
                    if (lang != classes_1.Language.CSharp && lang != classes_1.Language.XML) {
                        cs = encoding_1.encodeCS(newText, del);
                        newText = cs.Result;
                    }
                    ind = tab.repeat(indent);
                    newText = newText.replace(/(\n|^)[\t ]+$/g, '$1');
                    return [4 /*yield*/, LanguageFunction(lang)(newText, tab, indent)];
                case 1:
                    res = _a.sent();
                    if (!!cs && !res.Error)
                        res.Result = encoding_1.getElementsBack(res.Result, { Delimiter: cs.Delimiter, EncodedCollection: cs.EncodedCollection });
                    // для случаев <Text>текст\n.*
                    if (res.Result.match(/^\n*\S/)) {
                        res.Result = res.Result.replace(/^(\n*)(\S)/, "$1" + ind + "$2");
                    }
                    return [2 /*return*/, res];
            }
        });
    });
}
function formatPlainText(text, tab, indent, preserveEdges) {
    if (tab === void 0) { tab = "\t"; }
    if (indent === void 0) { indent = 0; }
    if (preserveEdges === void 0) { preserveEdges = false; }
    return __awaiter(this, void 0, void 0, function () {
        var res, err, strings, i, m, tabs, spaces, count, newInd_1, min, newInd, d;
        return __generator(this, function (_a) {
            res = text;
            try {
                strings = text.split('\n');
                for (i = 0; i < strings.length; i++) {
                    m = strings[i].match(/^[\t ]+/);
                    if (!m)
                        continue;
                    tabs = m[0].match(/\t+/);
                    spaces = m[0].match(/ +/);
                    count = (!!tabs ? tabs[0].length : 0) + (!!spaces ? Math.ceil(spaces[0].length / 4) : 0);
                    newInd_1 = tab.repeat(count);
                    strings[i] = strings[i].replace(/^[\t ]+/, newInd_1);
                }
                res = strings.join('\n');
                //let ind = tab.repeat(indent);
                // убираем дублирование
                if (tab != " ")
                    res = res.replace("  ", " ");
                res = res.replace(/([\t ]*\r?\n){4,}/g, "\n\n\n"); // две пустые строки, всё-таки, иногда отделяет что-то посмыслу, а вот 3 уже перебор
                min = minIndent(text);
                newInd = "";
                // отступаем
                if (min > -1) {
                    d = indent - min;
                    // custom trim
                    if (!preserveEdges) {
                        res = res.replace(/\s+$/, '');
                        if (d <= 0)
                            res = res.replace(/^\s*\n+/, '');
                        //else res = res.replace(/^\s+/, '');
                    }
                    // сдвигаем на разницу
                    if (d > 0) // если отступ меньше нужного
                     {
                        newInd = tab.repeat(d);
                        // двигаем только непустые строки
                        res = res.replace(/(\n|^)([\t ]*)(\S)/g, "$1" + newInd + "$2$3");
                    }
                    else if (d < 0) // если больше нужного - убираем лишние
                     {
                        newInd = tab.repeat(indent);
                        d = 0 - d;
                        res = res.replace(new RegExp("(\\n|^)([\\t ]{" + d + "})(\\s*\\S)", "g"), "$1$3");
                    }
                }
                // для случаев <Text>текст\n.*
                if (text.match(/^\S/)) {
                    res = tab.repeat(indent) + res.replace(/^(\n?)[\t ]/, "$1");
                }
            }
            catch (error) {
                err = "Ошибка при форматировании области PlainText";
            }
            // обрезаем хвосты
            res = res.replace(/(\n|^)(.*\S)[\t ]+(\r?\n)/, "$1$2$3");
            return [2 /*return*/, { Result: res, Error: err }];
        });
    });
}
function formatCSS(text, tab, indent) {
    if (tab === void 0) { tab = "\t"; }
    if (indent === void 0) { indent = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var newText, er, ind;
        return __generator(this, function (_a) {
            newText = clearIndents(text);
            er = null;
            try {
                newText = cssbeautify(newText, {
                    indent: "\t",
                    openbrace: (_settings.Item("formatSettings").braceStyle.indexOf("expand") > -1 ? "separate-line" : "end-of-line")
                });
            }
            catch (err) {
                er = "Ошибка форматирования CSS";
            }
            ind = tab.repeat(indent);
            newText = ind + newText.replace(/\n/g, "\n" + ind);
            return [2 /*return*/, { Result: newText, Error: er }];
        });
    });
}
function formatJS(text, tab, indent) {
    if (tab === void 0) { tab = "\t"; }
    if (indent === void 0) { indent = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var newText, er, ind;
        return __generator(this, function (_a) {
            newText = clearIndents(text);
            er = null;
            try {
                newText = beautify.js(newText, {
                    indent_size: 1,
                    indent_char: tab,
                    indent_with_tabs: tab == "\t",
                    indent_level: indent,
                    brace_style: _settings.Item("formatSettings").braceStyle
                });
            }
            catch (err) {
                er = "Ошибка форматирования JavaScript";
            }
            ind = tab.repeat(indent);
            newText = ind + newText.replace(/\n/g, "\n" + ind);
            return [2 /*return*/, { Result: newText, Error: er }];
        });
    });
}
function formatCSharp(text, tab, indent) {
    if (tab === void 0) { tab = "\t"; }
    if (indent === void 0) { indent = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var res, er, reg, hasCDATA, multiline, encoder, space, ind, tmpRes, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    res = text;
                    er = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (!!!extension_1.CSFormatter) return [3 /*break*/, 3];
                    reg = res.match(/^\s*<!\[CDATA\[([\s\S]*)\]\]>\s*$/);
                    hasCDATA = !!reg;
                    if (hasCDATA)
                        res = reg[1];
                    multiline = res.indexOf("\n") > -1;
                    encoder = new encoding_1.Encoder(res);
                    encoder.Encode(function (txt, delimiter) { return encoding_1.encodeElements(txt, /\$repeat\([\w@]+\)({.*\[.*\]\s*})?/, delimiter); });
                    encoder.Encode(function (txt, delimiter) { return encoding_1.encodeElements(txt, constants_1.RegExpPatterns.XMLIterators.Var, delimiter); });
                    encoder.Encode(function (txt, delimiter) { return encoding_1.encodeElements(txt, constants_1.RegExpPatterns.XMLIterators.Singele, delimiter); });
                    encoder.Encode(function (txt, delimiter) { return encoding_1.encodeElements(txt, /@(?!")(\w+)/, delimiter); }); // для констант
                    res = encoder.Result;
                    // форматируем
                    res = clearIndents(res);
                    return [4 /*yield*/, extension_1.CSFormatter(res)];
                case 2:
                    res = _a.sent();
                    space = multiline ? "\n" : " ";
                    if (hasCDATA)
                        res = res.replace(/^([\s\S]*)$/, "<![CDATA[" + space + "$1" + space + "]]>");
                    ind = tab.repeat(indent);
                    res = res.replace(/\n([\t ]*\S)/g, "\n" + ind + "$1");
                    // возвращаем собак и $repeat
                    res = encoding_1.getElementsBack(res, encoder.ToEncodeResult());
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, formatPlainText(res, tab, indent)];
                case 4:
                    tmpRes = _a.sent();
                    if (!!tmpRes.Error)
                        throw "Errors found";
                    res = tmpRes.Result;
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    er = "Ошибка при форматировании C#";
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, { Result: res, Error: er }];
            }
        });
    });
}
/** форматирование XML между тегами */
function formatBetweenTags(text, tab, indent) {
    if (tab === void 0) { tab = "\t"; }
    if (indent === void 0) { indent = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var res, newText, spaces, i, space, repl, spRes, repl, spRes, repl, spRes, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    res = new FormatResult();
                    newText = text;
                    spaces = parsing_1.get1LevelNodes(text);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    if (!(spaces.length > 0)) return [3 /*break*/, 9];
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < spaces.length)) return [3 /*break*/, 9];
                    space = spaces[i];
                    if (!(i == 0)) return [3 /*break*/, 4];
                    repl = text.slice(0, space.OpenTag.From);
                    if (repl.match(/^\s*$/))
                        return [3 /*break*/, 8];
                    return [4 /*yield*/, formatPlainText(repl, tab, indent, true)];
                case 3:
                    spRes = _a.sent();
                    if (!!spRes.Error) {
                        res.Error = spRes.Error;
                        return [3 /*break*/, 8];
                    }
                    newText = newText.replace(repl, spRes.Result);
                    _a.label = 4;
                case 4:
                    if (!(i == spaces.length - 1)) return [3 /*break*/, 6];
                    repl = text.slice(space.CloseTag.To, text.length);
                    if (repl.match(/^\s*$/))
                        return [3 /*break*/, 8];
                    return [4 /*yield*/, formatPlainText(repl, tab, indent, true)];
                case 5:
                    spRes = _a.sent();
                    if (!!spRes.Error) {
                        res.Error = spRes.Error;
                        return [3 /*break*/, 8];
                    }
                    newText = newText.replace(repl, spRes.Result);
                    _a.label = 6;
                case 6:
                    if (!(i < spaces.length - 1)) return [3 /*break*/, 8];
                    repl = text.slice(space.CloseTag.To, spaces[i + 1].OpenTag.From);
                    if (repl.match(/^\s*$/))
                        return [3 /*break*/, 8];
                    return [4 /*yield*/, formatPlainText(repl, tab, indent, true)];
                case 7:
                    spRes = _a.sent();
                    if (!!spRes.Error) {
                        res.Error = spRes.Error;
                        return [3 /*break*/, 8];
                    }
                    spRes.Result = spRes.Result.replace(/^[\t ]+/, " ");
                    newText = newText.replace(repl, spRes.Result);
                    _a.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 2];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_2 = _a.sent();
                    res.Error = "Ошибка форматирования области между тегами";
                    return [3 /*break*/, 11];
                case 11:
                    res.Result = newText;
                    return [2 /*return*/, res];
            }
        });
    });
}
/** определяет минимальный отступ без учёта CDATA и FoldingBlock */
function minIndent(text) {
    var min = -1;
    var pure = text.replace(/((<!\[CDATA\[)|(\]\]>))/g, ""); // убираем CDATA
    pure = pure.replace(/<!--#(end)?block.*-->/g, ""); // убираем FoldingBlock
    var mt = pure.match(/(\n|^)[\t ]*\S/g);
    if (!!mt) {
        for (var i = 0; i < mt.length; i++) {
            var reg = mt[i].match(/(\n)([\t ]*)\S/);
            if (reg && reg[2] !== null && (reg[2].length < min || min == -1))
                min = reg[2].length;
        }
    }
    return min;
}
/** Форматирует CDATA внутри всего текста */
function formatCDATA(text) {
    // располагает CDATA впритык к тегу
    var res = text.replace(/>\s*<!\[CDATA\[[\t ]*/g, "><![CDATA[");
    res = res.replace(/\s*\]\]>[\t ]*?(\n[\t ]*)</g, "$1]]><");
    // пробелы для однострочной
    res = res.replace(/<!\[CDATA\[[\t ]*(\S)/g, "<![CDATA[ $1");
    res = res.replace(/(\S)[\t ]*\]\]>/g, "$1 ]]>");
    return res;
}
/** очищает </?тег/?> от лишнего */
function formatTag(tag) {
    var res = tag;
    try {
        var closing = !!res.match(/^\s*<\//);
        if (closing) // закрывающий
         {
            res = res.replace(/^(\s*<\/)(\w+)(\s.*)(>\s*)$/, "$1$2$4"); // всё, кроме имени
        }
        else {
            // форматируем все атрибуты
            var result = res.match(/^(\s*<\w+)(\s.*?)?(\/?>\s*)$/);
            if (!!result && !!result[2]) {
                var results = result[2].match(/^\s*\w+\s*=\s*(("[^"]*")|('[^']*'))\s*$/g);
                var attrs_1 = result[2];
                if (!!results) {
                    attrs_1 = "";
                    results.forEach(function (r) {
                        attrs_1 += r.replace(/\s*(\w+)\s*=\s*(("[^"]*")|('[^']*'))\s*/, " $1=$2");
                    });
                }
                res = result[1] + attrs_1 + result[3];
            }
        }
    }
    catch (error) {
        extension_1.logError("Ошибка при форматировании атрибутов тега", error);
    }
    return res;
}
/** Убирает отступы от начала */
function formatFoldingBlocks(text) {
    return text.replace(/(^|\n)[\t ]+(<!--#(end)?block)/g, "$1$2");
}
/** предобработка XML */
function preFormatXML(text) {
    var res = text;
    // убираем пустые CDATA
    res = res.replace(/<!\[CDATA\[\s*\]\]>/, "");
    // переносим остатки CDATA на новую строку
    var regCS = new RegExp("(<!\\[CDATA\\[)(.*\\r?\\n[\\s\\S]*)(\\]\\]>)");
    var resCS = res.matchAll(regCS);
    resCS.forEach(function (element) {
        if (!element[2].match(/\]\]>/)) {
            if (element[2].match(/^.*\S.*\r?\n/)) // переносим начало
                res = res.replace(new RegExp(classes_1.safeString(element[1] + element[2]), "g"), element[1] + "\n" + element[2]);
            if (element[2].match(/\S[ \t]*$/)) // переносим конец
                res = res.replace(new RegExp(classes_1.safeString(element[2] + element[3]), "g"), element[2] + "\n" + element[3]);
        }
    });
    // переносим открытый тег на новую строку
    res = res.replace(/(^|\n)([\t ]*)((((?!<!)\S)(.*?\S)?)[\t ]*)(<\w+(\s+\w+=(("[^"]*")|('[^']')))*\s*\/?>)[\t ]*\r?\n/g, "$1$2$4\n$2$7\n");
    return res;
}
/** постобработка XML */
function postFormatXML(res) {
    var tmp = res.Result;
    // форматируем сворачиваемые блоки
    tmp = formatFoldingBlocks(tmp);
    // форматируем CDATA
    tmp = formatCDATA(tmp);
    res.Result = tmp;
    return res;
}
/** очищает все отступы */
function clearIndents(text) {
    return text.replace(/(^|\n)[\t ]+/g, "$1");
}
exports.clearIndents = clearIndents;
