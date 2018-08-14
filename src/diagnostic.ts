import * as vscode from 'vscode';
import { TagInfo } from './classes';



export function getWarnings(document: vscode.TextDocument): Promise<vscode.Diagnostic[]>
{
	return new Promise<vscode.Diagnostic[]>((resolve, reject) => {
		let res: vscode.Diagnostic[] = [];
		/* let text = document.getText();
		let includes = text.matchAll(/<Include/);
		includes.forEach(element => {
			let after = text.slice(element.index);
			let tag = new TagInfo(after, element.index);
			res.push(new vscode.Diagnostic(tag.FullLines.ToRange(document), "Include", vscode.DiagnosticSeverity.Information));
		});	 */	
		resolve(res); 
	});
}