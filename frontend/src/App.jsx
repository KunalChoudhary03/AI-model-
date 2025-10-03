import React, { useEffect } from 'react';
import AppRoutes from './AppRoutes';
import './styles/theme.css';
import './styles/chat.css';
import './styles/thinking-indicator.css';

const App = () => {
  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);
  return (
    <>
      <AppRoutes />
    </>
  )
}

export default App
