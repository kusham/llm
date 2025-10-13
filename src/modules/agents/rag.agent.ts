import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database';
import { RAGResponse } from './types';
import { IRAGAgent } from './interfaces';
import type { ILLMService } from '../../shared/services';
import { ILLMConfig } from '../../shared/interfaces';
import { CONFIG_NAMESPACES } from '../../shared/constants';

/**
 * RAG (Retrieval-Augmented Generation) Agent Implementation
 * Retrieves relevant information from Weaviate vector database
 * Falls back to LLM generation if no relevant data found
 * 
 * @implements {IRAGAgent}
 */
@Injectable()
export class RAGAgent implements IRAGAgent {
    private readonly logger = new Logger(RAGAgent.name);
    private readonly COLLECTION_NAME = 'KnowledgeBase';
    private readonly DEFAULT_TENANT = 'default';
    private readonly MAX_RESULTS = 5;
    private readonly MIN_KEYWORD_LENGTH = 3;
    private readonly useEmbeddings: boolean;

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
        @Inject('LLMService')
        private readonly llmService: ILLMService,
    ) {
        // Check if OpenAI API key is available for embeddings
        this.useEmbeddings = !!this.configService.get<ILLMConfig>(CONFIG_NAMESPACES.LLM)?.openAIApiKey;
        
        if (this.useEmbeddings) {
            this.logger.log('RAG Agent initialized with embedding support');
        } else {
            this.logger.warn(
                'RAG Agent initialized without embeddings (keyword matching only)',
            );
        }
    }

    /**
     * Queries the Weaviate vector database and returns relevant answers with fileIds
     * 
     * @remarks
     * This implementation supports two modes:
     * 
     * **WITH Embeddings (OpenAI API key available):**
     * - Uses nearText for semantic search
     * - Finds conceptually similar content
     * - Higher accuracy, understands synonyms
     * 
     * **WITHOUT Embeddings (Fallback):**
     * - Uses fetchObjects API to retrieve all documents
     * - Keyword matching for relevance scoring
     * - Works without external dependencies
     * 
     * @param userQuery - User's question or search query
     * @returns Promise resolving to answer, fileIds, and source
     * @throws Error if database query fails
     * 
     * @example
     * ```typescript
     * const result = await ragAgent.query("What is artificial intelligence?");
     * // Returns: { answer: "...", fileIds: ["uuid"], source: "Weaviate vector database" }
     * ```
     */
    async query(userQuery: string): Promise<RAGResponse> {
        this.logger.log(
            `RAG query initiated: ${userQuery} (embeddings: ${this.useEmbeddings})`,
        );

        try {
            // Validate input
            if (!userQuery || userQuery.trim().length === 0) {
                throw new Error('Query cannot be empty');
            }

            const client = this.databaseService.getClient();
            const collection = client.collections.get(this.COLLECTION_NAME);
            const tenantCollection = collection.withTenant(this.DEFAULT_TENANT);

            let results;

            if (this.useEmbeddings) {
                // Use semantic search with embeddings
                this.logger.debug('Using semantic search (nearText)');
                results = await tenantCollection.query.nearText(userQuery, {
                    limit: this.MAX_RESULTS,
                    returnMetadata: ['distance'],
                });
            } else {
                // Fallback to keyword matching
                this.logger.debug('Using keyword matching (fetchObjects)');
                // results = await tenantCollection.query.fetchObjects({
                //     limit: this.MAX_RESULTS,
                // });
            }

            // Handle empty results - generate answer from LLM
            if (!results?.objects || results?.objects?.length === 0) {
                this.logger.warn('No objects found in knowledge base, generating answer from LLM');
                return await this.generateLLMResponse(userQuery);
            }

            // Build response based on search method
            const response = this.useEmbeddings
                ? this.buildResponseFromSemanticSearch(results.objects)
                : this.buildResponseFromKeywordSearch(
                      results.objects,
                      userQuery,
                  );
            // If no relevant results found, generate answer from LLM
            if (response.fileIds.length === 0) {
                this.logger.warn('No relevant results found, generating answer from LLM');
                return await this.generateLLMResponse(userQuery);
            }
            this.logger.log(
                `RAG query completed: Found ${response.fileIds.length} relevant documents`,
            );

            return response;
        } catch (error) {
            this.logger.error('RAG query failed', error);
            throw new Error(`Failed to query knowledge base: ${error.message}`);
        }
    }


    /**
     * Filters results based on keyword matching
     * 
     * @private
     * @param objects - Raw objects from database
     * @param query - User query
     * @returns Filtered and scored results
     */
    private filterRelevantResults(
        objects: any[],
        query: string,
    ): Array<{ answer: string; fileId: string; score: number }> {
        const queryLower = query.toLowerCase();
        const queryWords = this.extractKeywords(queryLower);

        const scoredResults = objects
            .map((obj) => {
                const properties = obj.properties as any;
                const question = properties.question?.toLowerCase() || '';
                const answer = properties.answer || '';
                const fileId = properties.fileId || '';

                // Calculate relevance score
                const score = this.calculateRelevanceScore(
                    question,
                    queryWords,
                    queryLower,
                );

                return {
                    answer,
                    fileId,
                    score,
                };
            })
            .filter((result) => result.score > 0)
            .sort((a, b) => b.score - a.score);

        // If no matches found, return all results with low score
        if (scoredResults.length === 0) {
            this.logger.debug(
                'No keyword matches found, returning all results',
            );
            return objects.map((obj) => {
                const properties = obj.properties as any;
                return {
                    answer: properties.answer || '',
                    fileId: properties.fileId || '',
                    score: 0,
                };
            });
        }

        return scoredResults;
    }

    /**
     * Extracts meaningful keywords from query
     * 
     * @private
     * @param query - Lowercased query string
     * @returns Array of keywords
     */
    private extractKeywords(query: string): string[] {
        return query
            .split(' ')
            .filter((word) => word.length >= this.MIN_KEYWORD_LENGTH)
            .filter((word) => !this.isStopWord(word));
    }

    /**
     * Checks if word is a stop word
     * 
     * @private
     * @param word - Word to check
     * @returns True if stop word
     */
    private isStopWord(word: string): boolean {
        const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'or'];
        return stopWords.includes(word);
    }

    /**
     * Calculates relevance score for a question
     * 
     * @private
     * @param question - Question from database
     * @param queryWords - Keywords from user query
     * @param fullQuery - Full query string
     * @returns Relevance score (higher is better)
     */
    private calculateRelevanceScore(
        question: string,
        queryWords: string[],
        fullQuery: string,
    ): number {
        let score = 0;

        // Exact match bonus
        if (question.includes(fullQuery)) {
            score += 10;
        }

        // Keyword matches
        queryWords.forEach((word) => {
            if (question.includes(word)) {
                score += 1;
            }
        });

        return score;
    }

    /**
     * Builds response from semantic search results (with embeddings)
     * 
     * @private
     * @param objects - Results from nearText query
     * @returns RAG response object
     */
    private buildResponseFromSemanticSearch(objects: any[]): RAGResponse {
        const answers: string[] = [];
        const fileIds: string[] = [];

        for (const obj of objects) {
            const properties = obj.properties as any;
            if (properties.answer) {
                answers.push(properties.answer);
            }
            if (properties.fileId) {
                fileIds.push(properties.fileId);
            }
        }

        const combinedAnswer =
            answers.length > 0
                ? answers.join('\n\n')
                : 'No relevant information found.';

        return {
            answer: combinedAnswer,
            fileIds: [...new Set(fileIds)],
            source: 'Weaviate vector database (semantic search)',
        };
    }

    /**
     * Builds response from keyword search results (without embeddings)
     * 
     * @private
     * @param objects - Results from fetchObjects query
     * @param query - User query for filtering
     * @returns RAG response object
     */
    private buildResponseFromKeywordSearch(
        objects: any[],
        query: string,
    ): RAGResponse {
        // Extract and filter relevant results
        const relevantResults = this.filterRelevantResults(objects, query);

        const answers = relevantResults.map((r) => r.answer).filter((a) => a);
        const fileIds = [
            ...new Set(relevantResults.map((r) => r.fileId).filter((id) => id)),
        ];

        const combinedAnswer =
            answers.length > 0
                ? answers.join('\n\n')
                : 'No relevant information found.';

        return {
            answer: combinedAnswer,
            fileIds,
            source: 'Weaviate vector database (keyword matching)',
        };
    }

    /**
     * Generates a response using LLM when no data is found in database
     * 
     * @private
     * @param query - User query
     * @returns LLM-generated RAG response
     */
    private async generateLLMResponse(query: string): Promise<RAGResponse> {
        this.logger.log('Generating answer from LLM (no database results)');

        try {
            const llmAnswer = await this.llmService.generateDirectAnswer(query);

            return {
                answer: llmAnswer,
                fileIds: [],
                source: 'LLM Generation (no database matches)',
            };
        } catch (error) {
            this.logger.error('LLM generation failed', error);
            
            // Final fallback
            return {
                answer: 'I could not find relevant information in the knowledge base, and I am unable to generate an answer at this time. Please try rephrasing your question.',
                fileIds: [],
                source: 'Fallback response',
            };
        }
    }
}

