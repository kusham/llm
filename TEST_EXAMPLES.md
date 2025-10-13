# Agent System Test Examples

This document provides test examples for the LangGraph hierarchical agent system.

## Prerequisites

1. **Start Weaviate:**
   ```bash
   docker-compose up -d weaviate
   ```

2. **Setup Database:**
   ```bash
   yarn db:setup
   ```

3. **Start Application:**
   ```bash
   yarn start:dev
   ```

4. **Access:** `http://localhost:3000/api/v1/doc`

## Test Scenarios

### 1. RAG-Only Query (Knowledge Base)

#### Test Case 1.1: Ask about AI
**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is artificial intelligence?"}'
```

**Expected Response:**
```json
{
  "answer": "Artificial Intelligence (AI) is the simulation of human intelligence processes by machines, especially computer systems. These processes include learning, reasoning, problem-solving, perception, and language understanding.",
  "references": {
    "source": "Weaviate vector database"
  },
  "fileIds": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"]
}
```

#### Test Case 1.2: Ask about photosynthesis
**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "How does photosynthesis work?"}'
```

**Expected:** Answer from knowledge base with fileIds

#### Test Case 1.3: Ask about vaccines
**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Explain how vaccines work"}'
```

**Expected:** Vaccine explanation with fileIds

---

### 2. Chart-Only Query

#### Test Case 2.1: Simple chart request
**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me a chart"}'
```

**Expected Response:**
```json
{
  "answer": "Here is the requested chart visualization.",
  "references": {},
  "chartConfig": {
    "type": "bar",
    "data": {
      "labels": ["A", "B", "C", "D", "E"],
      "datasets": [{
        "label": "Example Data",
        "data": [10, 20, 30, 25, 15],
        "backgroundColor": [...],
        "borderColor": [...]
      }]
    },
    "options": {
      "responsive": true,
      "plugins": {
        "legend": { "position": "top" },
        "title": { "display": true, "text": "Generated Chart" }
      }
    }
  }
}
```

#### Test Case 2.2: Visualization request
**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Create a bar graph"}'
```

**Expected:** Chart configuration without fileIds

#### Test Case 2.3: Plot request
**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Plot some data for me"}'
```

**Expected:** Chart configuration

---

### 3. Combined Query (Both Chart + RAG)

#### Test Case 3.1: Visualize AI data
**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me a chart about artificial intelligence"}'
```

**Expected Response:**
```json
{
  "answer": "Artificial Intelligence (AI) is the simulation of human intelligence processes by machines...\n\nA chart has been generated to visualize this data.",
  "references": {
    "source": "Weaviate vector database"
  },
  "fileIds": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
  "chartConfig": {
    "type": "bar",
    "data": {...}
  }
}
```

#### Test Case 3.2: Graph exercise benefits
**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Visualize the benefits of regular exercise"}'
```

**Expected:** Both answer from KB AND chart config

#### Test Case 3.3: Display vaccine info
**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Display a graph showing how vaccines work"}'
```

**Expected:** Vaccine info + chart configuration

---

### 4. Direct Answer (No Tools)

#### Test Case 4.1: Simple greeting
**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Hello"}'
```

**Expected Response:**
```json
{
  "answer": "I understand your query: \"Hello\". However, I don't have specific information about this in my knowledge base. Please try asking about charts, visualizations, or questions related to the available data.",
  "references": {}
}
```

#### Test Case 4.2: Random query
**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "The weather is nice today"}'
```

**Expected:** Direct answer (no tools used)

---

## Testing via Swagger UI

1. Navigate to `http://localhost:3000/api/v1/doc`
2. Find the **Query** section
3. Click on **POST /api/v1/query**
4. Click **Try it out**
5. Enter test query in the request body
6. Click **Execute**
7. Review the response

---

## Testing via Postman

### Setup Collection

1. **Create New Collection:** "Agent System Tests"

2. **Add Environment Variables:**
   - `base_url`: `http://localhost:3000`

3. **Create Requests:**

#### Request 1: RAG Query
- Method: `POST`
- URL: `{{base_url}}/api/v1/query`
- Body (JSON):
  ```json
  {
    "query": "What is artificial intelligence?"
  }
  ```

#### Request 2: Chart Query
- Method: `POST`
- URL: `{{base_url}}/api/v1/query`
- Body (JSON):
  ```json
  {
    "query": "Show me a chart"
  }
  ```

#### Request 3: Combined Query
- Method: `POST`
- URL: `{{base_url}}/api/v1/query`
- Body (JSON):
  ```json
  {
    "query": "Visualize information about vaccines"
  }
  ```

---

## Expected Behavior Summary

| Query Type | Keywords Present | Tools Used | Response Contains |
|-----------|------------------|------------|-------------------|
| RAG-Only | what, how, explain | RAG Agent | answer, fileIds, references |
| Chart-Only | chart, graph, visualize | Chart Tool | answer, chartConfig |
| Combined | both chart + knowledge keywords | Both (sequential) | answer, fileIds, references, chartConfig |
| Direct | neither | None | answer only |

---

## Validation Checklist

### For RAG Queries:
- ✅ Answer is relevant to question
- ✅ fileIds array is present and not empty
- ✅ references.source is "Weaviate vector database"
- ✅ No chartConfig present

### For Chart Queries:
- ✅ chartConfig is present
- ✅ chartConfig has valid structure (type, data, options)
- ✅ No fileIds present
- ✅ Answer mentions chart generation

### For Combined Queries:
- ✅ Both answer AND chartConfig present
- ✅ fileIds array is present
- ✅ references.source is "Weaviate vector database"
- ✅ Answer mentions both information and chart

### For Direct Answers:
- ✅ Generic/fallback answer provided
- ✅ No fileIds present
- ✅ No chartConfig present

---

## Debugging Tips

### Check Application Logs
```bash
# View live logs
docker-compose logs -f

# Or in the terminal where you ran yarn start:dev
```

### Verify Weaviate Data
```bash
# Check if data exists
curl http://localhost:8080/v1/schema
```

### Test Weaviate Directly
```bash
curl http://localhost:8080/v1/objects | jq
```

### Enable Debug Logging
In your `.env`:
```env
LOG_LEVEL=debug
```

---

## Performance Benchmarks

Expected response times (on local development):
- RAG-Only: 50-200ms
- Chart-Only: 10-50ms
- Combined: 100-300ms
- Direct: 5-20ms

---

## Troubleshooting

### Issue: "Weaviate client not initialized"
**Solution:** Ensure Weaviate is running and database is setup
```bash
docker-compose up -d weaviate
yarn db:setup
```

### Issue: "No relevant information found"
**Solution:** Verify data is seeded
```bash
yarn db:setup
```

### Issue: LangGraph errors
**Solution:** Check all dependencies are installed
```bash
yarn install
```

---

## Next Steps for Video Assessment

1. **Show each test scenario** - RAG, Chart, Combined, Direct
2. **Explain decision logic** - How keywords determine routing
3. **Demonstrate Swagger UI** - Interactive testing
4. **Show logs** - Agent decision making process
5. **Explain code structure** - Walk through DelegatingAgent
6. **Discuss alternatives** - What other approaches you considered
7. **Show challenges** - Issues faced and solutions

