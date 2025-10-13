import { AgentResponse, ChartConfig } from './agent-response.types';
import { LLMDecision } from '../../../shared/types';


/**
 * LangGraph state for the agent system
 */
export interface AgentGraphState {
    // Input
    query: string;

    // Decision
    decision?: LLMDecision;

    // Intermediate results
    chartConfig?: ChartConfig;
    ragAnswer?: string;
    ragFileIds?: string[];

    // Final output
    finalResponse?: AgentResponse;

    // Error handling
    error?: string;
}

