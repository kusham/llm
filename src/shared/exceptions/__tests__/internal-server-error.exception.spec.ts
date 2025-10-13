import { HttpStatus } from '@nestjs/common';

import { ExceptionConstants } from '../../constants';
import { InternalServerErrorException } from '../internal-server-error.exception';

describe('InternalServerErrorException', () => {
    const baseExceptionData = {
        message: 'Something broke internally',
        code: 5001,
        description: 'Unexpected failure',
        cause: new Error('Low-level system error'),
    };

    it('should initialize with correct values', () => {
        const exception = new InternalServerErrorException(baseExceptionData);

        expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(exception.message).toBe(baseExceptionData.message);
        expect(exception.code).toBe(baseExceptionData.code);
        expect(exception.description).toBe(baseExceptionData.description);
        expect(exception.timestamp).toBeDefined();
    });

    it('should generate a proper response body', () => {
        const exception = new InternalServerErrorException(baseExceptionData);
        exception.setTraceId('trace-999');

        const response = exception.generateHttpResponseBody();

        expect(response).toEqual({
            code: baseExceptionData.code,
            message: baseExceptionData.message,
            description: baseExceptionData.description,
            timestamp: exception.timestamp,
            traceId: 'trace-999',
        });
    });

    describe('static methods', () => {
        it('INTERNAL_SERVER_ERROR should return a generic error', () => {
            const exception =
                InternalServerErrorException.INTERNAL_SERVER_ERROR();
            expect(exception.code).toBe(
                ExceptionConstants.InternalServerErrorCodes
                    .INTERNAL_SERVER_ERROR,
            );
            expect(exception.message).toBe(
                'We are sorry, something went wrong on our end. Please try again later or contact our support team for assistance.',
            );
        });

        it('UNEXPECTED_ERROR should return an unexpected error', () => {
            const exception = InternalServerErrorException.UNEXPECTED_ERROR();
            expect(exception.code).toBe(
                ExceptionConstants.InternalServerErrorCodes.UNEXPECTED_ERROR,
            );
            expect(exception.message).toBe(
                'An unexpected error occurred while processing the request.',
            );
        });

        it('UNEXPECTED_ERROR with custom message', () => {
            const exception = InternalServerErrorException.UNEXPECTED_ERROR(
                'Custom unexpected msg',
            );
            expect(exception.message).toBe('Custom unexpected msg');
        });
    });
});
