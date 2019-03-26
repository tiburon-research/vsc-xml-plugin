import * as vscode from 'vscode'

export function test()
{
    vscode.window.activeTextEditor.edit(builder =>
    {
        builder.setEndOfLine(vscode.EndOfLine.LF);
    })
}