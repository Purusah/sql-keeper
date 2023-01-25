import * as vscode from "vscode";
import {SqlConnectionStorage} from "../tree/SqlConnectionsStorage";
import {SqlConnectionsTreeView} from "../tree/SqlConnectionsTreeView";
import {DatabaseType, DATABASE_TYPE_PRESTO, isDatabaseType, SqlConnection, SqlConnectionPresto} from "../types";

export class SqlConnectionQuickPickInput {
    private readonly databaseToConnectionBuilder: {[Database in DatabaseType]: () => ConnectionBuilder } = {
        [DATABASE_TYPE_PRESTO]: PrestoConnectionBuilder.init,
    };

    constructor(private readonly tree: SqlConnectionsTreeView, private readonly storage: SqlConnectionStorage) {}

    async addConnection(): Promise<void> {let i = 0;
        const database = await vscode.window.showQuickPick([DATABASE_TYPE_PRESTO], {
            placeHolder: "Choose database",
            canPickMany: false,
        });
        if (database === undefined || !isDatabaseType(database)) {
            vscode.window.showInformationMessage("No options allowed");
            return;
        }

        const builder = this.databaseToConnectionBuilder[database]();
        const connection = await builder.build();
        if (connection === null) {
            vscode.window.showInformationMessage("Can't add a new connection");
            return;
        }

        await this.storage.add(connection);
        await this.tree.refresh();
    }
}

interface ConnectionBuilder {
    build(): Promise<SqlConnection | null>;
}

class PrestoConnectionBuilder implements ConnectionBuilder {
    async build(): Promise<SqlConnectionPresto | null> {
        const name = await vscode.window.showInputBox({
            placeHolder: "New connection name (\"Presto\" by default)",
        }) ?? DATABASE_TYPE_PRESTO;

        const connection = await vscode.window.showInputBox({
            placeHolder: "Connection string",
            validateInput(value) {
                if (value.length === 0) {
                    return "Non-empty string only";
                }
                // Valid value
                return "";
            },
        });
        if (connection === undefined) {
            return null;
        }

        return {
            type: DATABASE_TYPE_PRESTO,
            data: {
                name,
                connection,
            },
        };
    }

    static init(): PrestoConnectionBuilder {
        return new PrestoConnectionBuilder();
    }
}
