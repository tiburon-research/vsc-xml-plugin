import * as server from 'vscode-languageserver';


export interface CurrentTagGetFields
{
	document: server.TextDocument;
	position: server.Position;
	text?: string;
	force?: boolean;
}

/** Разница `p1`-`p2` */
export function comparePositions(document: server.TextDocument, p1: server.Position, p2: server.Position): number
{
    return document.offsetAt(p1) - document.offsetAt(p2);
}