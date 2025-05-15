// script.js

const chatContainer = document.querySelector(".chat-container");
const inputField = document.getElementById("chat-input");
const sendButton = document.getElementById("send-btn");

let messageHistory = [];
let isResponseGenerating = false;

// OpenRouter API configuration
const OPENROUTER_API_KEY = "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Create a chat message element
const createChatMessage = (message, className) => {
  const chatDiv = document.createElement("div");
  chatDiv.classList.add("message", className);
  chatDiv.innerHTML = `<div class="text">${message}</div>`;
  return chatDiv;
};

// Show typing effect
const showTypingEffect = (text, textElement, messageDiv) => {
  let index = 0;
  const typingInterval = setInterval(() => {
    if (index < text.length) {
      textElement.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(typingInterval);
      messageDiv.classList.remove("typing");
      isResponseGenerating = false;
    }
  }, 20);
};

// Fetch response from OpenRouter API
const generateAPIResponse = async (incomingMessageDiv, userMessage) => {
  const textElement = incomingMessageDiv.querySelector(".text");

  const messages = [
    {
      role: "system",
      content: "You are AgriChat, an advanced agricultural assistant specialized in climate data analysis. Provide insightful and data-driven responses about droughts, floods, and soil moisture levels."
    },
    ...messageHistory.map((msg, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: msg
    })),
    {
      role: "user",
      content: userMessage
    }
  ];

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com",
        "X-Title": "ChatBot System"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout:free",
        messages: messages
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "API Error");

    const apiResponse = data.choices[0].message.content.replace(/\*\*(.*?)\*\*/g, '$1');
    showTypingEffect(apiResponse, textElement, incomingMessageDiv);

    messageHistory.push(userMessage);
    messageHistory.push(apiResponse);
  } catch (error) {
    isResponseGenerating = false;
    textElement.innerText = error.message;
    incomingMessageDiv.classList.add("error");
  } finally {
    incomingMessageDiv.classList.remove("loading");
  }
};

// Handle sending message
const handleSendMessage = () => {
  const userMessage = inputField.value.trim();
  if (!userMessage || isResponseGenerating) return;

  inputField.value = "";
  chatContainer.appendChild(createChatMessage(userMessage, "outgoing"));

  const incomingMessageDiv = createChatMessage("...", "incoming loading typing");
  chatContainer.appendChild(incomingMessageDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);

  isResponseGenerating = true;
  generateAPIResponse(incomingMessageDiv, userMessage);
};

// Handle enter key
inputField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSendMessage();
});

sendButton.addEventListener("click", handleSendMessage);