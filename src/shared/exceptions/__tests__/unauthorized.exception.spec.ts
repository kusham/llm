import { HttpStatus } from '@nestjs/common';

import { ExceptionConstants } from '../../constants';
import { UnauthorizedException } from '../unauthorized.exception';

describe('UnauthorizedException', () => {
    const baseData = {
        message: 'Unauthorized access',
        code: 4010,
        description: 'Invalid session',
        cause: new Error('JWT expired'),
    };

    it('should initialize with correct values', () => {
        const exception = new UnauthorizedException(baseData);

        expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(exception.message).toBe(baseData.message);
        expect(exception.code).toBe(baseData.code);
        expect(exception.description).toBe(baseData.description);
        expect(exception.timestamp).toBeDefined();
    });

    it('should generate correct HTTP response body', () => {
        const exception = new UnauthorizedException(baseData);
        exception.setTraceId('trace-abc123');

        const response = exception.generateHttpResponseBody();

        expect(response).toEqual({
            code: baseData.code,
            message: baseData.message,
            description: baseData.description,
            timestamp: exception.timestamp,
            traceId: 'trace-abc123',
        });
    });

    describe('static factory methods', () => {
        it('TOKEN_EXPIRED_ERROR returns default message and code', () => {
            const ex = UnauthorizedException.TOKEN_EXPIRED_ERROR();
            expect(ex.message).toBe(
                'The authentication token provided has expired.',
            );
            expect(ex.code).toBe(
                ExceptionConstants.UnauthorizedCodes.TOKEN_EXPIRED_ERROR,
            );
        });

        it('JSON_WEB_TOKEN_ERROR returns default values', () => {
            const ex = UnauthorizedException.JSON_WEB_TOKEN_ERROR();
            expect(ex.message).toBe('Invalid token specified.');
            expect(ex.code).toBe(
                ExceptionConstants.UnauthorizedCodes.JSON_WEB_TOKEN_ERROR,
            );
        });

        it('UNAUTHORIZED_ACCESS uses default message and optional description', () => {
            const ex =
                UnauthorizedException.UNAUTHORIZED_ACCESS('Detailed reason');
            expect(ex.message).toBe(
                'Access to the requested resource is unauthorized.',
            );
            expect(ex.code).toBe(
                ExceptionConstants.UnauthorizedCodes.UNAUTHORIZED_ACCESS,
            );
            expect(ex.description).toBe('Detailed reason');
        });

        it('RESOURCE_NOT_FOUND returns proper values', () => {
            const ex = UnauthorizedException.RESOURCE_NOT_FOUND();
            expect(ex.message).toBe('Resource Not Found');
            expect(ex.code).toBe(
                ExceptionConstants.UnauthorizedCodes.RESOURCE_NOT_FOUND,
            );
        });

        it('USER_NOT_VERIFIED returns default message', () => {
            const ex = UnauthorizedException.USER_NOT_VERIFIED();
            expect(ex.message).toContain('User not verified');
            expect(ex.code).toBe(
                ExceptionConstants.UnauthorizedCodes.USER_NOT_VERIFIED,
            );
        });

        it('UNEXPECTED_ERROR handles custom message', () => {
            const ex =
                UnauthorizedException.UNEXPECTED_ERROR('Something failed');
            expect(ex.message).toBe('Something failed');
            expect(ex.code).toBe(
                ExceptionConstants.UnauthorizedCodes.UNEXPECTED_ERROR,
            );
        });

        it('REQUIRED_RE_AUTHENTICATION returns default fallback', () => {
            const ex = UnauthorizedException.REQUIRED_RE_AUTHENTICATION();
            expect(ex.message).toContain(
                'Your previous login session has been terminated',
            );
            expect(ex.code).toBe(
                ExceptionConstants.UnauthorizedCodes.REQUIRED_RE_AUTHENTICATION,
            );
        });

        it('INVALID_CREDENTIALS returns proper fallback message', () => {
            const ex = UnauthorizedException.INVALID_CREDENTIALS();
            expect(ex.message).toBe('Username or password incorrect');
            expect(ex.code).toBe(
                ExceptionConstants.UnauthorizedCodes.INVALID_CREDENTIALS,
            );
        });
    });
});
