import React, { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

const ChatHeader = ({ setShowSidebar, showProfile, onProfileClick, title }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  return (
    <div className="chat-header">
      <button
        className="menu-button"
        onClick={() => setShowSidebar && setShowSidebar((prev) => !prev)}
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="menu-icon">
          <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
        </svg>
      </button>
      
      <h2 className="chat-title">{title || "Jeeravan AI"}</h2>
      
      <div className="chat-header-right">
        <ThemeToggle />
        {showProfile && (
          <button className="profile-button" aria-label="Profile" onClick={onProfileClick}>
            <div className="user-profile-content">
              <span className="user-icon">👤</span>
              <span className="user-name-text desktop-only">
                {user?.name || user?.username || "User"}
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
