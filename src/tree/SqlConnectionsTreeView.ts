import * as vscode from "vscode";
import {SqlConnectionStorage} from "./SqlConnectionsStorage";

export class SqlConnectionsTreeView implements vscode.TreeDataProvider<ConnectionTreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<OnUpdateSqlConnectionTreeView>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private storage: SqlConnectionStorage) {}

    async getChildren(element?: ConnectionTreeItem): Promise<ConnectionTreeItem[]> {
        const connections = await this.storage.load();
        if (connections.length === 0) {
            vscode.window.showInformationMessage("No dependency in empty workspace");
            return [];
        }

        // if empty element then root elements requested
        if (element !== undefined) {
            // connection shouldn't contain children
            return [];
        }

        const connectionsTreeItems: ConnectionTreeItem[] = [];
        for (let c of connections) {
            const {data} = c;
            connectionsTreeItems.push(new ConnectionTreeItem(data.name, vscode.TreeItemCollapsibleState.None));
        }
        return connectionsTreeItems;
    }

    getTreeItem(element: ConnectionTreeItem): vscode.TreeItem {
        return element;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

class ConnectionTreeItem extends vscode.TreeItem {
    constructor(public readonly label: string, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleState);
    }
}

type OnUpdateSqlConnectionTreeView = void | ConnectionTreeItem | ConnectionTreeItem[] | null | undefined;
