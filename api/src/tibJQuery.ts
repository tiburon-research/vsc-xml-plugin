'use strict'

import { JSDOM } from 'jsdom'
import * as _JQuery from 'jquery'
import { KeyedCollection, Encoding } from './index'
//import { ReplaceXMLDeclaration } from './parsing';


/** Класс из XMLencodeResult:
 * 
 * { `Delimiter`, `EncodedCollection` }
*/
export class DOMSurveyData implements Encoding.XMLencodeResult
{
    Delimiter: string = null;
    EncodedCollection = new KeyedCollection<string>();
    XMLDeclaration: string;

    toXMLencodeResult(): Encoding.XMLencodeResult
    {
        return { Delimiter: this.Delimiter, EncodedCollection: this.EncodedCollection };
    }
}





/** возвращает JQuery, модернизированный под XML */
export function initJQuery(): any
{
    const dom = new JSDOM("<Root></Root>"); // нормальный объект DOM
    let JQuery: any = _JQuery(dom.window);

    // данные Survey
    JQuery.SurveyData = new DOMSurveyData();

    /** преобразуем селекторы в удобные */
    JQuery.safeSelector = function (selector: string): string
    {
        return safeSelector(selector);
    }

    /** Создаёт корневой элемент, в который обёрнуто содержимое */
    JQuery.XMLDOM = function (el: string, isInitial = true)
    {
        let text = el;
        if (isInitial)
        {
            // сохраняем XMLDeclaration
            /*let decl = ReplaceXMLDeclaration(text);
            if (!!decl.Declaration)
            {
                text = decl.Result;
                (JQuery.SurveyData as DOMSurveyData).XMLDeclaration = decl.Declaration;
            }*/
        }
        let res = Encoding.safeXML(text, JQuery._delimiter(text));
        JQuery._saveData(res.toXMLencodeResult(), isInitial);
        let root = JQuery(JQuery.parseXML('<Root>' + res.Result + '</Root>')).find('Root');
        root.isRootElement = true;
        return root;
    }

    /** Создаёт JQuery-элемент(ы) из строки XML */
    JQuery.XML = function (el: string)
    {
        return JQuery.XMLDOM(el, false).children();
    }

    JQuery.fn.xml = function (): string
    {
        let el = JQuery(this[0]);
        let res = el.html();
        res = JQuery.decode(res);
        if (this.isRootElement && !!JQuery.SurveyData.XMLDeclaration) res = JQuery.SurveyData.XMLDeclaration + res;
        return res;
    }

    // переписываем функцию получения текста
    JQuery.fn.textOriginal = JQuery.fn.text;
    let newText = function (param)
    {
        let el = JQuery(this[0]);
        let res;
        // если запрос, то возвращаем originalXML
        if (typeof param === typeof undefined)
        {
            res = JQuery.decode(el.textOriginal());
        }
        // если задаём текст, то как обычно
        else
        {
            let pure = Encoding.safeXML(param, JQuery._delimiter(param));
            JQuery._saveData(pure.toXMLencodeResult());
            res = el.textOriginal.apply(this, [pure.Result]);
        }
        return res;
    }
    Object.assign(newText, JQuery.fn.textOriginal);
    JQuery.fn.text = newText;

    // переписываем функцию получения атрибута
    JQuery.fn.attrOriginal = JQuery.fn.attr;
    let newAttr = function (name: string, param?)
    {
        let el = JQuery(this[0]);
        let res;
        // если запрос, то возвращаем originalXML
        if (typeof param === typeof undefined)
        {
            res = JQuery.decode(el.attrOriginal(name));
        }
        // если задаём атрибут, то как обычно
        else
        {
            let pure = Encoding.safeXML("" + param, JQuery._delimiter(param));
            JQuery._saveData(pure.toXMLencodeResult());
            res = el.attrOriginal.apply(this, [name, pure.Result]);
        }
        return res;
    }
    Object.assign(newAttr, JQuery.fn.attrOriginal);
    JQuery.fn.attr = newAttr;


    /** xml() вместе с родителем */
    JQuery.fn.outerHtml = function ()
    {
        let $el = JQuery(this[0]);
        return JQuery('<parent>').append($el.clone()).html();
    }
    JQuery.fn.outerXml = function ()
    {
        let $el = JQuery(this[0]);
        let res = $el.outerHtml();
        let data = (JQuery.SurveyData as DOMSurveyData);
        res = JQuery.decode(res);
        return res;
    }

    
    //--------- техническое


    /** Возвращает разделитель. Если его нет, то задаёт изходя из переданного XML */
    JQuery._delimiter = function(el): string
    {
        if (!JQuery.SurveyData.Delimiter)
        {
            JQuery.SurveyData.Delimiter = Encoding.getReplaceDelimiter(el);
        }
        return JQuery.SurveyData.Delimiter;
    }

    /** Сохраняет данные кодирования */
    JQuery._saveData = function(data: Encoding.XMLencodeResult, isInitial = false): void
    {
        if (isInitial)
        {
            // замена данных в объекте $
            JQuery.SurveyData.Delimiter = data.Delimiter;
            (JQuery.SurveyData as DOMSurveyData).EncodedCollection.Clear();
        }
        (JQuery.SurveyData as DOMSurveyData).EncodedCollection.AddRange(data.EncodedCollection);
    }

    /** Возвращает originalXML */
    JQuery.decode = function(text: string)
    {
        if (!text) return text;
        if (!JQuery.SurveyData || !JQuery.SurveyData.Delimiter)
        {
            throw "JQuery инициализирована неправильно";
        }       
        return Encoding.originalXML(text, JQuery.SurveyData.toXMLencodeResult())
    }


    return JQuery;
}





/** преобразует селектор для XML */
function safeSelector(selector: string): string
{
    let safeSel = selector;
    safeSel = safeSel.replace(/#([a-zA-Z0-9_\-@\)\(]+)/, '[Id="$1"]');
    return safeSel;
}
