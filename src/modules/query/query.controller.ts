import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DelegatingAgent } from '../agents';
import { QueryDto } from './dto';
import { AgentResponse } from '../agents/types';

@ApiTags('Query')
@Controller('query')
export class QueryController {
    constructor(private readonly delegatingAgent: DelegatingAgent) {}

    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Process a query through the agent system',
        description:
            'Sends a query to the delegating agent which will route it to appropriate tools (Chart.js, RAG, or direct answer)',
    })
    @ApiResponse({
        status: 200,
        description: 'Query processed successfully',
        schema: {
            example: {
                answer: 'Here is the information you requested...',
                references: {
                    source: 'Weaviate vector database',
                },
                fileIds: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'],
                chartConfig: {
                    type: 'bar',
                    data: {
                        labels: ['A', 'B', 'C'],
                        datasets: [
                            {
                                label: 'Example',
                                data: [10, 20, 30],
                            },
                        ],
                    },
                },
            },
        },
    })
    async processQuery(@Body() queryDto: QueryDto): Promise<AgentResponse> {
        return await this.delegatingAgent.processQuery(queryDto.query);
    }
}

