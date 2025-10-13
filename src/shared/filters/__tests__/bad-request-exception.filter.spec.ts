import { ArgumentsHost } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { BadRequestException } from '../../exceptions';
import { BadRequestExceptionFilter } from '../bad-request-exception.filter';

describe('BadRequestExceptionFilter', () => {
    let filter: BadRequestExceptionFilter;
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

        filter = new BadRequestExceptionFilter(mockHttpAdapterHost);

        mockHost = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({ id: 'trace-id-123' }),
                getResponse: jest.fn().mockReturnValue('mock-response'),
            }),
        } as unknown as ArgumentsHost;
    });

    it('should call httpAdapter.reply with correct response', () => {
        const mockException = new BadRequestException({
            message: 'Test message',
            code: 4001,
            description: 'A test error',
        });

        filter.catch(mockException, mockHost);

        expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
            'mock-response',
            mockException.generateHttpResponseBody(),
            mockException.getStatus(),
        );
    });

    it('should create correct response body from exception', () => {
        const mockException = new BadRequestException({
            message: 'Custom message',
            code: 4002,
            description: 'Another test error',
        });

        const body = filter['createResponseBody'](mockException);
        expect(body).toEqual(mockException.generateHttpResponseBody());
    });
});
