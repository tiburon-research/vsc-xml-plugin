'use strict'

import { JSDOM } from 'jsdom'
import * as _JQuery from 'jquery'
import { logString, KeyedCollection, XMLencodeResult, EncodeResult } from './classes'
import * as XML from './documentFunctions'


/** Класс из XMLencodeResult:
 * 
 * { `Delimiter`, `EncodedCollection` }
*/
export class DOMSurveyData implements XMLencodeResult
{
    Delimiter: string = null;
    EncodedCollection = new KeyedCollection<string>();
}





/** возвращает JQuery, модернизированный под XML */
export function initJQuery(): any
{
    let $dom; // JQuery для работы требуется объект window
    const dom = new JSDOM("<Root></Root>"); // нормальный объект DOM
    let JQuery: any = _JQuery(dom.window);

    // данные Survey
    JQuery.SurveyData = new DOMSurveyData();

    // преобразуем селекторы при вызове методов
    for (let key in JQuery)
    {
        if (typeof JQuery[key] == "function")
        {
            // изменяем входные параметры
            let f = JQuery[key];
            JQuery[key] = function (...params)
            {
                let sParams = safeParams(params);
                return f.apply(this, sParams);
            }
            // сохраняем свойства объекта
            Object.assign(JQuery[key], f);
        }
    }

    /** Возвращает разделитель. Если его нет, то задаёт изходя из переданного XML */
    JQuery._delimiter = function(el): string
    {
        if (!JQuery.SurveyData.Delimiter)
        {
            JQuery.SurveyData.Delimiter = XML.getReplaceDelimiter(el);
        }
        return JQuery.SurveyData.Delimiter;
    }

    /** Сохраняет данные кодирования */
    JQuery._saveData = function(data: XMLencodeResult): void
    {
        if (!JQuery.SurveyData.Delimiter) JQuery.SurveyData.Delimiter = data.Delimiter;
        (JQuery.SurveyData as DOMSurveyData).EncodedCollection.AddRange(data.EncodedCollection);
    }

    /** Создаёт корневой элемент, в который обёрнуто содержимое */
    JQuery.XMLDOM = function (el: string, isInitial = true)
    {
        let res = XML.safeXML(el, JQuery._delimiter(el));
        JQuery._saveData(res.toXMLencodeResult());
        return JQuery(JQuery.parseXML('<Root>' + res.Result + '</Root>')).find('Root');
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
        let data = (JQuery.SurveyData as DOMSurveyData);
        res = XML.originalXML(res, data);
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
            res = XML.originalXML(el.textOriginal(), JQuery.SurveyData);
        }
        // если задаём текст, то как обычно
        else
        {
            let pure = XML.safeXML(param, JQuery._delimiter(param));
            JQuery._saveData(pure.toXMLencodeResult());
            res = el.textOriginal.apply(this, [pure.Result]);
        }
        return res;
    }
    Object.assign(newText, JQuery.fn.textOriginal);
    JQuery.fn.text = newText;

    return JQuery;
}





/** преобразует селектор для XML */
function safeSelector(selector: string): string
{
    let safeSel = selector;
    safeSel = safeSel.replace(/#([a-zA-Z0-9_\-@\)\(]+)/, '[Id="$1"]');
    return safeSel;
}


/** преобразует строковые параметры $ для XML */
function safeParams(params: any[]): any[]
{
    return params.map(s => (typeof s == "string") ? safeSelector(s) : s);
}