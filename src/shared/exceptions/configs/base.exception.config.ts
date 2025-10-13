import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { IException } from '../../interfaces';
export abstract class BaseHttpException<
    TResponse extends Record<string, any>,
> extends HttpException {
    @ApiProperty({ description: 'Error code representing the exception' })
    code: number;

    @ApiProperty({ description: 'Error message' })
    message: string;

    @ApiProperty({ description: 'Detailed description of the error' })
    description: string;

    @ApiProperty({
        description: 'Timestamp when the error occurred',
        format: 'date-time',
    })
    timestamp: string;

    @ApiProperty({
        description: 'Trace ID',
    })
    traceId: string;

    protected constructor(
        exception: IException,
        statusCode: HttpStatus,
        cause?: Error,
    ) {
        super(exception.message, statusCode, {
            cause: cause || exception.cause,
            description: exception.description,
        });

        this.message = exception.message;
        this.description = exception.description ?? '';
        this.code = exception.code ?? 500;
        this.timestamp = new Date().toISOString();
    }

    setTraceId(traceId: string): void {
        this.traceId = traceId;
    }

    abstract generateHttpResponseBody(message?: string): TResponse;
}
