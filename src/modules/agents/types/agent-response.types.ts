/**
 * Chart.js configuration type
 */
export interface ChartConfig {
    type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter' | 'bubble';
    data: {
        labels?: string[];
        datasets: Array<{
            label: string;
            data: number[];
            backgroundColor?: string | string[];
            borderColor?: string | string[];
        }>;
    };
    options?: Record<string, any>;
}

/**
 * References from various sources
 */
export interface AgentReferences {
    source?: string;
    [key: string]: any;
}

/**
 * Final agent response structure
 */
export interface AgentResponse {
    answer: string;
    references?: AgentReferences;
    fileIds?: string[];
    chartConfig?: ChartConfig;
}

/**
 * RAG-specific response
 */
export interface RAGResponse {
    answer: string;
    fileIds: string[];
    source: string;
}

/**
 * Chart tool response
 */
export interface ChartToolResponse {
    chartConfig: ChartConfig;
}

