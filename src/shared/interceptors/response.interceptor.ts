import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ResponseMessageKey } from '../decorators';

export class Response<T> {
    statusCode: string;
    message: string;
    data: T;
}

/**
 * Interceptor to modify the response structure.
 * This interceptor:
 * - Retrieves a custom response message set by the `ResponseMessage` decorator.
 * - Modifies the response to include `statusCode`, `message`, and `data`.
 *
 * @typeparam T - The type of the response data.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    constructor(private reflector: Reflector) {}

    /**
     * Intercepts the request-response cycle and modifies the response.
     *
     * @param context The execution context that provides access to the request and response.
     * @param next The next handler in the request pipeline.
     * @returns An observable that returns the modified response structure.
     */
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<Response<T>> {
        const responseMessage: string =
            this.reflector.get<string>(
                ResponseMessageKey,
                context.getHandler(),
            ) ?? '';

        const httpResponse = context
            .switchToHttp()
            .getResponse<Response<T>>().statusCode;

        return next.handle().pipe(
            map((data: T) => ({
                data,
                statusCode: httpResponse,
                message: responseMessage,
            })),
        );
    }
}
