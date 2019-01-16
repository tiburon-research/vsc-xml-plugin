import * as server from 'vscode-languageserver';
import { CurrentTag, Parse, SimpleTag, CurrentTagGetFields, getPreviousText, KeyValuePair, KeyedCollection } from 'tib-api';
import { CacheSet } from './cache';


var connection = server.createConnection(server.ProposedFeatures.all);
var documents = new server.TextDocuments();
var Settings = new KeyedCollection<any>();

var Cache = new CacheSet(() => { return !Settings.Contains("enableCache") || !!Settings.Item("enableCache") });




// смена документа
function editorChanged()
{
	Cache.Clear();
}


export function getCurrentTag(data: CurrentTagGetFields)
{
	return _getCurrentTag(data.document, data.position, data.text, data.force);
}


function _getCurrentTag(document: server.TextDocument, position: server.Position, txt?: string, force = false): CurrentTag
{
	let tag: CurrentTag;
	document.getText
	let text = txt || getPreviousText(document, position);

	// сначала пытаемся вытащить из кэша (сначала обновить, если позиция изменилась)
	if (!force)
	{
		if (Cache.Active())
		{
			Cache.Update(document, position, text);
			tag = Cache.Tag.Get();
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



connection.onInitialize((params: server.InitializeParams) =>
{
	return {
		capabilities: {
			textDocumentSync: documents.syncKind
		}
	};
});



connection.onInitialized(() =>
{
	connection.sendNotification("client.log", "Сервер запущен");
});


documents.onDidChangeContent(change =>
{
	// let diagnostic = getDiagnosticElements(change.document)
})



// запрос на getCurrentTag
//subscribeClient("getCurrentTag", (data: CurrentTagGetFields) => getCurrentTag(data));



/** Подписываемся на Notification то клиента */
function subscribeClient<T, R>(type: string, func: (dataFromClient: T) => R)
{
	connection.onRequest(type, func);
}


documents.listen(connection);
connection.listen();