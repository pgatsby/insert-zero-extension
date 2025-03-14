console.log("Connected to content script");

let popupPort = null; // Store the popup connection

function sendMessageToContent(action, data = {}) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs.length) {
      console.warn("No active tab found.");
      return;
    }
    chrome.tabs.sendMessage(tabs[0].id, { action, data });
  });
}

// Handle messages from the popup
function handlePopupMessage(msg) {
  const { action, accessToken, courseId } = msg;

  switch (action) {
    case "searchButtonClicked":
      console.log("Forwarding search request to content script...");
      sendMessageToContent("searchButtonClicked");
      break;

    case "saveGradesButtonClicked":
      console.log("Forwarding save grades request to content script...");
      sendMessageToContent("saveGradesButtonClicked", {
        accessToken,
        courseId,
      });
      break;

    default:
      console.warn(`Unhandled popup action: ${action}`);
  }
}

// Handle messages from the content script
function handleContentMessage(msg, sendResponse) {
  const { action, data } = msg;

  switch (action) {
    case "messageFromContentAndAutoScroll":
      console.log("Received auto-scroll update:", data);
      popupPort?.postMessage({
        status: "auto-scroll-update",
        receivedData: data,
      });
      sendResponse({
        status: "Auto-scroll update received in background script",
      });
      break;

    case "messageFromContentAndSaveGrades":
      console.log("Received save grades update:", data);
      popupPort?.postMessage({
        status: "save-grades-update",
        receivedData: data,
      });
      sendResponse({
        status: "Save-grades update received in background script",
      });
      break;

    default:
      console.warn(`Unhandled content script action: ${action}`);
  }
}

// Handle persistent connection from popup.js
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "content-port") {
    console.log("Popup connected to background script.");
    popupPort = port;

    port.onMessage.addListener(handlePopupMessage);

    port.onDisconnect.addListener(() => {
      console.log("Popup disconnected.");
      popupPort = null;
    });
  }
});

// Handle messages from content.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  handleContentMessage(msg, sendResponse);
});
