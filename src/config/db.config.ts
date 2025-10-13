/**
 * @fileOverview - uses to define independent custom configurations for DB
 * using nest namespaces
 */
import { registerAs } from '@nestjs/config';

import { CONFIG_NAMESPACES } from '../shared/constants';
import { IDBConfig } from '../shared/interfaces';

export default registerAs(
    CONFIG_NAMESPACES.DB,
    (): IDBConfig => ({
        host: process.env.DB_HOST!,
        port: +process.env.DB_PORT!,
    }),
);
