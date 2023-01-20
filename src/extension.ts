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
        vscode.workspace.registerNotebookSerializer("sql-keeper-notebook", new SqlNotebookJsonSerializer()),
        new SqlKeeperNotebookKernel()
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

export class SqlKeeperNotebookKernel {
    readonly id = "sql-keeper-notebook-kernel";
    public readonly label = "SQL Keeper Notebook Kernel";
    readonly supportedLanguages = ["sql"];

    private _executionOrder = 0;
    private readonly _controller: vscode.NotebookController;

    constructor() {
        this._controller = vscode.notebooks.createNotebookController(this.id, "sql-keeper-notebook", this.label);
        this._controller.supportedLanguages = this.supportedLanguages;
        this._controller.supportsExecutionOrder = true;
        this._controller.executeHandler = this._executeAll.bind(this);
    }

    dispose(): void {
        this._controller.dispose();
    }

    private _executeAll(
        cells: vscode.NotebookCell[],
        _notebook: vscode.NotebookDocument,
        _controller: vscode.NotebookController,
    ): void {
        for (let cell of cells) {
            this._doExecution(cell);
        }
    }

    private async _doExecution(cell: vscode.NotebookCell): Promise<void> {
        const execution = this._controller.createNotebookCellExecution(cell);

        execution.executionOrder = ++this._executionOrder;
        execution.start(Date.now());

        try {
            execution.replaceOutput([new vscode.NotebookCellOutput([
                vscode.NotebookCellOutputItem.json(JSON.parse(
                    cell.document.getText()), "x-application/sample-json-renderer"),
                vscode.NotebookCellOutputItem.json(JSON.parse(cell.document.getText())),
            ])]);

            execution.end(true, Date.now());
        } catch (err) {
            execution.replaceOutput([new vscode.NotebookCellOutput([
                vscode.NotebookCellOutputItem.error(err as Error),
            ])]);
            execution.end(false, Date.now());
        }
    }
}
