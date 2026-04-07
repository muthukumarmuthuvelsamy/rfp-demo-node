const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { MCP_PROXY_TOKEN } = require("../config/env");

function createMcpHttpHandlers({ mcpServer, requireAuth }) {
  console.log("Creating MCP HTTP handlers...");
  
  // Create transport once - it manages connections internally
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });
  
  console.log("Transport created, connecting to MCP server...");

  // Connect the MCP server to the transport
  mcpServer.server.connect(transport);
  
  console.log("MCP server connected to transport");

  // Middleware to check MCP proxy token if configured
  const checkMcpToken = (req, res, next) => {
    console.log("Checking MCP token...");
    // If no token is configured, skip token check
    if (!MCP_PROXY_TOKEN) {
      console.log("No MCP token configured, skipping check");
      return next();
    }

    // Check Authorization header for Bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Missing or invalid Authorization header");
      return res.status(401).json({
        error: "Missing or invalid Authorization header",
        type: "MCP_AUTH_ERROR"
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    if (token !== MCP_PROXY_TOKEN) {
      console.log("Invalid MCP proxy token");
      return res.status(403).json({
        error: "Invalid MCP proxy token",
        type: "MCP_AUTH_ERROR"
      });
    }

    console.log("MCP token validated successfully");
    return next();
  };

  const mcpHandler = [
    checkMcpToken,
    requireAuth,
    async (req, res) => {
      console.log("=== MCP Request ===");
      console.log("Method:", req.method);
      console.log("Headers:", JSON.stringify(req.headers, null, 2));
      console.log("Body:", JSON.stringify(req.body, null, 2));
      
      try {
        console.log("Calling transport.handleRequest...");
        // The transport handles the request directly
        // It manages SSE streaming and JSON-RPC protocol internally
        await transport.handleRequest(req, res, req.body);
        console.log("transport.handleRequest completed");
      } catch (error) {
        console.error("=== MCP transport error ===");
        console.error("Error:", error);
        console.error("Error message:", error.message);
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
