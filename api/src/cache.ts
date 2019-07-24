'use  strict'

import * as server from 'vscode-languageserver';
import { CurrentTag, SimpleTag, CurrentTagGetFields } from './currentTag'
import * as Parse from './parsing'
import { comparePositions, getPreviousText } from './index';


class CacheItem<T>
{
	private Value: T;

	public Set(item: T)
	{
	    this.Value = item;
	}

	public Get(): T
	{
	    return this.Value;
	}

	/** Очистка */
	public Remove()
	{
	    this.Value = undefined;
	}

	/** Проверка на undefined */
	public IsSet()
	{
	    return typeof this.Value !== 'undefined';
	}

}


export class CacheSet 
{
	/** От начала документа до position */
	public PreviousTextSafe = new CacheItem<string>();
	public PreviousText = new CacheItem<string>();
	public Tag = new CacheItem<CurrentTag>();

	// поля для быстрой обработки
	private Keys = ["PreviousTextSafe", "PreviousText", "Tag"];

	/** Проверка активности */
	private _isActive = () => false;

	private _getTagHandler = (data: CurrentTagGetFields) => null;

	/** Полное обновление */
	private updateAll(document: server.TextDocument, position: server.Position, text: string): void
	{
	    this.Clear();
	    this.PreviousText.Set(text);
	    this.PreviousTextSafe.Set(CurrentTag.PrepareXML(text));
	    this.Tag.Set(this._getTagHandler({ document, position, text, force: true }));
	}

	/** Обновление последнего куска */
	private updatePart(document: server.TextDocument, position: server.Position, prevText: string, validParents: SimpleTag[], ind: number, restText: string): boolean
	{
	    try
	    {
	        let cachedSafe = this.PreviousTextSafe.Get();
	        let cachedTag = this.Tag.Get();

	        // обновляем последнюю часть SafeText (один из основных смыслов кэширования) и сам Text
	        let pre = cachedSafe.slice(0, ind);
	        let prep = CurrentTag.PrepareXML(restText);
	        cachedSafe = pre + prep;
	        this.PreviousTextSafe.Set(cachedSafe);
	        this.PreviousText.Set(prevText);

	        // обновляем Tag
	        if (Parse.tagNeedToBeParsed(cachedTag.Name)) // если внутри могут быть теги
	        {
	            let ranges = Parse.getParentRanges(document, cachedSafe, ind);
	            if (ranges.length > 0)
	                ranges.forEach(range => validParents.push(new SimpleTag(document, range)));
	            if (validParents.length > 0)
	            {
	                let lastParent = validParents.pop();
	                let lastParentRange = server.Range.create(lastParent.OpenTagRange.start, position);
	                let current = new SimpleTag(document, lastParentRange);
	                let openTagIsclosed = current.isClosed();
	                let body = openTagIsclosed ? document.getText(server.Range.create(current.OpenTagRange.end, position)) : undefined;
	                cachedTag.Update(current, {
	                    PreviousText: prevText,
	                    Parents: validParents,
	                    Body: body,
	                    OpenTagIsClosed: openTagIsclosed,
	                    OpenTagRange: lastParentRange,
	                    StartIndex: document.offsetAt(lastParentRange.start)
	                });
	                return true;
	            }
	        }
	        else // обновляем только текст
	        {
	            cachedTag.Update(null, {
	                PreviousText: prevText,
	                Body: document.getText(server.Range.create(cachedTag.OpenTagRange.end, position))
	            });
	        }

	    }
	    catch (error)
	    {
	        throw "Ошибка обновления части закешированного документа";
	    }
	    return false;
	}



	constructor(activeCheck: () => boolean, getTagHandler: (data: CurrentTagGetFields) => CurrentTag)
	{
	    this._isActive = activeCheck;
	    this._getTagHandler = getTagHandler;
	}


	/** Обновление всего кеша (если требуется) */
	public Update(document: server.TextDocument, position: server.Position, txt?: string): void
	{
	    try
	    {
	        if (!this.Active()) return;

	        let text = txt || getPreviousText(document, position);
	        let cachedText = this.PreviousText.Get();
	        // ничего не поменялось
	        if (!!cachedText && cachedText == text) return;

	        let cachedTag = this.Tag.Get();
	        let cachedSafe = this.PreviousTextSafe.Get();

	        if (!cachedText || !cachedSafe || !cachedTag || cachedText.length != cachedSafe.length)
	            return this.updateAll(document, position, text); // обновляем всё

	        // частичное обновление
	        let foundValidRange = false;
	        // сначала пробуем сравнить весь текст до начала тега
	        let upTo = cachedTag.OpenTagRange.start; // начало закешированного тега
	        if (comparePositions(document, upTo, position) <= 0)
	        {
	            let newText = getPreviousText(document, upTo);
	            let ind = document.offsetAt(upTo); // а document типа не изменился
	            let oldText = cachedText.slice(0, ind);
	            let restText = document.getText(server.Range.create(upTo, position)); // остаток текста после начала тега
	            if (oldText == newText && !restText.match("</" + cachedTag.Name))
	            {
	                foundValidRange = this.updatePart(document, position, text, cachedTag.Parents, ind, restText);
	                // если получилось, то ничего обновлять не надо
	                if (foundValidRange) return;
	            }
	        }

	        // если не получилось, то идём породительно снизу вверх
	        let validParents: Array<SimpleTag> = [];
	        foundValidRange = false;
	        for (let i = cachedTag.Parents.length - 1; i >= 0; i--)
	        {
	            let upTo = cachedTag.Parents[i].OpenTagRange.end;
	            let newText = getPreviousText(document, upTo);
	            let ind = document.offsetAt(upTo); // а document типа не изменился
	            let oldText = cachedText.slice(0, ind);
	            let restText = document.getText(server.Range.create(upTo, position)); // остаток текста после последнего родителя
	            // ищем такого, что он выше, текст перед ним сохранился и после него не появилось закрывающего его тега
	            if (comparePositions(document, upTo, position) <= 0 && oldText == newText && !restText.match("</" + cachedTag.Parents[i].Name))
	            {
	                // обновляем только последний кусок
	                validParents = cachedTag.Parents.slice(0, i + 1);
	                foundValidRange = this.updatePart(document, position, text, validParents, ind, restText);
	                break;
	            }
	        }
	        if (!foundValidRange) this.updateAll(document, position, text);
	    }
	    catch (error)
	    {
	        throw "Ошибка обновления закешированного документа";
	    }

	}

	/** Можно ли пользоваться кэшем */
	public Active(): boolean
	{
	    return this._isActive();
	}

	/** Очистка всех полей */
	public Clear()
	{
	    try
	    {
	        this.Keys.forEach(field =>
	        {
	            (this[field] as CacheItem<any>).Remove();
	        });
	    }
	    catch (error)
	    {
	        throw "Ошибка очистки кеша";
	    }
	}

}
