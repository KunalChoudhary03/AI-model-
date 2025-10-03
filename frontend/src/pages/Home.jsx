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

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000", { withCredentials: true });

const Home = () => {
  const [user, setUser] = useState(() => {
    // Load user from localStorage on initial load
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [currentChat, setCurrentChat] = useState(() => {
    // Load current chat from localStorage on initial load
    const savedCurrentChat = localStorage.getItem('currentChat');
    return savedCurrentChat ? JSON.parse(savedCurrentChat) : {
      messages: [{ 
        id: 1, 
        text: "Bhiya Ram! Main aapka Jeeravan hun 🌶️ - Indore ki dil se aur Malwa ka swaad liye hue! Koi bhi sawal poocho, main hazir hun madad karne ke liye!", 
        sender: "ai" 
      }],
    };
  });
  const [inputMessage, setInputMessage] = useState("");
  const [previousChats, setPreviousChats] = useState(() => {
    // Load previous chats from localStorage on initial load
    const savedChats = localStorage.getItem('previousChats');
    return savedChats ? JSON.parse(savedChats) : [];
  });
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat.messages]);

  // Save currentChat to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentChat', JSON.stringify(currentChat));
  }, [currentChat]);

  // Save previousChats to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('previousChats', JSON.stringify(previousChats));
  }, [previousChats]);

  // Auto-create first chat on login
  const createFirstChat = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: "Welcome Chat" }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newChat = {
            id: data.chat._id,
            title: "Welcome Chat",
            messages: [{ 
              id: 1, 
              text: "Bhiya Ram! Main aapka Jeeravan hun 🌶️ - Indore ki dil se aur Malwa ka swaad liye hue! Koi bhi sawal poocho, main hazir hun madad karne ke liye!", 
              sender: "ai" 
            }],
            active: true,
          };
          
          setPreviousChats([newChat]);
          setCurrentChat({ messages: newChat.messages });
          toast.success("Welcome! Your first chat has been created automatically!");
        }
      }
    } catch (error) {
      console.log("Failed to create first chat:", error);
    }
  };

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
    fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/auth/profile`, {
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
          const isNewLogin = !user && data.user; // User wasn't loaded before but now is
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Load user's chats
          loadUserChats(isNewLogin);
        }
      })
      .catch((err) => {
        console.log("User not logged in or profile fetch failed:", err);
        localStorage.removeItem('user');
        // Clear all chat data if user is not logged in
        localStorage.removeItem('currentChat');
        localStorage.removeItem('previousChats');
        setUser(null);
        setPreviousChats([]);
        setCurrentChat({
          messages: [{ 
            id: 1, 
            text: "Bhiya Ram! Main aapka Jeeravan hun 🌶️ - Indore ki dil se aur Malwa ka swaad liye hue! Koi bhi sawal poocho, main hazir hun madad karne ke liye!", 
            sender: "ai" 
          }],
        });
      });
  }, []);

  // Function to load user's existing chats
  const loadUserChats = async (isNewLogin = false) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/chat`, {
        method: "GET",
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.chats && data.chats.length > 0) {
          // Set chats with first one active
          const chatsWithActiveFlag = data.chats.map((chat, index) => ({
            ...chat,
            active: index === 0
          }));
          
          setPreviousChats(chatsWithActiveFlag);
          // Set current chat to first chat
          if (chatsWithActiveFlag[0].messages.length > 0) {
            setCurrentChat({ messages: chatsWithActiveFlag[0].messages });
          }
        } else if (isNewLogin) {
          // No chats exist and user just logged in - create first chat automatically
          createFirstChat();
        }
      } else if (isNewLogin) {
        // API call failed but user just logged in - create first chat
        createFirstChat();
      }
    } catch (error) {
      console.log("Failed to load user chats:", error);
      if (isNewLogin) {
        // Create first chat even if loading fails
        createFirstChat();
      }
    }
  };

  // Listen for AI response from backend
  useEffect(() => {
    function handleAIResponse({ content, chat }) {
      setIsAiThinking(false);
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
        
        // Save to localStorage when AI response comes
        if (updatedCurrentChat) {
          setCurrentChat({ messages: updatedCurrentChat.messages });
          localStorage.setItem('currentChat', JSON.stringify({ messages: updatedCurrentChat.messages }));
        }
        localStorage.setItem('previousChats', JSON.stringify(updatedChats));
        
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

    // Check if user is logged in
    if (!user) {
      toast.error("Please login first to send messages!");
      navigate('/login');
      return;
    }

    // Check if there's an active chat
    const activeChat = previousChats.find(chat => chat.active);
    if (!activeChat) {
      toast.error("Please create a chat first!");
      setShowNameModal(true);
      return;
    }

    const newMessage = {
      id: currentChat.messages.length + 1,
      text: inputMessage,
      sender: "user",
    };
    const updatedMessages = [...currentChat.messages, newMessage];
    setCurrentChat((prev) => ({ ...prev, messages: updatedMessages }));
    
    const updatedChats = previousChats.map((chat) => 
      chat.active 
        ? { ...chat, messages: updatedMessages } 
        : chat
    );
    setPreviousChats(updatedChats);
    
    // Save to localStorage immediately
    localStorage.setItem('currentChat', JSON.stringify({ messages: updatedMessages }));
    localStorage.setItem('previousChats', JSON.stringify(updatedChats));
    
    // Update chat title if it's the first user message
    if (currentChat.messages.length === 1) {
      updateChatTitle(updatedMessages);
    }
    
    setInputMessage("");
    setIsAiThinking(true);

    // Send message to backend via socket
    socket.emit("ai-message", {
      chat: activeChat.id,
      content: newMessage.text,
      userName: user ? `${user.fullName?.firstName} ${user.fullName?.lastName}` : null
    });
  };

  const handleTextareaInput = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleNewChat = () => {
    if (!user) {
      toast.error("Please login first to create a chat!");
      navigate('/login');
      return;
    }
    setShowNameModal(true);
  };

  const handleNameSubmit = (chatName) => {
    setShowNameModal(false);
    if (!chatName.trim()) return toast.error("Chat name cannot be empty!");

    if (!user) {
      toast.error("Please login first to create a chat!");
      navigate('/login');
      return;
    }

    fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title: chatName }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
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
          
          // Save to localStorage immediately
          const updatedChats = [...previousChats.map(chat => ({ ...chat, active: false })), newChat];
          localStorage.setItem('previousChats', JSON.stringify(updatedChats));
          localStorage.setItem('currentChat', JSON.stringify({ messages: newChat.messages }));
          
          toast.success("New chat created successfully!");
        } else {
          toast.error(data.message || "Failed to create chat");
        }
      })
      .catch((error) => {
        console.error('Chat creation error:', error);
        if (error.message.includes('401')) {
          toast.error("Please login first to create a chat!");
          navigate('/login');
        } else {
          toast.error("Network error while creating chat");
        }
      });
  };

  const handleSelectChat = (selectedChat) => {
    const updatedChats = previousChats.map(chat => ({ 
      ...chat, 
      active: chat.id === selectedChat.id 
    }));
    
    setPreviousChats(updatedChats);
    setCurrentChat({ messages: selectedChat.messages });
    setShowSidebar(false);
    
    // Save to localStorage
    localStorage.setItem('previousChats', JSON.stringify(updatedChats));
    localStorage.setItem('currentChat', JSON.stringify({ messages: selectedChat.messages }));
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    
    const chatToDelete = previousChats.find(chat => chat.id === chatId);
    if (!chatToDelete) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/chat/${chatId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setPreviousChats(prev => {
            const remainingChats = prev.filter(chat => chat.id !== chatId);
            
            if (chatToDelete.active) {
              if (remainingChats.length > 0) {
                remainingChats[0].active = true;
                setCurrentChat({ messages: remainingChats[0].messages });
              } else {
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