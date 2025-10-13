import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { WeaviateSchemaService } from './weaviate.schema';
import { DatabaseSeeder } from './database.seeder';

@Module({
    providers: [DatabaseService, WeaviateSchemaService, DatabaseSeeder],
    exports: [DatabaseService, WeaviateSchemaService, DatabaseSeeder],
})
export class DatabaseModule {}

