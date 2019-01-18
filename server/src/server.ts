'use strict'

import * as server from 'vscode-languageserver';
import { KeyedCollection} from 'tib-api';
import { sendDiagnostic } from './classes';


var connection = server.createConnection(server.ProposedFeatures.all);
var documents = new server.TextDocuments();
var Settings = new KeyedCollection<any>();


export function consoleLog(data)
{
	connection.sendNotification('console.log', data);
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





connection.onDidOpenTextDocument(data =>
{
	
})



connection.onDidChangeTextDocument(data =>
{
	let text = data.contentChanges.last().text;
	let document = server.TextDocument.create(data.textDocument.uri, 'tib', data.textDocument.version, text);
	sendDiagnostic(connection, document, Settings);
});
