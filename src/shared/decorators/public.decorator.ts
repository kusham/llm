import { SetMetadata, applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks an endpoint as public (bypassing authentication guards).
 *
 * @returns A metadata decorator that sets the `isPublic` flag to `true`.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Applies both `Public` and `Throttle` decorators.
 *
 * This decorator:
 * - Marks an endpoint as public (no authentication required).
 * - Limits the number of requests to prevent abuse (rate limiting).
 *
 * @param {number} limit - Maximum allowed requests within the TTL window (default: 10).
 * @param {number} ttl - Time window in seconds for rate limiting (default: 60s).
 * @returns A combined decorator applying both `Public` and `Throttle`.
 */
export const PublicThrottle = (limit = 10, ttl = 60) =>
    applyDecorators(Public(), Throttle({ default: { limit, ttl } }));
