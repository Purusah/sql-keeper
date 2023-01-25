import * as vscode from "vscode";
import {SqlNotebookKernel} from "./notebook/SqlNotebookKernel";
import {SqlNotebookJsonSerializer} from "./notebook/SqlNotebookJsonSerializer";
import {SqlConnectionsTreeView} from "./tree/SqlConnectionsTreeView";
import {SqlSchemaTreeView} from "./tree/SqlSchemaTreeView";
import {SqlConnectionStorage} from "./tree/SqlConnectionsStorage";
import {SqlConnectionQuickPickInput} from "./input/SqlConnectionQuickPickInput";

export function activate(context: vscode.ExtensionContext) {
    // services
    const sqlConnectionsStorage = new SqlConnectionStorage(context.secrets);
    // views
    const sqlConnectionsTreeView = new SqlConnectionsTreeView(sqlConnectionsStorage);
    // input
    const sqlConnectionsQuickPickInput = new SqlConnectionQuickPickInput(sqlConnectionsTreeView, sqlConnectionsStorage);

    context.subscriptions.push(
        // Commands
        vscode.commands.registerCommand("sql-keeper.command.connection-add", async () => {
            await sqlConnectionsQuickPickInput.addConnection();
        }),
        vscode.commands.registerCommand("sql-keeper.command.connections-refresh", async () => {
            await sqlConnectionsTreeView.refresh();
        }),

        // Notebook
        vscode.workspace.registerNotebookSerializer("sql-keeper-notebook", new SqlNotebookJsonSerializer()),
        new SqlNotebookKernel(),

        // Tree View
        vscode.window.createTreeView("sql-keeper.view.connection", {
            canSelectMany: false,
            showCollapseAll: true,
            treeDataProvider: sqlConnectionsTreeView,
        }),
        vscode.window.createTreeView("sql-keeper.view.schema", {
            canSelectMany: false,
            showCollapseAll: true,
            treeDataProvider: new SqlSchemaTreeView(),
        }),
    );
}

// This method is called when your extension is deactivated
export function deactivate() { }
