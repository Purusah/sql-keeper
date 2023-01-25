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

export type SqlConnection = SqlConnectionPresto;

export interface SqlConnectionPresto {
    type: typeof DATABASE_TYPE_PRESTO,
    data: {
        name: string;
        connection: string;
    }
}
