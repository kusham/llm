import { Catch } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { UnauthorizedException } from '../exceptions';

import { BaseHttpExceptionFilter } from './configs/base.exception.filter';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter extends BaseHttpExceptionFilter<UnauthorizedException> {
    constructor(httpAdapterHost: HttpAdapterHost) {
        super(httpAdapterHost, UnauthorizedExceptionFilter.name);
    }

    protected createResponseBody(exception: UnauthorizedException) {
        return {
            ...exception.generateHttpResponseBody(),
        };
    }
}
