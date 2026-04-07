# RFP Demo Node - Azure AI Powered RFP Response Generator

Azure AI Powered RFP Response Generator built with Node.js + Express.

## Features

- RFP document parsing and analysis
- AI-powered proposal generation
- Azure Blob Storage integration
- Azure AI Search for past proposals
- Model Context Protocol (MCP) support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure your Azure credentials:
```bash
cp .env.example .env
```

3. Configure the following environment variables in `.env`:
   - Azure Storage connection string and container names
   - Azure AI Search endpoint and credentials
   - Azure OpenAI endpoint and API keys
   - Optional: MCP proxy token for securing the MCP endpoint

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## MCP (Model Context Protocol) Integration

This application exposes an MCP endpoint at `/mcp` that allows AI assistants and tools to interact with the RFP system.

### MCP Endpoint Configuration

The MCP endpoint is available at: `http://localhost:3000/mcp`

#### Authentication Options

1. **MCP Proxy Token (Optional)**
   - Set `MCP_PROXY_TOKEN` in your `.env` file to enable token-based authentication
   - When enabled, clients must include the token in the Authorization header:
     ```
     Authorization: Bearer YOUR_MCP_PROXY_TOKEN
     ```
   - If not set, the MCP endpoint will only require Entra ID authentication (if enabled)

2. **Entra ID Authentication**
   - Controlled by `DISABLE_ENTRA_AUTH` environment variable
   - When enabled, requires `x-ms-client-principal` header

#### Using with MCP Inspector

To test the MCP endpoint with MCP Inspector, use the following npx command:

1. **Without MCP Proxy Token:**
   ```bash
   npx @modelcontextprotocol/inspector http://localhost:3000/mcp
   ```

2. **With MCP Proxy Token:**
   ```bash
   npx @modelcontextprotocol/inspector http://localhost:3000/mcp --header "Authorization: Bearer YOUR_MCP_PROXY_TOKEN"
   ```

The MCP Inspector will open in your browser and allow you to:
- View all available MCP tools
- Test tool invocations
- Inspect request/response payloads
- Debug the MCP protocol communication

#### Available MCP Tools

The MCP server automatically exposes all registered API routes as tools. Each tool corresponds to an API endpoint and includes:
- Input schema validation
- Output schema definition
- Automatic documentation

### CORS Configuration

- The `/mcp` endpoint allows requests from any origin for MCP client compatibility
- All other API endpoints use strict CORS with allowed origins:
  - `http://localhost:3000`
  - `http://localhost:4200`
  - `http://localhost:5173`

## API Documentation

Swagger documentation is available at: `http://localhost:3000/api-docs`

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm run index:proposals` - Index past proposals into Azure AI Search

## Environment Variables

See `.env.example` for all available configuration options.

### Required Variables
- `AZURE_STORAGE_CONNECTION_STRING`
- `AZURE_SEARCH_ENDPOINT`
- `AZURE_SEARCH_API_KEY`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`

### Optional Variables
- `PORT` (default: 3000)
- `DISABLE_ENTRA_AUTH` (default: false)
- `MCP_PROXY_TOKEN` (for securing MCP endpoint)

## License

Made with Bob
