document.addEventListener("DOMContentLoaded", function () {
  const elements = {
    segments: document.querySelectorAll(".win98-segment"),
    searchGif: document.getElementById("searchGif"),
    progressText: document.getElementById("progressText"),
    searchButton: document.getElementById("searchCourse"),
    saveGradesButton: document.getElementById("saveGrades"),
    refreshButton: document.getElementById("refreshBrowser"),
    progressContainer: document.getElementById("progressContainer"),
    accessTokenInput: document.getElementById("accessToken"),
    courseIdInput: document.getElementById("courseId"),
    saveAccessTokenCheckbox: document.getElementById("saveAccessToken"),
    toggleAccessTokenButton: document.getElementById("toggleAccessToken"),
    toggleIcon: document.getElementById("toggleAccessToken").querySelector("i"),
  };

  // Load saved access token if available
  const savedAccessToken = localStorage.getItem("savedAccessToken");
  if (savedAccessToken) {
    elements.accessTokenInput.value = savedAccessToken;
    elements.saveAccessTokenCheckbox.checked = true;
  }

  // Toggle access token visibility
  elements.toggleAccessTokenButton.addEventListener("click", function () {
    const isPassword = elements.accessTokenInput.type === "password";
    elements.accessTokenInput.type = isPassword ? "text" : "password";
    elements.toggleIcon.classList.toggle("fa-eye");
    elements.toggleIcon.classList.toggle("fa-eye-slash");
  });

  // Save access token when checkbox is checked
  elements.saveAccessTokenCheckbox.addEventListener("change", function () {
    if (elements.saveAccessTokenCheckbox.checked) {
      localStorage.setItem("savedAccessToken", elements.accessTokenInput.value);
    } else {
      localStorage.removeItem("savedAccessToken");
    }
  });

  // Update saved access token when user types
  elements.accessTokenInput.addEventListener("input", function () {
    if (elements.saveAccessTokenCheckbox.checked) {
      localStorage.setItem("savedAccessToken", elements.accessTokenInput.value);
    }
  });

  elements.progressContainer.style.display = "none";
  elements.refreshButton.style.display = "none";

  const port = chrome.runtime.connect({ name: "content-port" });

  elements.searchButton.addEventListener("click", function () {
    elements.searchGif.style.display = "block";
    elements.searchButton.disabled = true;
    elements.saveGradesButton.style.display = "none";
    elements.saveGradesButton.disabled = true;
    elements.progressContainer.style.display = "flex";

    port.postMessage({ action: "searchButtonClicked" });
  });

  elements.saveGradesButton.addEventListener("click", function () {
    const accessToken = elements.accessTokenInput.value.trim();
    const courseId = elements.courseIdInput.value.trim();

    if (!accessToken || !courseId) {
      alert("ERROR: Access Token and Course ID are required to proceed.");
      return;
    }

    elements.saveGradesButton.textContent = "Saving...";
    elements.saveGradesButton.disabled = true;

    port.postMessage({
      action: "saveGradesButtonClicked",
      accessToken,
      courseId,
    });
  });

  port.onMessage.addListener((msg) => {
    if (msg.status === "auto-scroll-update") {
      if (msg.receivedData === false) {
        alert("No students found in the gradebook. Please verify the course.");
        searchButton.disabled = false;
        searchGif.style.display = "none";
        saveGradesButton.style.display = "none";
        progressContainer.style.display = "none";
        return;
      }

      updateProgressBar(msg.receivedData);
      if (parseInt(msg.receivedData) === 100) {
        elements.searchGif.style.display = "none";
        elements.saveGradesButton.style.display = "inline-block";
        elements.saveGradesButton.disabled = false;
        elements.saveGradesButton.textContent = "Save Grades";
      }
    }

    if (msg.status === "save-grades-update") {
      updateProgressBar(msg.receivedData);
      if (parseInt(msg.receivedData) === 100) {
        elements.saveGradesButton.style.display = "none";
        elements.saveGradesButton.textContent = "Save Grades";
        elements.saveGradesButton.disabled = true;
        elements.refreshButton.style.display = "inline-block";
        elements.refreshButton.disabled = false;
      }
    }
  });

  function updateProgressBar(progress) {
    progress = Math.max(0, Math.min(100, Math.round(progress)));
    elements.progressText.textContent = `${progress}%`;

    let segmentsToShow = Math.round(
      (elements.segments.length * progress) / 100
    );
    elements.segments.forEach((seg, index) => {
      seg.style.opacity = index < segmentsToShow ? "1" : "0";
    });
  }

  elements.refreshButton.addEventListener("click", function () {
    elements.saveGradesButton.style.display = "inline-block";
    elements.searchButton.disabled = false;
    elements.refreshButton.style.display = "none";
    elements.refreshButton.disabled = true;
    elements.searchGif.style.display = "none";
    elements.progressContainer.style.display = "none";
    elements.progressText.textContent = "0%";
    elements.segments.forEach((seg) => (seg.style.opacity = "0"));

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length > 0) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
  });

  port.onDisconnect.addListener(() => console.log("Popup disconnected."));
});
