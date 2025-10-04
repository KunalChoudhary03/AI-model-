import React from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const ChatHeader = ({ setShowSidebar, showProfile, user, onProfileClick }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (user) {
      navigate("/profile");
    } else {
      onProfileClick();
    }
  };

  return (
    <div className="chat-header">
      <div className="chat-header-left">
        <button
          className="menu-button"
          onClick={() => setShowSidebar && setShowSidebar((prev) => !prev)}
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="menu-icon">
            <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 713 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 713 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="mobile-theme-toggle mobile-only">
          <ThemeToggle />
        </div>
      </div>
      
      <h2 className="chat-title">JEERAVAN</h2>
      
      <div className="chat-header-right">
        {showProfile && (
          <div className="profile-section">
            {user ? (
              <div 
                className="user-profile-badge"
                onClick={handleProfileClick}
              >
                <div className="user-profile-content">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="12" fill="#fff"/>
                    <text x="12" y="17" textAnchor="middle" fontSize="12" fill="#8B4513">���</text>
                  </svg>
                  <span className="user-name-text">
                    {user.fullName?.firstName} {user.fullName?.lastName}
                  </span>
                </div>
              </div>
            ) : (
              <button className="profile-button" aria-label="Profile/Login/Register" onClick={handleProfileClick}>
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="16" fill="#fff"/>
                  <text x="16" y="21" textAnchor="middle" fontSize="16" fill="#8B4513">���</text>
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="desktop-theme-toggle desktop-only">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
