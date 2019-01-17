'use strict'

import * as server from 'vscode-languageserver';
import { CurrentTag, Parse, SimpleTag, CurrentTagGetFields, getPreviousText, KeyValuePair, KeyedCollection } from 'tib-api';
import { CacheSet } from './cache';


/** Разница `p1`-`p2` */
export function comparePositions(document: server.TextDocument, p1: server.Position, p2: server.Position): number
{
    return document.offsetAt(p1) - document.offsetAt(p2);
}



export function getCurrentTag(data: CurrentTagGetFields, cache: CacheSet)
{
	return _getCurrentTag(data.document, data.position, cache, data.text, data.force);
}


function _getCurrentTag(document: server.TextDocument, position: server.Position, cache: CacheSet, txt?: string, force = false): CurrentTag
{
	let tag: CurrentTag;
	document.getText
	let text = txt || getPreviousText(document, position);

	// сначала пытаемся вытащить из кэша (сначала обновить, если позиция изменилась)
	if (!force)
	{
		if (cache.Active())
		{
			cache.Update(document, position, text);
			tag = cache.Tag.Get();
		}
	}

	if (!tag)
	{
		// собираем тег заново
		let pure: string;
		if (!pure) pure = CurrentTag.PrepareXML(text);
		let ranges = Parse.getParentRanges(document, pure);
		// где-то вне
		if (ranges.length == 0) tag = null;//new CurrentTag("XML");
		else
		{
			let parents = ranges.map(range => new SimpleTag(document, range))

			/** Последний незакрытый тег */
			let current = parents.pop();
			tag = new CurrentTag(current, parents);

			// Заполняем поля
			let lastRange = ranges.last();
			tag.SetFields({
				StartPosition: current.OpenTagRange.start,
				StartIndex: document.offsetAt(current.OpenTagRange.start),
				PreviousText: text,
				Body: tag.OpenTagIsClosed ? document.getText(server.Range.create(lastRange.end, position)) : undefined,
				LastParent: !!parents && parents.length > 0 ? parents.last() : undefined
			});
		}
	}
	return tag;
}