import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig, dbConfig, llmConfig } from './config';
import { DatabaseModule } from './modules/database';
import { AgentsModule } from './modules/agents';
import { QueryModule } from './modules/query';
import { SharedModule } from './shared/shared.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, llmConfig],
    }),
    DatabaseModule,
    AgentsModule,
    QueryModule,
    SharedModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
