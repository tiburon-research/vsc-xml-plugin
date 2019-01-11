'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var vscode = require("vscode");
var classes_1 = require("./classes");
var SurveyElementType;
(function (SurveyElementType) {
    SurveyElementType[SurveyElementType["Item"] = 0] = "Item";
    SurveyElementType[SurveyElementType["ListItem"] = 1] = "ListItem";
    SurveyElementType[SurveyElementType["Answer"] = 2] = "Answer";
    SurveyElementType[SurveyElementType["List"] = 3] = "List";
    SurveyElementType[SurveyElementType["Question"] = 4] = "Question";
    SurveyElementType[SurveyElementType["Page"] = 5] = "Page";
})(SurveyElementType = exports.SurveyElementType || (exports.SurveyElementType = {}));
;
/** Универсальный класс для элементов XML */
var SurveyElement = /** @class */ (function () {
    function SurveyElement(name, id, type) {
        /** Список атрибутов */
        this.Attributes = new classes_1.KeyedCollection();
        /** Дети поимённо */
        this.Children = new classes_1.OrderedCollection();
        /** Оставить однострочные дочерние теги на той же строке */
        this.CollapseTags = false;
        this.TagName = name;
        if (!!id)
            this.SetAttr("Id", id);
        if (!!type)
            this.ElementType = type;
    }
    /** Копирует элемент */
    SurveyElement.prototype.Clone = function () {
        var res = new SurveyElement(this.TagName);
        res = Object.assign(res, this);
        res.Children.Clear();
        this.Children.ForEach(function (value) {
            value.Value.forEach(function (element) {
                res.AddChild(element.Clone());
            });
        });
        return res;
    };
    /** Получение полного XML */
    SurveyElement.prototype.ToXML = function () {
        var res = "<" + this.TagName;
        res += this.GetAttributes() + ">";
        // получаем всё внутри рекурсивно
        if (this.Children.Count > 0) {
            res += this.XMLbodyFormatter();
        }
        else if (!!this.Text) {
            if (this.Text.indexOf('\n') > -1)
                res += "\n" + this.Text + "\n";
            else
                res += this.Text;
        }
        res += "</" + this.TagName + ">";
        return res;
    };
    SurveyElement.prototype.ToSnippet = function () {
        var res = new vscode.SnippetString();
        res.value = this.ToXML();
        return res;
    };
    /** возвращает XML строку атрибутов */
    SurveyElement.prototype.GetAttributes = function () {
        var res = "";
        this.Attributes.OrderBy(function (x) { return x.Key == "Id" ? 0 : 1; }).forEach(function (pair) {
            res += " " + pair.Value.Text;
        });
        return res;
    };
    /** проверяет существование атрибута */
    SurveyElement.prototype.AttrExists = function (name) {
        return this.Attributes.Contains(name);
    };
    /** возвращает значение атрибута */
    SurveyElement.prototype.AttrValue = function (name) {
        if (!this.AttrExists(name))
            return null;
        return this.Attributes.Item(name).Value;
    };
    /** задаёт значение атрибута (или создаёт новый) */
    SurveyElement.prototype.SetAttr = function (name, value) {
        this.Attributes.AddPair(name, new classes_1.InlineAttribute(name, value));
    };
    /** обновляет значение атрибута */
    SurveyElement.prototype.UpdateAttr = function (name, transform) {
        this.Attributes.UpdateValue(name, function (x) { return new classes_1.InlineAttribute(name, transform(x.Value)); });
    };
    /** функция преобразования дочерних элементов в XML */
    SurveyElement.prototype.XMLbodyFormatter = function () {
        if (this.CollapseTags)
            return this.XMLbodyFormatterCollapse();
        else
            return this.XMLbodyFormatterExpand();
    };
    /** Каждый тег на новой строке */
    SurveyElement.prototype.XMLbodyFormatterExpand = function () {
        var body = "";
        this.Children.ForEach(function (element) {
            element.Value.forEach(function (cildNode) {
                body += "\n" + cildNode.ToXML();
            });
        });
        // отступаем
        body = body.replace(/\n/g, "\n\t");
        body += "\n";
        return body;
    };
    /** Оставляем однострочные теги на той же строке */
    SurveyElement.prototype.XMLbodyFormatterCollapse = function () {
        var body = "";
        var childXml = []; // массив XML детей
        var separated = false;
        this.Children.ForEach(function (element) {
            element.Value.forEach(function (cildNode) {
                var child = cildNode.ToXML();
                if (child.indexOf('\n') > -1)
                    separated = true;
                childXml.push(child);
            });
        });
        childXml.forEach(function (element) {
            if (separated)
                body += '\n' + element;
            else
                body += element;
        });
        if (separated) {
            body = body.replace(/\n/g, "\n\t");
            body += "\n";
        }
        return body;
    };
    /** добавляет дочерний элемент */
    SurveyElement.prototype.AddChild = function (child) {
        var name = typeof child == "string" ? child : child.TagName;
        var value = typeof child == "string" ? new SurveyElement(child) : child;
        if (!this.Children.Contains(name))
            this.Children.Add(name, [value]);
        else
            this.Children.UpdateValue(name, function (val) { return val.concat([value]); });
    };
    SurveyElement.prototype.ToListItem = function () {
        return new SurveyListItem(this.AttrValue("Id"), this.Text);
    };
    SurveyElement.prototype.ToAnswer = function () {
        return new SurveyAnswer(this.AttrValue("Id"), this.Text);
    };
    return SurveyElement;
}());
exports.SurveyElement = SurveyElement;
/** <Item> */
var SurveyItem = /** @class */ (function (_super) {
    __extends(SurveyItem, _super);
    function SurveyItem(id, text) {
        var _this = _super.call(this, "Item", id) || this;
        var textItem = new SurveyElement("Text");
        textItem.Text = text;
        _this.AddChild(textItem);
        _this.ElementType = SurveyElementType.Item;
        return _this;
    }
    return SurveyItem;
}(SurveyElement));
exports.SurveyItem = SurveyItem;
/** список Var для SurveyListItem */
var SurveyListItemVars = /** @class */ (function () {
    function SurveyListItemVars(varArray) {
        var _this = this;
        this.Items = new Array();
        varArray.forEach(function (element) {
            _this.Items.push(element);
        });
    }
    /** Добавляет Var */
    SurveyListItemVars.prototype.Add = function (text) {
        this.Items.push(text);
    };
    /** Возвращает указанный var */
    SurveyListItemVars.prototype.Get = function (index) {
        if (this.Items.length > index)
            return this.Items[index];
        else
            return undefined;
    };
    /** Возвращает количество Var */
    SurveyListItemVars.prototype.Count = function () {
        return this.Items.length;
    };
    return SurveyListItemVars;
}());
/** Элементы <Item> для <List> */
var SurveyListItem = /** @class */ (function (_super) {
    __extends(SurveyListItem, _super);
    function SurveyListItem(id, text) {
        var _this = _super.call(this, id, text) || this;
        _this.CollapseTags = true;
        _this.ElementType = SurveyElementType.ListItem;
        return _this;
    }
    /** преобразует к стандартному классу */
    SurveyListItem.prototype.ToSurveyItem = function (separateVars) {
        var res = new SurveyElement("Item");
        // копируем все свойства
        res = Object.assign(res, this);
        // добавляем Var
        if (!!this.Vars && this.Vars.Count() > 0) {
            if (separateVars) {
                this.Vars.Items.forEach(function (x) {
                    var Var = new SurveyElement("Var");
                    Var.Text = x;
                    res.AddChild(Var);
                });
            }
            else {
                res.SetAttr("Var", this.Vars.Items.join(","));
            }
        }
        return res;
    };
    return SurveyListItem;
}(SurveyItem));
exports.SurveyListItem = SurveyListItem;
/** класс для <List> */
var SurveyList = /** @class */ (function (_super) {
    __extends(SurveyList, _super);
    function SurveyList(id) {
        var _this = _super.call(this, "List", id) || this;
        /** Каждый Var - отдельный тег */
        _this.VarsAsTags = true;
        /** Элементы Item */
        _this.Items = new classes_1.OrderedCollection();
        _this.ElementType = SurveyElementType.List;
        return _this;
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
    SurveyList.prototype.AddItem = function (item) {
        var id;
        // генерируем Id автоматически
        if (!item.Id) {
            var itemIds = this.Items.Keys().map(function (x) { return Number(x); }).filter(function (x) { return !!x; }).sort(function (x) { return x; });
            if (itemIds.length == 0)
                id = "1";
            else
                id = '' + (itemIds[itemIds.length - 1] + 1);
        }
        else
            id = item.Id;
        var res = new SurveyListItem(id, item.Text);
        if (!!item.Vars && item.Vars.length > 0)
            res.Vars = new SurveyListItemVars(item.Vars);
        if (!!item.Text)
            res.Text = item.Text;
        // предупреждаем о перезаписи
        if (this.Items.Contains(id))
            console.warn("Элемент '" + id + "' уже существует в листе '" + this.AttrValue("Id") + "', он будет заменён.");
        this.Items.Add(id, res);
        return id;
    };
    SurveyList.prototype.ToXML = function () {
        var _this = this;
        // Items не числятся в Children
        this.Items.ForEach(function (item) {
            _this.AddChild(item.Value.ToSurveyItem(_this.VarsAsTags));
        });
        return _super.prototype.ToXML.call(this);
    };
    return SurveyList;
}(SurveyElement));
exports.SurveyList = SurveyList;
var SurveyAnswer = /** @class */ (function (_super) {
    __extends(SurveyAnswer, _super);
    function SurveyAnswer(id, text) {
        var _this = _super.call(this, "Answer", id) || this;
        var textItem = new SurveyElement("Text");
        textItem.Text = text;
        _this.AddChild(textItem);
        _this.ElementType = SurveyElementType.Answer;
        _this.CollapseTags = true;
        return _this;
    }
    /** преобразует к стандартному классу */
    SurveyAnswer.prototype.ToSurveyItem = function () {
        var res = new SurveyElement("Answer");
        // копируем все свойства
        res = Object.assign(res, this);
        return res;
    };
    return SurveyAnswer;
}(SurveyElement));
exports.SurveyAnswer = SurveyAnswer;
var SurveyQuestion = /** @class */ (function (_super) {
    __extends(SurveyQuestion, _super);
    function SurveyQuestion(id, questionType) {
        var _this = _super.call(this, "Question", id) || this;
        /** Элементы Item */
        _this.Answers = new classes_1.OrderedCollection();
        if (!!questionType)
            _this.SetAttr("Type", questionType);
        _this.ElementType = SurveyElementType.Question;
        return _this;
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
    SurveyQuestion.prototype.AddAnswer = function (answer) {
        var id = answer.AttrValue("Id");
        // генерируем Id автоматически
        if (!!id) {
            var answerIds = this.Answers.Keys().map(function (x) { return Number(x); }).filter(function (x) { return !!x; }).sort(function (x) { return x; });
            if (answerIds.length == 0)
                id = "1";
            else
                id = '' + (answerIds[answerIds.length - 1] + 1);
        }
        var res = new SurveyAnswer(id, answer.Text);
        if (!!answer.Text)
            res.Text = answer.Text;
        // предупреждаем о перезаписи
        if (this.Answers.Contains(id))
            console.warn("Ответ '" + id + "' уже существует в вопросе '" + this.AttrValue("Id") + "', он будет заменён.");
        this.Answers.Add(id, res);
        return id;
    };
    SurveyQuestion.prototype.ToXML = function () {
        var _this = this;
        var headerTag = new SurveyElement("Header");
        headerTag.Text = this.Header;
        this.AddChild(headerTag);
        // Answers не числятся в Children
        this.Answers.ForEach(function (item) {
            _this.AddChild(item.Value.ToSurveyItem());
        });
        return _super.prototype.ToXML.call(this);
    };
    return SurveyQuestion;
}(SurveyElement));
exports.SurveyQuestion = SurveyQuestion;
var SurveyPage = /** @class */ (function (_super) {
    __extends(SurveyPage, _super);
    function SurveyPage(id) {
        var _this = _super.call(this, "Page", id) || this;
        _this.ElementType = SurveyElementType.Page;
        return _this;
    }
    return SurveyPage;
}(SurveyElement));
exports.SurveyPage = SurveyPage;
