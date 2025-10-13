import { HttpStatus } from '@nestjs/common';

import {
  IException,
  IHttpInternalServerErrorExceptionResponse,
} from '../interfaces';

import { BaseHttpException } from './configs';
import { ExceptionConstants } from '../constants';

export class InternalServerErrorException extends BaseHttpException<IHttpInternalServerErrorExceptionResponse> {
  constructor(exception: IException) {
    super(exception, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  generateHttpResponseBody(
    message?: string,
  ): IHttpInternalServerErrorExceptionResponse {
    return {
      code: this.code,
      message: message || this.message,
      description: this.description,
      timestamp: this.timestamp,
      traceId: this.traceId,
    };
  }

  static INTERNAL_SERVER_ERROR = (msg?: string) => {
    return new InternalServerErrorException({
      message:
        msg ||
        'We are sorry, something went wrong on our end. Please try again later or contact our support team for assistance.',
      code: ExceptionConstants.InternalServerErrorCodes.INTERNAL_SERVER_ERROR,
    });
  };

  static UNEXPECTED_ERROR = (msg?: string) => {
    return new InternalServerErrorException({
      message:
        msg || 'An unexpected error occurred while processing the request.',
      code: ExceptionConstants.InternalServerErrorCodes.UNEXPECTED_ERROR,
    });
  };
}
