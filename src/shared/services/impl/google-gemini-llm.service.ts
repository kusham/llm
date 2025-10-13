import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ILLMService } from '../llm-service.interface';
import { LLMDecision } from '../../types';
import { ILLMConfig } from '../../interfaces';
import { CONFIG_NAMESPACES } from '../../constants';
import { fromNullable } from 'src/shared/utils/type.helper';

@Injectable()
export class GoogleGeminiLLMService implements ILLMService {
    private readonly logger = new Logger(GoogleGeminiLLMService.name);
    private llm: ChatGoogleGenerativeAI;

    constructor(private readonly configService: ConfigService) {
        this.initializeLLM();
    }

    /**
     * Initializes the Google Gemini LLM client
     */
    private initializeLLM(): void {
        const { googleApiKey } = fromNullable(
            this.configService.get<ILLMConfig>(CONFIG_NAMESPACES.LLM),
        ).getOrThrow('googleApiKey is missing');

        if (!googleApiKey) {
            this.logger.warn(
                'GOOGLE_API_KEY not found. LLM features will use fallback logic.',
            );
            return;
        }

            this.llm = new ChatGoogleGenerativeAI({
                apiKey: googleApiKey,
                model: 'gemini-2.0-flash-exp',
                temperature: 0.3,
                maxOutputTokens: 1024,
            });

        this.logger.log('Google Gemini LLM initialized successfully');
    }

    /**
     * Analyzes a query using LLM to determine the appropriate action
     */
    async analyzeQuery(query: string): Promise<LLMDecision> {
        this.logger.log(`Analyzing query with LLM: ${query}`);

        // Fallback to keyword-based logic if LLM not available
        if (!this.llm) {
            return this.fallbackAnalyzeQuery(query);
        }

        try {
            const prompt = `You are a query analyzer for an AI agent system. Analyze the following user query and determine the best action.

Available actions:
1. "chart" - User wants to visualize data or create a chart/graph
2. "rag" - User wants information/knowledge from a database (questions about facts, explanations, how-to)
3. "both" - User wants both visualization AND information
4. "direct" - Simple greeting or query that doesn't need tools

Query: "${query}"

Respond with ONLY ONE WORD: chart, rag, both, or direct`;

            const response = await this.llm.invoke(prompt);
            const decision = response.content
                .toString()
                .trim()
                .toLowerCase();

            // Validate and convert to enum
            switch (decision) {
                case 'chart':
                    this.logger.log(`LLM Decision: ${LLMDecision.CHART}`);
                    return LLMDecision.CHART;
                case 'rag':
                    this.logger.log(`LLM Decision: ${LLMDecision.RAG}`);
                    return LLMDecision.RAG;
                case 'both':
                    this.logger.log(`LLM Decision: ${LLMDecision.BOTH}`);
                    return LLMDecision.BOTH;
                case 'direct':
                    this.logger.log(`LLM Decision: ${LLMDecision.DIRECT}`);
                    return LLMDecision.DIRECT;
                default:
                    // Invalid response, use fallback
                    this.logger.warn(
                        `Invalid LLM response: ${decision}. Using fallback.`,
                    );
                    return this.fallbackAnalyzeQuery(query);
            }

        } catch (error) {
            this.logger.error('LLM analysis failed, using fallback', error);
            return this.fallbackAnalyzeQuery(query);
        }
    }

    /**
     * Generates a direct answer using LLM
     */
    async generateDirectAnswer(query: string): Promise<string> {
        this.logger.log(`Generating direct answer for: ${query}`);

        // Fallback if LLM not available
        if (!this.llm) {
            return this.fallbackDirectAnswer(query);
        }

        try {
            const prompt = `You are a helpful AI assistant. The user has asked a question that doesn't require looking up information or creating charts.

User query: "${query}"

Provide a brief, friendly response (2-3 sentences max).`;

            const response = await this.llm.invoke(prompt);
            return response.content.toString().trim();
        } catch (error) {
            this.logger.error(
                'LLM direct answer generation failed, using fallback',
                error,
            );
            return this.fallbackDirectAnswer(query);
        }
    }

    /**
     * Combines results from multiple tools using LLM
     */
    async combineResults(
        query: string,
        ragAnswer?: string,
        hasChart?: boolean,
    ): Promise<string> {
        this.logger.log('Combining results with LLM');

        // Fallback if LLM not available
        if (!this.llm) {
            return this.fallbackCombineResults(ragAnswer, hasChart);
        }

        try {
            let prompt = `You are synthesizing a response for the user. Create a natural, cohesive answer.

User query: "${query}"

`;

            if (ragAnswer) {
                prompt += `Information found: ${ragAnswer}\n\n`;
            }

            if (hasChart) {
                prompt += `Note: A chart visualization has been generated.\n\n`;
            }

            prompt += `Provide a brief summary (2-3 sentences) that ties everything together.`;

            const response = await this.llm.invoke(prompt);
            return response.content.toString().trim();
        } catch (error) {
            this.logger.error(
                'LLM result combination failed, using fallback',
                error,
            );
            return this.fallbackCombineResults(ragAnswer, hasChart);
        }
    }

    /**
     * Fallback keyword-based query analysis
     */
    private fallbackAnalyzeQuery(query: string): LLMDecision {
        const lowerQuery = query.toLowerCase();

        const chartKeywords = [
            'chart',
            'graph',
            'plot',
            'visualize',
            'visualization',
            'show me',
            'display',
        ];
        const ragKeywords = [
            'what',
            'how',
            'why',
            'explain',
            'tell me',
            'information',
            'about',
        ];

        const hasChart = chartKeywords.some((keyword) =>
            lowerQuery.includes(keyword),
        );
        const hasRAG = ragKeywords.some((keyword) =>
            lowerQuery.includes(keyword),
        );

        if (hasChart && hasRAG) return LLMDecision.BOTH;
        if (hasChart) return LLMDecision.CHART;
        if (hasRAG) return LLMDecision.RAG;
        return LLMDecision.DIRECT;
    }

    /**
     * Fallback direct answer
     */
    private fallbackDirectAnswer(query: string): string {
        return `I understand your query: "${query}". However, I don't have specific information about this in my knowledge base. Please try asking about charts, visualizations, or questions related to the available data.`;
    }

    /**
     * Fallback result combination
     */
    private fallbackCombineResults(
        ragAnswer?: string,
        hasChart?: boolean,
    ): string {
        let result = ragAnswer || 'Here is the information you requested.';

        if (hasChart) {
            result += '\n\nA chart has been generated to visualize this data.';
        }

        return result;
    } 
}

