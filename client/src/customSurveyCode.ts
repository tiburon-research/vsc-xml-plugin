import * as vscode from 'vscode';


/** Реализует удобную работу с xml */
export class DocumentObjectModel
{
	private $dom;
	private _text: string;

	constructor(private document: vscode.TextDocument, private $: any)
	{
		this._text = document.getText();
		this.$dom = $.XMLDOM(this._text);
	}

	public getLists() {
		return this.$dom.find("List");
	}
}