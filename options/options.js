const timeOption = document.getElementById("time-option");

timeOption.addEventListener("change", (event) => {
  const val = event.target.value;
  if (val < 1 || val > 60) {
    timeOption.value = 25;
  }
});

const saveBtn = document.getElementById("save-btn");
saveBtn.addEventListener("click", () => {
  chrome.storage.local.set({
    timer: 0,
    timeOption: parseInt(timeOption.value),
    isRunning: false,
  }, () => {
    console.log("Time option saved:", timeOption.value);
  });
});

// Load saved value on page load
chrome.storage.local.get(["timeOption"], (res) => {
  if (res.timeOption) {
    timeOption.value = res.timeOption;
  }
});
