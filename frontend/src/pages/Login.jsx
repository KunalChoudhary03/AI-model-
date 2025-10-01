import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/theme.css';
import ThemeToggle from '../components/ThemeToggle';
import BackButton from '../components/BackButton';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    axios.post("http://localhost:3000/api/auth/login", 
      {
        email: formData.email,
        password: formData.password
      },
      {
        withCredentials: true   // ✅ fixed typo
      }
    )
    .then((res) => {
      console.log(res);
      navigate('/');
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      console.log("Login attempt finished");
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target; // ✅ fixed
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  return (
    <div className="auth-container">
      <BackButton />
      <ThemeToggle />
      <div className="auth-form-container">
        <h1 className="auth-title">Welcome Back</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="Enter your email"
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
              placeholder="Enter your password"
              onChange={handleChange}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="auth-button">
            Sign in
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
