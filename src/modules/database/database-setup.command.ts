import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DatabaseService } from './database.service';
import { WeaviateSchemaService } from './weaviate.schema';
import { DatabaseSeeder } from './database.seeder';

async function setupDatabase() {
    console.log('🚀 Starting database setup...');

    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        const databaseService = app.get(DatabaseService);
        const schemaService = app.get(WeaviateSchemaService);
        const seederService = app.get(DatabaseSeeder);

        // Wait for connection
        console.log('⏳ Connecting to Weaviate...');
        await databaseService.connect();

        // Check if ready
        const isReady = await databaseService.isReady();
        if (!isReady) {
            throw new Error('Weaviate is not ready');
        }
        console.log('✅ Connected to Weaviate');

        // Create schema
        console.log('⏳ Creating schema with multi-tenancy...');
        await schemaService.createSchema();
        console.log('✅ Schema created successfully');

        // Seed data
        console.log('⏳ Seeding data...');
        await seederService.seed();
        console.log('✅ Data seeded successfully');

        console.log('🎉 Database setup completed!');
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    } finally {
        await app.close();
    }
}

setupDatabase();

