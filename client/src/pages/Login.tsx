// Login.tsx - VIURL Login Page
// Location: client/src/pages/Login.tsx

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';

// API Base URL
const API_BASE = 'https://viurl.com';

interface LoginProps {
  onNavigate?: (page: string) => void;
  onLoginSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate, onLoginSuccess }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  
  const [isLogin, setIsLogin] = useState(true); // Toggle between login/register
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    name: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check for existing session
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      onLoginSuccess?.();
    }
  }, [onLoginSuccess]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Registration-specific validations
    if (!isLogin) {
      if (!formData.username) {
        errors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        errors.username = 'Username can only contain letters, numbers, and underscores';
      }
      
      if (!formData.name) {
        errors.name = 'Name is required';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : { 
            email: formData.email, 
            password: formData.password,
            username: formData.username,
            name: formData.name
          };
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        onLoginSuccess?.();
      } else {
        setFormErrors({ submit: data.message || 'Authentication failed' });
      }
    } catch (error) {
      setFormErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle between login and register
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormErrors({});
    setFormData({
      email: '',
      password: '',
      username: '',
      name: '',
      confirmPassword: ''
    });
  };

  return (
    <div style={styles.container}>
      {/* Background Effects */}
      <div style={styles.bgEffect1} />
      <div style={styles.bgEffect2} />
      
      {/* Main Content */}
      <div style={styles.content}>
        {/* Left Side - Branding */}
        <div style={styles.brandingSide}>
          <div style={styles.logoLarge}>
            <span style={styles.logoText}>V</span>
            <div style={styles.logoGlow} />
          </div>
          <h1 style={styles.brandTitle}>VIURL</h1>
          <p style={styles.brandTagline}>
            Verify Truth. Earn Rewards.
          </p>
          
          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>✅</span>
              <div>
                <strong>Verify Content</strong>
                <p>Help combat misinformation with community-driven fact-checking</p>
              </div>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>💰</span>
              <div>
                <strong>Earn V-TKN Tokens</strong>
                <p>Get rewarded for accurate verifications and quality content</p>
              </div>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🛡️</span>
              <div>
                <strong>Build Trust Score</strong>
                <p>Grow your reputation and unlock exclusive badges</p>
              </div>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🌐</span>
              <div>
                <strong>Decentralized</strong>
                <p>No single point of control - truth verified by the community</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div style={styles.formSide}>
          <div style={styles.formCard}>
            {/* Form Header */}
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>
                {isLogin ? 'Welcome back' : 'Join VIURL'}
              </h2>
              <p style={styles.formSubtitle}>
                {isLogin 
                  ? 'Sign in to continue verifying truth'
                  : 'Create an account and start earning'}
              </p>
            </div>

            {/* Error Message */}
            {formErrors.submit && (
              <div style={styles.errorBanner}>
                <span>⚠️</span>
                <span>{formErrors.submit}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Name Field (Register only) */}
              {!isLogin && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Name</label>
                  <div style={{
                    ...styles.inputWrapper,
                    ...(formErrors.name ? styles.inputWrapperError : {})
                  }}>
                    <span style={styles.inputIcon}>👤</span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      style={styles.input}
                    />
                  </div>
                  {formErrors.name && (
                    <span style={styles.errorText}>{formErrors.name}</span>
                  )}
                </div>
              )}

              {/* Username Field (Register only) */}
              {!isLogin && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Username</label>
                  <div style={{
                    ...styles.inputWrapper,
                    ...(formErrors.username ? styles.inputWrapperError : {})
                  }}>
                    <span style={styles.inputIcon}>@</span>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a username"
                      style={styles.input}
                    />
                  </div>
                  {formErrors.username && (
                    <span style={styles.errorText}>{formErrors.username}</span>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <div style={{
                  ...styles.inputWrapper,
                  ...(formErrors.email ? styles.inputWrapperError : {})
                }}>
                  <span style={styles.inputIcon}>✉️</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    style={styles.input}
                    autoComplete="email"
                  />
                </div>
                {formErrors.email && (
                  <span style={styles.errorText}>{formErrors.email}</span>
                )}
              </div>

              {/* Password Field */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={{
                  ...styles.inputWrapper,
                  ...(formErrors.password ? styles.inputWrapperError : {})
                }}>
                  <span style={styles.inputIcon}>🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    style={styles.input}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.showPasswordBtn}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {formErrors.password && (
                  <span style={styles.errorText}>{formErrors.password}</span>
                )}
              </div>

              {/* Confirm Password (Register only) */}
              {!isLogin && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Confirm Password</label>
                  <div style={{
                    ...styles.inputWrapper,
                    ...(formErrors.confirmPassword ? styles.inputWrapperError : {})
                  }}>
                    <span style={styles.inputIcon}>🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      style={styles.input}
                      autoComplete="new-password"
                    />
                  </div>
                  {formErrors.confirmPassword && (
                    <span style={styles.errorText}>{formErrors.confirmPassword}</span>
                  )}
                </div>
              )}

              {/* Remember Me & Forgot Password (Login only) */}
              {isLogin && (
                <div style={styles.optionsRow}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <span>Remember me</span>
                  </label>
                  <button 
                    type="button" 
                    style={styles.forgotBtn}
                    onClick={() => onNavigate?.('forgot-password')}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  ...styles.submitBtn,
                  ...(isSubmitting ? styles.submitBtnLoading : {})
                }}
              >
                {isSubmitting ? (
                  <span style={styles.spinner}>⏳</span>
                ) : (
                  isLogin ? 'Sign in' : 'Create account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={styles.divider}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>or</span>
              <span style={styles.dividerLine} />
            </div>

            {/* Social Login */}
            <div style={styles.socialButtons}>
              <button style={styles.socialBtn}>
                <span>🌐</span> Continue with Google
              </button>
              <button style={styles.socialBtn}>
                <span>🔗</span> Continue with Wallet
              </button>
            </div>

            {/* Toggle Mode */}
            <div style={styles.toggleSection}>
              <span style={styles.toggleText}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </span>
              <button 
                type="button"
                onClick={toggleMode}
                style={styles.toggleBtn}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>

            {/* Signup Bonus Banner */}
            {!isLogin && (
              <div style={styles.bonusBanner}>
                <span style={styles.bonusIcon}>🎁</span>
                <div>
                  <strong>New User Bonus!</strong>
                  <p>Get 100 V-TKN tokens free when you sign up</p>
                </div>
              </div>
            )}

            {/* Trust Badge */}
            <div style={styles.trustBadge}>
              <span style={styles.trustIcon}>🔐</span>
              <span style={styles.trustText}>
                Secured by <strong>blockchain</strong> verification
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLinks}>
          <a href="/about" style={styles.footerLink}>About</a>
          <a href="/terms" style={styles.footerLink}>Terms</a>
          <a href="/privacy" style={styles.footerLink}>Privacy</a>
          <a href="/help" style={styles.footerLink}>Help</a>
        </div>
        <span style={styles.copyright}>© 2024 VIURL. All rights reserved.</span>
      </footer>

      {/* Global Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 0, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 255, 0, 0.6); }
        }
      `}</style>
    </div>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#000',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  bgEffect1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: '50%',
    height: '50%',
    background: 'radial-gradient(circle, rgba(0, 255, 0, 0.1) 0%, transparent 70%)',
    animation: 'pulse 4s ease-in-out infinite',
  },
  bgEffect2: {
    position: 'absolute',
    bottom: '-20%',
    right: '-10%',
    width: '60%',
    height: '60%',
    background: 'radial-gradient(circle, rgba(0, 255, 0, 0.08) 0%, transparent 70%)',
    animation: 'pulse 5s ease-in-out infinite',
  },
  content: {
    flex: 1,
    display: 'flex',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '40px 20px',
    gap: '60px',
    position: 'relative',
    zIndex: 1,
  },
  brandingSide: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '40px',
  },
  logoLarge: {
    position: 'relative',
    width: '120px',
    height: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  logoText: {
    fontSize: '80px',
    fontWeight: 900,
    color: '#00FF00',
    textShadow: '0 0 30px rgba(0, 255, 0, 0.5)',
    fontFamily: 'Arial Black, sans-serif',
    animation: 'float 3s ease-in-out infinite',
  },
  logoGlow: {
    position: 'absolute',
    width: '150%',
    height: '150%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,255,0,0.2) 0%, transparent 70%)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  brandTitle: {
    fontSize: '48px',
    fontWeight: 900,
    color: '#fff',
    margin: '0 0 16px 0',
    letterSpacing: '4px',
  },
  brandTagline: {
    fontSize: '20px',
    color: '#00FF00',
    marginBottom: '48px',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  feature: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    color: '#fff',
  },
  featureIcon: {
    fontSize: '28px',
    flexShrink: 0,
  },
  formSide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: '20px',
    border: '1px solid #2a2a2a',
    padding: '40px',
    boxShadow: '0 0 40px rgba(0, 255, 0, 0.1)',
  },
  formHeader: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  formTitle: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#fff',
    margin: '0 0 8px 0',
  },
  formSubtitle: {
    fontSize: '15px',
    color: '#888',
    margin: 0,
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid #FF4444',
    borderRadius: '12px',
    marginBottom: '20px',
    color: '#FF4444',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    border: '1px solid #333',
    transition: 'all 0.2s ease',
  },
  inputWrapperError: {
    borderColor: '#FF4444',
  },
  inputIcon: {
    fontSize: '18px',
    opacity: 0.7,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '16px',
  },
  showPasswordBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px',
  },
  errorText: {
    fontSize: '12px',
    color: '#FF4444',
    marginTop: '4px',
  },
  optionsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#888',
    fontSize: '14px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#00FF00',
    cursor: 'pointer',
  },
  forgotBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#00FF00',
    fontSize: '14px',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '16px',
    backgroundColor: '#00FF00',
    color: '#000',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '8px',
  },
  submitBtnLoading: {
    backgroundColor: '#006600',
    cursor: 'not-allowed',
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '24px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#666',
    fontSize: '14px',
  },
  socialButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  socialBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '14px',
    backgroundColor: 'transparent',
    border: '1px solid #333',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  toggleSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '24px',
  },
  toggleText: {
    color: '#888',
    fontSize: '14px',
  },
  toggleBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#00FF00',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  bonusBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    borderRadius: '12px',
    marginTop: '20px',
    color: '#fff',
  },
  bonusIcon: {
    fontSize: '32px',
  },
  trustBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '24px',
    padding: '12px',
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
    borderRadius: '8px',
  },
  trustIcon: {
    fontSize: '18px',
  },
  trustText: {
    color: '#888',
    fontSize: '13px',
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '24px',
    borderTop: '1px solid #1a1a1a',
  },
  footerLinks: {
    display: 'flex',
    gap: '24px',
  },
  footerLink: {
    color: '#666',
    fontSize: '13px',
    textDecoration: 'none',
  },
  copyright: {
    color: '#444',
    fontSize: '12px',
  },
};

export default Login;