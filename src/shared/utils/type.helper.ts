import { InternalServerErrorException } from '../exceptions';
/**
 * A minimal functional utility to safely handle nullable values using an Option-like pattern.
 *
 * This provides a wrapper around potentially undefined values, allowing safe chaining
 * with `map` and fail-fast unwrapping with `getOrThrow`.
 *
 * Example:
 *   const region = fromNullable(configService.get('AWS'))
 *     .map(cfg => cfg.cognito)
 *     .map(cognito => cognito.region)
 *     .getOrThrow('Missing region in AWS config');
 *
 * Throws a standardized InternalServerErrorException if the value is missing.
 */
type Option<T> = {
    map<U>(fn: (val: T) => U): Option<U>;
    getOrThrow(error: string): T;
};

export function fromNullable<T>(value: T | undefined): Option<T> {
    return {
        map: fn => fromNullable(value !== undefined ? fn(value) : undefined),
        getOrThrow: error => {
            if (value === undefined)
                throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
            return value;
        },
    };
}

/**
 * Ensures a value is defined and non-empty (truthy), otherwise throws an exception.
 *
 * @param value - The value to check.
 * @param message - Error message to throw if value is missing.
 * @returns The value if defined.
 * @throws InternalServerErrorException if value is undefined or falsy.
 */
export function requireValue<T>(
    value: T | undefined | null,
    message: string,
): T {
    if (value === undefined || value === null || value === '') {
        throw InternalServerErrorException.INTERNAL_SERVER_ERROR(message);
    }
    return value;
}

/**
 * Returns the first non-empty value from two options.
 * Throws if both are undefined, null, or empty strings.
 *
 * @param primary - First (preferred) value.
 * @param fallback - Second (fallback) value.
 * @param message - Error message to throw if both are missing.
 * @returns The first truthy value.
 * @throws InternalServerErrorException if both values are missing.
 */
export function requireOneOf<T>(
    primary: T | undefined | null,
    fallback: T | undefined | null,
    message: string,
): T {
    if (primary != null) return primary;
    if (fallback != null) return fallback;
    throw InternalServerErrorException.INTERNAL_SERVER_ERROR(message);
}
