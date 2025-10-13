import { ArgumentsHost } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { ForbiddenException } from '../../exceptions';
import { ForbiddenExceptionFilter } from '../forbidden-exception.filter';

describe('ForbiddenExceptionFilter', () => {
    let filter: ForbiddenExceptionFilter;
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

        filter = new ForbiddenExceptionFilter(mockHttpAdapterHost);

        mockHost = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({ id: 'trace-id-456' }),
                getResponse: jest.fn().mockReturnValue('mock-response'),
            }),
        } as unknown as ArgumentsHost;
    });

    it('should call httpAdapter.reply with correct response', () => {
        const mockException = new ForbiddenException({
            message: 'Forbidden action',
            code: 4031,
            description: 'Access denied',
        });

        filter.catch(mockException, mockHost);

        expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
            'mock-response',
            mockException.generateHttpResponseBody(),
            mockException.getStatus(),
        );
    });

    it('should create correct response body from exception', () => {
        const mockException = new ForbiddenException({
            message: 'Another forbidden error',
            code: 4032,
            description: 'Restricted area',
        });

        const body = filter['createResponseBody'](mockException);
        expect(body).toEqual(mockException.generateHttpResponseBody());
    });
});
