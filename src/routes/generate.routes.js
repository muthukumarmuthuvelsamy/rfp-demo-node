const { generateRFP } = require("../controllers/generate.controller");
const { createRegisteredRouter, defineRoute } = require("../mcp/routeRegistry");

const { router, routes } = createRegisteredRouter("/api/generate", [
  defineRoute({
    method: "post",
    path: "/",
    handler: generateRFP,
    mcp: {
      name: "generate_proposal",
      description: "Generate a full RFP proposal from extracted RFP text",
      input: {
        body: {
          extractedText: {
            type: "string",
            required: true,
            description: "Full extracted plain text of the RFP"
          }
        }
      },
      output: {
        message: { type: "string", description: "Result message" },
        companyName: { type: "string", description: "Detected company name" },
        rfpData: { type: "object", description: "Parsed RFP metadata" },
        compliance: { type: "object", description: "Compliance result" },
        requirementsJson: { type: "object", description: "Structured requirements" },
        companyResearch: { type: "array", description: "Company research results" },
        retrievedEvidence: { type: "array", description: "Retrieved proposal evidence" },
        proposal: { type: "string", description: "Generated proposal text" },
        savedAs: { type: "string", description: "Saved blob name" }
      }
    }
  })
]);

module.exports = router;
module.exports.routes = routes;

// Made with Bob
