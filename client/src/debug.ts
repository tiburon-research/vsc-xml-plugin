import * as vscode from 'vscode';

export function test()
{
	/* vscode.window.activeTextEditor.edit(builder =>
	{
		builder.setEndOfLine(vscode.EndOfLine.LF);
	}) */
	console.log(require('node-xlsx').parse("T:\\=Tiburon_NEW\\Geo\\test.xlsx"));

}