import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./styles/SearchHistory.css";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react"; // Use the useAuth0 hook
import config from '../config';

function SearchHistory({ onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const navigate = useNavigate();
  const [sessionNames, setSessionNames] = useState({});
  const { getAccessTokenSilently } = useAuth0(); // Destructure getAccessTokenSilently from useAuth0

  useEffect(() => {
    const fetchRecentSessions = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${config.API_BASE_URL}/api/sessions`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        setRecentSessions(data.sessions);
  
        // Create a mapping of session IDs to session names
        const names = {};
        data.sessions.forEach(session => {
          names[session.session_id] = session.title || `Session ${session.session_id.slice(0, 6)}`;
        });
        setSessionNames(names);
      } catch (error) {
        console.error("Error fetching recent sessions:", error);
      }
    };
  
    fetchRecentSessions();
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMessages([]);
      return;
    }
  
    const fetchChatHistory = async () => {
      let results = [];
  
      for (let session of recentSessions) {
        try {
          const token = await getAccessTokenSilently();
          const response = await fetch(`${config.API_BASE_URL}/api/chathistory?session_id=${session.session_id}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          const data = await response.json();
  
          if (data.chat_history) {
            data.chat_history.forEach((entry) => {
              const messageText = entry.message?.message || "";
  
              const matchingLines = messageText
                .split("\n")
                .filter((line) => line.toLowerCase().includes(searchTerm.toLowerCase()));
  
              matchingLines.forEach((line) => {
                results.push({
                  sessionId: session.session_id,
                  sessionName: sessionNames[session.session_id], // Include session name
                  snippet: line,
                  timestamp: entry.message.timestamp,
                });
              });
            });
          }
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      }
      setFilteredMessages(results);
    };
  
    fetchChatHistory();
  }, [searchTerm, recentSessions, sessionNames, getAccessTokenSilently]);

  const handleSessionClick = (sessionId) => {
    navigate(`/ai-advisor/${sessionId}`);
    onClose();
  };

  const highlightText = (text, highlight) => {
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={index} className="yellow-text">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="search-modal">
      <div className="search-header">
        <input
          type="text"
          className="search-input"
          placeholder="Search chat history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaTimes className="close-btn" onClick={onClose} />
      </div>

      {searchTerm.trim() === "" && (
        <div className="recent-sessions">
          <h4>Recent Sessions</h4>
          <ul>
            {recentSessions.map((session) => (
              <li key={session.session_id} onClick={() => handleSessionClick(session.session_id)}>
                {session.title || `Session ${session.session_id.slice(0, 6)}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchTerm.trim() !== "" && (
        <div className="search-results">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((result, index) => (
              <div key={index} className="search-result" onClick={() => handleSessionClick(result.sessionId)}>
                <p className="session-id">{result.sessionName}</p> {/* Display session name */}
                <div>{highlightText(result.snippet, searchTerm)}</div>
              </div>
            ))
          ) : (
            <p className="no-results">No messages found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchHistory;