import * as server from 'vscode-languageserver';
import { TextDocument } from 'vscode';
import { getDiagnosticElements } from './diagnostic';


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
	console.log('initialized');
	connection.sendNotification("server.out", "Сервер запущен");
});


documents.onDidChangeContent(change =>
{
	// let diagnostic = getDiagnosticElements(change.document)
})



documents.listen(connection);
connection.listen();