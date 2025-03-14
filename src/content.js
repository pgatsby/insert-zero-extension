(function () {
  console.log("Content script injected and running.");

  // Inject insertzero.js into the webpage
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("js/insertzero.js");
  script.onload = function () {
    this.remove(); // Cleanup
  };
  document.documentElement.appendChild(script);

  function sendMessageToBackground(action, data = null) {
    chrome.runtime.sendMessage({ action, data }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn(
          "Error sending message:",
          chrome.runtime.lastError.message
        );
      } else {
        console.log("Background script responded:", response);
      }
    });
  }

  function forwardMessageToWebpage(action, data = null) {
    window.postMessage(data ? { action, ...data } : { action }, "*");
  }

  // Handle messages from background.js
  function handleBackgroundMessage(request) {
    switch (request.action) {
      case "searchButtonClicked":
        console.log("Forwarding search request to insertzero...");
        forwardMessageToWebpage("searchButtonClicked");
        break;

      case "saveGradesButtonClicked":
        console.log("Forwarding save grades request to insertzero...");
        if (request.data?.accessToken && request.data?.courseId) {
          forwardMessageToWebpage("saveGradesButtonClicked", {
            accessToken: request.data.accessToken,
            courseId: request.data.courseId,
          });
        } else {
          console.error("ERROR: No access token or course ID provided!");
        }
        break;

      default:
        console.warn(`Unhandled background message: ${request.action}`);
    }
  }

  // Handle messages from the webpage (insertzero.js)
  function handleWebpageMessage(event) {
    if (event.source !== window || !event.data?.action) return;

    switch (event.data.action) {
      case "sendAutoScrollUpdate":
        sendMessageToBackground(
          "messageFromContentAndAutoScroll",
          event.data.data
        );
        break;

      case "sendSaveGradesUpdate":
        sendMessageToBackground(
          "messageFromContentAndSaveGrades",
          event.data.data
        );
        break;

      default:
        console.warn(`Unhandled webpage message: ${event.data.action}`);
    }
  }

  // Listen for messages from background.js
  chrome.runtime.onMessage.addListener(handleBackgroundMessage);

  // Listen for messages from insertzero.js (Webpage → Content Script)
  window.addEventListener("message", handleWebpageMessage);
})();
