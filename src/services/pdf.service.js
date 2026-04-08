const PDFDocument = require('pdfkit');

/**
 * Generate a professional PDF from proposal text
 * @param {string} proposalText - The generated proposal text
 * @returns {PDFDocument} - PDF document stream
 */
function generateProposalPDF(proposalText) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    },
    info: {
      Title: 'AI Generated Proposal',
      Author: 'AI RFP Proposal Generator - POD 5',
      Subject: 'RFP Response Proposal',
      Keywords: 'RFP, Proposal, AI Generated'
    }
  });

  // Define colors
  const primaryColor = '#6366f1';
  const textColor = '#1e293b';
  const secondaryColor = '#64748b';

  // Helper function to add a section
  function addSection(title, content, isFirst = false) {
    if (!isFirst) {
      doc.moveDown(2);
    }

    // Section title with background
    doc
      .rect(doc.x - 10, doc.y - 5, doc.page.width - 100, 30)
      .fill(primaryColor);

    doc
      .fillColor('#ffffff')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(title, doc.x, doc.y + 5);

    doc.moveDown(1.5);

    // Section content
    doc
      .fillColor(textColor)
      .fontSize(11)
      .font('Helvetica')
      .text(content.trim(), {
        align: 'justify',
        lineGap: 3
      });
  }

  // Add header with logo placeholder and title
  doc
    .fontSize(24)
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .text('AI GENERATED PROPOSAL', { align: 'center' });

  doc
    .fontSize(10)
    .fillColor(secondaryColor)
    .font('Helvetica')
    .text('Powered by AI RFP Proposal Generator - POD 5', { align: 'center' });

  doc
    .moveDown(0.5)
    .fontSize(9)
    .text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, { align: 'center' });

  // Add a horizontal line
  doc
    .moveDown(1)
    .strokeColor(primaryColor)
    .lineWidth(2)
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .stroke();

  doc.moveDown(2);

  // Parse the proposal text and extract sections
  const sections = [];
  const lines = proposalText.split('\n');
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip separator lines and empty lines at section boundaries
    if (trimmedLine.startsWith('===') || trimmedLine.startsWith('---')) {
      continue;
    }

    // Check if it's a section header (numbered sections)
    const sectionMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
    if (sectionMatch) {
      // Save previous section
      if (currentSection) {
        sections.push({
          title: currentSection,
          content: currentContent.join('\n').trim()
        });
      }
      // Start new section
      currentSection = sectionMatch[2];
      currentContent = [];
    } else if (trimmedLine && currentSection) {
      currentContent.push(line);
    }
  }

  // Add the last section
  if (currentSection && currentContent.length > 0) {
    sections.push({
      title: currentSection,
      content: currentContent.join('\n').trim()
    });
  }

  // Add all sections to PDF
  sections.forEach((section, index) => {
    // Add page break before each section except the first
    if (index > 0 && doc.y > doc.page.height - 200) {
      doc.addPage();
    }

    addSection(section.title, section.content, index === 0);
  });

  // Add simple footer at the end
  doc.moveDown(3);
  doc
    .fontSize(8)
    .fillColor(secondaryColor)
    .text(
      '© 2026 Team: Saritha, Davinder, Prasanna, Muthu & Jovitto. All rights reserved.',
      50,
      doc.page.height - 50,
      { align: 'center', width: doc.page.width - 100 }
    );

  // Don't call doc.end() here - let the route handle it
  return doc;
}

module.exports = {
  generateProposalPDF
};

// Made with Bob
