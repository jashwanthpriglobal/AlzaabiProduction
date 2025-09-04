// App.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import InputArea from './components/InputArea';
import SuggestionBubbles from './components/SuggestionBubbles';
import { uploadFile } from './services/api';
import { initializeWebSocket } from './services/websocket';
import { Routes, Route, useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { loadChatHistory, saveChatMessage } from './services/chatHistoryService';
import { addOrUpdateSessionInRecents } from './utilities/sessionManager';
import { useAuth0 } from "@auth0/auth0-react";
import { isNewSession } from './utilities/sessionManager';
import ChannelAllocation from './components/ChannelAllocation';



function NewAiAdvisorRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const newSessionId = uuidv4();
    navigate(`/ai-advisor/${newSessionId}`, { replace: true });
  }, [navigate]);
  return null;
}

const AIAdvisorWrapper = ({ theme, toggleTheme }) => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTempSession = searchParams.get('temp') === 'true';
  const [showBanner, setShowBanner] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'bot',
      message: `Hello! I'm here to assist with tasks specifically related to **Al Zaabi Group**. Here's how I can help:

- **Database Queries**: Fetch data, generate reports, or provide insights related to Al Zaabi Group's operations, business metrics, or other relevant information.  
- **Data Analysis**: Create charts and interactive visualizations.  
- **Document Analysis**: Extract and analyze content from uploaded documents related to Al Zaabi Group.  
- **General Support**: Answer questions about Al Zaabi Group's business or operations.

Feel free to ask—I'm here to help!`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [suggestionBubbles, setSuggestionBubbles] = useState([
    { text: 'What is the sales trend over last 4 months?' },
    { text: 'Create a bar graph showing sales per category' },
    { text: 'Identify the top-performing products and categories' },
  ]);
  const lastMessageRef = useRef(null);
  const socketRef = useRef({ send: () => {}, close: () => {} });
  const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently, loginWithRedirect } = useAuth0();
  const currentLocation = useLocation();
  const [sessionTitle, setSessionTitle] = useState(`New Chat`);

  // Token helper
  const getValidToken = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "eZ06DTHAOF9fi9tHqb1K5QntJvYhvySf",
        scope: "read:chats write:chats",
        timeoutInSeconds: 60,
        cacheMode: "on",
        useRefreshTokens: true,
        expireInSeconds: 35900,
      });
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      loginWithRedirect({ appState: { returnTo: currentLocation.pathname } });
      return null;
    }
  };

  // Load previous history and clean up trailing statuses
  async function fetchHistory() {
    if (!sessionId || isTempSession) return;
    setIsLoadingHistory(true);
    setLoadError(null);
    try {
      const token = await getValidToken();
      if (!token) {
        setLoadError("Authentication failed. Please try logging in again.");
        setIsLoadingHistory(false);
        return;
      }
      const history = await loadChatHistory(sessionId, token);
      if (history && history.length > 0) {
        setChatHistory(history);


      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setLoadError("Failed to load chat history. Please try refreshing the page.");
    } finally {
      setIsLoadingHistory(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated && !authLoading) fetchHistory();
  }, [isAuthenticated, authLoading, sessionId]);

  useEffect(() => { if (loadError) console.error(loadError); }, [loadError]);

  useEffect(() => {
    if (!sessionId) {
      const newId = uuidv4();
      navigate(`/ai-advisor/${newId}`, { replace: true });
    } else {
      sessionStorage.setItem('session_id', sessionId);
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    if (!sessionId) return;
    const defaultSuggestions = [
      { text: 'What is the sales trend over last 4 months?' },
      { text: 'Create a bar graph showing sales per category' },
      { text: 'Identify the top-performing products and categories' },
    ];
    const storedSuggestions = localStorage.getItem(`suggestions_${sessionId}`);
    if (storedSuggestions) {
      setSuggestionBubbles(JSON.parse(storedSuggestions).map((text) => ({ text })));
    } else {
      setSuggestionBubbles(defaultSuggestions);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    if (isTempSession) {
      setChatHistory([{
        type: 'bot',
        message: `Hello! I'm here to assist with tasks specifically related to **Al Zaabi Group**. Here's how I can help:

- **Database Queries**: Fetch data, generate reports, or provide insights related to Al Zaabi Group's operations, business metrics, or other relevant information.  
- **Data Analysis**: Create charts and interactive visualizations.  
- **Document Analysis**: Extract and analyze content from uploaded documents related to Al Zaabi Group.  
- **General Support**: Answer questions about Al Zaabi Group's business or operations.

Feel free to ask—I'm here to help!`,
        timestamp: new Date().toISOString(),
      }]);
      return;
    }
    let didCancel = false;
    async function fetchHistory2() {
      try {
        const token = await getAccessTokenSilently();
        const isNew = await isNewSession(sessionId, token);
        if (isNew) {
          setShowBanner(false);
          setIsLoadingHistory(false);
          return;
        }
        const history = await loadChatHistory(sessionId, token);
        if (!didCancel) {
          setChatHistory(history);


          setShowBanner(false);
          setIsLoadingHistory(false);
        }
      } catch (error) {
        console.error("Error loading chat history", error);
      }
    }
    setShowBanner(true);
    setIsLoadingHistory(true);
    fetchHistory2();
    return () => { didCancel = true; };
  }, [sessionId, isTempSession, getAccessTokenSilently]);



  // 💡 THE FIX: always clean, always one 🛑
  const handleStopGenerating = useCallback(() => {
  if (socketRef.current) {
    socketRef.current.send(JSON.stringify({ type: "abort", session_id: sessionId }));
  }
  setLoading(false);
}, [sessionId]);





  const handleError = useCallback((errorMessage) => {
    console.error('Error received from server:', errorMessage);
    setLoading(false);
  }, []);

  // WebSocket/data streaming logic, always clean trailing statuses before adding any message
  useEffect(() => {
    const setupWebSocket = async () => {
      if (!sessionId || authLoading) return;
      try {
        let token = null;
        if (isAuthenticated) {
          try {
            token = await getAccessTokenSilently({
              audience: "eZ06DTHAOF9fi9tHqb1K5QntJvYhvySf",
              scope: "openid profile email"
            });
          } catch (error) {
            if (error.error === 'login_required' || error.error === 'consent_required') return;
            handleError(`Token error: ${error.message}`);
            return;
          }
        }
        let accumulatedText = '';
        let bufferedGraphs = [];
        let bufferedTables = [];
        let didStreamAnything = false;
        const wsManager = initializeWebSocket(
          token || sessionId,
          sessionId,
          (message, graph, pdf, isStatus = false) => {

            if (message === "__START__") {
      accumulatedText = '';
      bufferedGraphs = [];
      bufferedTables = [];
      didStreamAnything = false;
      return;
    }


            // === BOT STATUS/STOP HANDLING ===
            if (isStatus) {
              // If the stop message is just a regular bot message, handle it as a bot message.
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

              // If you want to display other status (thinking/working) messages, keep this:
              setChatHistory(prev => {
                // If the last message is bot_status, replace it
                const updated = [...prev];
                if (updated.length > 0 && updated[updated.length - 1].type === 'bot_status') {
                  updated[updated.length - 1] = {
                    type: 'bot_status',
                    message,
                    timestamp: new Date().toISOString(),
                  };
                } else {
                  updated.push({
                    type: 'bot_status',
                    message,
                    timestamp: new Date().toISOString(),
                  });
                }
                return updated;
              });

              if (
                message.toLowerCase().includes("aborted") ||
                message.toLowerCase().includes("stopped")
              ) setLoading(false);
              return;
            }




            // === END OF STREAM HANDLING ===
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
                  setChatHistory((prev) => {
                    // Optional dedupe logic, if you want:
                    const isDuplicate = prev.some(
                      (msg) =>
                        msg?.type === 'bot' &&
                        msg.message?.trim() === finalText &&
                        !msg.graph &&
                        !msg.pdf
                    );
                    if (isDuplicate) return prev;
                    return [...prev, finalMessage];
                  });
                  if (!isTempSession) getAccessTokenSilently().then(token => saveChatMessage(sessionId, finalMessage, token));
                }
                if (bufferedTables.length > 0) {
                  bufferedTables.forEach((tableMarkdown) => {
                    const tableMessage = {
                      type: 'bot',
                      message: tableMarkdown,
                      graph: null,
                      pdf: null,
                      timestamp: new Date().toISOString(),
                    };
                    setChatHistory((prev) => [...prev, tableMessage]);
                    if (!isTempSession) getAccessTokenSilently().then(token => saveChatMessage(sessionId, tableMessage, token));
                  });
                  bufferedTables = [];
                }
                if (bufferedGraphs.length > 0) {
                  bufferedGraphs.forEach((entry) => {
                    const graphOrPdfMessage = {
                      type: 'bot',
                      message: null,
                      graph: entry.graph,
                      pdf: entry.pdf,
                      timestamp: new Date().toISOString(),
                    };
                    setChatHistory((prev) => [...prev, graphOrPdfMessage]);
                    if (!isTempSession) getAccessTokenSilently().then(token => saveChatMessage(sessionId, graphOrPdfMessage, token));
                  });
                  bufferedGraphs = [];
                }
                accumulatedText = '';
                didStreamAnything = false;
                setLoading(false);
                return;
              }



            // === STREAMING BOT TEXT ===
            if (message) {
              const trimmed = message.trim();
              if (
                trimmed.startsWith("__TOOL_TABLE_START__") &&
                trimmed.includes("__TOOL_TABLE_END__")
              ) {
                const cleanedTable = trimmed
                  .replace("__TOOL_TABLE_START__", "")
                  .replace("__TOOL_TABLE_END__", "")
                  .trim();
                bufferedTables.push(cleanedTable);
                return;
              }
              setChatHistory((prev) => prev.filter(msg => msg.type !== 'bot_status'));
              didStreamAnything = true;
              accumulatedText += message;
              const previewMessage = {
                type: 'bot',
                message: accumulatedText.trim(),
                graph: null,
                pdf: null,
                timestamp: new Date().toISOString(),
              };
              setChatHistory((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.type === 'bot' && !last.graph && !last.pdf) {
                  updated[updated.length - 1] = previewMessage;
                  return updated;
                }
                return [...prev, previewMessage];
              });

            }
            if (graph || pdf) {
              bufferedGraphs.push({
                graph: graph || null,
                pdf: pdf || null,
              });
            }
          },
          (suggestions) => {
            if (!isTempSession) localStorage.setItem(`suggestions_${sessionId}`, JSON.stringify(suggestions));
            setSuggestionBubbles(suggestions.map((text) => ({ text })));
          },
          (errorMessage) => { setLoading(false); },
          () => { }
        );
        socketRef.current = wsManager;
      } catch (error) {
        setLoading(false);
      }
    };
    setupWebSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = { send: () => {}, close: () => {} };
      }
    };
  }, [sessionId, isAuthenticated, authLoading, getAccessTokenSilently, isTempSession, handleError]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (lastMessageRef.current) lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
    return () => clearTimeout(timeout);
  }, [chatHistory]);

  const handleInputChange = useCallback((e) => setInput(e.target.value), []);

  // 💡 Always clean up before user messages
  const handleSubmit = useCallback(async () => {
    if (!input.trim() || !sessionId) return;
    setLoading(true);
    const userMessage = {
      type: 'user',
      message: input,
      timestamp: new Date().toISOString(),
    };
    setChatHistory((prev) => [...prev, userMessage]);
    if (!isTempSession) {
      try {
        const token = await getAccessTokenSilently({
          audience: "eZ06DTHAOF9fi9tHqb1K5QntJvYhvySf",
          scope: "openid profile email",
        });
        await addOrUpdateSessionInRecents(sessionId, input, sessionTitle, token);
        await saveChatMessage(sessionId, userMessage, token);
      } catch (error) {
        setLoading(false);
        return;
      }
    }
    socketRef.current.send(
      JSON.stringify({
        type: 'user',
        message: input,
        session_id: sessionId,
      })
    );
    setInput('');
  }, [input, sessionId, isTempSession, getAccessTokenSilently, sessionTitle]);

  // 💡 Always clean up before adding user/bot file messages
  const handleFileChange = async (event) => {
    if (!sessionId) return;
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      if (!isTempSession) {
        const token = await getAccessTokenSilently({
          audience: "eZ06DTHAOF9fi9tHqb1K5QntJvYhvySf",
          scope: "openid profile email"
        });
        await addOrUpdateSessionInRecents(sessionId, "", sessionTitle, token);
        const userFileMessage = {
          type: 'user',
          file: { name: file.name },
          timestamp: new Date().toISOString(),
        };
        await saveChatMessage(sessionId, userFileMessage, token);
        setChatHistory((prev) => [...prev, userFileMessage]);
      } else {
        const userFileMessage = {
          type: 'user',
          file: { name: file.name },
          timestamp: new Date().toISOString(),
        };
        setChatHistory((prev) => [...prev, userFileMessage]);

      }
      await uploadFile(file, sessionId);
      const botFileMessage = {
        type: 'bot',
        message: `"${file.name}" uploaded successfully. How can I assist with it?`,
        timestamp: new Date().toISOString(),
      };
      if (!isTempSession) {
        const token = await getAccessTokenSilently({
          audience: "eZ06DTHAOF9fi9tHqb1K5QntJvYhvySf",
          scope: "openid profile email",
        });
        await saveChatMessage(sessionId, botFileMessage, token);
      }
      setChatHistory((prev) => [...prev, botFileMessage]);

    } catch (error) {
      const errorMessageObj = {
        type: 'bot',
        message: 'An error occurred while uploading the file. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setChatHistory((prev) => [...prev, errorMessageObj]);

      if (!isTempSession) {
        try {
          const token = await getAccessTokenSilently({
            audience: "eZ06DTHAOF9fi9tHqb1K5QntJvYhvySf",
            scope: "openid profile email",
          });
          await saveChatMessage(sessionId, errorMessageObj, token);
        } catch {}
      }
    }
    setLoading(false);
  };

  // 💡 Always clean up before adding suggestion messages
  const handleSuggestionClick = useCallback(async (suggestionText) => {
    if (!sessionId) return;
    setLoading(true);
    const suggestionMessage = {
      type: 'user',
      message: suggestionText,
      timestamp: new Date().toISOString(),
    };
    if (!isTempSession) {
      try {
        const token = await getAccessTokenSilently({
          audience: "eZ06DTHAOF9fi9tHqb1K5QntJvYhvySf",
          scope: "openid profile email"
        });
        await addOrUpdateSessionInRecents(sessionId, suggestionText, sessionTitle, token);
        await saveChatMessage(sessionId, suggestionMessage, token);
      } catch (error) {
        setLoading(false);
        return;
      }
    }
    setChatHistory((prev) => [...prev, suggestionMessage]);

    socketRef.current.send(
      JSON.stringify({
        type: 'user',
        message: suggestionText,
        session_id: sessionId,
      })
    );
  }, [sessionId, isTempSession, getAccessTokenSilently, sessionTitle]);

  const memoizedChatWindow = useMemo(() => (
    <ChatWindow
      chatHistory={chatHistory}
      loading={loading}
      lastMessageRef={lastMessageRef}
      setSessionTitle={setSessionTitle}
      sessionId={sessionId}
      getToken={async () => {
        return await getAccessTokenSilently({
          audience: "eZ06DTHAOF9fi9tHqb1K5QntJvYhvySf",
          scope: "openid profile email",
        });
      }}
      onStopGenerating={handleStopGenerating}
    />
  ), [chatHistory, loading, lastMessageRef, sessionId, handleStopGenerating]);

  const memoizedInputArea = useMemo(() => (
    <InputArea
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      handleFileChange={handleFileChange}
      disableSendButton={isLoadingHistory || loading}
      disableMicAndTyping={isLoadingHistory}
      isGenerating={loading}  // 👈 you already have this from ChatWindow
      handleStopGenerating={handleStopGenerating}
    />
  ), [input, handleInputChange, handleSubmit, handleFileChange, isLoadingHistory, loading]);

  const memoizedSuggestionBubbles = useMemo(() => (
    <SuggestionBubbles
      suggestionBubbles={suggestionBubbles}
      handleSuggestionClick={handleSuggestionClick}
      disableBubbles={isLoadingHistory || loading}
    />
  ), [suggestionBubbles, handleSuggestionClick, isLoadingHistory, loading]);

  if (!sessionId) return <div>Initializing chat session...</div>;

  return (
    <div className="app-container">
      {showBanner && (
        <div className="chat-style-banner">
          Loading previous chat messages...
        </div>
      )}
      <Header toggleTheme={toggleTheme} theme={theme} isLoading={loading} />
      <div className="chat-container">
        {memoizedChatWindow}
        {memoizedSuggestionBubbles}
        {memoizedInputArea}
      </div>
    </div>
  );
};

const App = () => {
  const [theme, setTheme] = useState('light');
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  const toggleTheme = () => setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-advisor"
        element={
          <ProtectedRoute>
            <NewAiAdvisorRedirect />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-advisor/:sessionId"
        element={
          <ProtectedRoute>
            <AIAdvisorWrapper theme={theme} toggleTheme={toggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/channel-allocation"
        element={
          <ProtectedRoute>
            <ChannelAllocation />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
