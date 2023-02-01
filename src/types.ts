export const DATABASE_TYPE_PRESTO = "Presto";

export type DatabaseType = typeof DATABASE_TYPE_PRESTO;

export const isDatabaseType = (input: string): input is DatabaseType => {
    switch(input) {
    case DATABASE_TYPE_PRESTO:
        return true;
    default:
        return false;
    }
};

export type SerializedConnection = PrestoSerializedConnection;

export interface PrestoSerializedConnection {
    type: typeof DATABASE_TYPE_PRESTO;
    data: {
        url: string;
        name: string;
        password: string;
        user: string;
        ssl: boolean;
    };
}

export interface Connection<T extends SerializedConnection> {
    execute(query: string): Promise<string>;
    serialize(): T;
    showDatabases(): Promise<string[]>;
    showTables(database: string): Promise<string[]>;
}
