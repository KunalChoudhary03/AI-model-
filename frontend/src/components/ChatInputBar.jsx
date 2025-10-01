import React from "react";

const ChatInputBar = ({ inputMessage, setInputMessage, handleSubmit, handleTextareaInput }) => (
  <div className="chat-input-container">
    <form onSubmit={handleSubmit} className="chat-input-form">
      <textarea
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onInput={handleTextareaInput}
        placeholder="Type your message..."
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <button
        type="submit"
        className="send-button"
        disabled={!inputMessage.trim()}
        aria-label="Send message"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="send-icon">
          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
        </svg>
      </button>
    </form>
  </div>
);

export default ChatInputBar;
