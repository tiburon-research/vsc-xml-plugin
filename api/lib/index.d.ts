import * as vscode from 'vscode';
import * as Encoding from './encoding';
import * as Parse from './parsing';
import * as Constants from './constants';
import * as JQUery from './tibJQuery';
export { Encoding, Parse, Constants, JQUery };
export declare enum Language {
    XML = 0,
    CSharp = 1,
    CSS = 2,
    JS = 3,
    PlainText = 4,
    Inline = 5
}
/** Результат поиска в строке */
interface SearchResult {
    Result: RegExpMatchArray;
    Index: number;
}
/**
 * @param From Включаемая граница
 * @param To Не влючамая граница
*/
export declare class ITextRange {
    From: number;
    To: number;
}
export declare class TextRange {
    From: number;
    To: number;
    readonly Length: number;
    constructor(obj: ITextRange);
    ToRange(document: vscode.TextDocument): vscode.Range;
}
/** Пара ключ-значение */
export interface IPair<T> {
    Key: string;
    Value: T;
}
/** Элемент `KeyedCollection` */
export declare class KeyValuePair<T> implements IPair<T> {
    constructor(key: string, value: T);
    Key: string;
    Value: T;
}
export declare class KeyedCollection<T> {
    protected items: {
        [index: string]: T;
    };
    private count;
    constructor();
    /** Создаёт коллекцию из массивов ключей и значений */
    static FromArrays<T>(keys: string[], values: T[]): KeyedCollection<T>;
    /** Создаёт коллекцию из массива `IPair` */
    static FromPairs<T>(pairs: IPair<T>[]): KeyedCollection<T>;
    /** Проверяет наличие ключа */
    Contains(key: string): boolean;
    Count(): number;
    AddElement(element: KeyValuePair<T>): void;
    /** Добавляет или заменяет */
    AddPair(key: string, value: T): void;
    Remove(key: string): T;
    Item(key: string): T;
    /** массив ключей */
    Keys(): string[];
    /** массив значений */
    Values(): T[];
    /** Очищает всю коллекцию */
    Clear(): void;
    /** обход элементов */
    forEach(callback: (key: string, val: T) => any): void;
    /**
     * преобразует набор
     * @param clearNull очищать ли по проверке (!!element)
    */
    Select(filter: (key: string, value: T) => any, clearNull?: boolean): any[];
    /** Фильтрует набор */
    protected Filter(filter: (key: string, value: T) => boolean): KeyedCollection<T>;
    /** Обновляет значение элемента по ключу */
    UpdateValue(key: string, transform: (value: T) => T): void;
    /** Добавляет диапазон значений */
    AddRange(range: KeyedCollection<T>): void;
    /** Преобразует коллекцию в новую */
    Map(func: (key: string, value: T) => KeyValuePair<any>): KeyedCollection<T>;
    /** Преобразует коллекцию в массив */
    ToArray(func: (element: KeyValuePair<T>) => any): any[];
    /** Возвращает отсортированную массив пар */
    OrderBy(func: (x: KeyValuePair<T>) => number): KeyValuePair<T>[];
}
export declare class OrderedCollection<T> {
    private items;
    private keys;
    constructor();
    private _addKey;
    protected _getIndex(key: string): number;
    Get(key: string): T;
    Add(key: string, item: T): void;
    readonly Count: number;
    Clear(): void;
    ForEach(callbackfn: (value: KeyValuePair<T>, index: number, array: KeyValuePair<T>[]) => void, thisArg?: any): void;
    Contains(key: string): boolean;
    UpdateValue(key: string, func: (val: T) => T): void;
    Remove(key: string): T;
    Keys(): string[];
    ToArray(func: (T: any) => any): any[];
}
export declare class TibAutoCompleteItem {
    Name: string;
    /** тип объекта (string из vscode.CompletionItemKind) */
    Kind: keyof typeof vscode.CompletionItemKind;
    /** краткое описание (появляется в редакторе в той же строчке) */
    Detail: string;
    /** подробное описание (появляется при клике на i (зависит от настроек)) */
    Description: string;
    /** кусок кода, сигнатура (показывается при наведении) */
    Documentation: string;
    /** Родитель (объект) */
    Parent: string;
    Overloads: TibAutoCompleteItem[];
    /** Тег, в котором должно работать */
    ParentTag: string;
    constructor(obj: Object);
    ToCompletionItem(addBracket?: boolean, sortString?: string): vscode.CompletionItem;
    ToSignatureInformation(): vscode.SignatureInformation;
}
export declare class TibAttribute {
    Name: string;
    Type: string;
    /** значение по умолчанию (если не задано) */
    Default: any;
    /** Значение, подставляемое автоматически при вставке атрибута */
    Auto: string;
    AllowCode: boolean;
    /** краткое описание (появляется в редакторе в той же строчке) */
    Detail: string;
    /** подробное описание (появляется при клике на i (зависит от настроек)) */
    Description: string;
    /** кусок кода, сигнатура (показывается при наведении) */
    Documentation: string;
    /** Значения, которые подставляются в AutoComplete */
    Values: Array<string>;
    /** код функции, вызываемый потом в callback, чтобы вернуть string[] для Snippet */
    Result: string;
    constructor(obj: Object);
    /** `nameOnly` - не подставлять значения */
    ToCompletionItem(callback: (query: string) => string[], nameOnly?: boolean): vscode.CompletionItem;
    ValueCompletitions(callback: (query: string) => string[]): string[];
    AutoValue(): string;
}
export declare class TibMethod {
    Name: string;
    Signature: string;
    IsFunction: boolean;
    Type: string;
    FileName: String;
    private Uri;
    private Location;
    constructor(name: string, sign: string, location: vscode.Range, fileName: string, isFunction?: boolean, type?: string);
    GetLocation(): vscode.Location;
    ToCompletionItem(): vscode.CompletionItem;
    ToHoverItem(): {
        language: string;
        value: string;
    };
    ToSignatureInformation(): vscode.SignatureInformation;
}
export declare class TibMethods extends KeyedCollection<TibMethod> {
    constructor(collection?: KeyedCollection<TibMethod>);
    Add(item: TibMethod): void;
    CompletionArray(): vscode.CompletionItem[];
    HoverArray(word: string): any[];
    SignatureArray(word: string): vscode.SignatureInformation[];
    Filter(filter: (key: string, value: TibMethod) => boolean): TibMethods;
}
/** Текстовая структура для хранения Name/Value */
export declare class InlineAttribute {
    Name: string;
    Value: string;
    /** Результирующая строка */
    Text: string;
    constructor(name: string, value: any);
}
/** Класс для получения информации по полному открывающемуся тегу
 *
 * используется для родителей и инициализации CurrentTag
 */
export declare class SimpleTag {
    constructor(document: vscode.TextDocument, range: vscode.Range);
    getAttributes(): KeyedCollection<string>;
    /** Возвращает источник повтора для `Repeat` */
    getRepeatSource(): string;
    /** Закрыт ли открывающий тег */
    isClosed(): boolean;
    readonly Name: string;
    protected Attrs: KeyedCollection<string>;
    /** Позиция открывающего тега */
    readonly OpenTagRange: vscode.Range;
    private readonly Raw;
}
/** Поля для CurrentTag */
export interface CurrentTagFields {
    PreviousText: string;
    StartPosition?: vscode.Position;
    StartIndex?: number;
    OpenTagIsClosed?: boolean;
    LastParent?: SimpleTag;
    Body?: string;
    Parents?: SimpleTag[];
    OpenTagRange?: vscode.Range;
}
/** Самый главный класс */
export declare class CurrentTag {
    Name: string;
    /** Идентификатор тега
     * - для `Item` - в зависимости от родителя
     * - для `Repeat` - в зависимости от источника
    */
    Id: string;
    Attributes: Array<InlineAttribute>;
    Body: string;
    /** Закрыт не тег, просто есть вторая скобка <Page...> */
    OpenTagIsClosed: boolean;
    Parents: Array<SimpleTag>;
    LastParent: SimpleTag;
    /** Откуда начинается */
    StartIndex: number;
    OpenTagRange: vscode.Range;
    /** Текст от начала документа до Position */
    PreviousText: any;
    /** Кеширование языка */
    private Language;
    /** Задаёт атрибуты */
    private SetAttributes;
    /** Обновление только самогО тега */
    private _update;
    /** Задаёт родителей */
    private _setParents;
    /** Сброс закешированного */
    private _reset;
    constructor(tag: string | SimpleTag, parents?: SimpleTag[]);
    /** Подготавливает TibXML для поиска теги */
    static PrepareXML(text: string): string;
    /** возвращает массив имён атрибутов */
    AttributeNames(): string[];
    /** возвращает коллекцию атрибутов из переданной строки */
    static GetAttributesArray(str: string): KeyedCollection<string>;
    /** Получает все атрибуты, независимо от Position */
    GetAllAttributes(document: vscode.TextDocument): KeyedCollection<string>;
    /** Язык содержимого */
    GetLaguage(): Language;
    /** [c#]Method() */
    CSInline(): boolean;
    /** $Method */
    CSSingle(): boolean;
    /** Курсор находится в строке */
    InString(): boolean;
    /** == Language.Inline. Но это только когда написано полностью */
    IsSpecial(): boolean;
    /** В строке внутри C# */
    InCSString(): boolean;
    /** Обновляет поля, если новые не undefined */
    SetFields(fields: CurrentTagFields): void;
    /** Обновляет только текущий тег */
    Update(tag: string | SimpleTag, fields: CurrentTagFields): void;
    /** Получает индекс текущего Var в Item
     *
     * Если найти не получилось, то -1
    */
    GetVarIndex(): number;
    GetIndent(): number;
}
/** Информация об XML узле */
export declare class SurveyNode {
    constructor(type: string, id: string, pos: vscode.Position, fileName: string);
    Id: string;
    Type: string;
    Position: vscode.Position;
    FileName: string;
    IconKind: vscode.CompletionItemKind;
    private Uri;
    GetLocation(): vscode.Location;
    /** Чтобы иконки отличались */
    private GetKind;
}
export declare class SurveyNodes extends KeyedCollection<SurveyNode[]> {
    constructor();
    /** Добавляет в нужный элемент */
    Add(item: SurveyNode): void;
    /** Добавляет к нужным элементам, не заменяя */
    AddRange(range: KeyedCollection<SurveyNode[]>): void;
    GetIds(type: string): string[];
    GetItem(id: string, type?: string): SurveyNode;
    Clear(names?: string[]): void;
    CompletitionItems(name: string, closeQt?: string): vscode.CompletionItem[];
    /** Фильтрует элементы */
    FilterNodes(filter: (node: SurveyNode) => boolean): SurveyNodes;
}
/** Настройки расширения */
export declare class ExtensionSettings extends KeyedCollection<any> {
    constructor();
    /** Обновляет объект настроек из файла конфигурации */
    Update(): void;
    /** Изменяет настройки */
    Set(key: string, value: any): Promise<void>;
    private Config;
}
/** Совмещённая структура ContentChangeEvent + Selection */
export declare class ContextChange {
    constructor(contextChange: vscode.TextDocumentContentChangeEvent, selection: vscode.Selection);
    Start: vscode.Position;
    End: vscode.Position;
    Active: vscode.Position;
    Change: vscode.TextDocumentContentChangeEvent;
    Selection: vscode.Selection;
}
/** Возвращает совмещённую структуру из изменений и соответствующих выделений */
export declare function getContextChanges(selections: vscode.Selection[], changes: vscode.TextDocumentContentChangeEvent[]): ContextChange[];
/** Собирает данные для первого встреченного <тега> на новой строке */
export declare class TagInfo {
    constructor(text: string, offset?: number);
    /** Возвращает язык исходя только из имени тега */
    static getTagLanguage(tagName: string): Language;
    OpenTag: TextRange;
    CloseTag: TextRange;
    Body: TextRange;
    Name: string;
    IsAllowCodeTag: boolean;
    /** Валидация: получилось ли распарсить */
    Found: boolean;
    Closed: boolean;
    SelfClosed: boolean;
    Language: Language;
    /** от начала строки открывающегося до конца строки закрывающегося */
    FullLines: TextRange;
    Multiline: boolean;
    /** если всё содержимое обёрнуто */
    HasCDATA: boolean;
}
/** Для преобразований Snippet -> CompletitionItem */
export declare class SnippetObject {
    prefix: string;
    body: string;
    description: string;
    constructor(obj: Object);
}
/** C# / JS / CSS */
export declare function isScriptLanguage(lang: Language): boolean;
/** возвращает минимальное неотрицательное или `negative` (= null), если нет таких */
export declare function positiveMin(a: any, b: any, negative?: any): any;
/** записывает данные в буфер обмена */
export declare function copyToCB(text: string): void;
/** получает данные из буфера обмена */
export declare function getFromClioboard(): string;
/** преобразует стандартый Snippet в CompletionItem */
export declare function snippetToCompletitionItem(obj: Object): vscode.CompletionItem;
/** Подготовленная для RegExp строка */
export declare function safeString(text: string): string;
/** Открытие текста файла в новом окне */
export declare function openFileText(path: string): Promise<void>;
export declare function getDocumentMethods(document: vscode.TextDocument, Settings: ExtensionSettings): Promise<TibMethods>;
export declare function getDocumentNodeIds(document: vscode.TextDocument, Settings: ExtensionSettings, NodeStoreNames: string[]): Promise<SurveyNodes>;
/** Возвращает список MixId */
export declare function getMixIds(document: vscode.TextDocument, Settings: ExtensionSettings): Promise<string[]>;
/** Проверка текущего положения курсора на нахождение в CDATA */
export declare function inCDATA(document: vscode.TextDocument, position: vscode.Position): boolean;
/** Создаёт команду только для языка tib */
export declare function registerCommand(name: string, command: Function): Promise<void>;
declare global {
    interface String {
        /** Продвинутый indexOf */
        find(search: string | RegExp): SearchResult;
        /** Продвинутый lastIndexOf string=Regexp */
        /** Поиск с группами по всей строке
         *
         * Нельзя использовать флаг `g`!
        */
        matchAll(search: RegExp): RegExpMatchArray[];
        /** Замена, начиная с `from` длиной `subsr` символов (если string, то берётся длина строки) */
        replaceRange(from: number, substr: string | number, newValue: string): string;
        /** Заменяет все Key (отсортированные) на Value */
        replaceValues(items: KeyedCollection<string>): string;
        /** Проверяет вхождение */
        contains(search: string): boolean;
    }
    interface Array<T> {
        /** Возвращает последний элемент */
        last(): T;
        /** Проверяет, что все элементы совпадают, независимо от порядка */
        equalsTo(ar: Array<T>): boolean;
        distinct(): T[];
        /** Содержит элемент */
        contains(element: T): boolean;
        /** Удаляет элемент из массива и возвращает этот элемент */
        remove(element: T): T;
        /** Преобразует массив в коллекцию */
        toKeyedCollection(func: (x: T) => KeyValuePair<any>): KeyedCollection<any>;
        /** Преjбразует массив в коллекцию T */
        toKeyedCollection(func: (x: T) => Object): KeyedCollection<any>;
    }
}
