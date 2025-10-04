import React from "react";

const Sidebar = ({ previousChats, handleSelectChat, handleDeleteChat, handleNewChat, showSidebar }) => (
  <aside className={`chat-sidebar ${showSidebar ? "visible" : ""}`}>
    <div className="sidebar-header">
      <button className="new-chat-button" style={{ marginTop: '32px' }} onClick={handleNewChat}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="chat-icon">
          <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
        </svg>
        New Chat
      </button>
    </div>
    <div className="previous-chats">
      {previousChats.map((chat) => (
        <div
          key={chat.id}
          className={`chat-item ${chat.active ? "active" : ""}`}
          onClick={() => handleSelectChat(chat)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
        >
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.title}</span>
          <button
            className="delete-chat-button"
            onClick={e => { e.stopPropagation(); handleDeleteChat(chat.id, e); }}
            aria-label="Delete chat"
            style={{ marginLeft: 8, opacity: 1, visibility: 'visible' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="#ff4b4b"/>
              <text x="10" y="15" textAnchor="middle" fontSize="16" fill="#fff">×</text>
            </svg>
          </button>
        </div>
      ))}
    </div>
  </aside>
);

export default Sidebar;
