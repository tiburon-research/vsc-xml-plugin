'use strict';

// форматирование, проверка и другие операции с текстом документа


export function findCloseTag(opBracket: string, tagName: string, clBracket: string, prevText: string, fullText: string,): number[]
{
    var textAfter = fullText.substr(prevText.length);
    var rest = textAfter;

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
    return [fullText.length - rest.length - 1, fullText.length - rest.length + clLast];
}


export function findOpenTag(opBracket: string, tagName: string, clBracket: string, prevText: string): number[]
{
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
    return [rest.length, txt.indexOf(clBracket, rest.length + 1)];
}


export function clearXMLComments(txt: string): string
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