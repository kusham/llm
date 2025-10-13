import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { FastifyReply } from 'fastify';

/**
 * Custom exception filter to handle request rate-limiting (ThrottlerException).
 * This filter catches `ThrottlerException` and returns a user-friendly response
 * when too many requests are made within a short time.
 */
@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
    /**
     * Handles the caught `ThrottlerException` and sends a structured response.
     * @param exception The caught `ThrottlerException`.
     * @param host Provides details about the execution context.
     */
    catch(exception: ThrottlerException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();

        response.code(429).send({
            statusCode: 429,
            message: 'Too many attempts. Please wait and try again.',
        });
    }
}
