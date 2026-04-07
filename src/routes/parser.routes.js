const {
  parseRFPText,
  parseRFPFromBlob,
  checkRFPCompliance,
  helloWorldMcp,
  listMcpTools
} = require("../controllers/parser.controller");
const { createRegisteredRouter, defineRoute } = require("../mcp/routeRegistry");

const { router, routes } = createRegisteredRouter("/api/parser", [
  defineRoute({
    method: "post",
    path: "/parse",
    handler: parseRFPText,
    mcp: {
      name: "parse_rfp_text",
      description: "Parse extracted RFP text into structured metadata",
      input: {
        body: {
          extractedText: {
            type: "string",
            required: true,
            description: "Extracted RFP plain text"
          }
        }
      },
      output: {
        company: { type: "string", description: "Issuing company or organization" },
        criteria: { type: "array", description: "Key evaluation criteria" },
        deadlines: { type: "array", description: "Important deadlines" }
      }
    }
  }),
  defineRoute({
    method: "post",
    path: "/hello-mcp",
    handler: helloWorldMcp,
    mcp: {
      name: "hello_world_mcp",
      description: "A simple Hello World MCP tool for testing and interception.",
      input: {
        body: {
          name: {
            type: "string",
            required: false,
            description: "Optional name to greet."
          }
        }
      },
      output: {
        message: { type: "string", description: "Hello world message." }
      }
    }
  }),
  defineRoute({
    method: "get",
    path: "/mcp-tools-list",
    handler: listMcpTools,
    mcp: {
      name: "list_mcp_tools",
      description: "List all available MCP tools.",
      input: {},
      output: {
        tools: { type: "array", description: "Array of available MCP tools." }
      }
    }
  }),
  defineRoute({
    method: "post",
    path: "/parse-from-blob",
    handler: parseRFPFromBlob,
    mcp: {
      name: "parse_rfp_from_blob",
      description: "Download a blob-stored RFP file, extract text, and parse metadata",
      input: {
        body: {
          blobName: {
            type: "string",
            required: true,
            description: "Blob file name in incoming container"
          }
        }
      },
      output: {
        company: { type: "string", description: "Issuing company or organization" },
        criteria: { type: "array", description: "Key evaluation criteria" },
        deadlines: { type: "array", description: "Important deadlines" }
      }
    }
  }),
  defineRoute({
    method: "post",
    path: "/compliance",
    handler: checkRFPCompliance,
    mcp: {
      name: "check_rfp_compliance",
      description: "Check RFP text for required sections and compliance score",
      input: {
        body: {
          extractedText: {
            type: "string",
            required: true,
            description: "Extracted RFP plain text"
          }
        }
      },
      output: {
        present_sections: { type: "array", description: "Sections present in the RFP" },
        missing_sections: { type: "array", description: "Sections missing from the RFP" },
        compliance_score: { type: "number", description: "Compliance score percentage" }
      }
    }
  })
]);

module.exports = router;
module.exports.routes = routes;

// Made with Bob
