import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryDto {
    @ApiProperty({
        description: 'User query to be processed by the agent system',
        example: 'What is artificial intelligence?',
    })
    @IsString()
    @IsNotEmpty()
    query: string;
}

