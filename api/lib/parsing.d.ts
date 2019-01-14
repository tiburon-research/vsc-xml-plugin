/// <reference types="node" />
import { TextRange, TagInfo, KeyedCollection } from "./index";
import * as vscode from 'vscode';
/** Результат поиска тегов */
export interface FindTagResult {
    Range: TextRange;
    /** Самозакрывающийся тег */
    SelfClosed: boolean;
}
export interface ParsedElementObject {
    Id: string;
    Text: string;
    Prefix?: string;
}
/**
 * Поиск закрывающего тега.
 *
 * @param before предыдущий текст или позиция (== его длина)
 * @returns `FindTagResult` или `null`, если тег не закрыт
 *
 * Если selfClosed, то `Range = null`
*/
export declare function findCloseTag(opBracket: string, tagName: string, clBracket: string, before: string | number, fullText: string): FindTagResult;
/**
 * Поиск открывающего тега.
 *
 * @param prevText предыдущий текст
 * @returns `FindTagResult` или `null`, если открывающий тег не найден
*/
export declare function findOpenTag(opBracket: string, tagName: string, clBracket: string, prevText: string): FindTagResult;
/** Тег, не требующий закрывающего */
export declare function isSelfClosedTag(tag: string): boolean;
/** получает теги 0 вложенности */
export declare function get1LevelNodes(text: string): TagInfo[];
/** Проверка на нахождение внутри кавычек */
export declare function inString(text: string): boolean;
/** Индекс конца открывающегося тега.
 *
 * Текст должен начинаться с открывающегося тега. Если не находит возвращает -1.
*/
export declare function indexOfOpenedEnd(text: string): number;
/** проверяет содержит ли строка начало объявления метода */
export declare function isMethodDefinition(text: string): boolean;
/** Получает коллекцию атрибутов из строки */
export declare function getAttributes(str: string): KeyedCollection<string>;
/** Возвращает `true`, если файл может быть прочитан в `windows-1251` */
export declare function win1251Avaliabe(buf: Buffer): boolean;
/** Разбирает текст на `Id` + `Text` */
export declare function parseElements(strings: string[]): ParsedElementObject[];
export declare function parseQuestion(text: string): ParsedElementObject;
/** массив из Range всех незакрытых тегов
 * @param prevText предыдущий текст (от начала документа)
 * @param startFrom откуда начинать
 *
 * Теги JS, CSS и PlainText не парсятся
*/
export declare function getParentRanges(document: vscode.TextDocument, prevText: string, startFrom?: number): vscode.Range[];
/** Проверяет нужно ли парсить этот тег */
export declare function tagNeedToBeParsed(tagName: string): boolean;
export declare function ReplaceXMLDeclaration(text: string): {
    Result: string;
    Declaration: string;
};
