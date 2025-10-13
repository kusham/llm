# LLM Agent Assessment - LangGraph Hierarchical System

A production-ready NestJS application implementing a hierarchical agent system using **LangGraph**, **LangChain**, and **Weaviate** vector database.

## 🎯 Project Overview

This project implements a sophisticated AI agent system that:
- Routes user queries intelligently to appropriate tools
- Generates chart configurations on demand
- Performs retrieval-augmented generation (RAG) from a vector database
- Handles parallel and sequential tool execution
- Returns unified, structured responses

## 🏗️ Architecture

```
User Query → Delegating Agent → [Chart Tool | RAG Agent | Direct Answer | Both]
                    ↓
            Combined Response
```

### Components

1. **Delegating Agent** - LangGraph-based orchestrator that analyzes queries and routes to appropriate tools
2. **Chart.js Tool** - Mocked tool that generates Chart.js configurations
3. **RAG Agent** - Retrieval system that queries Weaviate for relevant information
4. **Weaviate Vector DB** - Multi-tenant vector database with Q&A knowledge base

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and Yarn
- Docker and Docker Compose
- Git

### Installation

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository>
   cd llm
   yarn install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your Google API key for LLM features (optional)
   # GOOGLE_API_KEY=your_google_gemini_api_key
   # Note: System works with keyword fallback if no API key provided
   ```

3. **Start Weaviate**
   ```bash
   docker-compose up -d weaviate
   ```

4. **Setup Database Schema and Seed Data**
   ```bash
   yarn db:setup
   ```
   This creates:
   - Multi-tenant schema with `fileId`, `question`, `answer` fields
   - 5 fictional Q&A entries for testing

5. **Start Application**
   ```bash
   yarn start:dev
   ```

6. **Access Swagger Documentation**
   ```
   http://localhost:3000/api/v1/doc
   ```

## 📋 API Usage

### Endpoint: `POST /api/v1/query`

**Request:**
```json
{
  "query": "What is artificial intelligence?"
}
```

**Response:**
```json
{
  "answer": "Artificial Intelligence (AI) is the simulation of human intelligence processes...",
  "references": {
    "source": "Weaviate vector database"
  },
  "fileIds": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"]
}
```

## 🧪 Testing

### Test Scenarios

1. **RAG Query:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/query \
     -H "Content-Type: application/json" \
     -d '{"query": "What is artificial intelligence?"}'
   ```

2. **Chart Query:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/query \
     -H "Content-Type: application/json" \
     -d '{"query": "Show me a chart"}'
   ```

3. **Combined Query:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/query \
     -H "Content-Type: application/json" \
     -d '{"query": "Visualize information about vaccines"}'
   ```

See [TEST_EXAMPLES.md](./TEST_EXAMPLES.md) for comprehensive test cases.

## 📁 Project Structure

```
src/
├── config/                  # Configuration modules
├── modules/
│   ├── database/           # Weaviate integration
│   │   ├── interfaces/     # Service interfaces
│   │   ├── database.service.ts
│   │   ├── weaviate.schema.ts
│   │   └── database.seeder.ts
│   ├── agents/             # Agent system
│   │   ├── tools/          # Chart.js tool
│   │   ├── types/          # TypeScript interfaces
│   │   ├── delegating.agent.ts
│   │   └── rag.agent.ts
│   └── query/              # API endpoints
│       ├── dto/
│       └── query.controller.ts
└── main.ts                 # Application entry point
```

## 🔑 Key Features

### Part 1: Weaviate Setup ✅
- ✅ Docker-based Weaviate instance
- ✅ Multi-tenancy support
- ✅ Schema with `fileId`, `question`, `answer` fields
- ✅ Seeded with 5+ fictional entries
- ✅ TypeScript interfaces for all services

### Part 2: LangGraph Agent System ✅
- ✅ **Delegating Agent** with **Google Gemini LLM** routing
- ✅ **Chart.js Tool** (mocked implementation)
- ✅ **RAG Agent** with Weaviate integration
- ✅ Parallel/sequential tool execution
- ✅ Structured response format
- ✅ Complete API endpoints
- ✅ **LLM-powered decision making** with fallback

## 🛠️ Technology Stack

| Technology | Purpose |
|-----------|---------|
| NestJS | Backend framework |
| Fastify | HTTP server |
| LangGraph | Agent orchestration |
| LangChain | LLM abstraction |
| Weaviate | Vector database |
| TypeScript | Type safety |
| Docker | Containerization |
| Swagger | API documentation |

## 📚 Documentation

- [AGENT_SYSTEM.md](./AGENT_SYSTEM.md) - Detailed architecture and implementation
- [LLM_INTEGRATION.md](./LLM_INTEGRATION.md) - Google Gemini LLM integration guide
- [TEST_EXAMPLES.md](./TEST_EXAMPLES.md) - Comprehensive test scenarios
- [DEVELOPMENT_NOTES.md](./DEVELOPMENT_NOTES.md) - Design decisions and challenges
- [README.docker.md](./README.docker.md) - Docker configuration

## 🔍 Decision Logic

The Delegating Agent uses **Google Gemini LLM** for intelligent routing (with keyword fallback):

### LLM-Based Routing (Preferred)
- 🤖 **Google Gemini 1.5 Flash** analyzes query intent
- 🎯 Understands context, synonyms, and user intent
- 🔄 Falls back to keyword matching if API unavailable

### Routing Decisions

| Query Type | LLM Analysis | Tools Used | Response Includes |
|-----------|--------------|-----------|-------------------|
| "Can you show sales data?" | `both` | Chart + RAG | All fields |
| "Explain AI" | `rag` | RAG Agent | `answer`, `fileIds` |
| "Create a bar chart" | `chart` | Chart Tool | `chartConfig` |
| "Hello" | `direct` | None | `answer` only |

**See [LLM_INTEGRATION.md](./LLM_INTEGRATION.md) for detailed information.**

## 🎥 Video Assessment Guide

When recording your walkthrough:

1. **Setup Demo** (2-3 min)
   - Show Docker starting
   - Run `yarn db:setup`
   - Start application

2. **Architecture Explanation** (3-4 min)
   - Explain LangGraph state flow
   - Show code structure
   - Discuss decision logic

3. **Live Testing** (5-6 min)
   - Test RAG-only query
   - Test Chart-only query
   - Test Combined query
   - Show Swagger UI

4. **Challenges & Solutions** (2-3 min)
   - Discuss implementation challenges
   - Explain alternative approaches
   - Show reasoning for decisions

5. **Code Walkthrough** (3-4 min)
   - DelegatingAgent implementation
   - LangGraph workflow
   - Tool integration

## 🐛 Troubleshooting

### Weaviate Not Starting
```bash
docker-compose down
docker-compose up -d weaviate
docker-compose logs weaviate
```

### Database Not Seeded
```bash
yarn db:setup
```

### Port Already in Use
Change `PORT` in `.env` file

### LangGraph Errors
```bash
yarn install
rm -rf node_modules
yarn install
```

## 📊 Performance

Expected response times:
- **RAG Query**: 50-200ms
- **Chart Query**: 10-50ms
- **Combined**: 100-300ms
- **Direct**: 5-20ms

## 🔐 Security Features

- CSRF protection
- Helmet security headers
- Request validation (class-validator)
- CORS configuration
- Rate limiting ready (ThrottlerModule)

## 🚦 Available Scripts

```bash
yarn start:dev      # Development mode with hot reload
yarn start          # Production mode
yarn build          # Build for production
yarn test           # Run tests
yarn lint           # Lint and fix
yarn db:setup       # Setup database
```

## 🌟 Highlights

- **Clean Architecture**: Modular design with clear separation of concerns
- **Type Safety**: Full TypeScript with interfaces for all services
- **Production Ready**: Error handling, logging, validation
- **Well Documented**: Comprehensive docs and inline comments
- **Testable**: Easy to test with mocked tools and clear interfaces
- **Extensible**: Easy to add new tools and improve decision logic

## 📝 Assessment Completion

### Part 1: Weaviate Setup ✅
- Multi-tenant vector database
- Schema with required fields
- 5+ fictional entries seeded

### Part 2: Agent Hierarchy ✅
- Delegating Agent with LangGraph
- Chart.js Tool (mocked)
- RAG Agent with Weaviate
- Parallel/sequential execution
- Structured response format
- API endpoints for testing

## 👤 Author

Created as part of an AI/ML engineering assessment demonstrating:
- Agent-based system design
- Vector database integration
- LangGraph orchestration
- Production-quality NestJS code
- Clean architecture principles

## 📄 License

UNLICENSED - Assessment Project

---

**Need Help?** Check the documentation:
- Architecture: [AGENT_SYSTEM.md](./AGENT_SYSTEM.md)
- Testing: [TEST_EXAMPLES.md](./TEST_EXAMPLES.md)
- Swagger: http://localhost:3000/api/v1/doc
