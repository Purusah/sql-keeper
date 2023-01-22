import * as vscode from "vscode";

export class SqlConnectionStorage {
    private readonly secretsStorageRootKey = "sql-keeper-secret-storage";
    private serializer: SqlConnectionsJsonSerializer;

    constructor(private secrets: vscode.SecretStorage) {
        this.serializer = new SqlConnectionsJsonSerializer();
    }

    add(_connection: SqlConnection): void {}

    async load(): Promise<SqlConnectionsStorageSchema["connections"]> {
        const serializedConnections = await this.secrets.get(this.secretsStorageRootKey);
        if (serializedConnections === undefined) {
            return [];
        }
        return this.serializer.deserialize(serializedConnections).connections;
    }

    delete(_connection: SqlConnection): void {}
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
    version: number,
    connections: SqlConnection[];
}

type SqlConnection = SqlConnectionPresto;

interface SqlConnectionPresto {
    type: "presto",
    data: {
        name: string;
        connection: string;
    }
}
