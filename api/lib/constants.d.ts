/** Тип сборки */
export declare const _pack: ("debug" | "release");
/** XML теги, которые сохраняются в CurrentNodes */
export declare const _NodeStoreNames: string[];
/** Snippets для разных типов Item */
export declare const ItemSnippets: {
    List: string;
    Quota: string;
    Validate: string;
    Redirect: string;
    Filter: string;
    Constants: string;
    Split: string;
    Stat: string;
};
/** Работают правильно, но медленно */
export declare const RegExpPatterns: {
    CDATA: RegExp;
    CDATALast: RegExp;
    XMLComment: RegExp;
    XMLLastComment: RegExp;
    AllowCodeTags: string;
    /** RegExp для HTML тегов, которые не нужно закрывать */
    SelfClosedTags: string;
    InlineSpecial: string;
    /** Набор символов разделителя замены */
    DelimiterContent: string;
    SingleAttribute: string;
    Attributes: RegExp;
    OpenTagFull: RegExp;
    FormattingHash: RegExp;
    CSComments: RegExp;
    RestAttributes: RegExp;
    XMLIterators: {
        Singele: RegExp;
        Var: RegExp;
    };
};
export declare const _LockInfoFilePrefix = "vscode_tib_lockedInfo_";
/** Префикс для Warning в logToOutput */
export declare const _WarningLogPrefix = " WARNING: ";
export declare const QuestionTypes: string[];
export declare const translationArray: {
    rus: string[];
    eng: string[];
};
/** Константы, подставляющиеся через $ */
export declare const XMLEmbeddings: {
    Name: string;
    Title: string;
    Type: string;
}[];
