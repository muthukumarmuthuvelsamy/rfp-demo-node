const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { buildInputSchema, buildOutputSchema, toJsonSchemaLike } = require("./schema");

function createMcpServer({ name = "rfp-demo-mcp", version = "1.0.0", routes = [] } = {}) {
  const server = new McpServer({
    name,
    version
  });

  const toolMap = new Map();

  for (const route of routes) {
    if (route.mcp?.enabled === false) {
      continue;
    }

    const toolName = route.mcp?.name || createToolName(route);
    const description = route.mcp?.description || inferDescription(route);
    const inputSchema = buildInputSchema(route);
    const outputSchema = buildOutputSchema(route);

    toolMap.set(toolName, {
      name: toolName,
      description,
      method: route.method.toUpperCase(),
      path: route.fullPath,
      inputSchema,
      outputSchema,
      route
    });

    server.tool(
      toolName,
      description,
      inputSchema.shape,
      async (input = {}) => {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                tool: toolName,
                path: route.fullPath,
                method: route.method.toUpperCase(),
                validatedInput: input
              }, null, 2)
            }
          ]
        };
      }
    );
  }

  function listTools() {
    return Array.from(toolMap.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      method: tool.method,
      path: tool.path,
      inputSchema: toJsonSchemaLike(tool.inputSchema),
      outputSchema: toJsonSchemaLike(tool.outputSchema)
    }));
  }

  function getTool(name) {
    return toolMap.get(name);
  }

  return {
    server,
    listTools,
    getTool
  };
}

function createToolName(route) {
  const method = route.method.toLowerCase();
  const normalizedPath = route.fullPath
    .replace(/^\/+/, "")
    .replace(/[/:]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/_$/, "");

  return `${method}_${normalizedPath || "root"}`;
}

function inferDescription(route) {
  const method = route.method.toUpperCase();
  const path = route.fullPath;

  return `${method} ${path} MCP tool generated from Express route`;
}

module.exports = {
  createMcpServer
};

// Made with Bob
