// // // websocket.js
import config from '../config';

export function initializeWebSocket(token, sessionId, handleBotResponse, handleSuggestions, handleError, handleDisconnect) {
    let socket = null;
    let messageQueue = [];
    let isConnected = false;
    let reconnectTimeout = null;
    const maxReconnectAttempts = 5;
    let reconnectAttempts = 0;
  
    const connect = () => {
      const wsUrl = `${config.API_BASE_URL.replace(/^http/, 'ws').replace(/^https/, 'wss')}/ws?token=${encodeURIComponent(token)}`;
      socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        isConnected = true;
        reconnectAttempts = 0;
        while (messageQueue.length > 0 && isConnected) {
          const message = messageQueue.shift();
          socket.send(message);
        }
      };
  
      socket.onmessage = (event) => {
        console.log("[WebSocket] Received message:", event.data);

        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ping') {
              socket.send(JSON.stringify({ type: 'pong', session_id: sessionId })); // <--- Always send session_id
            return;
          }
          if (data.type === 'bot' && (data.message || data.graph || data.pdf)) {
              const isStatus = data.isStatus === true;  
 
              handleBotResponse(data.message, data.graph, data.pdf, isStatus);
          }else if (data.type === 'suggestions' && data.suggestions) {
            handleSuggestions(data.suggestions);
          } else if (data.type === 'error') {
            handleError(data.message);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };
  
      socket.onerror = (error) => {
        isConnected = false;
        handleError('WebSocket connection error');
      };
  
      socket.onclose = (event) => {
        isConnected = false;
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          reconnectTimeout = setTimeout(() => connect(), 5000);
        } else {
          handleDisconnect();
        }
      };
    };
  
    const send = (message) => {
    console.log("[WebSocket] Attempting to send:", message);
    if (isConnected && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
      console.log("[WebSocket] Sent immediately.");
    } else {
      messageQueue.push(message);
      console.log("[WebSocket] Queued message (socket not open). Queue length:", messageQueue.length);
      if (!socket || socket.readyState === WebSocket.CLOSED) {
        connect();
      }
    }
  };

  
    const close = () => {
      if (socket) {
        socket.close();
        clearTimeout(reconnectTimeout);
      }
    };
  
    connect();
  
    return {
      send,
      close
    };
  }
  
