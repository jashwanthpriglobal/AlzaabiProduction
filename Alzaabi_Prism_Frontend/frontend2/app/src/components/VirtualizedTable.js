import React from 'react';
import { FixedSizeList as List } from 'react-window';
import './styles/VirtualizedTable.css';



const VirtualizedTable = ({ markdown, maxHeight = 400, isFullScreen = false }) => {
  const parseMarkdown = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.includes('|'));
    if (lines.length < 2) return { headers: [], rows: [] };

    const headers = lines[0].split('|').map(col => col.trim()).filter(Boolean);
    const rows = lines.slice(2).map(line =>
      line.split('|').map(cell => cell.trim()).filter(Boolean)
    );

    return { headers, rows };
  };

  const { headers, rows } = parseMarkdown(markdown);
  const rowHeight = 32;
  const headerHeight = 40;

  if (!headers.length || !rows.length) {
    return <div style={{ padding: '1rem' }}>⚠️ No valid table found.</div>;
  }

  const rowCount = rows.length;

  // ✅ Dynamically adjust based on mode
  let dynamicBodyHeight, wrapperHeight;

  if (isFullScreen) {
    const screenCap = window.innerHeight * 0.85;
    const totalContentHeight = rowCount * rowHeight + headerHeight;

    wrapperHeight = Math.min(totalContentHeight, screenCap);
    dynamicBodyHeight = wrapperHeight - headerHeight;
  } else {
    dynamicBodyHeight = Math.min(rowCount, 10) * rowHeight;
    wrapperHeight = dynamicBodyHeight + headerHeight;
  }

  const Row = ({ index, style }) => {
    const row = rows[index];
    return (
      <div className={`table-row ${index % 2 === 0 ? 'even' : 'odd'}`} style={style}>
        {headers.map((_, colIndex) => (
          <div key={colIndex} className="table-cell" title={row[colIndex] || ''}>

          <div
            dangerouslySetInnerHTML={{ __html: row[colIndex] ?? '' }}
          />

          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="virtual-table-wrapper" style={{ height: wrapperHeight }}>
      <div className="table-header">
        {headers.map((header, i) => (
            <div
                key={i}
                className="table-cell header-cell"
                title={header}
                >
                <strong>{header}</strong>
                </div>
        ))}
      </div>
      <List
        height={dynamicBodyHeight}
        itemCount={rowCount}
        itemSize={rowHeight}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
};

export default VirtualizedTable;
