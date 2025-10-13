import { Inject, Injectable, Logger } from '@nestjs/common';
import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import { ChartTool } from './tools';
import { RAGAgent } from './rag.agent';
import { AgentGraphState, AgentResponse, ChartConfig } from './types';
import { LLMDecision } from '../../shared/types';
import type { ILLMService } from '../../shared/services';

// Define state annotation outside class for proper typing
const GraphStateAnnotation = Annotation.Root({
    query: Annotation<string>,
    decision: Annotation<LLMDecision | undefined>,
    chartConfig: Annotation<ChartConfig | undefined>,
    ragAnswer: Annotation<string | undefined>,
    ragFileIds: Annotation<string[] | undefined>,
    finalResponse: Annotation<AgentResponse | undefined>,
    error: Annotation<string | undefined>,
});

type GraphStateType = typeof GraphStateAnnotation.State;

@Injectable()
export class DelegatingAgent {
    private readonly logger = new Logger(DelegatingAgent.name);
    private graph: unknown;

    constructor(
        @Inject('LLMService')
        private readonly llmService: ILLMService,
        private readonly chartTool: ChartTool,
        private readonly ragAgent: RAGAgent,
    ) {
        this.buildGraph();
    }

    /**
     * Builds the LangGraph state graph for agent orchestration
     */
    private buildGraph(): void {
        const workflow = new StateGraph(GraphStateAnnotation) as unknown as {
            addNode: (name: string, func: (state: GraphStateType) => Promise<Partial<GraphStateType>>) => unknown;
            addEdge: (from: string, to: string) => unknown;
            addConditionalEdges: (source: string, router: (state: GraphStateType) => string, edges: Record<string, string>) => unknown;
            compile: () => { invoke: (state: unknown) => Promise<GraphStateType> };
        };

        // Node 1: Analyze query and decide what to do using LLM
        workflow.addNode('analyze', async (state: GraphStateType) => {
            this.logger.log(`Analyzing query with LLM: ${state.query}`);
            const decision = await this.llmService.analyzeQuery(state.query);
            this.logger.log(`LLM Decision: ${decision}`);
            return { decision };
        });

        // Node 2: Execute Chart Tool
        workflow.addNode('executeChart', async (state: GraphStateType) => {
            this.logger.log('Executing Chart Tool');
            try {
                const { chartConfig } = await this.chartTool.generateChart(
                    state.query,
                );
                return { chartConfig };
            } catch (error) {
                this.logger.error('Chart tool failed', error);
                return {
                    error: `Chart generation failed: ${(error as Error).message}`,
                };
            }
        });

        // Node 3: Execute RAG Agent
        workflow.addNode('executeRAG', async (state: GraphStateType) => {
            this.logger.log('Executing RAG Agent');
            try {
                const ragResponse = await this.ragAgent.query(state.query);
                return {
                    ragAnswer: ragResponse.answer,
                    ragFileIds: ragResponse.fileIds,
                };
            } catch (error) {
                this.logger.error('RAG agent failed', error);
                return {
                    error: `RAG query failed: ${(error as Error).message}`,
                };
            }
        });

        // Node 4: Generate direct answer using LLM
        workflow.addNode('directAnswer', async (state: GraphStateType) => {
            this.logger.log('Generating direct answer with LLM');
            const answer = await this.llmService.generateDirectAnswer(
                state.query,
            );
            return { ragAnswer: answer };
        });

        // Node 5: Combine results and create final response using LLM
        workflow.addNode('combineResults', async (state: GraphStateType) => {
            this.logger.log('Combining results with LLM');
            const finalResponse = await this.combineResultsWithLLM(state);
            return { finalResponse };
        });

        // Define edges based on decision
        workflow.addEdge(START, 'analyze');

        workflow.addConditionalEdges(
            'analyze',
            (state: GraphStateType): string => {
                return state.decision || 'direct';
            },
            {
                chart: 'executeChart',
                rag: 'executeRAG',
                direct: 'directAnswer',
                both: 'executeChart', // Start with chart, then RAG
            },
        );

        // Chart tool edges
        workflow.addConditionalEdges(
            'executeChart',
            (state: GraphStateType): string => {
                // If decision is 'both', go to RAG next
                if (state.decision === 'both') {
                    return 'rag';
                }
                return 'combine';
            },
            {
                rag: 'executeRAG',
                combine: 'combineResults',
            },
        );

        // RAG agent edges
        workflow.addEdge('executeRAG', 'combineResults');

        // Direct answer edges
        workflow.addEdge('directAnswer', 'combineResults');

        // Final edge to END
        workflow.addEdge('combineResults', END);

        this.graph = workflow.compile();
    }

    /**
     * Combines results from various tools into final response using LLM
     */
    private async combineResultsWithLLM(
        state: GraphStateType,
    ): Promise<AgentResponse> {
        const response: AgentResponse = {
            answer: '',
            references: {},
        };

        // Use LLM to generate a cohesive answer
        const llmAnswer = await this.llmService.combineResults(
            state.query,
            state.ragAnswer,
            !!state.chartConfig,
        );

        response.answer = llmAnswer;

        // Add references if RAG was used
        if (state.ragAnswer) {
            response.references = {
                source: 'Weaviate vector database',
            };
        }

        // Add chart config if available
        if (state.chartConfig) {
            response.chartConfig = state.chartConfig;
        }

        // Add fileIds if available
        if (state.ragFileIds && state.ragFileIds.length > 0) {
            response.fileIds = state.ragFileIds;
        }

        // Handle errors
        if (state.error) {
            response.answer = response.answer + `\n\nNote: ${state.error}`;
        }

        return response;
    }

    /**
     * Main entry point - processes a user query through the agent graph
     */
    async processQuery(query: string): Promise<AgentResponse> {
        this.logger.log(`Processing query: ${query}`);

        try {
            const initialState = {
                query,
            };

            // Execute the graph
            const result = await (this.graph as { invoke: (state: unknown) => Promise<GraphStateType> }).invoke(initialState);

            if (!result.finalResponse) {
                throw new Error('No final response generated');
            }

            return result.finalResponse;
        } catch (error) {
            this.logger.error('Agent processing failed', error);
            return {
                answer: `I encountered an error processing your query: ${(error as Error).message}`,
                references: {},
            };
        }
    }
}

