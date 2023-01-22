import * as vscode from "vscode";
import {SqlNotebookKernel} from "./notebook/SqlNotebookKernel";
import {SqlNotebookJsonSerializer} from "./notebook/SqlNotebookJsonSerializer";
import {SqlConnectionsTreeView} from "./tree/SqlConnectionsTreeView";
import {SqlSchemaTreeView} from "./tree/SqlSchemaTreeView";
import {SqlConnectionStorage} from "./tree/SqlConnectionsStorage";

export function activate(context: vscode.ExtensionContext) {
    const sqlConnectionsStorage = new SqlConnectionStorage(context.secrets);

    // Notebook
    context.subscriptions.push(
        vscode.workspace.registerNotebookSerializer("sql-keeper-notebook", new SqlNotebookJsonSerializer()),
        new SqlNotebookKernel()
    );

    // Tree View
    vscode.window.createTreeView("sql-keeper-view-connection", {
        canSelectMany: false,
        showCollapseAll: true,
        treeDataProvider: new SqlConnectionsTreeView(sqlConnectionsStorage),
    });
    vscode.window.createTreeView("sql-keeper-view-schema", {
        canSelectMany: false,
        showCollapseAll: true,
        treeDataProvider: new SqlSchemaTreeView(),
    });
}

// This method is called when your extension is deactivated
export function deactivate() { }
