/**
 * A custom exception that represents a BadRequest error.
 */
import { HttpStatus } from '@nestjs/common';

import { ExceptionConstants } from '../constants';
import {
    IException,
    IHttpBadRequestExceptionResponse,
} from '../interfaces';

import { BaseHttpException } from './configs';

export class BadRequestException extends BaseHttpException<IHttpBadRequestExceptionResponse> {
    constructor(exception: IException) {
        super(exception, HttpStatus.BAD_REQUEST);
    }

    generateHttpResponseBody(
        message?: string,
    ): IHttpBadRequestExceptionResponse {
        return {
            code: this.code,
            message: message || this.message,
            description: this.description,
            timestamp: this.timestamp,
            traceId: this.traceId,
        };
    }

    static HTTP_REQUEST_TIMEOUT = () => {
        return new BadRequestException({
            message: 'HTTP Request Timeout',
            code: ExceptionConstants.BadRequestCodes.HTTP_REQUEST_TIMEOUT,
        });
    };

    static RESOURCE_ALREADY_EXISTS = (msg?: string) => {
        return new BadRequestException({
            message: msg || 'Resource Already Exists',
            code: ExceptionConstants.BadRequestCodes.RESOURCE_ALREADY_EXISTS,
        });
    };

    static RESOURCE_NOT_FOUND = (msg?: string) => {
        return new BadRequestException({
            message: msg || 'Resource Not Found',
            code: ExceptionConstants.BadRequestCodes.RESOURCE_NOT_FOUND,
        });
    };

    static VALIDATION_ERROR = (msg?: string) => {
        return new BadRequestException({
            message: msg || 'Validation Error',
            code: ExceptionConstants.BadRequestCodes.VALIDATION_ERROR,
        });
    };

    static UNEXPECTED = (msg?: string) => {
        return new BadRequestException({
            message: msg || 'Unexpected Error',
            code: ExceptionConstants.BadRequestCodes.UNEXPECTED_ERROR,
        });
    };

    static INVALID_INPUT = (msg?: string) => {
        return new BadRequestException({
            message: msg || 'Invalid Input',
            code: ExceptionConstants.BadRequestCodes.INVALID_INPUT,
        });
    };
}
