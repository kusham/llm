import { LoggerService } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { CustomLogger } from '../custom-logger.service';

describe('CustomLogger', () => {
    let customLogger: CustomLogger;
    let mockLoggerProvider: jest.Mocked<LoggerService>;

    beforeEach(() => {
        mockLoggerProvider = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
        } as jest.Mocked<LoggerService>;

        customLogger = new CustomLogger(mockLoggerProvider);
    });

    describe('log', () => {
        it('should call provider log with message and context', () => {
            const message = 'test message';
            const context = 'TestContext';

            customLogger.log(message, context);

            expect(mockLoggerProvider.log).toHaveBeenCalledWith(message, {
                context,
            });
        });

        it('should call provider log with message and undefined context', () => {
            const message = 'test message';

            customLogger.log(message);

            expect(mockLoggerProvider.log).toHaveBeenCalledWith(message, {
                context: undefined,
            });
        });
    });

    describe('error', () => {
        it('should call provider error with message, error stack and context', () => {
            const message = 'error message';
            const error = new Error('error trace');
            const context = 'ErrorContext';

            customLogger.error(message, error, context);

            expect(mockLoggerProvider.error).toHaveBeenCalledWith(
                message,
                error.stack,
                { context },
            );
        });

        it('should call provider error with message and context when no error provided', () => {
            const message = 'error message';
            const context = 'ErrorContext';

            customLogger.error(message, undefined, context);

            expect(mockLoggerProvider.error).toHaveBeenCalledWith(message, {
                context,
            });
        });

        it('should call provider error with message only when no error or context provided', () => {
            const message = 'error message';

            customLogger.error(message);

            expect(mockLoggerProvider.error).toHaveBeenCalledWith(message, {
                context: undefined,
            });
        });
    });

    describe('warn', () => {
        it('should call provider warn with message and context', () => {
            const message = 'warning message';
            const context = 'WarnContext';

            customLogger.warn(message, context);

            expect(mockLoggerProvider.warn).toHaveBeenCalledWith(message, {
                context,
            });
        });

        it('should call provider warn with message and undefined context', () => {
            const message = 'warning message';

            customLogger.warn(message);

            expect(mockLoggerProvider.warn).toHaveBeenCalledWith(message, {
                context: undefined,
            });
        });
    });

    describe('debug', () => {
        it('should call provider debug with message and context when debug method exists', () => {
            const message = 'debug message';
            const context = 'DebugContext';

            customLogger.debug(message, context);

            expect(mockLoggerProvider.debug).toHaveBeenCalledWith(message, {
                context,
            });
        });

        it('should call provider debug with message and undefined context when debug method exists', () => {
            const message = 'debug message';

            customLogger.debug(message);

            expect(mockLoggerProvider.debug).toHaveBeenCalledWith(message, {
                context: undefined,
            });
        });

        it('should not call provider debug when debug method does not exist', () => {
            const message = 'debug message';
            const context = 'DebugContext';
            delete mockLoggerProvider.debug;

            customLogger.debug(message, context);

            expect(mockLoggerProvider.debug).toBeUndefined();
        });
    });

    describe('verbose', () => {
        it('should call provider verbose with message and context when verbose method exists', () => {
            const message = 'verbose message';
            const context = 'VerboseContext';

            customLogger.verbose(message, context);

            expect(mockLoggerProvider.verbose).toHaveBeenCalledWith(message, {
                context,
            });
        });

        it('should call provider verbose with message and undefined context when verbose method exists', () => {
            const message = 'verbose message';

            customLogger.verbose(message);

            expect(mockLoggerProvider.verbose).toHaveBeenCalledWith(message, {
                context: undefined,
            });
        });

        it('should not call provider verbose when verbose method does not exist', () => {
            const message = 'verbose message';
            const context = 'VerboseContext';
            delete mockLoggerProvider.verbose;

            customLogger.verbose(message, context);

            expect(mockLoggerProvider.verbose).toBeUndefined();
        });
    });
});
