import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  return (
    <nav className="nav-header">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
         JEERAVAN AI
        </Link>
        
        <div className="nav-right">
          <ThemeToggle className="nav-theme-toggle" />
          <div className="nav-auth-buttons">
            <Link to="/login" className="nav-button">
              Login
            </Link>
            <Link to="/register" className="nav-button nav-button-primary">
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;