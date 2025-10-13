import { Catch } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { BaseHttpExceptionFilter } from './configs/base.exception.filter';
import { BadRequestException } from '../exceptions';

@Catch(BadRequestException)
export class BadRequestExceptionFilter extends BaseHttpExceptionFilter<BadRequestException> {
  constructor(httpAdapterHost: HttpAdapterHost) {
    super(httpAdapterHost, BadRequestExceptionFilter.name);
  }

  protected createResponseBody(exception: BadRequestException) {
    return {
      ...exception.generateHttpResponseBody(),
    };
  }
}
