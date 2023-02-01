import * as vscode from "vscode";
import {SerializedConnection} from "../types";

export class SqlConnectionStorage {
    private readonly defaultVersion = 1;
    private readonly secretsStorageRootKey = "sql-keeper-secret-storage";
    private serializer: SqlConnectionsJsonSerializer;

    constructor(private secrets: vscode.SecretStorage) {
        this.serializer = new SqlConnectionsJsonSerializer();
    }

    async add(connection: SerializedConnection): Promise<void> {
        const connections = await this.load();
        connections.push(connection);
        const serializedConnection = this.serializer.serialize({connections, version: this.defaultVersion});
        await this.secrets.store(this.secretsStorageRootKey, serializedConnection);
    }

    async load(): Promise<SqlConnectionsStorageSchema["connections"]> {
        const serializedConnections = await this.secrets.get(this.secretsStorageRootKey);
        if (serializedConnections === undefined) {
            return [];
        }
        return this.serializer.deserialize(serializedConnections).connections;
    }

    delete(_connection: SerializedConnection): void {}
}

class SqlConnectionsJsonSerializer {
    deserialize(content: string): SqlConnectionsStorageSchema {
        return JSON.parse(content);
    }

    serialize(data: SqlConnectionsStorageSchema): string {
        return JSON.stringify(data);
    }
}

interface SqlConnectionsStorageSchema {
    version: number;
    connections: SerializedConnection[];
}
