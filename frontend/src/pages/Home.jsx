
import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "../styles/theme.css";
import "../styles/chat-items.css";
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import ChatMessages from "../components/ChatMessages";
import ChatInputBar from "../components/ChatInputBar";
import ThemeToggle from "../components/ThemeToggle";
import NamePromptModal from "../components/NamePromptModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket = io("http://localhost:3000", { withCredentials: true });

const Home = () => {
  const [currentChat, setCurrentChat] = useState({
    messages: [{ 
      id: 1, 
      text: "I'm your AI assistant, designed to help you with a wide range of tasks. Feel free to ask me anything!", 
      sender: "ai" 
    }],
  });
  const [inputMessage, setInputMessage] = useState("");
  const [previousChats, setPreviousChats] = useState([
    // Start with no chat, force user to create a new chat to get a valid ObjectId from backend
  ]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat.messages]);

  const updateChatTitle = (messages) => {
    const firstUserMessage = messages.find(m => m.sender === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.text.slice(0, 30) + (firstUserMessage.text.length > 30 ? '...' : '');
      setPreviousChats(prev =>
        prev.map(chat =>
          chat.active ? { ...chat, title } : chat
        )
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: currentChat.messages.length + 1,
      text: inputMessage,
      sender: "user",
    };
    const updatedMessages = [...currentChat.messages, newMessage];
    setCurrentChat((prev) => ({ ...prev, messages: updatedMessages }));
    setPreviousChats((prev) =>
      prev.map((chat) => 
        chat.active 
          ? { ...chat, messages: updatedMessages } 
          : chat
      )
    );
    if (currentChat.messages.length === 1) {
      updateChatTitle(updatedMessages);
    }
    setInputMessage("");

    // Send message to backend via socket
    // Find active chat id
    const activeChat = previousChats.find(chat => chat.active);
    if (activeChat) {
      socket.emit("ai-message", {
        chat: activeChat.id,
        content: newMessage.text
      });
    }
  };

  const handleTextareaInput = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleNewChat = () => {
    setShowNameModal(true);
  };

  const handleNameSubmit = (chatName) => {
    setShowNameModal(false);
    if (!chatName.trim()) return toast.error("Chat name cannot be empty!");
    // Create chat on backend to get valid ObjectId
    fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ title: chatName })
    })
      .then(res => res.json())
      .then(data => {
        if (data.chat && data.chat._id) {
          const initialMessage = { id: 1, text: "Hello! How can I help you today?", sender: "ai" };
          const newChat = {
            id: data.chat._id,
            title: chatName,
            messages: [initialMessage],
            active: true,
          };
          setPreviousChats(prev => [newChat, ...prev.map(chat => ({ ...chat, active: false }))]);
          setCurrentChat({ messages: [initialMessage] });
          setShowSidebar(false);
          toast.success(`New chat '${chatName}' created!`);
        } else {
          toast.error("Failed to create chat!");
        }
      })
      .catch(() => toast.error("Failed to create chat!"));
  };

  const handleSelectChat = (selectedChat) => {
    setPreviousChats((prev) =>
      prev.map((chat) => ({ ...chat, active: chat.id === selectedChat.id }))
    );
    setCurrentChat(selectedChat);
    setShowSidebar(false);
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    setPreviousChats(prev => {
      const updatedChats = prev.filter(chat => chat.id !== chatId);
      if (prev.find(chat => chat.id === chatId)?.active) {
        if (updatedChats.length > 0) {
          updatedChats[0].active = true;
          setCurrentChat(updatedChats[0]);
        } else {
          const initialMessage = { id: 1, text: "Hello! How can I help you today?", sender: "ai" };
          const newChat = {
            id: Date.now().toString(),
            title: "New Chat",
            messages: [initialMessage],
            active: true
          };
          updatedChats.push(newChat);
          setCurrentChat({ messages: [initialMessage] });
        }
      }
      return updatedChats;
    });
    toast.info("Chat deleted!");
  };


  // Listen for AI response from backend
  useEffect(() => {
    function handleAIResponse({ content, chat }) {
      setPreviousChats(prev => {
        let updatedCurrentChat = null;
        const updatedChats = prev.map(c => {
          if (c.id === chat) {
            const aiMessage = {
              id: c.messages.length + 1,
              text: content,
              sender: "ai"
            };
            const updatedMessages = [...c.messages, aiMessage];
            if (c.active) {
              updatedCurrentChat = { ...c, messages: updatedMessages };
            }
            return { ...c, messages: updatedMessages };
          }
          return c;
        });
        if (updatedCurrentChat) {
          setCurrentChat({ messages: updatedCurrentChat.messages });
        }
        return updatedChats;
      });
    }
    socket.on("ai-response", handleAIResponse);
    return () => {
      socket.off("ai-response", handleAIResponse);
    };
  }, []);

  const MAX_VISIBLE_MESSAGES = 30;
  function getVisibleMessages(messages) {
    if (messages.length > MAX_VISIBLE_MESSAGES) {
      return messages.slice(-MAX_VISIBLE_MESSAGES);
    }
    return messages;
  }

  return (
    <div className="chat-container">
      <Sidebar
        previousChats={previousChats}
        handleSelectChat={handleSelectChat}
        handleDeleteChat={handleDeleteChat}
        handleNewChat={handleNewChat}
        showSidebar={showSidebar}
      />
      {showSidebar && (
        <div
          className="sidebar-overlay"
          onClick={() => setShowSidebar(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9, background: 'rgba(0,0,0,0.2)' }}
        />
      )}
      <main className="chat-main">
        <div className="shiny-header-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="shiny-header-text">ChatGPT</span>
        </div>
        <ChatHeader
          setShowSidebar={setShowSidebar}
          showProfile={true}
          onProfileClick={() => navigate('/register')}
        />
        <ChatMessages messages={getVisibleMessages(currentChat.messages)} />
        <ChatInputBar
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSubmit={handleSubmit}
          handleTextareaInput={handleTextareaInput}
        />
        <NamePromptModal
          isOpen={showNameModal}
          onClose={() => setShowNameModal(false)}
          onSubmit={handleNameSubmit}
        />
        <ToastContainer position="top-right" autoClose={2500} hideProgressBar theme="colored" />
      </main>
    </div>
  );
};

export default Home;