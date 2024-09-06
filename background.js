import SpeedTest from 'https://cdn.skypack.dev/@cloudflare/speedtest';

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed. Setting up periodic speed tests.");
  chrome.alarms.create('speedTestAlarm', { periodInMinutes: 60 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'speedTestAlarm') {
      runSpeedTest();
    }
  });
});

function runSpeedTest() {
  console.log('Starting speed test...');
  const engine = new SpeedTest({ autoStart: true });

  engine.onResultsChange = ({ type }) => {
    if (!engine.isFinished) {
      console.log('Speed Test Results (raw):', engine.results.raw);
    }
  };

  engine.onFinish = results => {
    const summary = results.getSummary();
    console.log('Speed Test Finished! Summary:', summary);
    const resultWithTimestamp = { timestamp: new Date().toISOString(), results: summary };

    chrome.storage.local.get('speedTestResults', (data) => {
      let allResults = data.speedTestResults || [];
      allResults.push(resultWithTimestamp);
      chrome.storage.local.set({ speedTestResults: allResults }, () => {
        console.log('Results successfully saved in storage.');
        chrome.runtime.sendMessage({ action: "speedTestFinished", results: summary });
      });
    });
  };

  engine.onError = (e) => {
    console.error('Speed Test Error:', e);
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startSpeedTest") {
    console.log("Received startSpeedTest message, starting speed test...");
    runSpeedTest();
    sendResponse({ status: "Speed test started" });
  }
});
