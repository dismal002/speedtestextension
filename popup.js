document.addEventListener('DOMContentLoaded', () => {
  // Display the most recent results when the popup opens
  displayMostRecentResults();

  // Start the speed test when the button is clicked
  document.getElementById('testButton').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "startSpeedTest" }, response => {
      console.log("Speed test started:", response);
    });
  });

  // Download all past results when the "Download All" button is clicked
  document.getElementById('downloadAllButton').addEventListener('click', () => {
    downloadAllResults();
  });
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "speedTestFinished") {
    console.log("Speed test finished, received results:", message.results);
    // Display the results in the popup
    displayResults(message.results);
  }
});

// Function to fetch and display the most recent results from storage
function displayMostRecentResults() {
  chrome.storage.local.get('speedTestResults', (data) => {
    const allResults = data.speedTestResults || [];
    if (allResults.length > 0) {
      const mostRecent = allResults[allResults.length - 1];
      displayResults(mostRecent.results);
    } else {
      document.getElementById('result').textContent = 'No recent results.';
    }
  });
}

// Function to display the results in the popup
function displayResults(results) {
  const resultElement = document.getElementById('result');
  resultElement.textContent = JSON.stringify(results, null, 2); // Pretty print the results
}

// Function to download all past results
function downloadAllResults() {
  chrome.storage.local.get('speedTestResults', (data) => {
    const allResults = data.speedTestResults || [];
    if (allResults.length === 0) {
      alert('No results to download.');
      return;
    }

    const content = JSON.stringify(allResults, null, 2); // Convert all results to JSON string
    const file = new Blob([content], { type: 'application/json' });

    // Create a download link using DOM (only possible in popup or content scripts)
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "all_speed_test_results.json"; // Name of the downloaded file
    link.click();

    // Clean up
    URL.revokeObjectURL(link.href);
  });
}
