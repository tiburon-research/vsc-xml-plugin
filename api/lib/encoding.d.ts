import { KeyedCollection } from "./index";
/** { `Delimiter`, `EncodedCollection` } */
export interface XMLencodeResult {
    EncodedCollection: KeyedCollection<string>;
    Delimiter: string;
}
/** Результат кодирования */
export declare class EncodeResult {
    Result: string;
    EncodedCollection: KeyedCollection<string>;
    Delimiter: string;
    toXMLencodeResult(): XMLencodeResult;
}
/** Класс для множественного последовательного кодирования текста */
export declare class Encoder {
    /**
     * @param text исходный, который будет кодироваться
     * @param delimiter разделитель или его длина
    */
    constructor(text: string, delimiter?: string | number);
    /** Кодирование текущего результата указанной функцией `encodeFuntion` */
    Encode(encodeFuntion: (text: string, delimiter: string) => EncodeResult): void;
    ToEncodeResult(): EncodeResult;
    /** Исходный текст */
    readonly OriginalText: string;
    /** Разделитель для кодирования */
    readonly Delimiter: string;
    /** Результат кодирования */
    Result: string;
    /** Коллекция закодированных элементов */
    readonly EncodedCollection: KeyedCollection<string>;
}
/** Возвращает в `text` закодированные элементы */
export declare function getElementsBack(text: string, encodeResult: XMLencodeResult): string;
/** Кодирует элементы */
export declare function encodeElements(text: string, elem: RegExp, delimiter: string): EncodeResult;
/** кодирует C#-вставки в `text` */
export declare function encodeCS(text: string, delimiter: string): EncodeResult;
/** кодирует CDATA в `text` */
export declare function encodeCDATA(text: string, delimiter: string): EncodeResult;
export declare function encodeXMLComments(text: string, delimiter: string): EncodeResult;
export declare function getReplaceDelimiter(text: string, length?: number): string;
/** XML с закодированными C#-вставками и CDATA */
export declare function safeXML(text: string, delimiter?: string): EncodeResult;
/** преобразовывает безопасный XML в нормальный */
export declare function originalXML(text: string, data: XMLencodeResult): string;
/** заменяет блок комментариев на пробелы */
export declare function clearXMLComments(txt: string): string;
/** заменяет CDATA на пробелы */
export declare function clearCDATA(txt: string): string;
/** Заменяет содержимое CS-тегов пробелами */
export declare function clearCSContents(text: string): string;
/** Заменяет C#-комментарии пробелами */
export declare function clearCSComments(txt: string): string;
