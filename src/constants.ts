'use strict'

import { KeyedCollection } from './classes'




/** Тип сборки */
export const _pack: ("debug" | "release") = "debug";

/** XML теги, которые сохраняются в CurrentNodes */
export const _NodeStoreNames = ["Page", "Question", "Quota", "List"];

/** Snippets для разных типов Item */
export const ItemSnippets = {
    List: "<Item Id=\"$1\"><Text>$2</Text></Item>",
    Quota: "<Item Page=\"$1\" Question=\"$2\" Answer=\"$3\"/>",
    Validate: "<Item Page=\"$1\" Question=\"$2\" Answer=\"$3\"/>",
    Redirect: "<Item Page=\"$1\" Question=\"$2\" Answer=\"$3\"/>",
    Filter: "<Item Page=\"$1\" Question=\"$2\" Answer=\"$3\"/>",
    Constants: "<Item Id=\"$1\"><Value>$2</Value></Item>",
    Split: "<Item Id=\"$1\" Text=\"http://storage.internetopros.ru/Content/t/tib_${TM_FILENAME/^(\\d+)(.*)$/$1/}/$2.jpg,${3:Описание}\"/>",
    Stat: "<Item Id=\"$1\" Name=\"${2:Total}\" Source=\"1_X,2_X,3_X\"/>"
}

/** Работают правильно, но медленно */
export const RegExpPatterns = {
    CDATA: /<!\[CDATA\[([\S\s]*?)\]\]>/,
    CDATALast: /<!\[CDATA\[[\S\s]*$/,
    XMLComment: /(<!--([\S\s]*?)-->\s*)+/,
    XMLLastComment: /<!--[\S\s]*$/,
    /** RegExp для XML тегов, которые могут содержать C# */
    AllowCodeTags: "(Filter)|(Redirect)|(Validate)|(Methods)",
    /** RegExp для HTML тегов, которые не нужно закрывать */
    SelfClosedTags: "(area)|(base)|(br)|(col)|(embed)|(hr)|(img)|(input)|(keygen)|(link)|(menuitem)|(meta)|(param)|(source)|(track)|(wbr)",
    InlineSpecial: "(repeat)|(place)",
    /** Набор символов разделителя замены */
    DelimiterContent: "[0-9][a-z][A-Z]",
    SingleAttribute: /\s*(\w+)=(("[^"]*")|(('[^']*')))\s*/,
    Attributes: /\s*(\w+)=(("[^"]*")|(('[^']*')))\s*/g,
    OpenTagFull: /^\s*<\w+(\s*(\w+)=(("[^"]*")|('[^']*'))\s*)*\s*\/?>/,
    FormattingHash: /(\s)|(<!\[CDATA\[)|(\]\]>)/g,
    CSComments: /\/\*([\s\S]+?)\*\//g
}