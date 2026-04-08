let extractedTextGlobal = "";

// Helper function to show loader
function showLoader(loaderId, progressId, textId, buttonId) {
  document.getElementById(loaderId).classList.add("active");
  document.getElementById(buttonId).disabled = true;
  document.getElementById(progressId).style.width = "0%";
  document.getElementById(textId).textContent = "0%";
}

// Helper function to hide loader
function hideLoader(loaderId, buttonId) {
  document.getElementById(loaderId).classList.remove("active");
  document.getElementById(buttonId).disabled = false;
}

// Helper function to update progress
function updateProgress(progressId, textId, percentage) {
  document.getElementById(progressId).style.width = percentage + "%";
  document.getElementById(textId).textContent = percentage + "%";
}

// Simulate progress for API calls
function simulateProgress(progressId, textId, duration, callback) {
  let progress = 0;
  const interval = 50; // Update every 50ms
  const increment = (100 / duration) * interval;
  
  const timer = setInterval(() => {
    progress += increment;
    if (progress >= 95) {
      clearInterval(timer);
      updateProgress(progressId, textId, 95);
      // Wait for actual API response to complete to 100%
    } else {
      updateProgress(progressId, textId, Math.floor(progress));
    }
  }, interval);
  
  return timer;
}

async function uploadRFP() {
  const fileInput = document.getElementById("rfpFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file first.");
    return;
  }

  // Show loader
  showLoader("uploadLoader", "uploadProgress", "uploadProgressText", "uploadBtn");
  
  // Start progress simulation (2 seconds for upload)
  const progressTimer = simulateProgress("uploadProgress", "uploadProgressText", 2000);

  try {
    const formData = new FormData();
    formData.append("rfp", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    
    // Complete progress to 100%
    clearInterval(progressTimer);
    updateProgress("uploadProgress", "uploadProgressText", 100);
    
    // Show result after a brief delay
    setTimeout(() => {
      document.getElementById("uploadResult").textContent = JSON.stringify(data, null, 2);
      extractedTextGlobal = data.extractedText;
      hideLoader("uploadLoader", "uploadBtn");
    }, 500);
    
  } catch (error) {
    clearInterval(progressTimer);
    hideLoader("uploadLoader", "uploadBtn");
    alert("Upload failed: " + error.message);
  }
}

async function generateProposal() {
  if (!extractedTextGlobal) {
    alert("Upload RFP first!");
    return;
  }

  // Show loader
  showLoader("generateLoader", "generateProgress", "generateProgressText", "generateBtn");
  
  // Start progress simulation (5 seconds for generation - slower as AI processing takes longer)
  const progressTimer = simulateProgress("generateProgress", "generateProgressText", 5000);

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ extractedText: extractedTextGlobal })
    });

    const data = await res.json();
    
    // Complete progress to 100%
    clearInterval(progressTimer);
    updateProgress("generateProgress", "generateProgressText", 100);
    
    // Show result after a brief delay
    setTimeout(() => {
      document.getElementById("generateResult").textContent = JSON.stringify(data, null, 2);
      hideLoader("generateLoader", "generateBtn");
      
      // Enable action buttons after successful proposal generation
      document.getElementById("downloadBtn").disabled = false;
      document.getElementById("sendEmailBtn").disabled = false;
    }, 500);
    
  } catch (error) {
    clearInterval(progressTimer);
    hideLoader("generateLoader", "generateBtn");
    alert("Generation failed: " + error.message);
  }
}

async function downloadProposal() {
  try {
    // Disable button during download
    const downloadBtn = document.getElementById("downloadBtn");
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<span class="btn-icon">⏳</span> Downloading...';

    const res = await fetch("/api/download/proposal", {
      method: "GET"
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Download failed");
    }

    // Get the blob from response
    const blob = await res.blob();
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Re-enable button
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = '<span class="btn-icon">⬇️</span> Download';

  } catch (error) {
    alert("Download failed: " + error.message);
    
    // Re-enable button
    const downloadBtn = document.getElementById("downloadBtn");
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = '<span class="btn-icon">⬇️</span> Download';
  }
}
