# 🚀 Quick Start Guide

Get the agent system running in 5 minutes!

## Prerequisites

- ✅ Node.js 18+
- ✅ Yarn
- ✅ Docker & Docker Compose

## Setup (5 Commands)

```bash
# 1. Install dependencies
yarn install

# 2. Start Weaviate vector database
docker-compose up -d weaviate

# 3. Wait for Weaviate to be ready (check health)
docker-compose ps

# 4. Create schema and seed data
yarn db:setup

# 5. Start the application
yarn start:dev
```

## Verify

1. **Check application**: http://localhost:3000
2. **View Swagger UI**: http://localhost:3000/api/v1/doc
3. **Check Weaviate**: http://localhost:8080/v1/schema

## Test Queries

### Test 1: RAG Query
```bash
curl -X POST http://localhost:3000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is artificial intelligence?"}'
```

**Expected:** Returns answer with fileIds

### Test 2: Chart Query
```bash
curl -X POST http://localhost:3000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me a chart"}'
```

**Expected:** Returns chartConfig

### Test 3: Combined Query
```bash
curl -X POST http://localhost:3000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Visualize benefits of exercise"}'
```

**Expected:** Returns both answer AND chartConfig

## Swagger UI Testing

1. Open: http://localhost:3000/api/v1/doc
2. Find: **POST /api/v1/query**
3. Click: **Try it out**
4. Enter query: `"What is artificial intelligence?"`
5. Click: **Execute**
6. See: Response with answer, fileIds, references

## Project Structure

```
src/
├── modules/
│   ├── database/          # Weaviate integration
│   ├── agents/            # LangGraph agent system
│   └── query/             # API endpoints
└── main.ts                # Entry point
```

## Environment Variables

Located in `.env` file (auto-created):

```env
# Application
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Weaviate (matches docker-compose)
WEAVIATE_URL=http://localhost:8080
```

## Troubleshooting

### Issue: Port 3000 already in use
```bash
# Change port in .env
PORT=3001
```

### Issue: Weaviate not starting
```bash
docker-compose down
docker-compose up -d weaviate
docker-compose logs weaviate
```

### Issue: No data in database
```bash
yarn db:setup
```

### Issue: Application won't start
```bash
# Reinstall dependencies
rm -rf node_modules
yarn install
```

## Documentation

- **README.md** - Full documentation
- **AGENT_SYSTEM.md** - Architecture details
- **TEST_EXAMPLES.md** - All test scenarios
- **DEVELOPMENT_NOTES.md** - Design decisions
- **ASSESSMENT_SUMMARY.md** - Requirements checklist

## Key Features

✅ **Delegating Agent** - Routes queries intelligently
✅ **Chart.js Tool** - Generates chart configs
✅ **RAG Agent** - Retrieves from Weaviate
✅ **Multi-tenancy** - Tenant-based data isolation
✅ **Swagger UI** - Interactive API testing

## Agent Routing

| Query Contains | Calls | Returns |
|---------------|-------|---------|
| "chart", "graph" | Chart Tool | chartConfig |
| "what", "how", "explain" | RAG Agent | answer + fileIds |
| Both | Both (sequential) | All fields |
| Neither | Direct answer | Simple response |

## Response Format

All queries return:

```json
{
  "answer": "The answer text...",
  "references": {
    "source": "Weaviate vector database"
  },
  "fileIds": ["uuid-here"],
  "chartConfig": {
    "type": "bar",
    "data": {...}
  }
}
```

## Available Commands

```bash
yarn start:dev      # Start with hot reload
yarn start          # Production mode
yarn build          # Build project
yarn db:setup       # Setup Weaviate
yarn test           # Run tests
yarn lint           # Lint code
```

## Next Steps

1. ✅ Test all query types
2. ✅ Explore Swagger UI
3. ✅ Read architecture docs
4. ✅ Record video assessment

## Support

Check these docs for help:
- Architecture → `AGENT_SYSTEM.md`
- Testing → `TEST_EXAMPLES.md`
- Troubleshooting → `README.md`
- API Docs → http://localhost:3000/api/v1/doc

---

**🎉 You're ready to go!** Try the test queries above or use Swagger UI.

