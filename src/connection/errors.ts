export const ERROR_SERVER_BUSY = "ERROR_SERVER_BUSY";

export type ExecutionErrorType = typeof ERROR_SERVER_BUSY;

export class ExecutionError extends Error {
    public readonly type: ExecutionErrorType;
    public message: string;

    constructor(type: ExecutionErrorType, message: string) {
        super(message);
        this.message = message;
        this.type = type;
    }

    static isExecutionError(value: any): value is ExecutionError {
        return value instanceof ExecutionError;
    }

    static new(type: ExecutionErrorType): ExecutionError {
        return new ExecutionError(type, type);
    }
}
