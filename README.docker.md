# Weaviate Docker Setup

## Quick Start

### 1. Start Weaviate
```bash
docker-compose up -d
```

### 2. Check if Weaviate is running
```bash
# Check container status
docker-compose ps

# Check Weaviate health
curl http://localhost:8080/v1/.well-known/ready
```

You should see a response like:
```json
{
  "status": "ready"
}
```

### 3. Access Weaviate
- **REST API**: http://localhost:8080
- **GraphQL**: http://localhost:8080/v1/graphql
- **gRPC**: localhost:50051

### 4. Stop Weaviate
```bash
docker-compose down
```

### 5. Stop and remove data
```bash
docker-compose down -v
```

## Useful Commands

### View logs
```bash
docker-compose logs -f weaviate
```

### Restart Weaviate
```bash
docker-compose restart weaviate
```

### Check Weaviate meta information
```bash
curl http://localhost:8080/v1/meta
```

## Multi-Tenancy Configuration

Multi-tenancy is enabled at the schema/class level, not in the Docker setup. You'll configure this when creating your schema in the application code using the Weaviate JavaScript client.

Example:
```javascript
await client.schema.classCreator().withClass({
  class: 'Document',
  multiTenancyConfig: {
    enabled: true
  },
  properties: [
    // your properties here
  ]
}).do();
```

## Troubleshooting

### Port already in use
If port 8080 is already in use, modify the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "8081:8080"  # Change 8081 to any available port
```

Then update your `WEAVIATE_HOST` in `.env`:
```
WEAVIATE_HOST=http://localhost:8081
```

### Container won't start
Check logs:
```bash
docker-compose logs weaviate
```

### Reset everything
```bash
docker-compose down -v
docker-compose up -d
```

