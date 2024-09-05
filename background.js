import SpeedTest from 'https://cdn.skypack.dev/@cloudflare/speedtest';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startSpeedTest") {
    console.log("Received startSpeedTest message, starting speed test...");
    runSpeedTest();
    sendResponse({ status: "Speed test started" });
  }
});

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
    chrome.storage.local.set({ speedTestResults: summary });
  };

  engine.onError = (e) => {
    console.error('Speed Test Error:', e);
  };
}

