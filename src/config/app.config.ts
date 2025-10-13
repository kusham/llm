/**
 * @fileOverview - uses to define independent custom configurations
 * using nest namespaces
 */
import { registerAs } from '@nestjs/config';

import { CONFIG_NAMESPACES } from '../shared/constants';
import { IAppConfig } from '../shared/interfaces';

export default registerAs(
  CONFIG_NAMESPACES.APP,
  (): IAppConfig => ({
    env: process.env.APP_ENV!,
    port: +process.env.PORT! || 3000,
    host: process.env.HOST!,
  }),
);
