import { LLMDecision } from '../types';

/**
 * Interface for LLM service
 */
export interface ILLMService {
    /**
     * Analyzes a query and determines the appropriate action
     * @param query - User query to analyze
     * @returns Decision on how to handle the query
     */
    analyzeQuery(query: string): Promise<LLMDecision>;

    /**
     * Generates a direct answer for queries that don't need tools
     * @param query - User query
     * @returns Generated answer
     */
    generateDirectAnswer(query: string): Promise<string>;

    /**
     * Summarizes and combines results from multiple tools
     * @param query - Original user query
     * @param ragAnswer - Answer from RAG agent (optional)
     * @param hasChart - Whether a chart was generated
     * @returns Combined summary
     */
    combineResults(
        query: string,
        ragAnswer?: string,
        hasChart?: boolean,
    ): Promise<string>;
}

