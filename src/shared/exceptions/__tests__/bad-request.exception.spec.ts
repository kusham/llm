import { HttpStatus } from '@nestjs/common';

import { ExceptionConstants } from '../../constants';
import { BadRequestException } from '../bad-request.exception';

describe('BadRequestException', () => {
    const baseExceptionData = {
        message: 'Test Error Message',
        code: 1001,
        description: 'Test description',
        cause: new Error('cause'),
    };

    it('should set all fields correctly in constructor', () => {
        const exception = new BadRequestException(baseExceptionData);

        expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(exception.message).toBe(baseExceptionData.message);
        expect(exception.code).toBe(baseExceptionData.code);
        expect(exception.description).toBe(baseExceptionData.description);
        expect(exception.timestamp).toBeDefined();
    });

    it('should generate correct response body with generateHttpResponseBody()', () => {
        const exception = new BadRequestException(baseExceptionData);
        exception.setTraceId('123-trace-id');

        const response = exception.generateHttpResponseBody();

        expect(response).toEqual({
            code: baseExceptionData.code,
            message: baseExceptionData.message,
            description: baseExceptionData.description,
            timestamp: exception.timestamp,
            traceId: '123-trace-id',
        });
    });

    describe('static methods', () => {
        it('HTTP_REQUEST_TIMEOUT should return correct exception', () => {
            const exception = BadRequestException.HTTP_REQUEST_TIMEOUT();
            expect(exception.code).toBe(
                ExceptionConstants.BadRequestCodes.HTTP_REQUEST_TIMEOUT,
            );
            expect(exception.message).toBe('HTTP Request Timeout');
        });

        it('RESOURCE_ALREADY_EXISTS should return correct exception', () => {
            const exception = BadRequestException.RESOURCE_ALREADY_EXISTS();
            expect(exception.code).toBe(
                ExceptionConstants.BadRequestCodes.RESOURCE_ALREADY_EXISTS,
            );
            expect(exception.message).toBe('Resource Already Exists');
        });

        it('RESOURCE_NOT_FOUND should return correct exception', () => {
            const exception = BadRequestException.RESOURCE_NOT_FOUND();
            expect(exception.code).toBe(
                ExceptionConstants.BadRequestCodes.RESOURCE_NOT_FOUND,
            );
            expect(exception.message).toBe('Resource Not Found');
        });

        it('VALIDATION_ERROR should return correct exception', () => {
            const exception = BadRequestException.VALIDATION_ERROR(
                'Custom Validation Message',
            );
            expect(exception.code).toBe(
                ExceptionConstants.BadRequestCodes.VALIDATION_ERROR,
            );
            expect(exception.message).toBe('Custom Validation Message');
        });

        it('UNEXPECTED should return correct exception', () => {
            const exception = BadRequestException.UNEXPECTED();
            expect(exception.code).toBe(
                ExceptionConstants.BadRequestCodes.UNEXPECTED_ERROR,
            );
            expect(exception.message).toBe('Unexpected Error');
        });

        it('INVALID_INPUT should return correct exception', () => {
            const exception = BadRequestException.INVALID_INPUT('Invalid!');
            expect(exception.code).toBe(
                ExceptionConstants.BadRequestCodes.INVALID_INPUT,
            );
            expect(exception.message).toBe('Invalid!');
        });
    });
});
