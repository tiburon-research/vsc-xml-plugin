import * as server from 'vscode-languageserver';
import * as vscode from 'vscode';


var connection = server.createConnection(server.ProposedFeatures.all);
var documents = new server.TextDocuments();



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
	connection.sendNotification("server.out", "Сервер запущен");
});




documents.listen(connection);
connection.listen();