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
};

// Made with Bob
