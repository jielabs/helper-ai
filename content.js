const openAiApiCall = async (apiKey, prompt) => {
  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      model: "text-davinci-003",
      max_tokens: 100,
      n: 1,
      stop: null,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].text.trim();
};

chrome.runtime.sendMessage({ type: "getKeys" }, async (response) => {
  const apiKey = response.apiKey;

  if (!apiKey) {
    alert("Please set your OpenAI API key in the extension options.");
    return;
  }

  document.addEventListener("keyup", async (event) => {
    if (event.key !== ";") {
      return;
    }

    const target = event.target;
    let inputText = target.value;

    if (inputText === "" || inputText === undefined) {
      inputText = document.activeElement.innerText; // LinkedIn
      if (inputText === "" || inputText === undefined) {
        inputText = document.activeElement.textContent; // Twitter
      }
    }

    console.log("inputText: ", inputText);

    // Match formats
    const helpRegex = /help:\s*(.+?);/g;
    const langRegex = /translate,([a-zA-Z]+):\s*(.+?);/g;
    const codeRegex = /code,([a-zA-Z]+):\s*(.+?);/g;

    const updateInput = async (regex, callback) => {
      let updatedText = inputText;
      let match;
      let matchFound = false;

      console.log("regex: ", regex);
      console.log("updatedText: ", updatedText);

      while ((match = regex.exec(updatedText)) !== null) {
        console.log("Match found:", match); // Log the match
        matchFound = true;
        const generatedText = await callback(match);
        console.log("GeneratedText: ", generatedText);
        updatedText = updatedText.replace(match[0], generatedText);

        // Reset lastIndex to 0 to avoid infinite loops
        regex.lastIndex = 0;
      }
      if (matchFound) {
        const event = new Event("input", {
          bubbles: true,
          cancelable: true,
        });
        await document.activeElement.dispatchEvent(event);
        target.value = updatedText; //General
        document.activeElement.innerText = updatedText; //Linkedin
        document.activeElement.textContent = updatedText; //Twitter
      }
    };

    const generateText = async (query) => {
      console.log("query: ", query);
      return await openAiApiCall(apiKey, query);
    };

    const translateText = async (language, query) => {
      console.log("language: ", language);
      const prompt = `Translate the following English text to ${language}: "${query}"`;
      return await openAiApiCall(apiKey, prompt);
    };

    const generateCode = async (language, query) => {
      console.log("programming language: ", language);
      const prompt = `Write ${language} code to ${query}`;
      return await openAiApiCall(apiKey, prompt);
    };

    await updateInput(helpRegex, (match) => generateText(match[1]));
    await updateInput(langRegex, (match) => translateText(match[1], match[2]));
    await updateInput(codeRegex, (match) => generateCode(match[1], match[2]));
  });
});
