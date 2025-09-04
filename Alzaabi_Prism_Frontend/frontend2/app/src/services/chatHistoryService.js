// services/chatHistoryService.js

// This file contains functions to interact with the backend API for chat history management.

import config from '../config';

export async function loadChatHistory(sessionId, token) {
  try {
    const response = await fetch(`${config.API_BASE_URL}/api/chathistory?session_id=${sessionId}`, {
    // const response = await fetch(`http://127.0.0.1:8000/api/chathistory?session_id=${sessionId}`, {

      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error("Failed to load chat history");
    }
    const data = await response.json();
    const flattenedHistory = data.chat_history.map(item => item.message);
    return flattenedHistory;
  } catch (error) {
    console.error("Error loading chat history:", error);
    return [];
  }
}

export async function saveChatMessage(sessionId, messageObj, token) {
  try {
    const response = await fetch(`${config.API_BASE_URL}/api/chathistory?session_id=${sessionId}`, {
    // const response = await fetch(`http://127.0.0.1:8000/api/chathistory?session_id=${sessionId}`, {

      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ session_id: sessionId, message: messageObj })
    });
    if (!response.ok) {
      throw new Error("Failed to save chat message");
    }
  } catch (error) {
    console.error("Error saving chat message:", error);
  }
}
