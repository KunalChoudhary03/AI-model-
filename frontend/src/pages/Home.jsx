import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import ChatMessages from '../components/ChatMessages';
import ChatInputBar from '../components/ChatInputBar';
import { toast } from 'react-toastify';
import axios from 'axios';
import { io } from 'socket.io-client';

// Initialize Socket.IO client
const socket = io("http://localhost:3000", { withCredentials: true });

const Home = () => {
  const [chatSessions, setChatSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [chatNameInput, setChatNameInput] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false); // Loading state

  // Fetch messages for a chat
  const fetchMessages = async (chatId) => {
    setLoadingMessages(true);
    try {
      const res = await axios.get(`http://localhost:3000/api/chat/messages/${chatId}`, { withCredentials: true });
      const messages = res.data.messages.map(msg => ({
        sender: msg.role === 'user' ? 'user' : 'ai',
        text: msg.content
      }));
      setLoadingMessages(false);
      return messages;
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setLoadingMessages(false);
      return [];
    }
  };

  // Fetch chats and messages on mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/chat', { withCredentials: true });
        const chats = await Promise.all(res.data.chats.map(async (chat) => {
          const messages = await fetchMessages(chat._id);
          return {
            id: chat._id,
            title: chat.title,
            messages: messages
          };
        }));
        setChatSessions(chats);
        if (chats.length > 0) setActiveChatId(chats[0].id);
      } catch (err) {
        console.log('Failed to fetch chats', err);
      }
    };
    loadChats();
  }, []);

  // Listen for AI responses via Socket.IO
  useEffect(() => {
    const handler = ({ content, chat }) => {
      setChatSessions(prev =>
        prev.map(c =>
          c.id === chat
            ? { ...c, messages: [...c.messages, { sender: 'ai', text: content }] }
            : c
        )
      );
    };
    socket.on('ai-response', handler);
    return () => socket.off('ai-response', handler);
  }, []);

  const activeChat = chatSessions.find(c => c.id === activeChatId);
  const messages = activeChat ? activeChat.messages : [];

  // Send message
  const handleSend = (e) => {
    e.preventDefault();
    if (!activeChatId) {
      toast.error("Please create a chat first!");
      return;
    }
    if (!input.trim()) return;

    const newMessage = { sender: 'user', text: input };
    setChatSessions(prev =>
      prev.map(c =>
        c.id === activeChatId
          ? { ...c, messages: [...c.messages, newMessage] }
          : c
      )
    );
    socket.emit('ai-message', { chat: activeChatId, content: input });
    setInput('');
  };

  // Create new chat
  const handleCreateChat = () => {
    setChatNameInput('');
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    let chatName = chatNameInput.trim() || `Chat ${chatSessions.length + 1}`;
    const res = await axios.post('http://localhost:3000/api/chat', { title: chatName }, { withCredentials: true });
    const newChat = {
      id: res.data.chat._id,
      title: res.data.chat.title,
      messages: [{ sender: 'ai', text: 'New chat started. How can I help?' }]
    };
    setChatSessions([...chatSessions, newChat]);
    setActiveChatId(res.data.chat._id);
    setShowModal(false);
    toast.success('Chat created!');
  };

  // Delete chat
  const handleDeleteChat = async (id) => {
    await axios.delete(`http://localhost:3000/api/chat/${id}`, { withCredentials: true });
    setChatSessions(prev => prev.filter(chat => chat.id !== id));
    if (activeChatId === id) {
      const remaining = chatSessions.filter(chat => chat.id !== id);
      setActiveChatId(remaining.length > 0 ? remaining[0].id : null);
    } 
    toast.info('Chat deleted.');
  };

  const handleSelectChat = async (id) => {
    setActiveChatId(id);
    setSidebarOpen(false);
    const messages = await fetchMessages(id);
    setChatSessions(prev => prev.map(c => c.id === id ? { ...c, messages } : c));
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Sidebar
        chatSessions={chatSessions}
        activeChatId={activeChatId}
        handleSelectChat={handleSelectChat}
        handleCreateChat={handleCreateChat}
        handleDeleteChat={handleDeleteChat}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 bg-white shadow p-2 rounded-full"
        onClick={toggleSidebar}
      >
        <img src="/public/images/menu-line.png" alt="menu" />
      </button>

      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden" onClick={toggleSidebar}></div>}

      {/* Modal for chat name */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
          <div className="rounded-xl shadow-2xl p-6 w-full max-w-xs">
            <form onSubmit={handleModalSubmit}>
              <h3 className="text-lg font-bold mb-4 text-center">Enter Chat Name</h3>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Chat"
                value={chatNameInput}
                onChange={e => setChatNameInput(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <button type="button" className="flex-1 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main chat area */}
      <main className="flex-1 flex flex-col justify-between md:ml-64 pt-16 md:pt-0">
        {activeChat ? (
          <>
            <ChatHeader 
              title={activeChat.title} 
              setShowSidebar={setSidebarOpen}
              showProfile={true}
              onProfileClick={() => {
                // Add profile click handler here
                console.log('Profile clicked');
              }}
            />
            {loadingMessages ? (
              <div className="flex justify-center items-center h-full text-gray-500">Loading messages...</div>
            ) : (
              <ChatMessages messages={messages} />
            )}
            <ChatInput input={input} setInput={setInput} handleSend={handleSend} />
          </>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-gray-500">
            <p>No active chat. Please create a new chat to start messaging.</p>
            <button
              onClick={handleCreateChat}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Create Chat
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;