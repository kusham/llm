import { Injectable, Logger } from '@nestjs/common';
import { ChartConfig, ChartToolResponse } from '../types';
import { IChartTool } from '../interfaces';

/**
 * Chart.js Tool Implementation
 * Generates mock Chart.js configurations for data visualization
 * 
 * @implements {IChartTool}
 */
@Injectable()
export class ChartTool implements IChartTool {
    private readonly logger = new Logger(ChartTool.name);

    /**
     * Generates a mock Chart.js configuration based on the query
     * 
     * @remarks
     * This is a simplified mock implementation that returns a fixed bar chart.
     * In production, this would:
     * - Parse the query to determine chart type (bar, line, pie, etc.)
     * - Extract data requirements from the query
     * - Generate appropriate datasets
     * - Apply styling based on context
     * 
     * @param query - User query requesting visualization
     * @returns Promise resolving to chart configuration
     * 
     * @example
     * ```typescript
     * const result = await chartTool.generateChart("Show me a bar chart");
     * // Returns: { chartConfig: { type: 'bar', data: {...}, options: {...} } }
     * ```
     */
    async generateChart(query: string): Promise<ChartToolResponse> {
        this.logger.log(`Generating chart for query: ${query}`);

        try {
            // Determine chart type from query (simplified)
            const chartType = this.determineChartType(query);

            // Generate mock configuration
            const chartConfig: ChartConfig = this.createMockChartConfig(chartType);

            this.logger.debug(`Generated ${chartType} chart successfully`);
            return { chartConfig };
        } catch (error) {
            this.logger.error('Failed to generate chart', error);
            throw error;
        }
    }

    /**
     * Determines if the query requires chart generation
     * 
     * @param query - User query to analyze
     * @returns True if query contains chart-related keywords
     */
    shouldGenerateChart(query: string): boolean {
        const chartKeywords = [
            'chart',
            'graph',
            'plot',
            'visualize',
            'visualization',
            'show me',
            'display',
            'bar chart',
            'line chart',
            'pie chart',
            'diagram',
        ];

        const lowerQuery = query.toLowerCase();
        return chartKeywords.some((keyword) => lowerQuery.includes(keyword));
    }

    /**
     * Determines the appropriate chart type from query
     * 
     * @private
     * @param query - User query
     * @returns Chart type
     */
    private determineChartType(query: string): ChartConfig['type'] {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('line')) return 'line';
        if (lowerQuery.includes('pie')) return 'pie';
        if (lowerQuery.includes('doughnut')) return 'doughnut';
        if (lowerQuery.includes('scatter')) return 'scatter';

        // Default to bar chart
        return 'bar';
    }

    /**
     * Creates a mock chart configuration
     * 
     * @private
     * @param type - Type of chart to generate
     * @returns Chart.js configuration object
     */
    private createMockChartConfig(type: ChartConfig['type']): ChartConfig {
        const baseConfig: ChartConfig = {
            type,
            data: {
                labels: ['January', 'February', 'March', 'April', 'May'],
                datasets: [
                    {
                        label: 'Sample Dataset',
                        data: [65, 59, 80, 81, 56],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                        ],
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: `Sample ${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
                    },
                },
            },
        };

        return baseConfig;
    }
}

