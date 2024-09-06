import SpeedTest from 'https://cdn.skypack.dev/@cloudflare/speedtest';

// Set up periodic speed tests and handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed. Setting up periodic speed tests.");

  // Create an alarm to trigger every hour
  chrome.alarms.create('speedTestAlarm', { periodInMinutes: 60 });

  // Add listener for the alarm
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'speedTestAlarm') {
      runSpeedTest();
    }
  });
});

// Function to run speed test
function runSpeedTest() {
  console.log('Starting speed test...');

  const engine = new SpeedTest({
    autoStart: true
  });

  engine.onResultsChange = ({ type }) => {
    if (!engine.isFinished) {
      console.log('Speed Test Results (raw):', engine.results.raw);
    }
  };

  engine.onFinish = results => {
    const summary = results.getSummary();
    console.log('Speed Test Finished! Summary:', summary);

    // Add a timestamp to the results
    const resultWithTimestamp = {
      timestamp: new Date().toISOString(),
      results: summary
    };

    // Fetch existing results and append the new result
    chrome.storage.local.get('speedTestResults', (data) => {
      let allResults = data.speedTestResults;

      // Ensure allResults is an array, even if it's undefined or null
      if (!Array.isArray(allResults)) {
        allResults = [];
      }

      allResults.push(resultWithTimestamp);

      // Store the updated results back in storage
      chrome.storage.local.set({ speedTestResults: allResults }, () => {
        console.log('Results successfully saved in storage.');
      });

      // Send the latest result to the popup for display
      chrome.runtime.sendMessage({ action: "speedTestFinished", results: summary });
    });
  };

  engine.onError = (e) => {
    console.error('Speed Test Error:', e);
  };
}

// Listen for messages to start speed test manually
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startSpeedTest") {
    console.log("Received startSpeedTest message, starting speed test...");
    runSpeedTest();
    sendResponse({ status: "Speed test started" });
  }
});
