/**
 * A custom exception that represents a Unauthorized error.
 */
import { HttpStatus } from '@nestjs/common';

import {
    IException,
    IHttpUnauthorizedExceptionResponse,
} from '../interfaces';

import { BaseHttpException } from './configs';
import { ExceptionConstants } from '../constants';

export class UnauthorizedException extends BaseHttpException<IHttpUnauthorizedExceptionResponse> {
    constructor(exception: IException) {
        super(exception, HttpStatus.UNAUTHORIZED);
    }

    generateHttpResponseBody(
        message?: string,
    ): IHttpUnauthorizedExceptionResponse {
        return {
            code: this.code,
            message: message || this.message,
            description: this.description,
            timestamp: this.timestamp,
            traceId: this.traceId,
        };
    }

    static TOKEN_EXPIRED_ERROR = (msg?: string) => {
        return new UnauthorizedException({
            message: msg || 'The authentication token provided has expired.',
            code: ExceptionConstants.UnauthorizedCodes.TOKEN_EXPIRED_ERROR,
        });
    };

    static JSON_WEB_TOKEN_ERROR = (msg?: string) => {
        return new UnauthorizedException({
            message: msg || 'Invalid token specified.',
            code: ExceptionConstants.UnauthorizedCodes.JSON_WEB_TOKEN_ERROR,
        });
    };

    static UNAUTHORIZED_ACCESS = (description?: string) => {
        return new UnauthorizedException({
            message: 'Access to the requested resource is unauthorized.',
            code: ExceptionConstants.UnauthorizedCodes.UNAUTHORIZED_ACCESS,
            description,
        });
    };

    static RESOURCE_NOT_FOUND = (msg?: string) => {
        return new UnauthorizedException({
            message: msg || 'Resource Not Found',
            code: ExceptionConstants.UnauthorizedCodes.RESOURCE_NOT_FOUND,
        });
    };

    static USER_NOT_VERIFIED = (msg?: string) => {
        return new UnauthorizedException({
            message:
                msg ||
                'User not verified. Please complete verification process before attempting this action.',
            code: ExceptionConstants.UnauthorizedCodes.USER_NOT_VERIFIED,
        });
    };

    static UNEXPECTED_ERROR = (msg?: string) => {
        return new UnauthorizedException({
            message:
                msg ||
                'An unexpected error occurred while processing the request. Please try again later.',
            code: ExceptionConstants.UnauthorizedCodes.UNEXPECTED_ERROR,
        });
    };

    static REQUIRED_RE_AUTHENTICATION = (msg?: string) => {
        return new UnauthorizedException({
            message:
                msg ||
                'Your previous login session has been terminated due to a password change or reset. Please log in again with your new password.',
            code: ExceptionConstants.UnauthorizedCodes
                .REQUIRED_RE_AUTHENTICATION,
        });
    };

    static INVALID_CREDENTIALS = (msg?: string) => {
        return new UnauthorizedException({
            message: msg || 'Username or password incorrect',
            code: ExceptionConstants.UnauthorizedCodes.INVALID_CREDENTIALS,
        });
    };
}
