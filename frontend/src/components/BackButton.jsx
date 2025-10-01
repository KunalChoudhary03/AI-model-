import React from 'react';
import { Link } from 'react-router-dom';

const BackButton = () => {
  return (
    <Link to="/" className="back-button" aria-label="Go back to home">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="back-button-icon"
      >
        <path
          fillRule="evenodd"
          d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </Link>
  );
};

export default BackButton;