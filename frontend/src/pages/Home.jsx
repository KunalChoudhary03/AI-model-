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

const Home = () => {
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [user, setUser] = useState(() => {
    // Don't load user from localStorage initially - let useEffect handle it
    // This prevents showing wrong user data before server verification
    return null;
  });
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking', 'awake', 'sleeping', 'error'
  const [isRetrying, setIsRetrying] = useState(false);
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

  // Utility function to clear all user data
  const clearUserData = () => {
    console.log('🧹 Clearing all user data');
    localStorage.removeItem('user');
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
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

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

  // Function to check backend health and retry connection
  const retryBackendConnection = async () => {
    setIsRetrying(true);
    setBackendStatus('checking');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/auth/profile`, {
        method: "GET",
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Check if this is a different user
          const storedUser = localStorage.getItem('user');
          let isDifferentUser = false;
          
          if (storedUser) {
            try {
              const parsedStoredUser = JSON.parse(storedUser);
              if (parsedStoredUser._id !== data.user._id) {
                isDifferentUser = true;
                console.log('🔄 Different user detected in retry, clearing previous user data');
                clearUserData();
              }
            } catch (err) {
              isDifferentUser = true;
            }
          }
          
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          setBackendStatus('awake');
          toast.success("Connected to server! Welcome back!");
          // Initialize socket connection
          initializeSocket();
          loadUserChats(isDifferentUser);
        }
      } else if (response.status === 401) {
        setBackendStatus('awake');
        toast.warning("Please log in to access your chats");
      }
    } catch (error) {
      console.log("Retry failed:", error);
      setBackendStatus('sleeping');
      toast.error("Server is still sleeping. Please try again in a moment.");
    } finally {
      setIsRetrying(false);
    }
  };

  // Initialize socket connection when user is authenticated
  const initializeSocket = () => {
    if (socket) {
      socket.disconnect();
    }

    const newSocket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000", { 
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: false, // Don't auto-connect
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    // Add socket connection debugging
    newSocket.on('connect', () => {
      console.log('✅ Socket connected to backend');
      setSocketConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected from backend:', reason);
      setSocketConnected(false);
      if (reason === 'io server disconnect' || reason === 'transport close') {
        // Server initiated disconnect or connection lost
        console.log('🔄 Attempting to reconnect socket...');
        setTimeout(() => {
          if (user && newSocket) {
            newSocket.connect();
          }
        }, 2000);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      setSocketConnected(false);
      if (error.message.includes('Authentication error')) {
        console.log('🔐 Authentication required for socket connection');
        toast.warning("Session expired. Please refresh and login again.");
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      setSocketConnected(true);
      toast.success("Connection restored!");
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('🔄 Socket reconnection failed:', error);
      setSocketConnected(false);
    });

    setSocket(newSocket);
    
    // Only connect if we have a user
    if (user) {
      console.log('🔌 Connecting socket for user:', user.email);
      newSocket.connect();
    }
    
    return newSocket;
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
          // Check if this is a different user than what's stored in localStorage
          const storedUser = localStorage.getItem('user');
          let isDifferentUser = false;
          
          if (storedUser) {
            try {
              const parsedStoredUser = JSON.parse(storedUser);
              // Compare user IDs to detect if different user logged in
              if (parsedStoredUser._id !== data.user._id) {
                isDifferentUser = true;
                console.log('🔄 Different user detected, clearing previous user data');
                // Clear all localStorage data for previous user
                clearUserData();
              }
            } catch (err) {
              console.log('Error comparing stored user:', err);
              isDifferentUser = true; // Treat as different user if parsing fails
            }
          }
          
          const isNewLogin = !user && data.user; // User wasn't loaded before but now is
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          setBackendStatus('awake');
          
          // Initialize socket connection when user is authenticated
          initializeSocket();
          
          // Load user's chats (force reload if different user)
          loadUserChats(isNewLogin || isDifferentUser);
        }
      })
      .catch((err) => {
        console.log("User not logged in or profile fetch failed:", err);
        
        // If we have a stored user, keep using it but show backend status
        const storedUser = localStorage.getItem('user');
        if (storedUser && err.message.includes('fetch')) {
          console.log("Backend might be sleeping, using cached user data");
          setBackendStatus('sleeping');
          toast.warning("Server is sleeping. Using cached data. Click retry to wake it up.", {
            autoClose: 8000
          });
          // Keep the stored user data and show app normally
          return;
        }
        
        setBackendStatus('error');
        // Otherwise clear all user data
        clearUserData();
      });
  }, []);

  // Initialize/cleanup socket when user state changes
  useEffect(() => {
    if (user && !socket) {
      // User is logged in but no socket connection
      initializeSocket();
    } else if (!user && socket) {
      // User logged out, disconnect socket
      socket.disconnect();
      setSocket(null);
    }

    // Cleanup function
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

  // Function to load user's existing chats
  const loadUserChats = async (shouldCreateFirstChat = false) => {
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
          
          // Save new user's chats to localStorage
          localStorage.setItem('previousChats', JSON.stringify(chatsWithActiveFlag));
          localStorage.setItem('currentChat', JSON.stringify({ messages: chatsWithActiveFlag[0].messages }));
        } else if (shouldCreateFirstChat) {
          // No chats exist and user just logged in - create first chat automatically
          createFirstChat();
        }
      } else if (shouldCreateFirstChat) {
        // API call failed but user just logged in - create first chat
        createFirstChat();
      }
    } catch (error) {
      console.log("Failed to load user chats:", error);
      if (shouldCreateFirstChat) {
        // Create first chat even if loading fails
        createFirstChat();
      }
    }
  };

  // Listen for AI response from backend
  useEffect(() => {
    function handleAIResponse({ content, chat }) {
      console.log('🤖 Received AI response:', { content: content?.substring(0, 50) + '...', chat });
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

    if (socket) {
      socket.on("ai-response", handleAIResponse);
      return () => socket.off("ai-response", handleAIResponse);
    }
  }, [socket]);

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
    const messageData = {
      chat: activeChat.id,
      content: newMessage.text,
      userName: user ? `${user.fullName?.firstName} ${user.fullName?.lastName}` : null
    };
    console.log('📤 Sending message to AI:', messageData);
    
    if (socket && socket.connected) {
      socket.emit("ai-message", messageData);
    } else {
      console.error('❌ Socket not connected, cannot send message');
      console.log('🔄 Attempting to reconnect socket...');
      
      // Try to reconnect socket first
      if (socket && !socket.connected) {
        socket.connect();
        
        // Wait a moment and try again
        setTimeout(() => {
          if (socket && socket.connected) {
            console.log('🔄 Socket reconnected, retrying message...');
            socket.emit("ai-message", messageData);
          } else {
            setIsAiThinking(false);
            toast.error("Connection lost. Please try sending the message again.");
          }
        }, 2000);
      } else {
        // No socket at all, need to reinitialize
        initializeSocket();
        setIsAiThinking(false);
        toast.error("Connection lost. Please try sending the message again.");
      }
    }
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

    // Check if backend is sleeping and suggest retry
    if (backendStatus === 'sleeping') {
      toast.warning("Server is sleeping! Click 'Wake Up Server' first, then try creating a chat.");
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
        
        // Check if it's specifically a 401 error
        if (error.message.includes('401')) {
          toast.error("Your session has expired. Please login again!");
          // Clear stored user data
          clearUserData();
          navigate('/login');
        } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          setBackendStatus('sleeping');
          toast.error("Network error: Server might be sleeping. Click 'Wake Up Server' and try again.");
        } else {
          toast.error("Failed to create chat. Please try again.");
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
        
        {/* Backend Status Indicator */}
        {backendStatus === 'sleeping' && (
          <div style={{
            background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
            color: 'white',
            padding: '8px 16px',
            textAlign: 'center',
            fontSize: '14px',
            borderRadius: '8px',
            margin: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>🔄 Server is sleeping. Using cached data.</span>
            <button 
              onClick={retryBackendConnection}
              disabled={isRetrying}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '4px',
                cursor: isRetrying ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              {isRetrying ? '⏳ Waking up...' : '🚀 Wake Up Server'}
            </button>
          </div>
        )}
        
        {backendStatus === 'checking' && (
          <div style={{
            background: 'linear-gradient(45deg, #4CAF50, #45a049)',
            color: 'white',
            padding: '8px 16px',
            textAlign: 'center',
            fontSize: '14px',
            borderRadius: '8px',
            margin: '10px'
          }}>
            🔍 Checking server status...
          </div>
        )}
        
        {/* Socket Connection Status */}
        {user && !socketConnected && (
          <div style={{
            background: 'linear-gradient(45deg, #ff9800, #f57c00)',
            color: 'white',
            padding: '6px 12px',
            textAlign: 'center',
            fontSize: '13px',
            borderRadius: '6px',
            margin: '5px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span>🔌 Chat connection offline</span>
            <span style={{ fontSize: '11px' }}>• Messages will retry automatically</span>
          </div>
        )}
        
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