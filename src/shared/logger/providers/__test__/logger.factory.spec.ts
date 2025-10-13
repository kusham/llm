import { LoggerService } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';

import { LoggerFactory } from '../logger.factory';
import { SentryLoggerProvider } from '../sentry.provider';

// Mock the dependencies
jest.mock('nest-winston');
jest.mock('winston');
jest.mock('../sentry.provider');

describe('LoggerFactory', () => {
    let mockConsoleLogger: jest.Mocked<LoggerService>;
    let mockSentryLogger: jest.Mocked<SentryLoggerProvider>;
    let originalEnv: string | undefined;

    beforeEach(() => {
        // Store original env
        originalEnv = process.env.LOGGER;

        // Create mock loggers
        mockConsoleLogger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
        };

        mockSentryLogger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        } as unknown as jest.Mocked<SentryLoggerProvider>;

        // Mock WinstonModule.createLogger
        (WinstonModule.createLogger as jest.Mock).mockReturnValue(
            mockConsoleLogger,
        );

        // Mock SentryLoggerProvider constructor
        (
            SentryLoggerProvider as jest.MockedClass<
                typeof SentryLoggerProvider
            >
        ).mockImplementation(() => mockSentryLogger);

        // Mock winston format methods
        const mockFormat = {
            combine: jest.fn().mockReturnValue('combined-format'),
            timestamp: jest.fn().mockReturnValue('timestamp-format'),
            errors: jest.fn().mockReturnValue('errors-format'),
            prettyPrint: jest.fn().mockReturnValue('pretty-format'),
            json: jest.fn().mockReturnValue('json-format'),
        };
        (winston.format as any) = mockFormat;

        // Mock winston transports
        const mockConsoleTransport = jest.fn();
        (winston.transports as any) = {
            Console: mockConsoleTransport,
        };
    });

    afterEach(() => {
        // Restore original env
        if (originalEnv !== undefined) {
            process.env.LOGGER = originalEnv;
        } else {
            delete process.env.LOGGER;
        }

        jest.clearAllMocks();
    });

    describe('createLogger', () => {
        describe('when LOGGER environment variable is not set', () => {
            beforeEach(() => {
                delete process.env.LOGGER;
            });

            it('should create a console logger with default configuration', () => {
                const result = LoggerFactory.createLogger();

                expect(result).toBe(mockConsoleLogger);
                expect(WinstonModule.createLogger).toHaveBeenCalledWith({
                    transports: [expect.anything()],
                    format: 'combined-format',
                });
            });

            it('should configure winston format correctly', () => {
                LoggerFactory.createLogger();

                expect(winston.format.combine).toHaveBeenCalledWith(
                    'timestamp-format',
                    'errors-format',
                    expect.any(String), // This will be either pretty or json format
                );
                expect(winston.format.timestamp).toHaveBeenCalled();
                expect(winston.format.errors).toHaveBeenCalledWith({
                    stack: true,
                });
            });
        });

        describe('when LOGGER environment variable is set to "console"', () => {
            beforeEach(() => {
                process.env.LOGGER = 'console';
            });

            it('should create a console logger', () => {
                const result = LoggerFactory.createLogger();

                expect(result).toBe(mockConsoleLogger);
                expect(WinstonModule.createLogger).toHaveBeenCalled();
                expect(SentryLoggerProvider).not.toHaveBeenCalled();
            });
        });

        describe('when LOGGER environment variable is set to "CONSOLE" (uppercase)', () => {
            beforeEach(() => {
                process.env.LOGGER = 'CONSOLE';
            });

            it('should create a console logger (case insensitive)', () => {
                const result = LoggerFactory.createLogger();

                expect(result).toBe(mockConsoleLogger);
                expect(WinstonModule.createLogger).toHaveBeenCalled();
                expect(SentryLoggerProvider).not.toHaveBeenCalled();
            });
        });

        describe('when LOGGER environment variable is set to "sentry"', () => {
            beforeEach(() => {
                process.env.LOGGER = 'sentry';
            });

            it('should create a Sentry logger', () => {
                const result = LoggerFactory.createLogger();

                expect(result).toBe(mockSentryLogger);
                expect(SentryLoggerProvider).toHaveBeenCalled();
                expect(WinstonModule.createLogger).not.toHaveBeenCalled();
            });
        });

        describe('when LOGGER environment variable is set to "SENTRY" (uppercase)', () => {
            beforeEach(() => {
                process.env.LOGGER = 'SENTRY';
            });

            it('should create a Sentry logger (case insensitive)', () => {
                const result = LoggerFactory.createLogger();

                expect(result).toBe(mockSentryLogger);
                expect(SentryLoggerProvider).toHaveBeenCalled();
                expect(WinstonModule.createLogger).not.toHaveBeenCalled();
            });
        });

        describe('when LOGGER environment variable is set to unknown value', () => {
            beforeEach(() => {
                process.env.LOGGER = 'unknown-logger';
            });

            it('should default to console logger', () => {
                const result = LoggerFactory.createLogger();

                expect(result).toBe(mockConsoleLogger);
                expect(WinstonModule.createLogger).toHaveBeenCalled();
                expect(SentryLoggerProvider).not.toHaveBeenCalled();
            });
        });

        describe('winston configuration based on NODE_ENV', () => {
            let originalNodeEnv: string | undefined;

            beforeEach(() => {
                originalNodeEnv = process.env.NODE_ENV;
                delete process.env.LOGGER; // Use default console logger
            });

            afterEach(() => {
                if (originalNodeEnv !== undefined) {
                    process.env.NODE_ENV = originalNodeEnv;
                } else {
                    delete process.env.NODE_ENV;
                }
            });

            it('should use prettyPrint format in development environment', () => {
                process.env.NODE_ENV = 'development';

                LoggerFactory.createLogger();

                expect(winston.format.combine).toHaveBeenCalledWith(
                    'timestamp-format',
                    'errors-format',
                    'pretty-format',
                );
                expect(winston.format.prettyPrint).toHaveBeenCalled();
                expect(winston.format.json).not.toHaveBeenCalled();
            });

            it('should use json format in production environment', () => {
                process.env.NODE_ENV = 'production';

                LoggerFactory.createLogger();

                expect(winston.format.combine).toHaveBeenCalledWith(
                    'timestamp-format',
                    'errors-format',
                    'json-format',
                );
                expect(winston.format.json).toHaveBeenCalled();
                expect(winston.format.prettyPrint).not.toHaveBeenCalled();
            });

            it('should use json format when NODE_ENV is not development', () => {
                process.env.NODE_ENV = 'test';

                LoggerFactory.createLogger();

                expect(winston.format.combine).toHaveBeenCalledWith(
                    'timestamp-format',
                    'errors-format',
                    'json-format',
                );
                expect(winston.format.json).toHaveBeenCalled();
                expect(winston.format.prettyPrint).not.toHaveBeenCalled();
            });
        });
    });

    describe('static class behavior', () => {
        it('should not require instantiation', () => {
            expect(() => LoggerFactory.createLogger()).not.toThrow();
        });

        it('should return a LoggerService instance', () => {
            const logger = LoggerFactory.createLogger();

            expect(logger).toBeDefined();
            expect(typeof logger.log).toBe('function');
            expect(typeof logger.error).toBe('function');
            expect(typeof logger.warn).toBe('function');
            expect(typeof logger.debug).toBe('function');
        });
    });
});
