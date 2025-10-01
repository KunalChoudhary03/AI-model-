import React from "react";
import ThemeToggle from "./ThemeToggle";

const ChatHeader = ({ setShowSidebar, showProfile, onProfileClick }) => (
  <div className="chat-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <button
      className="menu-button"
      onClick={() => setShowSidebar && setShowSidebar((prev) => !prev)}
      aria-label="Toggle sidebar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="menu-icon"><path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>
    </button>
      <h2 className="chat-title">JEERAVAN</h2>
    <div style={{ display: 'flex', alignItems: 'center', gap: '18px', position: 'relative' }}>
      <ThemeToggle />
      {showProfile && (
        <button className="profile-button" aria-label="Profile/Login/Register" onClick={onProfileClick} style={{ marginLeft: '0px' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#4f46e5"/>
            <text x="16" y="21" textAnchor="middle" fontSize="16" fill="#fff">👤</text>
          </svg>
        </button>
      )}
    </div>
  </div>
);

export default ChatHeader;
