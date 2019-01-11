'use strict';
exports.__esModule = true;
var jsdom_1 = require("jsdom");
var _JQuery = require("jquery");
var tib_classes_1 = require("tib-classes");
var Encoding = require("../../modules/TibClasses/lib/encoding");
var parsing_1 = require("../../modules/TibClasses/lib/parsing");
/** Класс из XMLencodeResult:
 *
 * { `Delimiter`, `EncodedCollection` }
*/
var DOMSurveyData = /** @class */ (function () {
    function DOMSurveyData() {
        this.Delimiter = null;
        this.EncodedCollection = new tib_classes_1.KeyedCollection();
    }
    DOMSurveyData.prototype.toXMLencodeResult = function () {
        return { Delimiter: this.Delimiter, EncodedCollection: this.EncodedCollection };
    };
    return DOMSurveyData;
}());
exports.DOMSurveyData = DOMSurveyData;
/** возвращает JQuery, модернизированный под XML */
function initJQuery() {
    var dom = new jsdom_1.JSDOM("<Root></Root>"); // нормальный объект DOM
    var JQuery = _JQuery(dom.window);
    // данные Survey
    JQuery.SurveyData = new DOMSurveyData();
    /** преобразуем селекторы в удобные */
    JQuery.safeSelector = function (selector) {
        return safeSelector(selector);
    };
    /** Создаёт корневой элемент, в который обёрнуто содержимое */
    JQuery.XMLDOM = function (el, isInitial) {
        if (isInitial === void 0) { isInitial = true; }
        var text = el;
        if (isInitial) {
            // сохраняем XMLDeclaration
            var decl = parsing_1.ReplaceXMLDeclaration(text);
            if (!!decl.Declaration) {
                text = decl.Result;
                JQuery.SurveyData.XMLDeclaration = decl.Declaration;
            }
        }
        var res = Encoding.safeXML(text, JQuery._delimiter(text));
        JQuery._saveData(res.toXMLencodeResult(), isInitial);
        var root = JQuery(JQuery.parseXML('<Root>' + res.Result + '</Root>')).find('Root');
        root.isRootElement = true;
        return root;
    };
    /** Создаёт JQuery-элемент(ы) из строки XML */
    JQuery.XML = function (el) {
        return JQuery.XMLDOM(el, false).children();
    };
    JQuery.fn.xml = function () {
        var el = JQuery(this[0]);
        var res = el.html();
        res = JQuery.decode(res);
        if (this.isRootElement && !!JQuery.SurveyData.XMLDeclaration)
            res = JQuery.SurveyData.XMLDeclaration + res;
        return res;
    };
    // переписываем функцию получения текста
    JQuery.fn.textOriginal = JQuery.fn.text;
    var newText = function (param) {
        var el = JQuery(this[0]);
        var res;
        // если запрос, то возвращаем originalXML
        if (typeof param === typeof undefined) {
            res = JQuery.decode(el.textOriginal());
        }
        // если задаём текст, то как обычно
        else {
            var pure = Encoding.safeXML(param, JQuery._delimiter(param));
            JQuery._saveData(pure.toXMLencodeResult());
            res = el.textOriginal.apply(this, [pure.Result]);
        }
        return res;
    };
    Object.assign(newText, JQuery.fn.textOriginal);
    JQuery.fn.text = newText;
    // переписываем функцию получения атрибута
    JQuery.fn.attrOriginal = JQuery.fn.attr;
    var newAttr = function (name, param) {
        var el = JQuery(this[0]);
        var res;
        // если запрос, то возвращаем originalXML
        if (typeof param === typeof undefined) {
            res = JQuery.decode(el.attrOriginal(name));
        }
        // если задаём атрибут, то как обычно
        else {
            var pure = Encoding.safeXML("" + param, JQuery._delimiter(param));
            JQuery._saveData(pure.toXMLencodeResult());
            res = el.attrOriginal.apply(this, [name, pure.Result]);
        }
        return res;
    };
    Object.assign(newAttr, JQuery.fn.attrOriginal);
    JQuery.fn.attr = newAttr;
    /** xml() вместе с родителем */
    JQuery.fn.outerHtml = function () {
        var $el = JQuery(this[0]);
        return JQuery('<parent>').append($el.clone()).html();
    };
    JQuery.fn.outerXml = function () {
        var $el = JQuery(this[0]);
        var res = $el.outerHtml();
        var data = JQuery.SurveyData;
        res = JQuery.decode(res);
        return res;
    };
    //--------- техническое
    /** Возвращает разделитель. Если его нет, то задаёт изходя из переданного XML */
    JQuery._delimiter = function (el) {
        if (!JQuery.SurveyData.Delimiter) {
            JQuery.SurveyData.Delimiter = Encoding.getReplaceDelimiter(el);
        }
        return JQuery.SurveyData.Delimiter;
    };
    /** Сохраняет данные кодирования */
    JQuery._saveData = function (data, isInitial) {
        if (isInitial === void 0) { isInitial = false; }
        if (isInitial) {
            // замена данных в объекте $
            JQuery.SurveyData.Delimiter = data.Delimiter;
            JQuery.SurveyData.EncodedCollection.Clear();
        }
        JQuery.SurveyData.EncodedCollection.AddRange(data.EncodedCollection);
    };
    /** Возвращает originalXML */
    JQuery.decode = function (text) {
        if (!text)
            return text;
        if (!JQuery.SurveyData || !JQuery.SurveyData.Delimiter) {
            tib_classes_1.showWarning("JQuery инициализирована неправильно");
            return text;
        }
        return Encoding.originalXML(text, JQuery.SurveyData.toXMLencodeResult());
    };
    return JQuery;
}
exports.initJQuery = initJQuery;
/** преобразует селектор для XML */
function safeSelector(selector) {
    var safeSel = selector;
    safeSel = safeSel.replace(/#([a-zA-Z0-9_\-@\)\(]+)/, '[Id="$1"]');
    return safeSel;
}
