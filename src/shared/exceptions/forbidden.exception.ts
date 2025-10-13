/**
 * A custom exception that represents a Forbidden error.
 */
import { HttpStatus } from '@nestjs/common';

import { ExceptionConstants } from '../constants';
import { IException, IHttpForbiddenExceptionResponse } from '../interfaces';

import { BaseHttpException } from './configs';

export class ForbiddenException extends BaseHttpException<IHttpForbiddenExceptionResponse> {
    constructor(exception: IException) {
        super(exception, HttpStatus.FORBIDDEN);
    }

    generateHttpResponseBody(
        message?: string,
    ): IHttpForbiddenExceptionResponse {
        return {
            code: this.code,
            message: message || this.message,
            description: this.description,
            timestamp: this.timestamp,
            traceId: this.traceId,
        };
    }

    static FORBIDDEN = (msg?: string) => {
        return new ForbiddenException({
            message: msg || 'Access to this resource is forbidden.',
            code: ExceptionConstants.ForbiddenCodes.FORBIDDEN,
        });
    };

    static MISSING_PERMISSIONS = (msg?: string) => {
        return new ForbiddenException({
            message:
                msg || 'You do not have permission to perform this action.',
            code: ExceptionConstants.ForbiddenCodes.MISSING_PERMISSIONS,
        });
    };

    static TEMPORARY_LOCK = (msg?: string) => {
        return new ForbiddenException({
            message:
                msg || 'Your account is locked. Please retry after 5 minutes.',
            code: ExceptionConstants.ForbiddenCodes.USER_TEMPORARY_LOCK,
        });
    };

    static TOO_MANY_SESSIONS = (msg?: string) => {
        return new ForbiddenException({
            message: msg || 'There are too many sessions',
            code: ExceptionConstants.ForbiddenCodes.TOO_MANY_SESSIONS,
        });
    };
}
