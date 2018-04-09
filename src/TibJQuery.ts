'use strict'

import { JSDOM } from 'jsdom'
import * as _JQuery from 'jquery'
import { XMLencodeResult, logString } from './classes'
import * as XML from './documentFunctions'


export class DOMSurveyData
{
    Delimiter: string = null;
    CSCollection: XMLencodeResult = null;
    CDATACollection: XMLencodeResult = null;
}



/** возвращает JQuery, модернизированный под XML */
export function initJQuery(): any
{
    let $dom; // JQuery для работы требуется объект window
    const dom = new JSDOM("<Root></Root>"); // нормальный объект DOM
    let JQuery: any = _JQuery(dom.window);

    // инициализируем пустой
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

    JQuery.XMLDOM = function (el: string, isInitial = true)
    {
        let res = XML.safeXML(el);
        if (isInitial)
        {
            JQuery.SurveyData.CDATACollection = res.CDATACollection;
            JQuery.SurveyData.CSCollection = res.CSCollection;
        }
        return JQuery(JQuery.parseXML('<Root>' + res.Result + '</Root>')).find('Root');
    }

    JQuery.XML = function (el: string)
    {
        return JQuery.XMLDOM(el, false).children();
    }

    JQuery.fn.xml = function (formatFunction?: (text: string) => Promise<string>): string
    {
        let el = JQuery(this[0]);
        let res = el.html();
        res = XML.originalXML({
            Result: res,
            CSCollection: JQuery.SurveyData.CSCollection,
            CDATACollection: JQuery.SurveyData.CDATACollection
        });
        return res;
    }

    // тескт CDATA
    /* JQuery.fn.CDATAtext = function (...params)
    {
        let el = JQuery(this[0]);
        let id = el.attr(JQuery.SurveyData.CDATACollection.Delimiter);
        if (!params || params.length == 0) // получение
        {
            let text = JQuery.SurveyData.CDATACollection.EncodedCollection.Item(id);
            if (!!text) text = text.replace(/<!\[CDATA\[([\s\S]*)\]\]>/, "$1");
            return text;
        }
        else // замена
        {
            let space = params[0].indexOf('\n') > 0 ? "\n" : " ";
            let pure = "<![CDATA[" + space + params[0] + space + "]]>";
            JQuery.SurveyData.CDATACollection.EncodedCollection.AddPair(id, pure);
            return this;
        }
    } */

    // переписываем функцию получения текста
    JQuery.fn.textOriginal = JQuery.fn.text;
    let newText = function (...params)
    {
        let el = JQuery(this[0]);
       /*  if (this[0].tagName == "CDATA") // для CDATA своя функция
        {
            return el.CDATAtext.apply(this, params);
        } */
        let res;
        if (!params || params.length == 0) // если запрос, то возвращаем originalXML
        {
            res = XML.originalXML({
                Result: el.textOriginal(),
                CSCollection: JQuery.SurveyData.CSCollection,
                CDATACollection: JQuery.SurveyData.CDATACollection
            });
        }
        else // если задаём текст, то как обычно
        {
            res = el.textOriginal.apply(this, params);
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
