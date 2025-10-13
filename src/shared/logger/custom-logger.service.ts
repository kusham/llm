import {
    LoggerService,
    LoggerService as NestLoggerService,
} from '@nestjs/common';

export class CustomLogger implements NestLoggerService {
    private readonly logger: LoggerService;

    constructor(logger: LoggerService) {
        this.logger = logger;
    }

    log(message: string, context?: string): void {
        this.logger.log(message, { context });
    }

    error(message: string, error?: Error, context?: string): void {
        if (error) {
            this.logger.error(message, error.stack, { context });
        } else {
            this.logger.error(message, { context });
        }
    }

    warn(message: string, context?: string): void {
        this.logger.warn(message, { context });
    }

    debug(message: string, context?: string): void {
        if (this.logger.debug) {
            this.logger.debug(message, { context });
        }
    }

    verbose(message: string, context?: string): void {
        if (this.logger.verbose) {
            this.logger.verbose(message, { context });
        }
    }
}
