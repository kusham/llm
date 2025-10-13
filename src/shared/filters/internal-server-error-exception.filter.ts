import { ArgumentsHost, Catch } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { InternalServerErrorException } from '../exceptions';

import { BaseHttpExceptionFilter } from './configs/base.exception.filter';

@Catch(InternalServerErrorException)
export class InternalServerErrorExceptionFilter extends BaseHttpExceptionFilter<InternalServerErrorException> {
    constructor(httpAdapterHost: HttpAdapterHost) {
        super(httpAdapterHost, InternalServerErrorExceptionFilter.name);
    }

    protected createResponseBody(exception: InternalServerErrorException) {
        return {
            ...exception.generateHttpResponseBody(),
        };
    }

    catch(exception: InternalServerErrorException, host: ArgumentsHost): void {
        super.catch(exception, host);
    }
}
