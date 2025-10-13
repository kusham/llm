import { LoggerService } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';

export class LoggerFactory {
  static createLogger(): LoggerService {
    const loggerType = process.env.LOGGER ?? 'console';

    switch (loggerType.toLowerCase()) {
      default:
        return WinstonModule.createLogger({
          transports: [new winston.transports.Console()],
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            process.env.NODE_ENV === 'development'
              ? winston.format.prettyPrint()
              : winston.format.json(),
          ),
        });
    }
  }
}
