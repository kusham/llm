/**
 * LLM Decision Types
 * Represents the possible decisions the LLM can make when analyzing a query
 */
export enum LLMDecision {
    /**
     * Generate a chart/visualization
     */
    CHART = 'chart',

    /**
     * Retrieve information from RAG (Retrieval-Augmented Generation)
     */
    RAG = 'rag',

    /**
     * Provide a direct answer without tools
     */
    DIRECT = 'direct',

    /**
     * Use both chart and RAG tools
     */
    BOTH = 'both',
}

