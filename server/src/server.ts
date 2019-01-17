'use strict'

import * as server from 'vscode-languageserver';
import { CurrentTagGetFields, KeyedCollection } from 'tib-api';
import { CacheSet } from './cache';
import { getCurrentTag } from './classes';


var connection = server.createConnection(server.ProposedFeatures.all);
var documents = new server.TextDocuments();
var Settings = new KeyedCollection<any>();

var Cache = new CacheSet(
	() => { return !Settings.Contains("enableCache") || !!Settings.Item("enableCache") },
	(data: CurrentTagGetFields) => { return getCurrentTag(data, Cache) }
);




// смена документа
function editorChanged()
{
	Cache.Clear();
}


/** отправляет CurrentTag клиенту */
function sendCurrentTag()
{
	let data: CurrentTagGetFields;
	let tag = getCurrentTag(data, Cache);
}


/** Подписываемся на Notification от клиента */
function subscribeClient<T, R>(type: string, func: (dataFromClient: T) => R)
{
	connection.onNotification(type, func);
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



documents.listen(connection);
connection.listen();





// изменение содержимого
subscribeClient("changed", (data: CurrentTagGetFields) =>
{
	// let diagnostic = getDiagnosticElements(change.document)
	let tag = getCurrentTag(data, Cache);
});