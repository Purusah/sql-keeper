import * as vscode from "vscode";
import {SqlNotebookKernel} from "./notebook/SqlNotebookKernel";
import {SqlNotebookJsonSerializer} from "./notebook/SqlNotebookJsonSerializer";
import {SqlConnectionsTreeView} from "./tree/SqlConnectionsTreeView";
import {SqlSchemaTreeView} from "./tree/SqlSchemaTreeView";

export function activate(context: vscode.ExtensionContext) {
    // Notebook
    context.subscriptions.push(
        vscode.workspace.registerNotebookSerializer("sql-keeper-notebook", new SqlNotebookJsonSerializer()),
        new SqlNotebookKernel()
    );

    // Tree View
    vscode.window.createTreeView("sql-keeper-view-connection", {treeDataProvider: new SqlConnectionsTreeView()});
    vscode.window.createTreeView("sql-keeper-view-schema", {treeDataProvider: new SqlSchemaTreeView()});
}

// This method is called when your extension is deactivated
export function deactivate() { }
