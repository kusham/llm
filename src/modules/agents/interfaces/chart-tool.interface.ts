import { ChartConfig } from '../types';

/**
 * Interface for Chart Tool
 * Generates Chart.js configurations based on queries
 */
export interface IChartTool {
    /**
     * Generates a Chart.js configuration based on the query
     * @param query - User query requesting chart/visualization
     * @returns Chart.js configuration object
     */
    generateChart(query: string): Promise<{ chartConfig: ChartConfig }>;

    /**
     * Determines if the query requires chart generation
     * @param query - User query to analyze
     * @returns True if chart should be generated
     */
    shouldGenerateChart(query: string): boolean;
}

