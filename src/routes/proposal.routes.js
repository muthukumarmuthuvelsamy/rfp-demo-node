const {
  retrieveSimilarProposals,
  retrieveSimilarProposalsFromBlob
} = require("../controllers/proposal.controller");
const { createRegisteredRouter, defineRoute } = require("../mcp/routeRegistry");

const { router, routes } = createRegisteredRouter("/api/proposals", [
  defineRoute({
    method: "post",
    path: "/retrieve",
    handler: retrieveSimilarProposals,
    mcp: {
      name: "retrieve_similar_proposals",
      description: "Retrieve similar past proposals using extracted RFP text and optional industry",
      input: {
        body: {
          extractedText: {
            type: "string",
            required: true,
            description: "Extracted RFP plain text"
          },
          industry: {
            type: "string",
            description: "Optional industry filter"
          }
        }
      },
      output: {
        industry: { type: "string", description: "Industry used for search" },
        proposals: { type: "array", description: "Matching proposals" }
      }
    }
  }),
  defineRoute({
    method: "post",
    path: "/retrieve-from-blob",
    handler: retrieveSimilarProposalsFromBlob,
    mcp: {
      name: "retrieve_similar_proposals_from_blob",
      description: "Retrieve similar proposals using an RFP document stored in blob storage",
      input: {
        body: {
          blobName: {
            type: "string",
            required: true,
            description: "Blob file name in incoming container"
          },
          industry: {
            type: "string",
            description: "Optional industry filter"
          }
        }
      },
      output: {
        blobName: { type: "string", description: "Blob file used for retrieval" },
        industry: { type: "string", description: "Industry used for search" },
        proposals: { type: "array", description: "Matching proposals" }
      }
    }
  })
]);

module.exports = router;
module.exports.routes = routes;

// Made with Bob
