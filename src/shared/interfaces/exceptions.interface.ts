export interface IException {
    message: string;
    code?: number;
    cause?: Error;
    description?: string;
}

export interface IHttpExceptionResponseBase {
    code: number;
    message: string;
    description: string;
    timestamp: string;
    traceId: string;
}

export type IHttpBadRequestExceptionResponse = IHttpExceptionResponseBase;
export type IHttpInternalServerErrorExceptionResponse =
    IHttpExceptionResponseBase;
export type IHttpUnauthorizedExceptionResponse = IHttpExceptionResponseBase;
export type IHttpForbiddenExceptionResponse = IHttpExceptionResponseBase;
export type IHttpTooManyRequestsExceptionResponse = IHttpExceptionResponseBase;
