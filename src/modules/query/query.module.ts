import { Module } from '@nestjs/common';
import { QueryController } from './query.controller';
import { AgentsModule } from '../agents';

@Module({
    imports: [AgentsModule],
    controllers: [QueryController],
})
export class QueryModule {}

