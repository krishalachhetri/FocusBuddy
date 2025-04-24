// === Setup ===
let sessionStartTime = null;
let tasks = [];

const alarm = new Audio("alarm.mp3");
const startTimerBtn = document.getElementById("start-timer-btn");
const resetTimerBtn = document.getElementById("reset-timer-btn");
const addTaskBtn = document.getElementById("add-task-btn");

// === Timer Update Logic ===
function updateTime() {
  chrome.storage.local.get(["timer", "timeOption", "isRunning"], (res) => {
    console.log("Loaded timeOption:", res.timeOption);

    const timeDisplay = document.getElementById("time");
    const totalSeconds = res.timeOption * 60;

    const minutes = `${res.timeOption - Math.ceil(res.timer / 60)}`.padStart(2, "0");
    let seconds = "00";
    if (res.timer % 60 !== 0) {
      seconds = `${60 - (res.timer % 60)}`.padStart(2, "0");
    }

    timeDisplay.textContent = `${minutes}:${seconds}`;
    startTimerBtn.textContent = res.isRunning ? "Pause Timer" : "Start Timer";

    if (res.timer >= totalSeconds && res.isRunning && sessionStartTime) {
      const sessionEnd = new Date();
      saveSession(sessionStartTime.toISOString(), sessionEnd.toISOString());
      sessionStartTime = null;
      alarm.play().catch((err) => {
        console.warn("🔇 Alarm failed to play (likely autoplay policy):", err);
      });
      chrome.storage.local.set({ isRunning: false });
    }
  });
}

updateTime();
setInterval(updateTime, 1000);

// === Timer Controls ===
startTimerBtn.addEventListener("click", () => {
  chrome.storage.local.get(["isRunning"], (res) => {
    const shouldRun = !res.isRunning;

    chrome.storage.local.set({ isRunning: shouldRun }, () => {
      startTimerBtn.textContent = shouldRun ? "Pause Timer" : "Start Timer";
      if (shouldRun) sessionStartTime = new Date();
    });
  });
});

resetTimerBtn.addEventListener("click", () => {
  chrome.storage.local.set({ timer: 0, isRunning: false }, () => {
    startTimerBtn.textContent = "Start Timer";
  });
});

// === Task Management ===
addTaskBtn.addEventListener("click", addTask);

chrome.storage.sync.get(["tasks"], (res) => {
  tasks = res.tasks || [];
  renderTasks();
});

function saveTasks() {
  chrome.storage.sync.set({ tasks });
}

function renderTask(index) {
  const taskRow = document.createElement("div");

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter a task...";
  input.value = tasks[index];
  input.className = "task-input";
  input.addEventListener("change", () => {
    tasks[index] = input.value;
    saveTasks();
  });

  const deleteBtn = document.createElement("input");
  deleteBtn.type = "button";
  deleteBtn.value = "X";
  deleteBtn.className = "task-delete";
  deleteBtn.addEventListener("click", () => {
    deleteTask(index);
  });

  taskRow.appendChild(input);
  taskRow.appendChild(deleteBtn);

  const container = document.getElementById("task-container");
  container.appendChild(taskRow);
}

function addTask() {
  const index = tasks.length;
  tasks.push("");
  renderTask(index);
  saveTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  renderTasks();
  saveTasks();
}

function renderTasks() {
  const container = document.getElementById("task-container");
  container.textContent = "";
  tasks.forEach((_, index) => renderTask(index));
}

function saveSession(start, end) {
  fetch("http://localhost:8000/log-session/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ start, end }),
  })
  .then((res) => res.json())
  .then((data) => {
    console.log("✅ Session logged to backend:", data);
  })
  .catch((err) => {
    console.error("❌ Failed to log session:", err);
  });
}

