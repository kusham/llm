import { FastifyRequest } from 'fastify';

export enum Environment {
    DEVELOPMENT = 'dev',
    QA = 'qa',
    STAGING = 'staging',
    PRODUCTION = 'production',
}

export type Request = FastifyRequest;
