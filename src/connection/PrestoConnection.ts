/* eslint-disable @typescript-eslint/naming-convention */
import fetch, {Response} from "node-fetch";
import {Disposable} from "vscode";
import {Connection, DATABASE_TYPE_PRESTO, PrestoSerializedConnection} from "../types";

export class PrestoConnection implements Connection<PrestoSerializedConnection>, Disposable {
    private readonly connection: PrestoSerializedConnection["data"];
    private readonly executor: PrestoQueryExecutor;

    constructor(serializedConnection: PrestoSerializedConnection, executor: PrestoQueryExecutor) {
        this.connection = serializedConnection.data;
        this.executor = executor;
    };

    dispose(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async execute(query: string): Promise<string> {
        return this.executor.execute(query);
    }

    serialize(): PrestoSerializedConnection {
        return {
            type: DATABASE_TYPE_PRESTO,
            data: this.connection,
        };
    }

    async showDatabases(): Promise<string[]> {
        return [await this.execute("SHOW CATALOGS")];
    }

    async showTables(database: string): Promise<string[]> {
        return [await this.execute(`SHOW TABLES FROM ${database}`)];
    }

    static async init(connectionView: PrestoSerializedConnection): Promise<PrestoConnection> {
        const executor = new PrestoQueryExecutor(connectionView);
        const _response = executor.execute("SHOW CATALOGS;");
        return new PrestoConnection(connectionView, executor);
    }
}

class PrestoQueryExecutor {
    private readonly connection: PrestoSerializedConnection["data"];
    private readonly headers: {[Header in string]: string};
    private readonly domain: string;

    constructor(serializedConnection: PrestoSerializedConnection) {
        this.connection = serializedConnection.data;
        const auth = Buffer.from(this.connection.user + ":" + this.connection.password).toString("base64");
        this.headers = {
            [PrestoHeaders.USER]: this.connection.user,
            [PrestoHeaders.SOURCE]: "vscode/sql-keeper",
            [PrestoHeaders.CATALOG]: "default",
            [PrestoHeaders.SCHEMA]: "default",
            [PrestoHeaders.LANGUAGE]: "en",
            [PrestoHeaders.TRACE_TOKEN]: "asd",
            [PrestoHeaders.ROLE]: "adf",
            [PrestoHeaders.AUTHORIZATION]: `Basic ${auth}`,
        };
        const protocol = this.connection.ssl ? "https://" : "http://";
        this.domain = `${protocol}${this.connection.url}`;
    };

    async execute(query: string): Promise<string> {
        const url = `${this.domain}/v1/statement`;
        let circuitBreaker = 3;
        while (circuitBreaker > 0) {
            const response = await this.raw(url, query);
            const result = <ExecuteResponse><unknown>(await response.text());
            console.dir(result);
            if (result.stats.state === "FINISHED") {
                return result.stats.state;
            }
            circuitBreaker -= 1;
        }
        return "";
        // TODO
        // throw ...
    }

    private async raw(url: string, body: string) : Promise<Response> {
        return fetch(url, {method: "POST", headers: this.headers, body});
    }
}

type ExecuteResponse = ExecuteFinishedResponse | ExecutePendingResponse;

interface ExecuteFinishedResponse {
    id: number;
    columns: string[];
    data: Array<Array<string>>;
    stats: {
        state: "FINISHED";
    };
    error: {
        errorCode: number;
        message: string;
    };
}

interface ExecutePendingResponse {
  nextUri: string;
  stats: {
      state: string;
  };
}

class PrestoHeaders {
    static USER = "X-Presto-User";
    static SOURCE = "X-Presto-Source";
    static CATALOG = "X-Presto-Catalog";
    static LANGUAGE = "X-Presto-Language";
    static SCHEMA = "X-Presto-Schema";
    static TIME_ZONE = "X-Presto-Time-Zone";
    static TRACE_TOKEN = "X-Presto-Trace-Token";
    static CURRENT_STATE = "X-Presto-Current-State";
    static MAX_WAIT = "X-Presto-Max-Wait";
    static MAX_SIZE = "X-Presto-Max-Size";
    static PAGE_SEQUENCE_ID = "X-Presto-Page-Sequence-Id";
    static SESSION = "X-Presto-Session";
    static USER_AGENT = "User-Agent";
    static ROLE: "X-Presto-Role";
    static AUTHORIZATION = "Authorization";
}
