const { searchSimilarProposals } = require("../services/search.service");
const { downloadBlob } = require("../services/blob.service");
const { extractTextFromFileBuffer } = require("../services/parser.service");

async function retrieveSimilarProposals(req, res) {
  try {
    const { extractedText, industry } = req.body;

    if (!extractedText || typeof extractedText !== "string") {
      return res.status(400).json({ error: "Missing extractedText in request body" });
    }

    const proposals = await searchSimilarProposals(industry, extractedText);
    return res.json({ industry: industry || null, proposals });
  } catch (err) {
    console.error("Proposals /retrieve error:", err);
    return res.status(500).json({ error: err.message });
  }
}

async function retrieveSimilarProposalsFromBlob(req, res) {
  try {
    const { blobName, industry } = req.body;

    if (!blobName || typeof blobName !== "string") {
      return res.status(400).json({ error: "Missing blobName in request body" });
    }

    const buffer = await downloadBlob("incoming", blobName);
    const file = { originalname: blobName, buffer };
    const extractedText = await extractTextFromFileBuffer(file);

    const proposals = await searchSimilarProposals(industry, extractedText);
    return res.json({ blobName, industry: industry || null, proposals });
  } catch (err) {
    console.error("Proposals /retrieve-from-blob error:", err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  retrieveSimilarProposals,
  retrieveSimilarProposalsFromBlob
};

// Made with Bob
