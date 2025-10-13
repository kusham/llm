import { RAGResponse } from '../types';

/**
 * Interface for RAG (Retrieval-Augmented Generation) Agent
 * Retrieves relevant information from vector database
 * Falls back to LLM generation if no relevant data found
 */
export interface IRAGAgent {
    /**
     * Queries the vector database for relevant information
     * If no results found in database, generates answer using LLM
     * @param query - User query to search for
     * @returns Answer with relevant fileIds (empty array if LLM-generated)
     */
    query(query: string): Promise<RAGResponse>;
}

