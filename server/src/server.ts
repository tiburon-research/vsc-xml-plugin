'use strict'

import * as server from 'vscode-languageserver';
import { KeyedCollection} from 'tib-api';
import { sendDiagnostic } from './classes';


//#region --------------------------- Инициализация

var connection = server.createConnection(server.ProposedFeatures.all);
var documents = new server.TextDocuments();
var Settings = new KeyedCollection<any>();


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


//#endregion



//#region --------------------------- Обработчики

connection.onDidOpenTextDocument(data =>
{
	let document = server.TextDocument.create(data.textDocument.uri, 'tib', data.textDocument.version, data.textDocument.text);
	anyChangeHandler(document);
})


connection.onDidChangeTextDocument(data =>
{
	let text = data.contentChanges.last().text;
	let document = server.TextDocument.create(data.textDocument.uri, 'tib', data.textDocument.version, text);
	anyChangeHandler(document);
});



//#region --------------------------- Функции

export function consoleLog(data)
{
	connection.sendNotification('console.log', data);
}

/** Дёргаем при изменении или открытии */
function anyChangeHandler(document: server.TextDocument)
{
	sendDiagnostic(connection, document, Settings);
}

//#endregion
