import { ArgumentsHost } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { InternalServerErrorException } from '../../exceptions';
import { InternalServerErrorExceptionFilter } from '../internal-server-error-exception.filter';

describe('InternalServerErrorExceptionFilter', () => {
    let filter: InternalServerErrorExceptionFilter;
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

        filter = new InternalServerErrorExceptionFilter(mockHttpAdapterHost);

        mockHost = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({ id: 'trace-id-789' }),
                getResponse: jest.fn().mockReturnValue('mock-response'),
            }),
        } as unknown as ArgumentsHost;
    });

    it('should call httpAdapter.reply with the correct response', () => {
        const mockException = new InternalServerErrorException({
            message: 'Internal server failure',
            code: 5001,
            description: 'Something broke internally',
        });

        filter.catch(mockException, mockHost);

        expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
            'mock-response',
            mockException.generateHttpResponseBody(),
            mockException.getStatus(),
        );
    });

    it('should create the correct response body', () => {
        const mockException = new InternalServerErrorException({
            message: 'Unexpected failure',
            code: 5002,
            description: 'This shouldn’t have happened',
        });

        const response = filter['createResponseBody'](mockException);

        expect(response).toEqual(mockException.generateHttpResponseBody());
    });
});
