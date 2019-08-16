import * as vscode from 'vscode';
import * as geo from './geo';

export function test()
{
	/* vscode.window.activeTextEditor.edit(builder =>
	{
		builder.setEndOfLine(vscode.EndOfLine.LF);
	}) */

	geo.readGeoFile();

}