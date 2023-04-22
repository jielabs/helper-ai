chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getKeys") {
    const getStorageData = (key) => {
      return new Promise((resolve) => {
        chrome.storage.sync.get(key, (data) => {
          resolve(data[key]);
        });
      });
    };

    const handleGetKeys = async () => {
      const apiKey = await getStorageData("apiKey");

      sendResponse({ apiKey });
    };

    handleGetKeys();

    // Keep the listener open for the async response
    return true;
  }
});
