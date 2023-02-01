import * as vscode from "vscode";
import {PrestoConnection} from "../connection/PrestoConnection";
import {SqlConnectionStorage} from "../tree/SqlConnectionsStorage";
import {SqlConnectionsTreeView} from "../tree/SqlConnectionsTreeView";
import {
    DatabaseType,
    DATABASE_TYPE_PRESTO,
    isDatabaseType,
    SerializedConnection,
    PrestoSerializedConnection,
} from "../types";

export class SqlConnectionQuickPickInput {
    private readonly databaseToConnectionBuilder: {[Database in DatabaseType]: () => ConnectionBuilder} = {
        [DATABASE_TYPE_PRESTO]: PrestoConnectionQuickPickInputBuilder.init,
    };

    constructor(private readonly tree: SqlConnectionsTreeView, private readonly storage: SqlConnectionStorage) {}

    async addConnection(): Promise<void> {let i = 0;
        const database = await vscode.window.showQuickPick([DATABASE_TYPE_PRESTO], {
            placeHolder: "Choose database",
            canPickMany: false,
        });
        if (database === undefined || !isDatabaseType(database)) {
            vscode.window.showInformationMessage("Not supported database");
            return;
        }

        const builder = this.databaseToConnectionBuilder[database]();
        const connection = await builder.build();
        if (connection === null) {
            vscode.window.showInformationMessage("Can't add a new connection");
            return;
        }
        // TODO try/catch and notification for the user
        await PrestoConnection.init(connection);
        await this.storage.add(connection);
        await this.tree.refresh();
    }
}

interface ConnectionBuilder {
    build(): Promise<SerializedConnection | null>;
}

class PrestoConnectionQuickPickInputBuilder implements ConnectionBuilder {
    async build(): Promise<PrestoSerializedConnection | null> {
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

        // TODO
        return {
            type: DATABASE_TYPE_PRESTO,
            data: {
                name,
                url: connection,
                user: "",
                password: "",
                ssl: false,
            },
        };
    }

    static init(): PrestoConnectionQuickPickInputBuilder {
        return new PrestoConnectionQuickPickInputBuilder();
    }
}
