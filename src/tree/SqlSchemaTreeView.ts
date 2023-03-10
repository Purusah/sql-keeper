import * as vscode from "vscode";
import * as path from "path";

export class SqlSchemaTreeView implements vscode.TreeDataProvider<Dependency> {
    constructor() {}

    getTreeItem(element: Dependency): vscode.TreeItem {
        return element;
    }

    getChildren(_element?: Dependency): Thenable<Dependency[]> {
        return Promise.resolve([]);
    }
}

class Dependency extends vscode.TreeItem {
    constructor(
    public readonly label: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}-${this.version}`;
        this.description = this.version;
    }

    iconPath = {
        light: path.join(__filename, "..", "..", "resources", "light", "dependency.svg"),
        dark: path.join(__filename, "..", "..", "resources", "dark", "dependency.svg"),
    };
}
