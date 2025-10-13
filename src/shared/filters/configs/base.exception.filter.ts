import { ArgumentsHost, ExceptionFilter, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyRequest } from 'fastify';

import { BaseHttpException } from './../../exceptions/configs';

export abstract class BaseHttpExceptionFilter<T extends BaseHttpException<any>>
    implements ExceptionFilter<T>
{
    protected readonly logger: Logger;

    constructor(
        protected readonly httpAdapterHost: HttpAdapterHost,
        contextName: string,
    ) {
        this.logger = new Logger(contextName);
    }

    catch(exception: T, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<FastifyRequest>();
        const response = ctx.getResponse<FastifyRequest>();
        const traceId = request.id;
        exception.setTraceId(traceId);
        const responseBody = this.createResponseBody(exception);

        this.logger.verbose(exception);
        httpAdapter.reply(response, responseBody, exception.getStatus());
    }

    // NOTE:: Created this abstract method so we can modify or add custom logic to any exception filters.
    protected abstract createResponseBody(exception: T): unknown;

    // TODO:: If needed add any method here as abstract and call it inside catch method.
    // In that way it will allow us to add more customization to exception filter.
}
