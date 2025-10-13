# LangGraph Hierarchical Agent System

## Overview

This project implements a hierarchical agent system using **LangGraph** and **LangChain** with NestJS. The system consists of:

1. **Delegating Agent** - Central orchestrator that routes queries
2. **Chart.js Tool** - Mocked tool for chart generation
3. **RAG Agent** - Retrieval-Augmented Generation using Weaviate vector database

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Query                            │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Delegating Agent (LangGraph)                │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  1. Analyze Query                               │   │
│  │     - Detect keywords                           │   │
│  │     - Determine required tools                  │   │
│  └─────────────────────────────────────────────────┘   │
│                        │                                 │
│           ┌────────────┼────────────┐                   │
│           ▼            ▼            ▼                   │
│    ┌──────────┐  ┌─────────┐  ┌──────────┐            │
│    │  Chart   │  │   RAG   │  │  Direct  │            │
│    │  Tool    │  │  Agent  │  │  Answer  │            │
│    └──────────┘  └─────────┘  └──────────┘            │
│           │            │            │                   │
│           └────────────┼────────────┘                   │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  3. Combine Results                             │   │
│  │     - Merge responses                           │   │
│  │     - Format final output                       │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Final Response                          │
│  {                                                       │
│    answer: "...",                                        │
│    references: { source: "..." },                       │
│    fileIds: ["..."],                                     │
│    chartConfig: { ... }                                  │
│  }                                                       │
└─────────────────────────────────────────────────────────┘
```

## Components

### 1. Delegating Agent (`delegating.agent.ts`)

The central orchestrator that:
- Analyzes incoming queries
- Decides which tools to use (chart, RAG, both, or direct)
- Executes tools in parallel or sequentially
- Combines results into a unified response

**Decision Logic:**
- Detects keywords: "chart", "graph", "visualize" → Use Chart Tool
- Detects keywords: "what", "how", "explain" → Use RAG Agent
- Both present → Execute both tools (sequential: chart first, then RAG)
- Neither → Generate direct answer

**LangGraph State Flow:**
```
START → analyze → [executeChart | executeRAG | directAnswer | both]
                   ↓           ↓                ↓                ↓
                   └───────────┴────────────────┴────────────────┘
                                        ↓
                                 combineResults
                                        ↓
                                       END
```

### 2. Chart.js Tool (`tools/chart.tool.ts`)

A mocked tool that generates Chart.js configurations.

**Features:**
- Keyword detection for chart-related queries
- Returns mock bar chart configuration
- Easily extensible for real chart generation

**Example Output:**
```json
{
  "type": "bar",
  "data": {
    "labels": ["A", "B", "C", "D", "E"],
    "datasets": [{
      "label": "Example Data",
      "data": [10, 20, 30, 25, 15]
    }]
  }
}
```

### 3. RAG Agent (`rag.agent.ts`)

Retrieval-Augmented Generation agent that:
- Queries Weaviate vector database
- Performs keyword-based search (since no embeddings)
- Returns relevant answers with fileIds

**Features:**
- Multi-tenant support (uses "default" tenant)
- Keyword matching against questions/answers
- Combines multiple relevant answers
- Returns unique fileIds

## API Endpoints

### POST `/api/v1/query`

Process a query through the agent system.

**Request:**
```json
{
  "query": "What is artificial intelligence?"
}
```

**Response:**
```json
{
  "answer": "Artificial Intelligence (AI) is the simulation of human intelligence processes by machines...",
  "references": {
    "source": "Weaviate vector database"
  },
  "fileIds": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"]
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
yarn install
```

Dependencies include:
- `weaviate-client` - Weaviate JS client
- `@langchain/langgraph` - Agent orchestration
- `@langchain/core` - LangChain core functionality

### 2. Start Weaviate
```bash
docker-compose up -d weaviate
```

### 3. Setup Database
```bash
yarn db:setup
```

This will:
- Create the schema with multi-tenancy
- Seed 5 fictional Q&A entries

### 4. Start the Application
```bash
yarn start:dev
```

### 5. Access Swagger Documentation
Navigate to: `http://localhost:3000/api/v1/doc`

## Testing Scenarios

### Scenario 1: RAG-Only Query
**Query:** `"What is artificial intelligence?"`

**Expected:**
- Decision: `rag`
- Response includes: answer, fileIds, references
- No chartConfig

### Scenario 2: Chart-Only Query
**Query:** `"Show me a chart"`

**Expected:**
- Decision: `chart`
- Response includes: answer, chartConfig
- No fileIds

### Scenario 3: Combined Query
**Query:** `"Show me a chart about artificial intelligence"`

**Expected:**
- Decision: `both`
- Response includes: answer, chartConfig, fileIds, references
- Executes Chart Tool first, then RAG Agent
- Combines both results

### Scenario 4: Direct Answer
**Query:** `"Hello"`

**Expected:**
- Decision: `direct`
- Response includes: default answer
- No fileIds or chartConfig

## Parallel vs Sequential Execution

### Sequential Execution (Current Implementation)
When decision is `both`:
1. Execute Chart Tool first
2. Execute RAG Agent second
3. Combine both results

### Parallel Execution (Future Enhancement)
To implement parallel execution:
```typescript
// In buildGraph() method
workflow.addNode('executeBoth', async (state: AgentGraphState) => {
    const [chartResult, ragResult] = await Promise.all([
        this.chartTool.generateChart(state.query),
        this.ragAgent.query(state.query)
    ]);
    
    return {
        ...state,
        chartConfig: chartResult.chartConfig,
        ragAnswer: ragResult.answer,
        ragFileIds: ragResult.fileIds
    };
});
```

## Response Format

All responses follow this structure:

```typescript
interface AgentResponse {
    answer: string;              // Main textual answer
    references?: {               // Source information
        source?: string;
        [key: string]: any;
    };
    fileIds?: string[];          // From RAG agent
    chartConfig?: ChartConfig;   // From Chart tool
}
```

## File Structure

```
src/modules/
├── agents/
│   ├── tools/
│   │   ├── chart.tool.ts           # Chart.js mock tool
│   │   └── index.ts
│   ├── types/
│   │   ├── agent-response.types.ts # Response interfaces
│   │   ├── agent-state.types.ts    # LangGraph state
│   │   └── index.ts
│   ├── delegating.agent.ts         # Main orchestrator
│   ├── rag.agent.ts                # RAG agent
│   ├── agents.module.ts
│   └── index.ts
├── database/
│   ├── interfaces/
│   ├── database.service.ts
│   ├── weaviate.schema.ts
│   ├── database.seeder.ts
│   └── database.module.ts
└── query/
    ├── dto/
    │   └── query.dto.ts
    ├── query.controller.ts         # API endpoint
    ├── query.module.ts
    └── index.ts
```

## Environment Variables

```env
# Weaviate Configuration
WEAVIATE_URL=http://localhost:8080

# Application Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
```

## Extensibility

### Adding New Tools
1. Create new tool in `src/modules/agents/tools/`
2. Implement tool logic
3. Add to `DelegatingAgent` constructor
4. Update decision logic in `analyzeQuery()`
5. Add new node to LangGraph workflow

### Improving RAG with Embeddings
To use real embeddings:
1. Configure Weaviate with vectorizer module
2. Update schema with vector configuration
3. Replace `fetchObjects()` with `nearText()` or `nearVector()`

### Enhancing Decision Logic
Current implementation uses keyword matching. For better accuracy:
1. Use LLM to analyze query intent
2. Implement semantic similarity
3. Add confidence scoring
4. Support multiple languages

## Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Manual testing via Swagger
http://localhost:3000/api/v1/doc
```

## Troubleshooting

### Weaviate Connection Error
- Ensure Docker is running
- Verify Weaviate is healthy: `docker ps`
- Check logs: `docker-compose logs weaviate`

### No Results from RAG
- Verify database is seeded: `yarn db:setup`
- Check collection exists in Weaviate
- Test keyword matching logic

### LangGraph Errors
- Ensure all dependencies are installed
- Check Node.js version compatibility
- Review graph structure in debugger

## Next Steps

1. ✅ Implement LLM-based query analysis
2. ✅ Add real embedding support
3. ✅ Implement caching layer
4. ✅ Add conversation history
5. ✅ Deploy to production

