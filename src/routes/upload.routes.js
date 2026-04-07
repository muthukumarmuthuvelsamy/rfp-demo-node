const multer = require("multer");
const { uploadRFP } = require("../controllers/upload.controller");
const { createRegisteredRouter, defineRoute } = require("../mcp/routeRegistry");

const upload = multer({ storage: multer.memoryStorage() });

const { router, routes } = createRegisteredRouter("/api/upload", [
  defineRoute({
    method: "post",
    path: "/",
    middlewares: [upload.single("rfp")],
    handler: uploadRFP,
    mcp: {
      name: "upload_rfp",
      description: "Upload an RFP document and extract its text",
      input: {
        body: {
          rfp: {
            type: "file",
            required: true,
            description: "Uploaded RFP file with base64 content"
          }
        }
      },
      output: {
        message: { type: "string", description: "Result message" },
        fileId: { type: "string", description: "Generated file identifier" },
        blobName: { type: "string", description: "Stored blob name" },
        extractedTextPreview: { type: "string", description: "Preview of extracted text" },
        extractedText: { type: "string", description: "Full extracted text" }
      }
    }
  })
]);

module.exports = router;
module.exports.routes = routes;

// Made with Bob
