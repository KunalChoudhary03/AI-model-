import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const ChatHeader = ({ setShowSidebar, showProfile, user, onProfileClick }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      onProfileClick();
    }
  };

  return (
    <div className="chat-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
      <button
        className="menu-button"
        onClick={() => setShowSidebar && setShowSidebar((prev) => !prev)}
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="menu-icon">
          <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
        </svg>
      </button>
      <h2 className="chat-title" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>JEERAVAN</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginLeft: 'auto' }}>
        <ThemeToggle />
        {showProfile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <div 
                style={{ position: 'relative' }}
                onClick={handleProfileClick}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '8px 12px', 
                  background: 'linear-gradient(45deg, #8B4513, #D2691E)', 
                  borderRadius: '20px', 
                  color: 'white', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(139, 69, 19, 0.3)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="12" fill="#fff"/>
                    <text x="12" y="17" textAnchor="middle" fontSize="12" fill="#8B4513">👤</text>
                  </svg>
                  <span className="user-name-text" style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>
                    {user.fullName?.firstName} {user.fullName?.lastName}
                  </span>
                </div>
              </div>
            ) : (
              <button className="profile-button" aria-label="Profile/Login/Register" onClick={handleProfileClick} style={{ 
                background: 'linear-gradient(45deg, #8B4513, #D2691E)',
                border: 'none',
                borderRadius: '50%',
                padding: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(139, 69, 19, 0.3)',
                transition: 'all 0.2s ease'
              }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="16" fill="#fff"/>
                  <text x="16" y="21" textAnchor="middle" fontSize="16" fill="#8B4513">👤</text>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
