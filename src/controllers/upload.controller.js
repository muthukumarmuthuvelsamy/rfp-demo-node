const { v4: uuidv4 } = require("uuid");
const { uploadToBlob } = require("../services/blob.service");
const { extractTextFromFileBuffer } = require("../services/parser.service");

async function uploadRFP(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileId = uuidv4();
    const originalName = req.file.originalname;
    const blobName = `${fileId}-${originalName}`;

    await uploadToBlob("incoming", blobName, req.file.buffer);

    const extractedText = await extractTextFromFileBuffer(req.file);

    return res.json({
      message: "RFP uploaded successfully",
      fileId,
      blobName,
      extractedTextPreview: extractedText.substring(0, 2000),
      extractedText
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  uploadRFP
};

// Made with Bob
