const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { MCP_PROXY_TOKEN } = require("../config/env");

function createMcpHttpHandlers({ mcpServer, requireAuth }) {
  // Create transport once - it manages connections internally
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  // Connect the MCP server to the transport
  mcpServer.server.connect(transport);

  // Middleware to check MCP proxy token if configured
  const checkMcpToken = (req, res, next) => {
    // If no token is configured, skip token check
    if (!MCP_PROXY_TOKEN) {
      return next();
    }

    // Check Authorization header for Bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Missing or invalid Authorization header",
        type: "MCP_AUTH_ERROR"
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    if (token !== MCP_PROXY_TOKEN) {
      return res.status(403).json({
        error: "Invalid MCP proxy token",
        type: "MCP_AUTH_ERROR"
      });
    }

    return next();
  };

  const mcpHandler = [
    checkMcpToken,
    requireAuth,
    async (req, res) => {
      try {
        // The transport handles the request directly
        // It manages SSE streaming and JSON-RPC protocol internally
        await transport.handleRequest(req, res, req.body);
      } catch (error) {
        console.error("MCP transport error:", error);
        console.error("Error stack:", error.stack);
        if (!res.headersSent) {
          return res.status(500).json({
            error: error.message,
            stack: error.stack,
            type: "MCP_TRANSPORT_ERROR"
          });
        }
      }
    }
  ];

  return {
    mcpHandler
  };
}

module.exports = {
  createMcpHttpHandlers
};

// Made with Bob
