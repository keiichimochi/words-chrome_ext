document.addEventListener('DOMContentLoaded', () => {
  const englishTextInput = document.getElementById('englishText');
  const processButton = document.getElementById('processButton');
  const loadingDiv = document.getElementById('loading');
  const resultsAreaDiv = document.getElementById('resultsArea');
  const translationOutputDiv = document.getElementById('translationOutput');
  const frequentWordsOutputUl = document.getElementById('frequentWordsOutput');
  const wordDetailOutputDiv = document.getElementById('wordDetailOutput');
  const selectedWordDisplaySpan = document.getElementById('selectedWordDisplay');
  const wordDefinitionP = document.getElementById('wordDefinition');
  const wordExampleP = document.getElementById('wordExample');
  const apiKeyNoticeDiv = document.getElementById('apiKeyNotice');
  const openOptionsLink = document.getElementById('openOptionsLink');

  let API_KEY = '';
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=`;

  // --- Helper Functions ---
  function showLoading(isLoading) {
    loadingDiv.style.display = isLoading ? 'block' : 'none';
    processButton.disabled = isLoading;
  }

  function displayError(section, message) {
    if (section === 'translation') {
      translationOutputDiv.textContent = `Error: ${message}`;
    } else if (section === 'words') {
      frequentWordsOutputUl.innerHTML = `<li>Error: ${message}</li>`;
    } else if (section === 'wordDetail') {
      wordDefinitionP.textContent = `Error: ${message}`;
      wordExampleP.textContent = '';
    }
    console.error(message);
  }

  async function callGeminiAPI(prompt) {
    if (!API_KEY) {
      apiKeyNoticeDiv.style.display = 'block';
      resultsAreaDiv.style.display = 'none';
      throw new Error("API Key not set.");
    }
    apiKeyNoticeDiv.style.display = 'none';

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      // Optional: Add safetySettings if needed
      // "safetySettings": [
      //   { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
      //   { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
      //   { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
      //   { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
      // ]
    };

    try {
      const response = await fetch(GEMINI_API_URL + API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
      }
      const data = await response.json();
      if (data.candidates && data.candidates.length > 0 &&
          data.candidates[0].content && data.candidates[0].content.parts &&
          data.candidates[0].content.parts.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else if (data.promptFeedback && data.promptFeedback.blockReason) {
        throw new Error(`Content blocked by API: ${data.promptFeedback.blockReason}`);
      }
       else {
        console.warn("Unexpected API response structure:", data);
        throw new Error("Could not extract text from API response.");
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error; // Re-throw to be caught by caller
    }
  }

  // --- Core Logic Functions ---
  async function translateText(text) {
    const prompt = `Translate the following English text to Japanese. Output only the Japanese translation, without any introductory phrases or explanations:\n\n"${text}"`;
    try {
      const translation = await callGeminiAPI(prompt);
      translationOutputDiv.textContent = translation.trim();
    } catch (error) {
      displayError('translation', error.message);
    }
  }

  function extractFrequentWords(text, count = 10) {
    frequentWordsOutputUl.innerHTML = ''; // Clear previous
    if (!text) return;

    const commonWords = new Set([ // Common English stop words
      'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'can', 'could', 'may', 'might', 'must', 'i', 'you', 'he', 'she', 'it',
      'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
      'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
      'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves',
      'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
      'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
      'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to',
      'from', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further',
      'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
      'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
      'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
      's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'of', 'and'
    ]);

    const words = text.toLowerCase()
                      .replace(/[^\w\s'-]|(?<!\w)'(?!w)/g, "") // Remove punctuation, keep apostrophes within words
                      .split(/\s+/)
                      .filter(word => word.length > 2 && !commonWords.has(word) && !/^\d+$/.test(word)); // Filter short, common, or numeric words

    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    const sortedWords = Object.entries(frequency)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, count);

    if (sortedWords.length === 0) {
        frequentWordsOutputUl.innerHTML = '<li>No significant words found.</li>';
        return;
    }

    sortedWords.forEach(([word, freq]) => {
      const li = document.createElement('li');
      li.textContent = `${word} (${freq})`;
      li.dataset.word = word; // Store word for click event
      li.addEventListener('click', handleWordClick);
      frequentWordsOutputUl.appendChild(li);
    });
  }

  async function getWordDetails(word) {
    selectedWordDisplaySpan.textContent = `Details for "${word}":`;
    wordDefinitionP.textContent = 'Loading definition...';
    wordExampleP.textContent = 'Loading example...';
    wordDetailOutputDiv.style.display = 'block'; // Show section

    const definitionPrompt = `Provide a concise English definition for the word "${word}". Output only the definition.`;
    const examplePrompt = `Provide one clear English example sentence using the word "${word}". Output only the sentence.`;

    try {
      const definition = await callGeminiAPI(definitionPrompt);
      wordDefinitionP.textContent = `Definition: ${definition.trim()}`;
    } catch (error) {
      displayError('wordDetail', `Could not get definition: ${error.message}`);
    }

    try {
      const example = await callGeminiAPI(examplePrompt);
      wordExampleP.textContent = `Example: ${example.trim()}`;
    } catch (error) {
      // If definition failed, this might also fail or not be needed,
      // but we'll try to update the example part specifically
      wordExampleP.textContent = `Error getting example: ${error.message}`;
    }
  }

  async function handleWordClick(event) {
    const word = event.target.dataset.word;
    if (word) {
      showLoading(true);
      await getWordDetails(word);
      showLoading(false);
    }
  }

  // --- Event Listeners ---
  processButton.addEventListener('click', async () => {
    const text = englishTextInput.value.trim();
    if (!text) {
      alert("Please paste some English text.");
      return;
    }
    if (!API_KEY) {
      apiKeyNoticeDiv.style.display = 'block';
      resultsAreaDiv.style.display = 'none';
      alert("Please set your Gemini API Key in the extension options.");
      return;
    }

    showLoading(true);
    resultsAreaDiv.style.display = 'block';
    wordDetailOutputDiv.style.display = 'none'; // Hide old details

    // Clear previous results
    translationOutputDiv.textContent = '';
    frequentWordsOutputUl.innerHTML = '';
    selectedWordDisplaySpan.textContent = '';
    wordDefinitionP.textContent = '';
    wordExampleP.textContent = '';

    // Run tasks in parallel where possible, or sequentially
    await translateText(text); // This involves an API call
    extractFrequentWords(text); // This is local

    showLoading(false);
  });

  openOptionsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  // --- Initialization ---
  chrome.storage.sync.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) {
      API_KEY = result.geminiApiKey;
      apiKeyNoticeDiv.style.display = 'none';
    } else {
      apiKeyNoticeDiv.style.display = 'block';
      resultsAreaDiv.style.display = 'none'; // Hide results if no API key
    }
  });
}); 