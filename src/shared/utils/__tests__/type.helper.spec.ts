import { InternalServerErrorException } from '../../exceptions';
import { fromNullable, requireOneOf, requireValue } from '../type.helper';

describe('Type Helper Utilities', () => {
    describe('fromNullable', () => {
        describe('when value is defined', () => {
            it('should return an Option with the value', () => {
                const option = fromNullable(42);

                expect(() => option.getOrThrow('error')).not.toThrow();
                expect(option.getOrThrow('error')).toBe(42);
            });

            it('should allow chaining with map operations', () => {
                const result = fromNullable(10)
                    .map(x => x * 2)
                    .map(x => x + 5)
                    .getOrThrow('Failed to calculate');

                expect(result).toBe(25); // (10 * 2) + 5 = 25
            });

            it('should handle complex object transformations', () => {
                interface Config {
                    database: {
                        host: string;
                        port: number;
                    };
                }

                const config: Config = {
                    database: {
                        host: 'localhost',
                        port: 5432,
                    },
                };

                const connectionString = fromNullable(config)
                    .map(cfg => cfg.database)
                    .map(db => `${db.host}:${db.port}`)
                    .getOrThrow('Missing database config');

                expect(connectionString).toBe('localhost:5432');
            });

            it('should handle string transformations', () => {
                const result = fromNullable('hello')
                    .map(str => str.toUpperCase())
                    .map(str => str + ' WORLD')
                    .getOrThrow('Failed to transform string');

                expect(result).toBe('HELLO WORLD');
            });

            it('should handle array transformations', () => {
                const result = fromNullable([1, 2, 3])
                    .map(arr => arr.map(x => x * 2))
                    .map(arr => arr.length)
                    .getOrThrow('Failed to process array');

                expect(result).toBe(3);
            });
        });

        describe('when value is undefined', () => {
            it('should throw InternalServerErrorException on getOrThrow', () => {
                const option = fromNullable(undefined);

                expect(() => option.getOrThrow('Value is missing')).toThrow(
                    InternalServerErrorException,
                );
            });

            it('should throw with the provided error message', () => {
                const option = fromNullable(undefined);
                const customMessage = 'Custom error message';

                expect(() => option.getOrThrow(customMessage)).toThrow(
                    customMessage,
                );
            });

            it('should propagate undefined through map operations', () => {
                const option = fromNullable(undefined)
                    .map((x: any) => x * 2)
                    .map((x: any) => x + 5);

                expect(() => option.getOrThrow('Failed')).toThrow(
                    InternalServerErrorException,
                );
            });

            it('should not execute map functions when value is undefined', () => {
                const mockFn = jest.fn();

                fromNullable(undefined).map(mockFn).map(mockFn);

                expect(mockFn).not.toHaveBeenCalled();
            });
        });

        describe('edge cases', () => {
            it('should handle null as a valid value (not undefined)', () => {
                const option = fromNullable(null as any);

                // null is treated as a valid value since it's not undefined
                expect(option.getOrThrow('Null value')).toBe(null);
            });

            it('should handle falsy values correctly (0, false, empty string)', () => {
                // These should be treated as valid values, not undefined
                expect(fromNullable(0).getOrThrow('error')).toBe(0);
                expect(fromNullable(false).getOrThrow('error')).toBe(false);
                expect(fromNullable('').getOrThrow('error')).toBe('');
            });

            it('should handle nested undefined values', () => {
                interface NestedConfig {
                    level1?: {
                        level2?: {
                            value: string;
                        };
                    };
                }

                const config: NestedConfig = { level1: {} };

                expect(() => {
                    fromNullable(config)
                        .map(c => c.level1)
                        .map(l1 => l1!.level2)
                        .map(l2 => l2!.value)
                        .getOrThrow('Nested value missing');
                }).toThrow(InternalServerErrorException);
            });
        });
    });

    describe('requireValue', () => {
        describe('when value is valid', () => {
            it('should return the value unchanged', () => {
                expect(requireValue(42, 'error')).toBe(42);
                expect(requireValue('hello', 'error')).toBe('hello');
                expect(requireValue(true, 'error')).toBe(true);
                expect(requireValue(false, 'error')).toBe(false);
                expect(requireValue(0, 'error')).toBe(0);
            });

            it('should handle objects and arrays', () => {
                const obj = { key: 'value' };
                const arr = [1, 2, 3];

                expect(requireValue(obj, 'error')).toBe(obj);
                expect(requireValue(arr, 'error')).toBe(arr);
            });
        });

        describe('when value is invalid', () => {
            it('should throw InternalServerErrorException for undefined', () => {
                expect(() =>
                    requireValue(undefined, 'Value is undefined'),
                ).toThrow(InternalServerErrorException);
            });

            it('should throw InternalServerErrorException for null', () => {
                expect(() => requireValue(null, 'Value is null')).toThrow(
                    InternalServerErrorException,
                );
            });

            it('should throw InternalServerErrorException for empty string', () => {
                expect(() => requireValue('', 'Value is empty string')).toThrow(
                    InternalServerErrorException,
                );
            });

            it('should throw with the provided error message', () => {
                const customMessage = 'Custom validation error';

                expect(() => requireValue(undefined, customMessage)).toThrow(
                    customMessage,
                );
                expect(() => requireValue(null, customMessage)).toThrow(
                    customMessage,
                );
                expect(() => requireValue('', customMessage)).toThrow(
                    customMessage,
                );
            });
        });

        describe('type safety', () => {
            it('should preserve the original type', () => {
                const numberValue: number | undefined = 42;
                const result = requireValue(numberValue, 'error');

                // TypeScript should infer this as number, not number | undefined
                expect(typeof result).toBe('number');
                expect(result).toBe(42);
            });
        });
    });

    describe('requireOneOf', () => {
        describe('when primary value is valid', () => {
            it('should return primary value and ignore fallback', () => {
                expect(requireOneOf('primary', 'fallback', 'error')).toBe(
                    'primary',
                );
                expect(requireOneOf(42, 100, 'error')).toBe(42);
                expect(requireOneOf(true, false, 'error')).toBe(true);
                expect(requireOneOf(0, 100, 'error')).toBe(0);
            });

            it('should return primary even when fallback is undefined', () => {
                expect(requireOneOf('primary', undefined, 'error')).toBe(
                    'primary',
                );
                expect(requireOneOf(42, null, 'error')).toBe(42);
            });
        });

        describe('when primary is invalid but fallback is valid', () => {
            it('should return fallback value', () => {
                expect(requireOneOf(undefined, 'fallback', 'error')).toBe(
                    'fallback',
                );
                expect(requireOneOf(null, 42, 'error')).toBe(42);
                expect(requireOneOf(undefined, false, 'error')).toBe(false);
                expect(requireOneOf(null, 0, 'error')).toBe(0);
            });
        });

        describe('when both values are invalid', () => {
            it('should throw InternalServerErrorException when both are undefined', () => {
                expect(() =>
                    requireOneOf(undefined, undefined, 'Both values missing'),
                ).toThrow(InternalServerErrorException);
            });

            it('should throw InternalServerErrorException when both are null', () => {
                expect(() =>
                    requireOneOf(null, null, 'Both values null'),
                ).toThrow(InternalServerErrorException);
            });

            it('should throw InternalServerErrorException when one is null and other undefined', () => {
                expect(() =>
                    requireOneOf(undefined, null, 'Both values missing'),
                ).toThrow(InternalServerErrorException);
                expect(() =>
                    requireOneOf(null, undefined, 'Both values missing'),
                ).toThrow(InternalServerErrorException);
            });

            it('should throw with the provided error message', () => {
                const customMessage = 'Custom fallback error';

                expect(() =>
                    requireOneOf(undefined, undefined, customMessage),
                ).toThrow(customMessage);
            });
        });

        describe('edge cases', () => {
            it('should treat empty string as valid value', () => {
                expect(requireOneOf('', 'fallback', 'error')).toBe('');
                expect(requireOneOf(undefined, '', 'error')).toBe('');
            });

            it('should handle complex objects', () => {
                const obj1 = { name: 'primary' };
                const obj2 = { name: 'fallback' };

                expect(requireOneOf(obj1, obj2, 'error')).toBe(obj1);
                expect(requireOneOf(undefined, obj2, 'error')).toBe(obj2);
            });

            it('should work with different types for primary and fallback', () => {
                // TypeScript should handle union types appropriately
                expect(requireOneOf(undefined, 'string', 'error')).toBe(
                    'string',
                );
                expect(requireOneOf(null, 42, 'error')).toBe(42);
            });
        });
    });

    describe('integration tests', () => {
        it('should work together for complex configuration scenarios', () => {
            interface AppConfig {
                database?: {
                    primary?: string;
                    fallback?: string;
                };
            }

            const config: AppConfig = {
                database: {
                    fallback: 'backup-db-url',
                },
            };

            const dbUrl = fromNullable(config)
                .map(c => c.database)
                .map(db =>
                    requireOneOf(
                        db!.primary,
                        db!.fallback,
                        'No database URL configured',
                    ),
                )
                .getOrThrow('Database configuration missing');

            expect(dbUrl).toBe('backup-db-url');
        });

        it('should handle error scenarios in complex chains', () => {
            interface IncompleteConfig {
                database?: {
                    primary?: string;
                    fallback?: string;
                };
            }

            const config: IncompleteConfig = {
                database: {},
            };

            expect(() => {
                fromNullable(config)
                    .map(c => c.database)
                    .map(db =>
                        requireOneOf(
                            db!.primary,
                            db!.fallback,
                            'No database URL configured',
                        ),
                    )
                    .getOrThrow('Database configuration missing');
            }).toThrow('No database URL configured');
        });
    });
});
