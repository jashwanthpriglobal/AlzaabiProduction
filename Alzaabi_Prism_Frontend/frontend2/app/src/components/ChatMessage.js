import React, { useState, useEffect} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Plot from 'react-plotly.js';
import { FaFile, FaDownload, FaExpand, FaCompress } from 'react-icons/fa';
import assistantIcon from '../assets/assistant_icon.png';
import VirtualizedTable from './VirtualizedTable';

function DotLoader() {
  return (
    <div className="dot-loader">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}


const ChatMessage = React.memo(
  ({
    chat,
    structuredData,
    index,
    lastMessageRef,
    totalMessages,
    expandedTables,
    toggleExpand,
    handleDownloadCSV,
    expandedGraphs,
    toggleGraphExpand,
    getResponsiveDimensions,
    handleDownloadPDF,
  }) => {
    const isUser = chat.type === 'user';
    const messageContent = chat.message || '';

    const [animatedDots, setAnimatedDots] = useState('');
    useEffect(() => {
    if (
      messageContent.toLowerCase().startsWith(' ') ||
      messageContent.toLowerCase().startsWith(' ') ||
      messageContent.toLowerCase().startsWith(' ')
    )  {
      const interval = setInterval(() => {
        setAnimatedDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [messageContent]);
   

    return (
      <div
        className={`chat-message ${isUser ? 'user-message' : 'assistant-message'}`}
        ref={index === totalMessages - 1 ? lastMessageRef : null}
      >
        {/* {isUser ? (
          <div className="chat-bubble user">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              children={messageContent.replace(/\n/g, '  \n')}
            />
          </div>
        ) : ( */}
        {isUser ? (
            chat.file ? (
              <div className="file-upload-bubble">
                <FaFile className="file-icon" />
                <p className="file-name">{chat.file.name}</p>
              </div>
            ) : (
              <div className="chat-bubble user">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  children={messageContent.replace(/\n/g, '  \n')}
                />
              </div>
            )
          ) : (

          <div className="assistant-message-container">
            <img src={assistantIcon} alt="Assistant Icon" className="assistant-icon" />
            <div className="assistant-text">
              {chat.graph ? (
                <div className={`plot-wrapper ${expandedGraphs[`graph-${index}`] ? 'full-screen' : ''}`}>
                  <div className="plot-actions">
                    {expandedGraphs[`graph-${index}`] ? (
                      <button className="compress-btn" onClick={() => toggleGraphExpand(`graph-${index}`)}>
                        <FaCompress title="Exit Fullscreen" />
                      </button>
                    ) : (
                      <button className="expand-btn" onClick={() => toggleGraphExpand(`graph-${index}`)}>
                        <FaExpand title="Expand Graph" />
                      </button>
                    )}
                  </div>
                  <div className="plot-content">
                    <Plot
                      data={JSON.parse(chat.graph).data}
                      layout={{
                        ...JSON.parse(chat.graph).layout,
                        autosize: true,
                        ...getResponsiveDimensions(expandedGraphs[`graph-${index}`]),
                        margin: {
                          l: 50,
                          r: 50,
                          t: 50,
                          b: 50,
                          pad: 4,
                        },
                      }}
                      useResizeHandler={true}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
              ) : chat.pdf ? (
                <div>
                  <p>{chat.message}</p>
                  <button className="gradient-button" onClick={() => handleDownloadPDF(chat.pdf, 'report.pdf')}>
                    Download PDF <FaDownload size={18} />
                  </button>
                </div>
              ) : chat.file ? (
                <div className="file-upload-bubble">
                  <FaFile className="file-icon" />
                  <p className="file-name">{chat.file.name}</p>
                </div>
              ) : (
                <div className="markdown-content">
                  {structuredData.map((item, idx) => {
                      if (item.type === 'text') {
                        const isWorkingMsg = item.content.toLowerCase().startsWith(" ");
                        const isGettingResultsMsg = item.content.toLowerCase().startsWith(" ");
                        const isThinkingMsg = item.content.toLowerCase().startsWith("thinking");

                        if (isWorkingMsg || isGettingResultsMsg || isThinkingMsg) {
                          const cleanedText = item.content.replace(/\.*$/, '');

                          return (
                            <div className="agent-status-message" key={`msg-${index}-txt-${idx}`}>
                              {isThinkingMsg ? (
                                <span className="agent-text">
                                  {cleanedText}
                                  <span className="dots"> <DotLoader/> </span>
                                </span>
                              ) : (
                                <>
                                
                                  <span className="agent-text">
                                    {cleanedText}
                                    <span className="dots"> <DotLoader/> </span>
                                  </span>
                                </>
                              )}
                            </div>
                          );
                        }

                        return (
                          <ReactMarkdown
                            key={`msg-${index}-txt-${idx}`}
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                          >
                            {item.content}
                          </ReactMarkdown>
                        );
                  {/* {structuredData.map((item, idx) => {
                    if (item.type === 'text') {
                      return (
                        <ReactMarkdown
                          key={`msg-${index}-txt-${idx}`}
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                        >
                          {item.content}
                        </ReactMarkdown>
                      ); */}
                    } else {
                      const uniqueId = `msg-${index}-tbl-${idx}`;
                      const isExpanded = expandedTables[uniqueId] === 'full-screen';
                      const rowCount = (item.content.match(/\n/g) || []).length;
                      const isLargeTable = rowCount > 0;

                      return (
                        <div key={uniqueId} className={`table-wrapper ${isExpanded ? 'full-screen' : ''}`}>
                          {isExpanded && (
                            <button className="close-fullscreen-btn" onClick={() => toggleExpand(uniqueId)}>
                              Close Full-Screen
                            </button>
                          )}
                          <div className="table-header-box">
                            <span className="table-title">
                              <strong>{item.heading}</strong>
                            </span>
                            <div className="table-actions">
                              <FaDownload
                                className="download-icon"
                                onClick={() => handleDownloadCSV(item)}
                                title="Download CSV"
                              />
                              <FaExpand
                                className="expand-icon"
                                onClick={() => toggleExpand(uniqueId)}
                                title="Expand Table"
                              />
                            </div>
                          </div>
                          <div className={`table-content ${isExpanded ? 'expanded-content' : ''}`}>
                            {isLargeTable ? (
                              // <VirtualizedTable markdown={item.content} maxHeight={isExpanded ? 700 : 300} />
                              <VirtualizedTable
                                markdown={item.content}
                                isFullScreen={isExpanded}
                                maxHeight={isExpanded ? window.innerHeight * 0.85 : 300}
                              />


                            ) : (
                              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                {item.content}
                              </ReactMarkdown>
                            )}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

function areEqual(prevProps, nextProps) {
  return (
    prevProps.chat.message === nextProps.chat.message &&
    prevProps.chat.graph === nextProps.chat.graph &&
    prevProps.chat.pdf === nextProps.chat.pdf &&
    prevProps.chat.file?.name === nextProps.chat.file?.name &&
    prevProps.expandedTables === nextProps.expandedTables &&
    prevProps.expandedGraphs === nextProps.expandedGraphs &&
    prevProps.toggleExpand === nextProps.toggleExpand &&
    prevProps.toggleGraphExpand === nextProps.toggleGraphExpand
  );
}

export default React.memo(ChatMessage, areEqual);

