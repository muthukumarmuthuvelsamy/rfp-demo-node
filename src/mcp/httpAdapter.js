const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");

function createMcpHttpHandlers({ mcpServer, requireAuth }) {
  let transport;

  const mcpHandler = [
    requireAuth,
    async (req, res) => {
      try {
        if (!transport) {
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined
          });

          await mcpServer.server.connect(transport);
        }

        return await transport.handleRequest(req, res, req.body);
      } catch (error) {
        console.error("MCP transport error:", error);
        if (!res.headersSent) {
          return res.status(500).json({
            error: error.message,
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
