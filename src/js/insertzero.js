const studentData = {};

(async function loadAxios() {
  if (typeof axios === "undefined") {
    console.log("Axios is not available, loading now...");
    await new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";
      script.onload = resolve;
      document.head.appendChild(script);
    });
    console.log("Axios loaded successfully!");
  } else {
    console.log("Axios is already loaded.");
  }
})();

function sendMessageToExtension(action, data = null) {
  window.postMessage({ action, data }, "*");
}

function calculateProgress(current, total) {
  return total ? Math.round((current / total) * 100) : 0;
}

window.progressUpdate = (progress, total = null) => {
  const percentage = calculateProgress(progress, total);
  const barCount = Math.round((percentage / 100) * 20);
  const bar = "█".repeat(barCount).padEnd(20, "-");
  console.clear();
  console.log(`${bar} ${percentage}% Complete.`);
};

function collectStudentData() {
  document.querySelectorAll(".slick-row").forEach((row) => {
    const studentIdClass = [...row.classList].find((cls) =>
      cls.startsWith("student_")
    );
    const studentId = studentIdClass?.replace("student_", "");

    if (!studentId) return;

    if (!studentData[studentId]) {
      studentData[studentId] = {};
    }

    row.querySelectorAll(".slick-cell.assignment").forEach((cell) => {
      const assignmentClass = [...cell.classList].find((cls) =>
        cls.startsWith("assignment_")
      );
      const assignmentId = assignmentClass?.replace("assignment_", "");

      if (!assignmentId) return;

      const inputField = cell.querySelector(
        'input[type="text"], input.css-f7qphh-textInput'
      );
      const gradeSpan = cell.querySelector(".Grade");
      const gradeValue = inputField
        ? inputField.value.trim()
        : gradeSpan?.innerText.trim() || null;

      studentData[studentId][assignmentId] =
        gradeValue && gradeValue !== "–" ? gradeValue : -1;
    });
  });
}

window.autoScroll = () => {
  const observer = new MutationObserver(() => {
    console.log("Collecting data...");
    collectStudentData();
  });

  observer.observe(document.querySelector("#gradebook_grid"), {
    childList: true,
    subtree: true,
  });

  const viewport = document.querySelector(".viewport_1.slick-viewport");
  if (!viewport) {
    console.error("Viewport not found. Ensure the page is fully loaded.");
    return;
  }

  const step = 30;
  const delay = 20;
  const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
  let progress;
  let scrollInterval = setInterval(() => {
    const currentScroll = viewport.scrollLeft;
    progress = calculateProgress(currentScroll, maxScrollLeft);

    window.progressUpdate(currentScroll, maxScrollLeft);
    sendMessageToExtension("sendAutoScrollUpdate", progress);

    if (currentScroll >= maxScrollLeft - step) {
      viewport.scrollLeft = 0;
      clearInterval(scrollInterval);
      sendMessageToExtension("sendAutoScrollUpdate", 100);
      observer.disconnect();
      // console.log("Final student data:", studentData);
    } else {
      viewport.scrollLeft += step;
    }
  }, delay);

  if (progress === 100 && Object.keys(studentData).length === 0) {
    sendMessageToExtension("sendAutoScrollUpdate", false);
  }
};

window.saveGrades = async (accessToken, courseId) => {
  if (!accessToken || !courseId) {
    console.error("ERROR: No access token or course ID provided!");
    return;
  }

  const missingGrades = [];

  for (const studentId in studentData) {
    for (const assignmentId in studentData[studentId]) {
      if (studentData[studentId][assignmentId] === -1) {
        missingGrades.push({ studentId, assignmentId });
      }
    }
  }

  if (missingGrades.length === 0) {
    console.log("No missing grades to update.");
    alert("No Grades to Smoke! (⌐■_■)");
    sendMessageToExtension("sendSaveGradesUpdate", 100);
    return;
  }

  console.log("Updating missing grades...");

  const total = missingGrades.length;
  let progress = 0;

  for (const { studentId, assignmentId } of missingGrades) {
    try {
      const url = `/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${studentId}`;
      const payload = {
        submission: {
          assignment_id: assignmentId,
          user_id: studentId,
          posted_grade: 0,
        },
        include: ["visibility", "sub_assignment_submissions"],
        prefer_points_over_scheme: true,
        originator: "gradebook",
      };

      await axios.put(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      progress++;
      sendMessageToExtension(
        "sendSaveGradesUpdate",
        calculateProgress(progress, total)
      );
    } catch (error) {
      console.error(
        `Failed to update grade for User ID: ${studentId}, Assignment ID: ${assignmentId}`,
        error
      );

      alert(
        "ERROR: Could not save grades, please make sure Access Token and Course ID are correct!"
      );
      return;
    }
  }

  console.log("All missing grades updated!");
};

console.log("autogradecanvas.js loaded!");

window.addEventListener("message", (event) => {
  if (event.source !== window || !event.data?.action) return;

  switch (event.data.action) {
    case "searchButtonClicked":
      console.log("Running autoScroll...");
      window.autoScroll();
      break;

    case "saveGradesButtonClicked":
      const { accessToken, courseId } = event.data;
      console.log("Running saveGrades...");
      window.saveGrades(accessToken, courseId);
      break;

    default:
      console.warn(`Unhandled message action: ${event.data.action}`);
  }
});
