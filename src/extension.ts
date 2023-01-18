import { TextDecoder, TextEncoder } from "util";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    // Example
    let disposable = vscode.commands.registerCommand("sql-keeper.helloWorld", () => {
        vscode.window.showInformationMessage("Hello World from SQL Keeper!");
    });
    context.subscriptions.push(disposable);

    // Notebook
    context.subscriptions.push(
        vscode.workspace.registerNotebookSerializer("sql-keeper-notebook", new SqlNotebookJsonSerializer())
    );
}

// This method is called when your extension is deactivated
export function deactivate() { }

interface RawNotebookCell {
	language: string;
	value: string;
	kind: vscode.NotebookCellKind;
}

class SqlNotebookJsonSerializer implements vscode.NotebookSerializer {
    async deserializeNotebook(
        content: Uint8Array,
        _token: vscode.CancellationToken
    ): Promise<vscode.NotebookData> {
        var contents = new TextDecoder().decode(content);

        let raw: RawNotebookCell[];
        try {
            raw = <RawNotebookCell[]>JSON.parse(contents);
        } catch {
            raw = [];
        }

        const cells = raw.map(
            item => new vscode.NotebookCellData(item.kind, item.value, item.language)
        );

        return new vscode.NotebookData(cells);
    }

    async serializeNotebook(
        data: vscode.NotebookData,
        _token: vscode.CancellationToken
    ): Promise<Uint8Array> {
        let contents: RawNotebookCell[] = [];

        for (const cell of data.cells) {
            contents.push({
                kind: cell.kind,
                language: cell.languageId,
                value: cell.value,
            });
        }

        return new TextEncoder().encode(JSON.stringify(contents));
    }
}
