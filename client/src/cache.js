'use  strict';
"use strict";
exports.__esModule = true;
var vscode = require("vscode");
var classes_1 = require("./classes");
var Parse = require("../../modules/TibClasses/lib/parsing");
var extension_1 = require("./extension");
var CacheItem = /** @class */ (function () {
    function CacheItem() {
    }
    CacheItem.prototype.Set = function (item) {
        this.Value = item;
    };
    CacheItem.prototype.Get = function () {
        return this.Value;
    };
    /** Очистка */
    CacheItem.prototype.Remove = function () {
        this.Value = undefined;
    };
    /** Проверка на undefined */
    CacheItem.prototype.IsSet = function () {
        return typeof this.Value !== 'undefined';
    };
    return CacheItem;
}());
var CacheSet = /** @class */ (function () {
    function CacheSet() {
        /** От начала документа до position */
        this.PreviousTextSafe = new CacheItem();
        this.PreviousText = new CacheItem();
        this.Tag = new CacheItem();
        this.Methods = new CacheItem();
        this.CurrentNodes = new CacheItem();
        // поля для быстрой обработки
        this.Keys = ["PreviousTextSafe", "PreviousText", "Tag", "Methods", "CurrentNodes"];
    }
    /** Полное обновление */
    CacheSet.prototype.updateAll = function (document, position, text) {
        this.Clear();
        this.PreviousText.Set(text);
        this.PreviousTextSafe.Set(classes_1.CurrentTag.PrepareXML(text));
        this.Tag.Set(extension_1.getCurrentTag(document, position, text, true));
    };
    /** Обновление последнего куска */
    CacheSet.prototype.updatePart = function (document, position, prevText, validParents, ind, restText) {
        try {
            var cachedSafe = this.PreviousTextSafe.Get();
            var cachedTag = this.Tag.Get();
            // обновляем последнюю часть SafeText (один из основных смыслов кэширования) и сам Text
            var pre = cachedSafe.slice(0, ind);
            var prep = classes_1.CurrentTag.PrepareXML(restText);
            cachedSafe = pre + prep;
            this.PreviousTextSafe.Set(cachedSafe);
            this.PreviousText.Set(prevText);
            // обновляем Tag
            if (Parse.tagNeedToBeParsed(cachedTag.Name)) // если внутри могут быть теги
             {
                var ranges = Parse.getParentRanges(document, cachedSafe, ind);
                if (ranges.length > 0)
                    ranges.forEach(function (range) { return validParents.push(new classes_1.SimpleTag(document, range)); });
                if (validParents.length > 0) {
                    var lastParent = validParents.pop();
                    var lastParentRange = new vscode.Range(lastParent.OpenTagRange.start, position);
                    var current = new classes_1.SimpleTag(document, lastParentRange);
                    var openTagIsclosed = current.isClosed();
                    var body = openTagIsclosed ? document.getText(new vscode.Range(current.OpenTagRange.end, position)) : undefined;
                    cachedTag.Update(current, {
                        PreviousText: prevText,
                        Parents: validParents,
                        Body: body,
                        OpenTagIsClosed: openTagIsclosed,
                        OpenTagRange: lastParentRange,
                        StartIndex: document.offsetAt(lastParentRange.start)
                    });
                    return true;
                }
            }
            else // обновляем только текст
             {
                cachedTag.Update(null, {
                    PreviousText: prevText,
                    Body: document.getText(new vscode.Range(cachedTag.OpenTagRange.end, position))
                });
            }
        }
        catch (error) {
            extension_1.logError("Ошибка обновления части закешированного документа", error);
        }
        return false;
    };
    /** Обновление всего кеша (если требуется) */
    CacheSet.prototype.Update = function (document, position, txt) {
        try {
            if (!this.Active())
                return;
            var text = txt || extension_1.getPreviousText(document, position);
            var cachedText = this.PreviousText.Get();
            // ничего не поменялось
            if (!!cachedText && cachedText == text)
                return;
            var cachedTag = this.Tag.Get();
            var cachedSafe = this.PreviousTextSafe.Get();
            if (!cachedText || !cachedSafe || !cachedTag || cachedText.length != cachedSafe.length)
                return this.updateAll(document, position, text); // обновляем всё
            // частичное обновление
            var foundValidRange = false;
            // сначала пробуем сравнить весь текст до начала тега
            var upTo = cachedTag.OpenTagRange.start; // начало закешированного тега
            if (upTo.compareTo(position) <= 0) {
                var newText = extension_1.getPreviousText(document, upTo);
                var ind = document.offsetAt(upTo); // а document типа не изменился
                var oldText = cachedText.slice(0, ind);
                var restText = document.getText(new vscode.Range(upTo, position)); // остаток текста после начала тега
                if (oldText == newText && !restText.match("</" + cachedTag.Name)) {
                    foundValidRange = this.updatePart(document, position, text, cachedTag.Parents, ind, restText);
                    // если получилось, то ничего обновлять не надо
                    if (foundValidRange)
                        return;
                }
            }
            // если не получилось, то идём породительно снизу вверх
            var validParents = [];
            foundValidRange = false;
            for (var i = cachedTag.Parents.length - 1; i >= 0; i--) {
                var upTo_1 = cachedTag.Parents[i].OpenTagRange.end;
                var newText = extension_1.getPreviousText(document, upTo_1);
                var ind = document.offsetAt(upTo_1); // а document типа не изменился
                var oldText = cachedText.slice(0, ind);
                var restText = document.getText(new vscode.Range(upTo_1, position)); // остаток текста после последнего родителя
                // ищем такого, что он выше, текст перед ним сохранился и после него не появилось закрывающего его тега
                if (upTo_1.compareTo(position) <= 0 && oldText == newText && !restText.match("</" + cachedTag.Parents[i].Name)) {
                    // обновляем только последний кусок
                    validParents = cachedTag.Parents.slice(0, i + 1);
                    foundValidRange = this.updatePart(document, position, text, validParents, ind, restText);
                    break;
                }
            }
            if (!foundValidRange)
                this.updateAll(document, position, text);
        }
        catch (error) {
            extension_1.logError("Ошибка обновления закешированного документа", error);
        }
    };
    /** Можно ли пользоваться кэшем */
    CacheSet.prototype.Active = function () {
        return !extension_1.Settings.Contains("enableCache") || !!extension_1.Settings.Item("enableCache");
    };
    /** Очистка всех полей */
    CacheSet.prototype.Clear = function () {
        var _this = this;
        try {
            this.Keys.forEach(function (field) {
                _this[field].Remove();
            });
        }
        catch (error) {
            extension_1.logError("Ошибка очистки кеша", error);
        }
    };
    return CacheSet;
}());
exports.CacheSet = CacheSet;
