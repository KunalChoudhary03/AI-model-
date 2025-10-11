import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/theme.css';
import ThemeToggle from '../components/ThemeToggle';
import BackButton from '../components/BackButton';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // 🔹 Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔹 Submit handler
 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/register`,
      {
        fullName: {
          firstName: formData.firstName,
          lastName: formData.lastName,
        },
        email: formData.email,
        password: formData.password,
      },
      { withCredentials: true }
    );

    console.log("Register success:", res.data);
    navigate("/login"); // ✅ redirect to login after success
  } catch (err) {
    if (err.response) {
      console.error("Register error (server):", err.response.data);

      if (err.response.data?.message) {
        setErrors((prev) => ({
          ...prev,
          email: err.response.data.message,
        }));
      }
    } else if (err.request) {
      console.error("Register error (network):", err.request);
      alert("Network error. Please try again.");
    } else {
      console.error("Register error (other):", err.message);
    }
  }
};


  // 🔹 Input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="auth-container">
      <BackButton />
      <ThemeToggle />
      <div className="auth-form-container">
        <h1 className="auth-title">Create Account</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="form-input"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="form-input"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="auth-button">
            Create Account
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
