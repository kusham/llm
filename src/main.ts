import fastifyCsrf from '@fastify/csrf-protection';
import helmet from '@fastify/helmet';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { CONFIG_NAMESPACES } from './shared/constants';
import { ThrottlerExceptionFilter } from './shared/filters';
import { IAppConfig } from './shared/interfaces';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { fromNullable } from './shared/utils';
import { CustomLogger, LoggerFactory } from './shared/logger';

async function bootstrap() {
  // Instance of NestApplication with fastify as the HTTP provider
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    {
      logger: new CustomLogger(LoggerFactory.createLogger()),
    },
  );

  // global filters
  app.useGlobalFilters(new ThrottlerExceptionFilter());

  // cors configuration
  app.enableCors({
    origin: ['*'],
    methods: '*',

    allowedHeaders: '*',
  });

  const { port, host } = fromNullable(
    app.get(ConfigService).get<IAppConfig>(CONFIG_NAMESPACES.APP),
  ).getOrThrow('App config is missing');

  // Uri versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
  });

  app.setGlobalPrefix('api');

  // CSRF protection
  await app.register(fastifyCsrf as any);

  // apply global payload validation
  // NOTE:: migrate to Using APP_PIPE as a Provider if needed in future.
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Register helmet for security headers
  await app.register(helmet as any, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  });

  // Configure Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Docs')
    .setDescription(
      'API documentation for this backend. This API provides endpoints for platform authentication, user, and core entity management. The API leverages JWT tokens for authorization and provides schema definitions for all core resources.',
    )
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      in: 'header',
    })
    .setExternalDoc('OpenAPI JSON', '/api/v1/doc-json')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/v1/doc', app, swaggerDocument, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(port, host);
}

void bootstrap();
