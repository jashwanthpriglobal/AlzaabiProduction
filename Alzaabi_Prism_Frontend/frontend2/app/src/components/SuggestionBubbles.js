import React from 'react';
import './styles/SuggestionBubbles.css';

const SuggestionBubbles = ({ suggestionBubbles, handleSuggestionClick, disableBubbles }) => {
  return (
    <div className="suggestion-bubbles">
      {suggestionBubbles.map((bubble, index) => (
        <button
          key={index}
          className="suggestion-bubble"
          onClick={() => {
            if (!disableBubbles) {
              handleSuggestionClick(bubble.text);
            }
          }}
          disabled={disableBubbles}
        >
          {bubble.text}
        </button>
      ))}
    </div>
  );
};

function areEqual(prevProps, nextProps) {
  return (
    prevProps.disableBubbles === nextProps.disableBubbles &&
    prevProps.suggestionBubbles === nextProps.suggestionBubbles &&
    prevProps.handleSuggestionClick === nextProps.handleSuggestionClick
  );
}

export default React.memo(SuggestionBubbles, areEqual);
