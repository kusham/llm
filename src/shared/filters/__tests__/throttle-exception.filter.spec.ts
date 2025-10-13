import { ArgumentsHost } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { ThrottlerExceptionFilter } from '../throttle-exception.filter';

describe('ThrottlerExceptionFilter', () => {
    let filter: ThrottlerExceptionFilter;

    beforeEach(() => {
        filter = new ThrottlerExceptionFilter();
    });

    it('should return a 429 response with a friendly message', () => {
        const sendMock = jest.fn();
        const codeMock = jest.fn().mockReturnValue({ send: sendMock });

        const mockReply = {
            code: codeMock,
        } as unknown as FastifyReply;

        const getResponseMock = jest.fn().mockReturnValue(mockReply);
        const switchToHttpMock = jest.fn().mockReturnValue({
            getResponse: getResponseMock,
        });

        const mockHost = {
            switchToHttp: switchToHttpMock,
        } as unknown as ArgumentsHost;

        const mockException = {
            name: 'ThrottlerException',
            message: 'Too many requests',
        };

        filter.catch(mockException as any, mockHost);

        expect(codeMock).toHaveBeenCalledWith(429);
        expect(sendMock).toHaveBeenCalledWith({
            statusCode: 429,
            message: 'Too many attempts. Please wait and try again.',
        });
    });
});
