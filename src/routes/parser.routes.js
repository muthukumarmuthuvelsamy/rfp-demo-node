const {
  parseRFPText,
  parseRFPFromBlob,
  checkRFPCompliance
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
