import { Catch } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { ForbiddenException } from '../exceptions';

import { BaseHttpExceptionFilter } from './configs/base.exception.filter';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter extends BaseHttpExceptionFilter<ForbiddenException> {
    constructor(httpAdapterHost: HttpAdapterHost) {
        super(httpAdapterHost, ForbiddenExceptionFilter.name);
    }

    protected createResponseBody(exception: ForbiddenException) {
        return {
            ...exception.generateHttpResponseBody(),
        };
    }
}
