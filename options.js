document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("options-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const apiKey = document.getElementById("api-key").value;
      chrome.storage.sync.set({ apiKey }, () => {
        alert("API key saved!");
      });
    });

  chrome.storage.sync.get("apiKey", (data) => {
    if (data.apiKey) {
      document.getElementById("api-key").value = data.apiKey;
    }
  });
});
