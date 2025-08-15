// Login.tsx - Viurl Authentication Page with Backend Integration
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, register } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    username: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Registration-specific validation
    if (!isLoginMode) {
      if (!formData.name) {
        errors.name = 'Name is required';
      }
      
      if (!formData.username) {
        errors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isLoginMode) {
        // Login
        const result = await dispatch(login({
          email: formData.email,
          password: formData.password
        })).unwrap();
        
        // Show success animation
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      } else {
        // Register
        const result = await dispatch(register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          username: formData.username
        })).unwrap();
        
        // Show success and switch to login
        setShowSuccess(true);
        setTimeout(() => {
          setIsLoginMode(true);
          setShowSuccess(false);
          setFormData({
            email: formData.email,
            password: '',
            name: '',
            username: '',
            confirmPassword: ''
          });
        }, 1500);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setFormErrors({
        general: err.message || 'Authentication failed. Please try again.'
      });
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormErrors({});
    setFormData({
      email: '',
      password: '',
      name: '',
      username: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="login-container">
      {/* Left Side - Branding */}
      <div className="login-brand">
        <div className="brand-content">
          <div className="brand-logo">VIURL</div>
          <p className="brand-tagline">Verify Everything. Trust Everyone.</p>
          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Earn VTOKENS for verifying content</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛡</span>
              <span>Build your Trust Score reputation</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌐</span>
              <span>Join the truth-driven community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="login-form-section">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">
              {isLoginMode ? 'Welcome Back' : 'Join Viurl'}
            </h1>
            <p className="auth-subtitle">
              {isLoginMode 
                ? 'Enter your credentials to access your account' 
                : 'Create your account and start verifying'}
            </p>
          </div>

          {showSuccess && (
            <div className="success-checkmark show">
              <svg viewBox="0 0 52 52">
                <circle className="circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
          )}

          {!showSuccess && (
            <form className="auth-form" onSubmit={handleSubmit}>
              {formErrors.general && (
                <div className="error-message">{formErrors.general}</div>
              )}
              
              {!isLoginMode && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`form-input ${formErrors.name ? 'error' : ''}`}
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                    />
                    {formErrors.name && (
                      <span className="error-message">{formErrors.name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="username">Username</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className={`form-input ${formErrors.username ? 'error' : ''}`}
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="@johndoe"
                    />
                    {formErrors.username && (
                      <span className="error-message">{formErrors.username}</span>
                    )}
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-input ${formErrors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {formErrors.email && (
                  <span className="error-message">{formErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-input ${formErrors.password ? 'error' : ''}`}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  autoComplete={isLoginMode ? "current-password" : "new-password"}
                />
                {formErrors.password && (
                  <span className="error-message">{formErrors.password}</span>
                )}
              </div>

              {!isLoginMode && (
                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-input ${formErrors.confirmPassword ? 'error' : ''}`}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  {formErrors.confirmPassword && (
                    <span className="error-message">{formErrors.confirmPassword}</span>
                  )}
                </div>
              )}

              {isLoginMode && (
                <div className="remember-group">
                  <label className="checkbox-label">
                    <input type="checkbox" className="checkbox-input" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="forgot-link">Forgot password?</a>
                </div>
              )}

              <button 
                type="submit" 
                className={`submit-btn ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? '' : (isLoginMode ? 'Sign In' : 'Create Account')}
              </button>

              {isLoginMode && (
                <>
                  <div className="auth-divider">
                    <div className="divider-line"></div>
                    <span className="divider-text">OR</span>
                    <div className="divider-line"></div>
                  </div>

                  <div className="social-login">
                    <button type="button" className="social-btn">
                      <span>🔷</span>
                      <span>Continue with Web3 Wallet</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          <div className="auth-toggle">
            <span className="toggle-text">
              {isLoginMode ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button 
              type="button"
              className="toggle-link" 
              onClick={toggleMode}
            >
              {isLoginMode ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          {!isLoginMode && (
            <div className="trust-badge">
              <span className="trust-icon">🛡️</span>
              <span className="trust-text">
                Join <strong>50,000+</strong> verified users building trust
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;