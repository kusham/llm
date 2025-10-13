import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database';
import { SharedModule } from '../../shared/shared.module';
import { DelegatingAgent } from './delegating.agent';
import { RAGAgent } from './rag.agent';
import { ChartTool } from './tools';

@Module({
    imports: [DatabaseModule, SharedModule],
    providers: [DelegatingAgent, RAGAgent, ChartTool],
    exports: [DelegatingAgent, RAGAgent, ChartTool],
})
export class AgentsModule {}

