import { KeyedCollection, Encoding } from './index';
/** Класс из XMLencodeResult:
 *
 * { `Delimiter`, `EncodedCollection` }
*/
export declare class DOMSurveyData implements Encoding.XMLencodeResult {
    Delimiter: string;
    EncodedCollection: KeyedCollection<string>;
    XMLDeclaration: string;
    toXMLencodeResult(): Encoding.XMLencodeResult;
}
/** возвращает JQuery, модернизированный под XML */
export declare function initJQuery(): any;
