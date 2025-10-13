import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import weaviate, { WeaviateClient } from 'weaviate-client';
import { IDatabaseService } from './interfaces';
import { IAppConfig, IDBConfig, ILLMConfig } from '../../shared/interfaces';
import { CONFIG_NAMESPACES } from '../../shared/constants';
import { fromNullable } from 'src/shared/utils';

@Injectable()
export class DatabaseService implements IDatabaseService, OnModuleInit {
    private readonly logger = new Logger(DatabaseService.name);
    private client: WeaviateClient;

    constructor(private readonly configService: ConfigService) {}

    async onModuleInit() {
        await this.connect();
    }

    async connect(): Promise<void> {
        try {
            const weaviateConfig =
                this.configService.get<IDBConfig>(CONFIG_NAMESPACES.DB) ||
                {
                    host: 'localhost',
                    port: 8080,
                };

                const { openAIApiKey } = fromNullable(
                    this.configService.get<ILLMConfig>(CONFIG_NAMESPACES.LLM),
                  ).getOrThrow('llm config is missing');


            this.client = await weaviate.connectToLocal({
                host: weaviateConfig.host,
                port: weaviateConfig.port,
                grpcPort: 50051,
                headers: openAIApiKey
                    ? {
                          'X-OpenAI-Api-Key': openAIApiKey,
                      }
                    : undefined,
            });

            this.logger.log(
                `Successfully connected to Weaviate ${openAIApiKey ? '(with OpenAI embeddings)' : '(without embeddings)'}`,
            );
        } catch (error) {
            this.logger.error('Failed to connect to Weaviate', error);
            throw error;
        }
    }

    getClient(): WeaviateClient {
        if (!this.client) {
            throw new Error('Weaviate client not initialized');
        }
        return this.client;
    }

    async isReady(): Promise<boolean> {
        try {
            const response = await this.client.getMeta();
            return !!response;
        } catch (error) {
            this.logger.error('Weaviate is not ready', error);
            return false;
        }
    }
}

