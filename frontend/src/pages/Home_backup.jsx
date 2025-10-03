
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
  const [user, setUser] = useState(null);
  const [currentChat, setCurrentChat] = useState({
    messages: [{ 
      id: 1, 
      text: "Bhiya Ram! Main aapka Jeeravan hun 🌶️ - Indore ki dil se aur Malwa ka swaad liye hue! Koi bhi sawal poocho, main hazir hun madad karne ke liye!", 
      sender: "ai" 
    }],
  });
  const [inputMessage, setInputMessage] = useState("");
  const [previousChats, setPreviousChats] = useState([
    // Start with no chat, force user to create a new chat to get a valid ObjectId from backend
  ]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat.messages]);

  // Fetch user profile on mount
  useEffect(() => {
    // First try to get user from localStorage for immediate display
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (err) {
        console.log('Error parsing stored user data:', err);
      }
    }

    // Then fetch fresh user data from server
    fetch("http://localhost:3000/api/auth/profile", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      })
      .catch((err) => {
        console.log("User not logged in or profile fetch failed:", err);
        // Clear localStorage if fetch fails
        localStorage.removeItem('user');
        setUser(null);
      });
  }, []);

  // Listen for AI response from backend
  useEffect(() => {
    function handleAIResponse({ content, chat }) {
      setIsAiThinking(false); // Stop thinking indicator
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
    return () => socket.off("ai-response", handleAIResponse);
  }, []);

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

    // Set thinking indicator
    setIsAiThinking(true);

    // Send message to backend via socket
    // Find active chat id
    const activeChat = previousChats.find(chat => chat.active);
    if (activeChat) {
      socket.emit("ai-message", {
        chat: activeChat.id,
        content: newMessage.text,
        userName: user ? `${user.fullName?.firstName} ${user.fullName?.lastName}` : null
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

    fetch("http://localhost:3000/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title: chatName }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Deactivate all previous chats
          setPreviousChats(prev => prev.map(chat => ({ ...chat, active: false })));
          
          // Add new chat and make it active
          const newChat = {
            id: data.chat._id,
            title: chatName,
            messages: [{ 
              id: 1, 
              text: "Bhiya Ram! Main aapka Jeeravan hun 🌶️ - Indore ki dil se aur Malwa ka swaad liye hue! Koi bhi sawal poocho, main hazir hun madad karne ke liye!", 
              sender: "ai" 
            }],
            active: true,
          };
          
          setPreviousChats(prev => [...prev, newChat]);
          setCurrentChat({ messages: newChat.messages });
          setShowSidebar(false);
        } else {
          toast.error(data.message || "Failed to create chat");
        }
      })
      .catch(() => toast.error("Network error"));
  };

  const handleSelectChat = (selectedChat) => {
    // Deactivate all chats and activate selected one
    setPreviousChats(prev => 
      prev.map(chat => ({ 
        ...chat, 
        active: chat.id === selectedChat.id 
      }))
    );
    setCurrentChat({ messages: selectedChat.messages });
    setShowSidebar(false);
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    
    const chatToDelete = previousChats.find(chat => chat.id === chatId);
    if (!chatToDelete) return;

    fetch(`http://localhost:3000/api/chats/${chatId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Remove chat from state
          setPreviousChats(prev => {
            const remainingChats = prev.filter(chat => chat.id !== chatId);
            
            // If deleted chat was active, activate another chat or reset
            if (chatToDelete.active) {
              if (remainingChats.length > 0) {
                // Activate the first remaining chat
                remainingChats[0].active = true;
                setCurrentChat({ messages: remainingChats[0].messages });
              } else {
                // No chats left, reset to default
                setCurrentChat({
                  messages: [{ 
                    id: 1, 
                    text: "Bhiya Ram! Main aapka Jeeravan hun 🌶️ - Indore ki dil se aur Malwa ka swaad liye hue! Koi bhi sawal poocho, main hazir hun madad karne ke liye!", 
                    sender: "ai" 
                  }],
                });
              }
            }
            
            return remainingChats;
          });
          
          toast.success("Chat deleted successfully");
        } else {
          toast.error(data.message || "Failed to delete chat");
        }
      })
      .catch(() => toast.error("Network error"));
  };

  const getVisibleMessages = (messages) => {
    return messages || [];
  };

  return (
    <div className="chat-container">
      <Sidebar
        previousChats={previousChats}
        handleSelectChat={handleSelectChat}
        handleDeleteChat={handleDeleteChat}
        handleNewChat={handleNewChat}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
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
          <span className="shiny-header-text">Jeeravan</span>
        </div>
        <ChatHeader
          setShowSidebar={setShowSidebar}
          showProfile={true}
          user={user}
          onProfileClick={() => navigate('/login')}
        />
        <ChatMessages 
          messages={getVisibleMessages(currentChat.messages)} 
          isAiThinking={isAiThinking}
        />
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