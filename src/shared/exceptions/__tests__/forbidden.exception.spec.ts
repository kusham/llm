import { HttpStatus } from '@nestjs/common';

import { ExceptionConstants } from '../../constants';
import { ForbiddenException } from '../forbidden.exception';

describe('ForbiddenException', () => {
    const baseExceptionData = {
        message: 'Forbidden Error',
        code: 2001,
        description: 'Forbidden action attempted',
        cause: new Error('some cause'),
    };

    it('should initialize with all required fields', () => {
        const exception = new ForbiddenException(baseExceptionData);

        expect(exception.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(exception.message).toBe(baseExceptionData.message);
        expect(exception.code).toBe(baseExceptionData.code);
        expect(exception.description).toBe(baseExceptionData.description);
        expect(exception.timestamp).toBeDefined();
    });

    it('should generate correct response body', () => {
        const exception = new ForbiddenException(baseExceptionData);
        exception.setTraceId('trace-id-456');

        const response = exception.generateHttpResponseBody();

        expect(response).toEqual({
            code: baseExceptionData.code,
            message: baseExceptionData.message,
            description: baseExceptionData.description,
            timestamp: exception.timestamp,
            traceId: 'trace-id-456',
        });
    });

    describe('static methods', () => {
        it('FORBIDDEN should return correct exception', () => {
            const exception = ForbiddenException.FORBIDDEN();
            expect(exception.code).toBe(
                ExceptionConstants.ForbiddenCodes.FORBIDDEN,
            );
            expect(exception.message).toBe(
                'Access to this resource is forbidden.',
            );
        });

        it('MISSING_PERMISSIONS should return correct exception', () => {
            const exception = ForbiddenException.MISSING_PERMISSIONS();
            expect(exception.code).toBe(
                ExceptionConstants.ForbiddenCodes.MISSING_PERMISSIONS,
            );
            expect(exception.message).toBe(
                'You do not have permission to perform this action.',
            );
        });

        it('TEMPORARY_LOCK should return correct exception', () => {
            const exception = ForbiddenException.TEMPORARY_LOCK();
            expect(exception.code).toBe(
                ExceptionConstants.ForbiddenCodes.USER_TEMPORARY_LOCK,
            );
            expect(exception.message).toBe(
                'Your account is locked. Please retry after 5 minutes.',
            );
        });

        it('TOO_MANY_SESSIONS should return correct exception', () => {
            const exception = ForbiddenException.TOO_MANY_SESSIONS('Too many!');
            expect(exception.code).toBe(
                ExceptionConstants.ForbiddenCodes.TOO_MANY_SESSIONS,
            );
            expect(exception.message).toBe('Too many!');
        });
    });
});
