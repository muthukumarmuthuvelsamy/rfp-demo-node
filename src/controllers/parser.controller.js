// MCP tool: List all available MCP tools
async function listMcpTools(req, res) {
  // mcpServer is not available here, so we pass the list via req or global
  if (req.mcpServer && typeof req.mcpServer.listTools === 'function') {
    const tools = req.mcpServer.listTools();
    res.json({ tools });
  } else {
    res.status(500).json({ error: 'MCP server not available in request context' });
  }
}
// Hello World MCP tool handler (connect from MCP inspector)
async function helloWorldMcp(req, res) {
  // If an MCP inspector/interceptor is present, connect and respond
  if (req.mcpInspectorConnect) {
    await req.mcpInspectorConnect(req, res);
    return;
  }
  res.json({ message: "Connected from MCP inspector!" });
}
const {
  extractTextFromFileBuffer,
  parseRFP,
  checkCompliance
} = require("../services/parser.service");
const { downloadBlob } = require("../services/blob.service");

async function parseRFPText(req, res) {
  try {
    const { extractedText } = req.body;

    if (!extractedText || typeof extractedText !== "string") {
      return res.status(400).json({ error: "Missing extractedText in request body" });
    }

    const parsedRFP = await parseRFP(extractedText);
    return res.json(parsedRFP);
  } catch (err) {
    console.error("Parser /parse error:", err);
    return res.status(500).json({ error: err.message });
  }
}

async function parseRFPFromBlob(req, res) {
  try {
    const { blobName } = req.body;

    if (!blobName || typeof blobName !== "string") {
      return res.status(400).json({ error: "Missing blobName in request body" });
    }

    const buffer = await downloadBlob("incoming", blobName);
    const file = { originalname: blobName, buffer };
    const extractedText = await extractTextFromFileBuffer(file);

    const parsedRFP = await parseRFP(extractedText);
    return res.json(parsedRFP);
  } catch (err) {
    console.error("Parser /parse-from-blob error:", err);
    return res.status(500).json({ error: err.message });
  }
}

async function checkRFPCompliance(req, res) {
  try {
    const { extractedText } = req.body;

    if (!extractedText || typeof extractedText !== "string") {
      return res.status(400).json({ error: "Missing extractedText in request body" });
    }

    const complianceResult = await checkCompliance(extractedText);
    return res.json(complianceResult);
  } catch (err) {
    console.error("Parser /compliance error:", err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  parseRFPText,
  parseRFPFromBlob,
  checkRFPCompliance
  ,helloWorldMcp
  ,listMcpTools
};

// Made with Bob
