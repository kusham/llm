import { ArgumentsHost } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { UnauthorizedException } from '../../exceptions';
import { UnauthorizedExceptionFilter } from '../unauthorized-exception.filter';

describe('UnauthorizedExceptionFilter', () => {
    let filter: UnauthorizedExceptionFilter;
    let mockHttpAdapterHost: HttpAdapterHost;
    let mockHttpAdapter: any;
    let mockHost: ArgumentsHost;

    beforeEach(() => {
        mockHttpAdapter = {
            reply: jest.fn(),
        };

        mockHttpAdapterHost = {
            httpAdapter: mockHttpAdapter,
        } as unknown as HttpAdapterHost;

        filter = new UnauthorizedExceptionFilter(mockHttpAdapterHost);

        mockHost = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest
                    .fn()
                    .mockReturnValue({ id: 'trace-id-unauth' }),
                getResponse: jest.fn().mockReturnValue('mock-response'),
            }),
        } as unknown as ArgumentsHost;
    });

    it('should call httpAdapter.reply with the correct response', () => {
        const mockException = new UnauthorizedException({
            message: 'Token expired',
            code: 4011,
            description: 'Authentication token is no longer valid',
        });

        filter.catch(mockException, mockHost);

        expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
            'mock-response',
            mockException.generateHttpResponseBody(),
            mockException.getStatus(),
        );
    });

    it('should create the correct response body', () => {
        const mockException = new UnauthorizedException({
            message: 'Invalid credentials',
            code: 4012,
            description: 'Username or password is incorrect',
        });

        const response = filter['createResponseBody'](mockException);

        expect(response).toEqual(mockException.generateHttpResponseBody());
    });
});
