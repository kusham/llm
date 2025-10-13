import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { IWeaviateSchemaService } from './interfaces';

@Injectable()
export class WeaviateSchemaService implements IWeaviateSchemaService {
    private readonly logger = new Logger(WeaviateSchemaService.name);
    private readonly COLLECTION_NAME = 'KnowledgeBase';

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
    ) {}

    async createSchema(): Promise<void> {
        try {
            const client = this.databaseService.getClient();

            // Check if collection already exists
            const exists = await client.collections.exists(
                this.COLLECTION_NAME,
            );

            if (exists) {
                this.logger.log(
                    `Collection "${this.COLLECTION_NAME}" already exists`,
                );
                return;
            }

            // Check if OpenAI API key is available for embeddings
            const openAIKey = this.configService.get<string>('OPENAI_API_KEY');
            const useEmbeddings = !!openAIKey;

            if (useEmbeddings) {
                this.logger.log('Creating collection with OpenAI embeddings');
            } else {
                this.logger.warn(
                    'OPENAI_API_KEY not found. Collection will be created without embeddings.',
                );
            }

            // Create collection with multi-tenancy enabled
            await client.collections.create({
                name: this.COLLECTION_NAME,
                description:
                    'Knowledge base with questions and answers for RAG',
                multiTenancy: {
                    enabled: true,
                },
                vectorizers: useEmbeddings
                    ? ([
                          {
                              name: 'title_vector',
                              vectorizer: {
                                  name: 'text2vec-openai',
                                  config: {
                                      model: 'text-embedding-3-small',
                                  },
                              },
                          },
                      ] as any)
                    : undefined,
                properties: [
                    {
                        name: 'fileId',
                        dataType: 'uuid',
                        description: 'Identifier for each file',
                        indexSearchable: false,
                        indexFilterable: true,
                        skipVectorization: true,
                    },
                    {
                        name: 'question',
                        dataType: 'text',
                        description: 'The question being asked',
                        indexSearchable: true,
                        indexFilterable: true,
                    },
                    {
                        name: 'answer',
                        dataType: 'text',
                        description: 'The answer to the question',
                        indexSearchable: true,
                        indexFilterable: true,
                    },
                ],
            });

            // Create default tenant
            const collection = client.collections.get(this.COLLECTION_NAME);
            await collection.tenants.create([{ name: 'default' }]);

            this.logger.log(
                `Successfully created collection "${this.COLLECTION_NAME}" with multi-tenancy and default tenant`,
            );
        } catch (error) {
            this.logger.error('Failed to create schema', error);
            throw error;
        }
    }

    async deleteSchema(): Promise<void> {
        try {
            const client = this.databaseService.getClient();
            await client.collections.delete(this.COLLECTION_NAME);
            this.logger.log(
                `Successfully deleted collection "${this.COLLECTION_NAME}"`,
            );
        } catch (error) {
            this.logger.error('Failed to delete schema', error);
            throw error;
        }
    }

    getCollectionName(): string {
        return this.COLLECTION_NAME;
    }
}

