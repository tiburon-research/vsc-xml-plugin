'use strict'

import * as server from 'vscode-languageserver';
import { KeyedCollection } from 'tib-api';
import { getDiagnosticElements } from './diagnostic';
import { consoleLog } from './server';



export function sendDiagnostic(connection: server.Connection, document: server.TextDocument, settings: KeyedCollection<any>)
{
	getDiagnosticElements(document, settings).then(diagnostics =>
	{
		let clientDiagnostic: server.PublishDiagnosticsParams = {
			diagnostics,
			uri: document.uri
		};
		connection.sendDiagnostics(clientDiagnostic);
	})
}