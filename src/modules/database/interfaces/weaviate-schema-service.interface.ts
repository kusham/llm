export interface IWeaviateSchemaService {
    /**
     * Creates the Weaviate schema with multi-tenancy support
     */
    createSchema(): Promise<void>;

    /**
     * Deletes the Weaviate schema/collection
     */
    deleteSchema(): Promise<void>;

    /**
     * Returns the name of the collection
     */
    getCollectionName(): string;
}

