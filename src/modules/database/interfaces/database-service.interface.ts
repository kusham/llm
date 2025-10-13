import { WeaviateClient } from 'weaviate-client';

export interface IDatabaseService {
    /**
     * Establishes connection to Weaviate instance
     */
    connect(): Promise<void>;

    /**
     * Returns the Weaviate client instance
     */
    getClient(): WeaviateClient;

    /**
     * Checks if Weaviate is ready and responding
     */
    isReady(): Promise<boolean>;
}

