import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { WeaviateSchemaService } from './weaviate.schema';
import { IDatabaseSeeder } from './interfaces';

interface KnowledgeBaseEntry {
    fileId: string;
    question: string;
    answer: string;
}

@Injectable()
export class DatabaseSeeder implements IDatabaseSeeder {
    private readonly logger = new Logger(DatabaseSeeder.name);
    private readonly DEFAULT_TENANT = 'default';

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly schemaService: WeaviateSchemaService,
    ) {}

    async seed(): Promise<void> {
        try {
            const client = this.databaseService.getClient();
            const collectionName = this.schemaService.getCollectionName();

            // Get the collection
            const collection = client.collections.get(collectionName);

            // Create default tenant if not exists
            await this.ensureTenantExists(collectionName, this.DEFAULT_TENANT);

            // Get collection with tenant
            const tenantCollection = collection.withTenant(this.DEFAULT_TENANT);

            // Fictional data entries
            const entries: KnowledgeBaseEntry[] = [
                {
                    fileId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                    question: 'What is the capital of France?',
                    answer: 'The capital of France is Paris. Paris is not only the capital but also the largest city in France, known for its art, culture, and iconic landmarks like the Eiffel Tower.',
                },
                {
                    fileId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                    question: 'How does photosynthesis work?',
                    answer: 'Photosynthesis is the process by which plants convert light energy into chemical energy. Plants use sunlight, water, and carbon dioxide to produce glucose and oxygen. This process occurs primarily in the chloroplasts of plant cells.',
                },
                {
                    fileId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                    question: 'What are the benefits of regular exercise?',
                    answer: 'Regular exercise provides numerous benefits including improved cardiovascular health, stronger muscles and bones, better mental health, weight management, reduced risk of chronic diseases, and increased energy levels.',
                },
                {
                    fileId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                    question: 'What is artificial intelligence?',
                    answer: 'Artificial Intelligence (AI) is the simulation of human intelligence processes by machines, especially computer systems. These processes include learning, reasoning, problem-solving, perception, and language understanding.',
                },
                {
                    fileId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                    question: 'How do vaccines work?',
                    answer: 'Vaccines work by training the immune system to recognize and combat pathogens. They introduce a weakened or inactive form of a pathogen, which prompts the immune system to produce antibodies without causing the disease itself.',
                },
            ];

            // Insert entries
            const insertPromises = entries.map((entry) =>
                tenantCollection.data.insert({
                    properties: {
                        fileId: entry.fileId,
                        question: entry.question,
                        answer: entry.answer,
                    },
                }),
            );

            await Promise.all(insertPromises);

            this.logger.log(
                `Successfully seeded ${entries.length} entries into tenant "${this.DEFAULT_TENANT}"`,
            );
        } catch (error) {
            this.logger.error('Failed to seed data', error);
            throw error;
        }
    }

    private async ensureTenantExists(
        collectionName: string,
        tenantName: string,
    ): Promise<void> {
        try {
            const client = this.databaseService.getClient();
            const collection = client.collections.get(collectionName);

            // Try to create tenant (will fail silently if already exists)
            await collection.tenants.create([{ name: tenantName }]);

            this.logger.log(`Tenant "${tenantName}" is ready`);
        } catch (error) {
            // Tenant might already exist, which is fine
            this.logger.debug(
                `Tenant "${tenantName}" may already exist or error occurred`,
                error,
            );
        }
    }

    async clearData(): Promise<void> {
        try {
            const client = this.databaseService.getClient();
            const collectionName = this.schemaService.getCollectionName();
            const collection = client.collections.get(collectionName);

            // Delete tenant data
            await collection.tenants.remove([this.DEFAULT_TENANT]);

            this.logger.log(
                `Successfully cleared data for tenant "${this.DEFAULT_TENANT}"`,
            );
        } catch (error) {
            this.logger.error('Failed to clear data', error);
            throw error;
        }
    }
}

