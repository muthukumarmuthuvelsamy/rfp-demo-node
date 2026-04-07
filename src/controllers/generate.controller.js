const { extractRequirements, extractCompanyName } = require("../services/openai.service");
const { searchSimilarProposals } = require("../services/search.service");
const { generateFullProposal } = require("../services/proposal.service");
const { uploadToBlob } = require("../services/blob.service");
const { parseRFP, checkCompliance } = require("../services/parser.service");
const { researchCompany } = require("../services/websearch.service");

async function generateRFP(req, res) {
  try {
    const { extractedText } = req.body;

    if (!extractedText) {
      return res.status(400).json({ error: "extractedText is required" });
    }

    const rfpData = await parseRFP(extractedText);

    const compliance = await checkCompliance(extractedText);
    const {
      compliance_score = 0,
      missing_sections = [],
      present_sections = []
    } = compliance;

    if (compliance_score < 80) {
      return res.status(400).json({
        error: "RFP compliance score is below the minimum threshold",
        compliance_score,
        missing_sections,
        present_sections
      });
    }

    const requirementsJson = await extractRequirements(extractedText);

    const companyName = await extractCompanyName(extractedText);
    let companyResearch = [];

    if (companyName) {
      try {
        companyResearch = await researchCompany(companyName);
      } catch (error) {
        console.warn(`Company research failed: ${error.message}`);
      }
    }

    const retrievedEvidence = await searchSimilarProposals(
      requirementsJson.industry || "",
      extractedText
    );

    const proposal = await generateFullProposal({
      extractedText,
      requirementsJson,
      retrievedEvidence,
      rfpData,
      companyResearch
    });

    const outputBlobName = `proposal-${Date.now()}.txt`;
    await uploadToBlob("output", outputBlobName, Buffer.from(proposal, "utf-8"));

    return res.json({
      message: "Proposal generated successfully",
      companyName,
      rfpData,
      compliance,
      requirementsJson,
      companyResearch,
      retrievedEvidence,
      proposal,
      savedAs: outputBlobName
    });
  } catch (err) {
    console.error("Generate error:", err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  generateRFP
};

// Made with Bob
