import * as vscode from "vscode";

export class SqlNotebookKernel {
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
