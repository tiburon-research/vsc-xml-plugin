'use strict'

import * as server from 'vscode-languageserver';
import { CurrentTagGetFields, KeyedCollection, getCurrentTag } from 'tib-api';
import { CacheSet } from 'tib-api/lib/cache';


var connection = server.createConnection(server.ProposedFeatures.all);
var documents = new server.TextDocuments();
var Settings = new KeyedCollection<any>();



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


