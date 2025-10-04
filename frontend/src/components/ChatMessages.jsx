import React, { useRef, useEffect } from "react";

const ChatMessages = ({ messages }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-messages">
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message-bubble message-${message.sender}`}> 
            <div className="bubble-row">
              {message.sender === "ai" && (
                <div className="avatar ai-avatar">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#10a37f"/><text x="16" y="21" textAnchor="middle" fontSize="16" fill="#fff">🤖</text></svg>
                </div>
              )}
              <div className="bubble-content">
                {message.text}
              </div>
              {message.sender === "user" && (
                <div className="avatar user-avatar">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#4f46e5"/><text x="16" y="21" textAnchor="middle" fontSize="16" fill="#fff">🧑</text></svg>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
