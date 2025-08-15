import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    
    // Apply dark mode class
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      {/* Twitter-like Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-text">Viurl</span>
        </div>
        
        <nav className="nav-menu">
          <a href="#" className="nav-item active">
            <span className="icon">🏠</span>
            <span>Home</span>
          </a>
          <a href="#" className="nav-item">
            <span className="icon">🔍</span>
            <span>Explore</span>
          </a>
          <a href="#" className="nav-item">
            <span className="icon">🔔</span>
            <span>Notifications</span>
          </a>
          <a href="#" className="nav-item">
            <span className="icon">✉️</span>
            <span>Messages</span>
          </a>
          <a href="#" className="nav-item">
            <span className="icon">👤</span>
            <span>Profile</span>
          </a>
        </nav>
        
        <button className="post-button">Post</button>
        
        <button 
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </aside>

      {/* Main Feed */}
      <main className="main-feed">
        <header className="feed-header">
          <h1>Home</h1>
        </header>
        
        {/* Post Box */}
        <div className="post-box">
          <img src="https://via.placeholder.com/48" alt="Avatar" className="avatar" />
          <div className="post-input-area">
            <input 
              type="text" 
              placeholder="What's the truth?" 
              className="post-input"
            />
            <div className="post-actions">
              <button className="action-btn">📷</button>
              <button className="action-btn">📊</button>
              <button className="action-btn">😊</button>
              <button className="submit-btn">Verify</button>
            </div>
          </div>
        </div>
        
        {/* Sample Post */}
        <article className="post">
          <img src="https://via.placeholder.com/48" alt="Avatar" className="avatar" />
          <div className="post-content">
            <div className="post-header">
              <span className="username">@testuser</span>
              <span className="timestamp">· 2h</span>
            </div>
            <p className="post-text">
              Welcome to Viurl! The decentralized truth verification platform 🚀
            </p>
            <div className="post-stats">
              <button className="stat-btn">
                <span className="icon">💬</span> 12
              </button>
              <button className="stat-btn">
                <span className="icon">🔁</span> 34
              </button>
              <button className="stat-btn">
                <span className="icon">❤️</span> 128
              </button>
              <button className="stat-btn verify">
                <span className="icon">✓</span> Verify
              </button>
            </div>
          </div>
        </article>
      </main>

      {/* Right Sidebar */}
      <aside className="right-sidebar">
        <div className="search-box">
          <input type="text" placeholder="Search Viurl" />
        </div>
        
        <div className="widget">
          <h3>Truth Trending</h3>
          <div className="trending-item">
            <span className="trend-category">Technology</span>
            <span className="trend-title">Web3 Authentication</span>
            <span className="trend-count">1,234 verifications</span>
          </div>
        </div>
        
        <div className="widget">
          <h3>Your Tokens</h3>
          <div className="token-balance">
            <span className="token-type">VTOKENS</span>
            <span className="token-amount">0</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default App;
