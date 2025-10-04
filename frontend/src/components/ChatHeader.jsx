import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const ChatHeader = ({ onMenuClick, onProfileClick, userName = "User" }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    }
  };

  return (
    <div className="chat-header">
      {/* Left: Hamburger Menu */}
      <div className="chat-header-left">
        <button className="menu-button" onClick={onMenuClick}>
          <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
      </div>

      {/* Center: JEERAVAN Title */}
      <h1 className="chat-title">JEERAVAN</h1>

      {/* Right: Theme Toggle + Profile */}
      <div className="chat-header-right">
        <div className="mobile-only">
          <ThemeToggle />
        </div>
        
        <button className="profile-button" onClick={handleProfileClick}>
          <div className="user-profile-content">
            <span className="user-icon">👤</span>
            <span className="user-name-text desktop-only">{userName}</span>
          </div>
        </button>
        
        <div className="desktop-only">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
