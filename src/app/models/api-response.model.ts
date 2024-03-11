export interface ApiResponse<T = unknown> {
    status: number;
    message: string;
    data: T;
    hasError?: boolean;
    methodName?: string;
    errorDetails?: unknown;
    errorType?: string;
}