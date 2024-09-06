document.addEventListener('DOMContentLoaded', () => {
  const testButton = document.getElementById('testButton');
  const resultDiv = document.getElementById('result');
  const downloadButton = document.getElementById('downloadButton');

  // Function to display results
  function displayResults(results) {
    resultDiv.innerHTML = `<pre>${JSON.stringify(results, null, 2)}</pre>`;
  }

  // Function to load results from storage and display them
  function loadResults() {
    chrome.storage.local.get('speedTestResults', (data) => {
      const results = data.speedTestResults || [];
      if (results.length > 0) {
        displayResults(results[results.length - 1].results);
      } else {
        resultDiv.textContent = "No results available.";
      }
    });
  }

  // Load results when popup is opened
  loadResults();

  // Event listener for the test button
  testButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "startSpeedTest" }, (response) => {
      if (response.status === "Speed test started") {
        resultDiv.textContent = "Speed test started...";
      } else {
        resultDiv.textContent = "Failed to start speed test.";
      }
    });
  });

  // Event listener for receiving results from the background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "speedTestFinished") {
      const results = message.results;
      displayResults(results);
    }
  });

  // Event listener for the download button
  downloadButton.addEventListener('click', () => {
    chrome.storage.local.get('speedTestResults', (data) => {
      const results = data.speedTestResults || [];
      if (results.length > 0) {
        const content = JSON.stringify(results, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link element for download
        const tempLink = document.createElement('a');
        tempLink.href = url;
        tempLink.download = 'speedTestResults.json';
        
        // Append link to the body, click it, then remove it
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        
        // Revoke the object URL to free up memory
        URL.revokeObjectURL(url);
      } else {
        alert('No results available to download.');
      }
    });
  });
});
