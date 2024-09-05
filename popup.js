document.getElementById('testButton').addEventListener('click', () => {
  console.log("Button clicked, sending message to background script...");
  chrome.runtime.sendMessage({ action: "startSpeedTest" }, response => {
    console.log("Response from background script:", response);
  });
});



// Fetch the last speed test result from storage
chrome.storage.local.get('speedTestResults', data => {
  if (data.speedTestResults) {
    document.getElementById('result').textContent = JSON.stringify(data.speedTestResults, null, 2);
  }
});
