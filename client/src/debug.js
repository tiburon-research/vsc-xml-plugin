"use strict";
exports.__esModule = true;
var vscode = require("vscode");
function test() {
    vscode.window.activeTextEditor.edit(function (builder) {
        builder.setEndOfLine(vscode.EndOfLine.LF);
    });
}
exports.test = test;
