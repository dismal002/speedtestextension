document.addEventListener('DOMContentLoaded', () => {
  const testButton = document.getElementById('testButton');
  const resultDiv = document.getElementById('result');
  const downloadButton = document.getElementById('downloadButton');

  // Function to display results
  function displayResults(results) {
    resultDiv.innerHTML = `<pre>${JSON.stringify(results, null, 2)}</pre>`;
  }

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
      const content = JSON.stringify(results, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'speedTestResults.json';
      link.click();
      URL.revokeObjectURL(url);
    });
  });
});
