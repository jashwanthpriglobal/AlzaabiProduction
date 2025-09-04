// File: ChatWindow.js


import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
// import Plot from 'react-plotly.js';
import ReactMarkdown from 'react-markdown';
// import { FaFile, FaDownload, FaExpand } from 'react-icons/fa';
// import assistantIcon from '../assets/assistant_icon.png';
import './styles/ChatWindow.css';
import remarkGfm from 'remark-gfm';
// import { Download } from 'lucide-react';
import SearchHistory from './SearchHistory';
import { FaSearch } from 'react-icons/fa';
import { PiNotePencilBold } from "react-icons/pi";
import { v4 as uuidv4 } from 'uuid';
import { BsLayoutTextSidebarReverse } from "react-icons/bs";
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MdDriveFileRenameOutline,MdOutlineSummarize,MdDownload} from "react-icons/md";
import { RiDeleteBin6Line, RiChatHistoryFill } from "react-icons/ri";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { useAuth0 } from '@auth0/auth0-react';
// import { FaCompress } from "react-icons/fa";
import config from '../config';
 
// eslint-disable-next-line
import { isNewSession } from '../utilities/sessionManager';
import { getRecentSessions, addOrUpdateSessionInRecents, deleteSession } from '../utilities/sessionManager';
import rehypeRaw from 'rehype-raw'
import ChatMessage from './ChatMessage';;

// Utility: Filter out repeated "Message stopped by user." (bot_status) messages
function filterRepeatedBotStatusMessages(messages) {
  const filtered = [];
  let lastWasStatus = false;
  for (const msg of messages) {
    if (msg.type === 'bot_status' && msg.message && msg.message.toLowerCase().includes("stopped by user")) {
      if (lastWasStatus) continue; // Skip if previous was also a stop
      lastWasStatus = true;
    } else {
      lastWasStatus = false;
    }
    filtered.push(msg);
  }
  return filtered;
}



function ChatWindow({ chatHistory, loading, lastMessageRef, setSessionTitle, sessionId, getToken, showSidebar = true }) {
// function ChatWindow({ chatHistory, loading, lastMessageRef, setSessionTitle, sessionId, getToken, showSidebar = true }) {
  const navigate = useNavigate();
  const [loadingStage, setLoadingStage] = useState('');
  const [expandedTables, setExpandedTables] = useState({});
  const [expandedGraphs, setExpandedGraphs] = useState({});
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
 
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showSearch, setShowSearch] = useState(false); //  Search modal state
  // eslint-disable-next-line
  const [searchTerm, setSearchTerm] = useState("");
  const [pinned, setPinned] = useState(false);
  const { sessionId: activeSessionId } = useParams();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchParams] = useSearchParams();
  const isEphemeral = searchParams.get('temp') === 'true';
  // eslint-disable-next-line
  const hasMessages = chatHistory.length > 1;
 
  const { getAccessTokenSilently } = useAuth0();
  const [recentSessions, setRecentSessions] = useState([]);
 
  const menuRef = useRef(null);
  const [menuVisible, setMenuVisible] = useState(null);
  const [renameSessionId, setRenameSessionId] = useState(null);
  const [newName, setNewName] = useState("");
  const [summary, setSummary] = useState('');
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
 
  const [recentsMenuVisible, setRecentsMenuVisible] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
 
  const recentsMenuRef = useRef(null);
 
  const fillEmptyMarkdownCells = (markdown, placeholder = '-') => {
    return markdown
      .split('\n')
      .map((line) => {
        if (!line.trim().startsWith('|')) return line;
        const parts = line.split('|').map((cell) => {
          const trimmed = cell.trim();
          return trimmed === '' ? ` ${placeholder} ` : trimmed;
        });
        return '| ' + parts.slice(1, -1).join(' | ') + ' |';
      })
      .join('\n');
  };
 
 
  useEffect(() => {
    async function fetchSessions() {
      try {
        const token = await getAccessTokenSilently();
        const sessions = await getRecentSessions(token);
        setRecentSessions(sessions);
      } catch (error) {
        console.error("Error fetching sessions", error);
      }
    }
    fetchSessions();
  }, [getAccessTokenSilently]);
   
  // ✅ Toggle search modal
  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    setSearchTerm(""); // Clear search when closing
  };
 
  const handleSummarize = async (sessionId) => {
    setIsSummarizing(true); // Set loading state to true
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, chat_history: chatHistory }),
      });
 
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        setShowSummaryPopup(true);
      } else {
        console.error('Summarize failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error during summarization:', error);
    } finally {
      setIsSummarizing(false); // Set loading state to false
    }
  };
 
  useEffect(() => {
    async function fetchSessions() {
      try {
        const token = await getAccessTokenSilently();
        const sessions = await getRecentSessions(token);
        setRecentSessions(sessions);
      } catch (error) {
        console.error("Error fetching sessions", error);
      }
    }
    fetchSessions();
  }, [getAccessTokenSilently]);
 
  useEffect(() => {
    async function refreshSessions() {
      try {
        const token = await getAccessTokenSilently();
        const sessions = await getRecentSessions(token);
        setRecentSessions(sessions);
      } catch (error) {
        console.error("Error refreshing sessions", error);
      }
    }
    if (chatHistory && chatHistory.length > 0) {
      refreshSessions();
    }
  }, [chatHistory, getAccessTokenSilently]);
 
  // const toggleMenu = (sessionId, event) => {
  //   event.stopPropagation();
  //   setMenuVisible(menuVisible === sessionId ? null : sessionId);
  // };

  const toggleMenu = (sessionId, event) => {
    event.stopPropagation();
  const button = event.currentTarget;
  const buttonRect = button.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
 
  const dropdownHeight = 130; // Approximate height of your dropdown
  const spaceBelow = viewportHeight - buttonRect.bottom;
  const shouldOpenUpward = spaceBelow < dropdownHeight;
 
  setMenuVisible(menuVisible === sessionId ? null : sessionId);
 
  setTimeout(() => {
    const dropdown = document.querySelector('.menu-dropdown');
    if (dropdown) {
      if (shouldOpenUpward) {
        dropdown.classList.add('open-upward');
      } else {
        dropdown.classList.remove('open-upward');
      }
    }
  }, 0);
};


 
  const toggleRecentsMenu = (e) => {
    e.stopPropagation();
    setRecentsMenuVisible(!recentsMenuVisible);
  };
 
  const handleDeleteAllSessions = () => {
    setConfirmDeleteAll(true);
    setRecentsMenuVisible(false);
  };
 
  const cancelDeleteAll = () => {
    setConfirmDeleteAll(false);
  };
 
  // const confirmDeleteAllAction = async () => {
  //   try {
  //     const token = await getAccessTokenSilently();
  //     for (const sess of recentSessions) {
  //       await deleteSession(sess.session_id, token);
  //     }
  //     setRecentSessions([]);
  //     if (recentSessions.some(sess => sess.session_id === activeSessionId)) {
  //       const newSessionId = uuidv4();
  //       sessionStorage.setItem('session_id', newSessionId);
  //       navigate(`/ai-advisor/${newSessionId}`, { replace: true });
  //       setTimeout(() => window.location.reload(), 100);
  //     }
  //   } catch (error) {
  //     console.error("Error deleting all sessions", error);
  //   }
  //   setConfirmDeleteAll(false);
  // };
 
  const confirmDeleteAllAction = async () => {
    setIsDeletingAll(true);  // ✅ Start spinner
 
    try {
      const token = await getAccessTokenSilently();
      for (const sess of recentSessions) {
        await deleteSession(sess.session_id, token);
      }
      setRecentSessions([]);
 
      if (recentSessions.some(sess => sess.session_id === activeSessionId)) {
        const newSessionId = uuidv4();
        sessionStorage.setItem('session_id', newSessionId);
        navigate(`/ai-advisor/${newSessionId}`, { replace: true });
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (error) {
      console.error("Error deleting all sessions", error);
    } finally {
      setIsDeletingAll(false); // ✅ Stop spinner
      setConfirmDeleteAll(false);
    }
  };
 
 
 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
 
 
 
  // const handleRenameSession = async (sessionId) => {
  //   if (!newName.trim()) return;
  //   try {
  //     const token = await getAccessTokenSilently();
  //     await addOrUpdateSessionInRecents(sessionId, "", newName, token);
  //     setSessionTitle(newName);
  //     const sessions = await getRecentSessions(token);
  //     setRecentSessions(sessions);
  //   } catch (error) {
  //     console.error("Error renaming session", error);
  //   }
  //   setRenameSessionId(null);
  //   setMenuVisible(null);
  // };
 
  const handleRenameSession = async (sessionId, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      const token = await getAccessTokenSilently();
      await addOrUpdateSessionInRecents(sessionId, "", newTitle, token);
      setSessionTitle(newTitle);
      const sessions = await getRecentSessions(token);
      setRecentSessions(sessions);
    } catch (error) {
      console.error("Error renaming session", error);
    }
  };
 
 
  const confirmDeletion = async () => {
    if (!confirmDelete) return;
    try {
      const token = await getAccessTokenSilently();
      await deleteSession(confirmDelete, token);
      const sessions = await getRecentSessions(token);
      setRecentSessions(sessions);
      if (confirmDelete === activeSessionId) {
        const newSessionId = uuidv4();
        sessionStorage.setItem('session_id', newSessionId);
        navigate(`/ai-advisor/${newSessionId}`, { replace: true });
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      console.error("Error deleting session", error);
    }
    setConfirmDelete(null);
  };
 
  const handleDeleteSessionClick = (sessionId) => {
    setConfirmDelete(sessionId);
  };
 
  const cancelDeletion = () => {
    setConfirmDelete(null);
  };
 
  const handleMouseEnter = () => {
    if (!pinned) setSidebarVisible(true);
  };
 
  const handleMouseLeave = () => {
    if (!pinned) setSidebarVisible(false);
  };
 
  const handleDownloadPDF = (pdfBase64, filename) => {
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${pdfBase64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
 
  const handleDownloadChat = async () => {
    if (!sessionId) {
      console.error("Session ID is undefined. Cannot download PDF.");
      return;
    }
    setIsDownloading(true); // Show spinner
 
    try {
      // Retrieve the token using the passed getToken function
      const token = await getToken();
 
      const response = await fetch(`${config.API_BASE_URL}/api/download_pdf?session_id=${sessionId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
        },
      });
 
      if (response.ok) {
        // Handle the PDF download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${sessionId}_chat_history.pdf`;
       
       
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        console.error("Failed to download PDF:", response.statusText);
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }finally {
      setIsDownloading(false); // Hide spinner
    }
  };
 
  const togglePin = () => {
    const newPinnedState = !pinned;
    setPinned(newPinnedState);
    localStorage.setItem("sidebarPinned", JSON.stringify(newPinnedState));
  };
 
  useEffect(() => {
    const storedPinned = JSON.parse(localStorage.getItem("sidebarPinned"));
    if (storedPinned !== null) {
      setPinned(storedPinned);
    }
  }, []);
 
 
  const handleSessionClick = (sessId) => {
    navigate(`/ai-advisor/${sessId}`);
  };
 
 
  const handleStartNewChat = () => {
    const currentSessionId = sessionStorage.getItem('session_id');
    const sessionExists = recentSessions.some(s => s.session_id === currentSessionId);
    if (!isEphemeral && !sessionExists) {
      return;
    }
    const newSessionId = uuidv4();
    sessionStorage.setItem('session_id', newSessionId);
    navigate(`/ai-advisor/${newSessionId}`);
    window.location.reload();
  };
 
 
  const handleStartTemporaryChat = () => {
    const currentSessionId = sessionStorage.getItem('session_id');
    const sessionExists = recentSessions.some(s => s.session_id === currentSessionId);
    if (
      isEphemeral &&
      !sessionExists &&
      chatHistory.length === 1 &&
      chatHistory[0].type === 'bot'
    ) {
      return;
    }
    const ephemeralSessionId = uuidv4();
    navigate(`/ai-advisor/${ephemeralSessionId}?temp=true`, { replace: true });
  };
 
 
  const stripHTML = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };
 
  const convertTableToCSV = (tableContent) => {
    const rows = tableContent
      .split('\n')
      .filter(row => row.includes('|'))
      .map(row => row.split('|').map(cell => stripHTML(cell.trim()))); // strip HTML here
 
    if (rows.length > 1) rows.splice(1, 1); // remove the separator row
 
    return rows
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
  };
 
 
// Detect if a section is an ASCII table (dashed borders + pipe separators)
const isAsciiTable = (section) => {
  const lines = section.split('\n');
  const hasPipe = lines.some(line => line.includes('|'));
  const hasDashLine = lines.some(line => /^[-\s|]+$/.test(line.trim()));
  return hasPipe && hasDashLine;
};
 
// Convert an ASCII table to a valid markdown table
const convertAsciiTableToMarkdown = (tableContent) => {
  // Split lines, trim, and remove lines that are just dashes/pipes
  const lines = tableContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => !/^[-\s|]+$/.test(line));
  if (lines.length === 0) return tableContent;
  // The first non-dashed line is assumed to be the header row.
  let headerRow = lines[0];
  // Ensure header row has leading/trailing pipes.
  if (!headerRow.startsWith('|')) headerRow = '| ' + headerRow;
  if (!headerRow.endsWith('|')) headerRow = headerRow + ' |';
  // Split header into columns.
  const columns = headerRow.split('|').map(c => c.trim()).filter(c => c !== '');
  // Create a markdown header separator row.
  const separatorRow = '| ' + columns.map(c => '-'.repeat(Math.max(c.length, 3))).join(' | ') + ' |';
  // Process the remaining rows.
  const bodyRows = lines.slice(1).map(row => {
    let formattedRow = row;
    if (!formattedRow.startsWith('|')) formattedRow = '| ' + formattedRow;
    if (!formattedRow.endsWith('|')) formattedRow = formattedRow + ' |';
    return formattedRow;
  });
  return [headerRow, separatorRow, ...bodyRows].join('\n');
};
 
// Update the extraction function to handle both markdown and ASCII tables.
// const extractMarkdownContent = (markdown = '') => {
//   const sections = markdown.split(/\n\n+/);
//   let structuredData = [];
//   let buffer = [];
//   sections.forEach((section) => {
//     // Check for both your current markdown table or the new ASCII table
//     if ((section.includes('|') && section.includes('-|-')) || isAsciiTable(section)) {
//       let tableContent = section;
//       if (isAsciiTable(section)) {
//         tableContent = convertAsciiTableToMarkdown(section);
//       }
//       const headingMatch = buffer.length ? buffer[buffer.length - 1]?.match(/^###\s*(.*)/) : null;
//       const heading = headingMatch ? headingMatch[1] : '';
//       const filledTable = fillEmptyMarkdownCells(tableContent);
//       structuredData.push({ type: 'table', heading, content: filledTable });
//       if (headingMatch) buffer.pop();
//     } else {
//       buffer.push(section);
//       structuredData.push({ type: 'text', content: section });
//     }
//   });
//   return structuredData;
// };

const extractMarkdownContent = (markdown = '') => {
  // const sections = markdown.split(/\n\n+/);
  const cleanedMarkdown = markdown
  // Fix **bold** followed by table
  .replace(/(\*\*.+?\*\*)(\n\|)/g, '$1\n\n$2')
  // Fix markdown heading (##, ###, etc.) followed by table
  .replace(/(#+\s+.+)(\n\|)/g, '$1\n\n$2')
  // Fix numbered list like "5. Title:" followed by table
  .replace(/^(\d+\.\s+.+)(\n\|)/gm, '$1\n\n$2');       // handles #/##/### headings

  const sections = cleanedMarkdown.split(/\n\n+/);
  let structuredData = [];
  let buffer = [];
  sections.forEach((section) => {
    // Check for both your current markdown table or the new ASCII table
    if ((section.includes('|') && section.includes('-|-')) || isAsciiTable(section)) {
      let tableContent = section;
      if (isAsciiTable(section)) {
        tableContent = convertAsciiTableToMarkdown(section);
      }
      const headingMatch = buffer.length ? buffer[buffer.length - 1]?.match(/^###\s*(.*)/) : null;
      const heading = headingMatch ? headingMatch[1] : '';
      const filledTable = fillEmptyMarkdownCells(tableContent);
      structuredData.push({ type: 'table', heading, content: filledTable });
      if (headingMatch) buffer.pop();
    } else {
      buffer.push(section);
      structuredData.push({ type: 'text', content: section });
    }
  });
  return structuredData;
};
 
  const handleDownloadCSV = (table) => {
    const csvContent = convertTableToCSV(table.content);
    if (!csvContent) return;
    const fileName = table.heading ? table.heading.replace(/\s+/g, '_') : 'Table_Data';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
 
 
 
const toggleExpand = useCallback((uniqueId) => {
  setExpandedTables(prev => ({
    ...prev,
    [uniqueId]: prev[uniqueId] === 'full-screen' ? '' : 'full-screen'
  }));
}, []);
 
const toggleGraphExpand = useCallback((id) => {
  setExpandedGraphs(prev => ({
    ...prev,
    [id]: prev[id] === 'full-screen' ? '' : 'full-screen'
  }));
}, []);
 
 
  // Add window resize event listener
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
 
  // Calculate responsive dimensions for graphs
  const getResponsiveDimensions = (isExpanded) => {
    if (!isExpanded) {
      return { width: 700, height: 400 }; // Default dimensions
    }
   
    // For smaller screens (laptops, etc.)
    if (windowDimensions.width < 1366) {
      return {
        width: windowDimensions.width * 0.85,
        height: windowDimensions.height * 0.6
      };
    }
   
    // For larger screens
    return {
      width: windowDimensions.width * 0.97,
      height: windowDimensions.height * 0.8
    };
  };
  const memoizedMessages = useMemo(() => {
  // Filter repeated status messages before rendering
  const displayHistory = filterRepeatedBotStatusMessages(chatHistory);

  return displayHistory.map((chat, index) => {
    const messageContent = chat.message || '';
    const normalizedMessage = typeof messageContent === 'string' ? messageContent : messageContent?.content || '';
    const structuredData = extractMarkdownContent(normalizedMessage);

    return (
      <ChatMessage
        key={index}
        chat={chat}
        structuredData={structuredData}
        index={index}
        totalMessages={displayHistory.length}
        lastMessageRef={lastMessageRef}
        expandedTables={expandedTables}
        toggleExpand={toggleExpand}
        handleDownloadCSV={handleDownloadCSV}
        expandedGraphs={expandedGraphs}
        toggleGraphExpand={toggleGraphExpand}
        getResponsiveDimensions={getResponsiveDimensions}
        handleDownloadPDF={handleDownloadPDF}
      />
    );
  });
}, [
  chatHistory,
  expandedTables,
  toggleExpand,
  handleDownloadCSV,
  expandedGraphs,
  toggleGraphExpand,
  getResponsiveDimensions,
  handleDownloadPDF,
  lastMessageRef
]);

 
const RenameInput = ({ initialValue, onSave }) => {
  const [value, setValue] = useState(initialValue);
 
  const handleChange = (e) => setValue(e.target.value);
  const handleBlur = () => {
    if (value.trim()) onSave(value.trim());
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) onSave(value.trim());
    }
  };
 
  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="rename-input"
      autoFocus
    />
  );
};
 
 
  return (
    <div className="chat-container">
      <div className="hover-detect-area" onMouseEnter={handleMouseEnter}></div>
      {showSidebar && (
      <aside
        className={`sidebar ${sidebarVisible ? 'visible' : ''} ${pinned ? 'pinned' : ''}`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="sidebar-header">
          <button
            className={`temporary-chat-button ${loading ? "disabled-session" : ""}`}
            onClick={!loading ? handleStartTemporaryChat : undefined}
            disabled={loading}
          >
            <div className="temporary-chat-bubble">
              <RiChatHistoryFill className={`temporary-chat-icon ${isEphemeral ? "active" : ""}`} />
              <span className="temporary-chat-label">New Temporary Chat</span>
            </div>
          </button>
 
        <button className="search-button" onClick={handleSearchToggle}>
            <FaSearch className="search-icon" />
          </button>
 
          <button className="pin-button" onClick={togglePin}>
            <BsLayoutTextSidebarReverse className={`pin-icon ${pinned ? 'pinned-icon' : ''}`} />
          </button>
        </div>
        <button
          className={`start-new-chat ${loading ? "disabled-session" : ""}`}
          onClick={!loading ? handleStartNewChat : undefined}
          disabled={loading}
        >
          <PiNotePencilBold className="chat-icon" /> Start new chat
        </button>
        <div className="recent-chats">
          <div className="recents-header">
              <h4 className="recent-title">Recents</h4>
              <button className="recents-menu-button" onClick={toggleRecentsMenu}>⋮</button>
              {recentsMenuVisible && (
                <div className="recents-menu-dropdown" ref={recentsMenuRef}>
                  <button onClick={handleDeleteAllSessions} className="menu-item delete-all">
                    Delete All
                  </button>
                </div>
              )}
            </div>
          <ul className="chat-list">
            {recentSessions.map((sess) => (
              <li
                key={sess.session_id}
                className={`chat-item ${sess.session_id === activeSessionId ? "active-session" : ""} ${loading ? "disabled-session" : ""}`}
                onClick={!loading ? () => handleSessionClick(sess.session_id) : undefined}
              >
                <div className="chat-item-content">
                  {/* {renameSessionId === sess.session_id ? (
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onBlur={() => handleRenameSession(sess.session_id)}
                      onKeyDown={(e) => e.key === "Enter" && handleRenameSession(sess.session_id)}
                      className="rename-input"
                      autoFocus
                    />
                  ) : (
                    <span className="session-title">{sess.title ? sess.title : sess.session_id}</span>
                  )} */}
                  {renameSessionId === sess.session_id ? (
                        <RenameInput
                          initialValue={sess.title}
                          onSave={(newTitle) => {
                            handleRenameSession(sess.session_id, newTitle);
                            setRenameSessionId(null);
                            setMenuVisible(null);
                          }}
                        />
                      ) : (
                        <span className="session-title">{sess.title ? sess.title : sess.session_id}</span>
                      )}
 
                </div>
                <div className="menu-wrapper">
                  <button className="menu-button" onClick={(e) => toggleMenu(sess.session_id, e)}>⋯</button>
                  {menuVisible === sess.session_id && (
                    <div className="menu-dropdown" ref={menuRef}>
                      <button onClick={() => setRenameSessionId(sess.session_id)} className="menu-item">
                        <MdDriveFileRenameOutline className="menu-icon" /> Rename
                      </button>
                      <button onClick={() => handleSummarize(sess.id)} className="menu-item">
                        <MdOutlineSummarize className="menu-icon" /> Summarize
                        {isSummarizing && <div className="spinner"></div>} {/* Show spinner */}
                        </button>
                        <button onClick={() => handleDownloadChat(sess.id)} className="menu-item">
                          <MdDownload className="menu-icon" /> Chat
                          {isDownloading && <div className="spinner"></div>}
                        </button>                      
                      <button onClick={() => handleDeleteSessionClick(sess.session_id)} className="menu-item delete">
                        <RiDeleteBin6Line className="menu-icon" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      )}
      {showSearch && <SearchHistory onClose={handleSearchToggle} chatHistory={chatHistory} />}
 
      {confirmDelete && (
        <div className="overlay">
          <div className="confirmation-popup">
            <h3>Delete chat?</h3>
            <p>
              This will delete <strong>{recentSessions.find(s => s.session_id === confirmDelete)?.title || confirmDelete}</strong>.
            </p>
            <div className="popup-buttons">
              <button className="cancel-btn" onClick={cancelDeletion}>Cancel</button>
              <button className="delete-btn" onClick={confirmDeletion}>Delete</button>
            </div>
          </div>
        </div>
      )}
 
 
      {confirmDeleteAll && (
        <div className="overlay">
          <div className="confirmation-popup">
            <h3>Delete all chats?</h3>
            <p>This will delete all chat sessions. Are you sure?</p>
            <div className="popup-buttons">
              <button className="cancel-btn" onClick={cancelDeleteAll} disabled={isDeletingAll}>
                {isDeletingAll ? "Processing..." : "Cancel"}
              </button>
              <button className="delete-btn" onClick={confirmDeleteAllAction} disabled={isDeletingAll}>
                {isDeletingAll ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
 
      {showSummaryPopup && (
        <div className="summary-popup">
          <div className="summary-popup-content">
            <h2>Summary</h2>
            <div className="summary-popup-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {summary}
              </ReactMarkdown>
 
            </div>
            <div className="summary-popup-footer">
              <button className="summary-close-btn" onClick={() => setShowSummaryPopup(false)}>Close</button>
            </div>
          </div>
        </div>
      )}  
 
      <div className="chat-window">
        {isEphemeral && (
          <div className="temporary-chat-banner">
            <span>Temporary Chat</span>
            <IoMdInformationCircleOutline className="info-icon" title="Temporary Chats won't appear in your history." />
          </div>
        )}
        {memoizedMessages}
 
        {loading && !chatHistory.some(msg =>
          msg.type === 'bot_status' &&
          (msg.message?.toLowerCase().startsWith(" ") || msg.message?.toLowerCase().startsWith(" ") ||msg.message?.toLowerCase().startsWith(" "))
        ) && (
          <div className="chat-bubble bot">
            <div className="loading-indicator">
              <span className="text">{loadingStage.replace(/[^a-zA-Z\s]/g, '')}</span>
              <span className="emoji">{loadingStage.replace(/[a-zA-Z\s.]/g, '')}</span>
            </div>
          </div>
        )}
        

      </div>
    </div>
  );
}
 
//export default ChatWindow;
export default React.memo(ChatWindow);
 