import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import ChatWindow from './ChatWindow';
import InputArea from './InputArea';
import SuggestionBubbles from './SuggestionBubbles';
import { v4 as uuidv4 } from 'uuid';
import { useAuth0 } from "@auth0/auth0-react";
import { initializeWebSocket } from '../services/websocket';
import model from '../assets/gpt-4.1.png';
import { useNavigate } from 'react-router-dom';
import { loadChatHistory, saveChatMessage } from '../services/chatHistoryService';
import { addOrUpdateSessionInRecents } from '../utilities/sessionManager';
import './styles/Chatbot.css';
 
const Chatbot = ({onClose  }) => {
  const [input, setInput] = useState('');
 
const defaultWelcome =
  {
    type: 'bot',
    message: `Hello! I'm here to assist with tasks specifically related to **Al Zaabi Group**. Here's how I can help:
 
- **Database Queries**: Fetch data, generate reports, or provide insights related to Al Zaabi Group's operations, business metrics, or other relevant information.  
- **Data Analysis**: Create charts and interactive visualizations.  
- **Document Analysis**: Extract and analyze content from uploaded documents related to Al Zaabi Group.  
- **General Support**: Answer questions about Al Zaabi Group's business or operations.
 
Feel free to ask—I'm here to help!`,
    timestamp: new Date().toISOString(),
 
  }
const defaultSuggestions = [
  { text: 'What is the sales trend over last 4 months?' },
      { text: 'Create a bar graph showing sales per category' },
      { text: 'Identify the top-performing products and categories' },
];
 
  const [chatHistory, setChatHistory] = useState([
      defaultWelcome
    ]);
  const [suggestionBubbles, setSuggestionBubbles] = useState([defaultSuggestions
    ]);
  const [loading, setLoading] = useState(false);
  const lastMessageRef = useRef(null);
  const socketRef = useRef({ send: () => {}, close: () => {} });
  const [sessionId, setSessionId] = useState(() => sessionStorage.getItem('session_id') || uuidv4());
  const navigate = useNavigate();
 
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
 
  useEffect(() => {
    sessionStorage.setItem('session_id', sessionId);
  }, [sessionId]);
 
 
  useEffect(() => {
    if (!isAuthenticated) return;
 
    const fetchHistory = async () => {
      try {
        const token = await getAccessTokenSilently();
        const history = await loadChatHistory(sessionId, token);
 
        if (history && history.length > 0) {
          setChatHistory(history);
        } else {
          // No history, reset suggestions
          setChatHistory([defaultWelcome]);
          setSuggestionBubbles(defaultSuggestions);
        }
      } catch (err) {
        console.error("Failed to fetch chat history", err);
      }
    };
 
    fetchHistory();
  }, [getAccessTokenSilently, sessionId, isAuthenticated]);
 
 
 
  const getToken = async () => {
    return await getAccessTokenSilently({
      audience: "eZ06DTHAOF9fi9tHqb1K5QntJvYhvySf",
      scope: "openid profile email",
    });
  };
 
  const setupWebSocket = useCallback(async () => {
    const token = await getToken();
    let accumulatedText = '';
    let bufferedGraphs = [];
    let bufferedTables = [];
    let didStreamAnything = false;
 
    async function handleMessage(message, graph, pdf, isStatus = false) {
      if (message === "__START__") {
      accumulatedText = '';
      bufferedGraphs = [];
      bufferedTables = [];
      didStreamAnything = false;
      return;
    }
 
      if (isStatus) {
  if (message === "🛑 Message stopped by user.") {
    setChatHistory(prev => [
      ...prev,
      {
        type: 'bot',
        message: "🛑 Message stopped by user.",
        timestamp: new Date().toISOString(),
      }
    ]);
    setLoading(false);
    return;
  }
 
  setChatHistory(prev => {
    const newHistory = [...prev];
    const lastIndex = newHistory.length - 1;
 
    if (lastIndex >= 0 && newHistory[lastIndex].type === 'bot_status') {
      newHistory[lastIndex] = {
        type: 'bot_status',
        message,
        timestamp: new Date().toISOString()
      };
    } else {
      newHistory.push({
        type: 'bot_status',
        message,
        timestamp: new Date().toISOString()
      });
    }
    return newHistory;
  });
 
  if (
    message.toLowerCase().includes("aborted") ||
    message.toLowerCase().includes("stopped")
  ) setLoading(false);
  return;
}
 
 
      if (message === "__END__") {
        const finalText = accumulatedText.trim();
 
        if (finalText) {
          const finalMessage = {
            type: 'bot',
            message: finalText,
            graph: null,
            pdf: null,
            timestamp: new Date().toISOString(),
          };
 
          setChatHistory(prev => {
            const updated = [...prev].filter(msg => msg.type !== 'bot_status'); // Remove status
            const isDuplicate = updated.some(
              msg =>
                msg?.type === 'bot' &&
                msg.message?.trim() === finalText &&
                !msg.graph &&
                !msg.pdf
            );
            if (isDuplicate) return updated;
 
            const last = updated[updated.length - 1];
            if (
              didStreamAnything &&
              last?.type === 'bot' &&
              last.message?.trim() === finalText
            ) {
              updated.pop();
            }
 
            return [...updated, finalMessage];
          });
 
          const saveToken = await getToken();
          await saveChatMessage(sessionId, finalMessage, saveToken);
        }
 
        for (const tableMarkdown of bufferedTables) {
          const tableMessage = {
            type: 'bot',
            message: tableMarkdown,
            graph: null,
            pdf: null,
            timestamp: new Date().toISOString(),
          };
          setChatHistory(prev => [...prev, tableMessage]);
          const saveToken = await getToken();
          await saveChatMessage(sessionId, tableMessage, saveToken);
        }
 
        for (const entry of bufferedGraphs) {
          const graphOrPdfMessage = {
            type: 'bot',
            message: null,
            graph: entry.graph,
            pdf: entry.pdf,
            timestamp: new Date().toISOString(),
          };
          setChatHistory(prev => [...prev, graphOrPdfMessage]);
          const saveToken = await getToken();
          await saveChatMessage(sessionId, graphOrPdfMessage, saveToken);
        }
 
        accumulatedText = '';
        bufferedGraphs = [];
        bufferedTables = [];
        didStreamAnything = false;
        setLoading(false);
        return;
      }
 
      if (message) {
        const trimmed = message.trim();
 
        // 🧹 Remove bot_status immediately when real message starts
        setChatHistory(prev => prev.filter(msg => msg.type !== 'bot_status'));
 
        didStreamAnything = true;
        accumulatedText += message;
 
        const previewMessage = {
          type: 'bot',
          message: accumulatedText.trim(),
          graph: null,
          pdf: null,
          timestamp: new Date().toISOString(),
        };
 
        setChatHistory(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.type === 'bot' && !last.graph && !last.pdf) {
            updated[updated.length - 1] = previewMessage;
            return updated;
          }
          return [...updated, previewMessage];
        });
      }
 
      if (graph || pdf) {
        bufferedGraphs.push({
          graph: graph || null,
          pdf: pdf || null,
        });
      }
    }
 
    const wsManager = initializeWebSocket(
      token,
      sessionId,
      handleMessage,
      (suggestions) => {
        setSuggestionBubbles(suggestions.map(text => ({ text })));
      },
      (errorMessage) => {
        console.error("WS Error", errorMessage);
        setLoading(false);
      },
      () => {
        console.error("Connection lost");
      }
    );
 
    socketRef.current = wsManager;
  }, [sessionId]);
 
 
  useEffect(() => {
    if (isAuthenticated) setupWebSocket();
    return () => socketRef.current?.close();
  }, [setupWebSocket, isAuthenticated]);
 
  const handleInputChange = (e) => setInput(e.target.value);
 
  const handleSubmit = useCallback(async () => {
    if (!input.trim()) return;
 
    setLoading(true);
 
    const token = await getToken();
    const userMessage = {
      type: 'user',
      message: input,
      timestamp: new Date().toISOString(),
    };
 
    await addOrUpdateSessionInRecents(sessionId, input, 'New Chat', token);
    await saveChatMessage(sessionId, userMessage, token);
    setChatHistory(prev => [...prev, userMessage]);
 
    socketRef.current.send(JSON.stringify({
      type: 'user',
      message: input,
      session_id: sessionId,
    }));
 
    setInput('');
  }, [input, sessionId, getToken]);
 
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
 
    const token = await getToken();
 
    const userFileMsg = {
      type: 'user',
      file: { name: file.name },
      timestamp: new Date().toISOString(),
    };
 
   
 
 
    await saveChatMessage(sessionId, userFileMsg, token);
    setChatHistory(prev => [...prev, userFileMsg]);
 
    // Upload file via API
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId);
    await fetch('/api/upload', { method: 'POST', body: formData });
 
    const botFileMsg = {
      type: 'bot',
      message: `"${file.name}" uploaded successfully.`,
      timestamp: new Date().toISOString(),
    };
    await saveChatMessage(sessionId, botFileMsg, token);
    setChatHistory(prev => [...prev, botFileMsg]);
 
    setLoading(false);
  };
 
  const handleSuggestionClick = async (text) => {
    setInput(text);
    handleSubmit();
  };
 
  const handleStartNewChat = () => {
    const newId = uuidv4();
    sessionStorage.setItem('session_id', newId);
    setSessionId(newId);
    setChatHistory([defaultWelcome]);
    setSuggestionBubbles(defaultSuggestions);
  };
 
  const handleStopGenerating = useCallback(() => {
  if (socketRef.current) {
    socketRef.current.send(JSON.stringify({ type: "abort", session_id: sessionId }));
  }
  setLoading(false);
}, [sessionId]);
 
 
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chatHistory]);
 
 
  const memoizedChatWindow = useMemo(() => (
    <ChatWindow
      showSidebar={false}
      chatHistory={chatHistory}
      loading={loading}
      lastMessageRef={lastMessageRef}
      setSessionTitle={() => {}}
      sessionId={sessionId}
      getToken={getToken}
      onStopGenerating={handleStopGenerating}
    />
  ), [chatHistory, loading, lastMessageRef, sessionId, getToken, handleStopGenerating]);
 
  const memoizedInputArea = useMemo(() => (
  <InputArea
    input={input}
    handleInputChange={handleInputChange}
    handleSubmit={handleSubmit}
    handleFileChange={handleFileChange}
    disableSendButton={loading}
    disableMicAndTyping={loading}
    isGenerating={loading}  // ✅ NEW
    handleStopGenerating={handleStopGenerating}  // ✅ NEW
  />
), [input, handleInputChange, handleSubmit, handleFileChange, loading, handleStopGenerating]);
 
  const memoizedSuggestions = useMemo(() => (
    <SuggestionBubbles
      suggestionBubbles={suggestionBubbles}
      handleSuggestionClick={handleSuggestionClick}
      disableBubbles={loading}
    />
  ), [suggestionBubbles, handleSuggestionClick, loading]);
 
 
  return (
    <div className="chatbot-wrapper">
      <div className="chatbot-header">
     
        <div className="chatbot-header-left">
          <button className="start-new-chat-btn" onClick={handleStartNewChat}> New Chat</button>
        </div>
        <div className="chatbot-model-container">
          <img src={model} alt="Model" className="chatbot-model-icon" />
        </div>
        <div className="chatbot-header-right">
          <button className="close-chat-btn" onClick={onClose}>✖</button>
       
        </div>
       
 
      </div>
     
 
 
      <div className="chatbot-body">
 
    {memoizedChatWindow}
    {memoizedSuggestions}
    {memoizedInputArea}
 
      </div>
    </div>
  );
};
 
export default Chatbot;