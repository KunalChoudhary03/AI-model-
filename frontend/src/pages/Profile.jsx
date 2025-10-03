import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import '../styles/profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/auth/profile`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        console.log("Failed to fetch user profile");
        navigate('/login');
      }
    } catch (err) {
      console.log("Error fetching profile:", err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      console.log('Logout error:', err);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/auth/delete-account`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        localStorage.removeItem('user');
        navigate('/register');
      } else {
        const errorData = await response.json();
        console.error('Delete account error:', errorData.message || 'Unknown error');
      }
    } catch (err) {
      console.log('Delete account error:', err);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-error">User not found</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <BackButton />
      
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="40" fill="var(--accent-color)"/>
              <text x="40" y="50" textAnchor="middle" fontSize="24" fill="white">👤</text>
            </svg>
          </div>
          <h1 className="profile-title">User Profile</h1>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <label className="detail-label">Full Name</label>
            <div className="detail-value">
              {user.fullName?.firstName} {user.fullName?.lastName}
            </div>
          </div>

          <div className="detail-item">
            <label className="detail-label">Email</label>
            <div className="detail-value">{user.email}</div>
          </div>
        </div>

        <div className="profile-actions">
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Logout
          </button>

          <button 
            className="delete-account-btn"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleteLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="m19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Delete Account</h3>
            <p>
              Are you sure you want to delete your account? This action cannot be undone. 
              All your data including chats and messages will be permanently removed.
            </p>
            <div className="delete-modal-actions">
              <button 
                className="cancel-delete-btn"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;