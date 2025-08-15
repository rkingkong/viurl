import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { logout } from '../../store/slices/authSlice';
import './Layout.css';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { darkMode } = useAppSelector((state) => state.user);

  const navItems: NavItem[] = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/explore', label: 'Explore', icon: '🔍' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' },
    { path: '/messages', label: 'Messages', icon: '✉️' },
    { path: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
    { path: '/verified', label: 'Verified', icon: '✓' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`layout ${darkMode ? 'dark' : 'light'}`}>
      {/* Left Sidebar - Twitter Style */}
      <aside className="sidebar">
        <div className="sidebar-content">
          {/* Logo */}
          <div className="logo" onClick={() => navigate('/home')}>
            <span className="logo-text">Viurl</span>
            <span className="logo-glow"></span>
          </div>

          {/* Navigation Menu */}
          <nav className="nav-menu">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
            
            {/* More Menu */}
            <button className="nav-item">
              <span className="nav-icon">⋯</span>
              <span className="nav-label">More</span>
            </button>
          </nav>

          {/* Post/Verify Button */}
          <button className="post-button">
            <span className="post-text">Verify</span>
            <span className="post-icon">✓</span>
          </button>

          {/* User Profile Section */}
          {isAuthenticated && user && (
            <div className="user-section">
              <div className="user-info">
                <img 
                  src={user.avatar || 'https://via.placeholder.com/40'} 
                  alt="User" 
                  className="user-avatar"
                />
                <div className="user-details">
                  <span className="user-name">{user.name || 'User'}</span>
                  <span className="user-handle">@{user.username || 'username'}</span>
                </div>
              </div>
              <button className="more-btn" onClick={handleLogout}>
                <span>⋯</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Right Sidebar - Widgets */}
      <aside className="right-sidebar">
        {/* Search Bar */}
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search Viurl" 
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Token Balance Widget */}
        <div className="widget token-widget">
          <h3 className="widget-title">Your VTOKENS</h3>
          <div className="token-balance">
            <span className="token-amount">1,250</span>
            <span className="token-symbol">VTK</span>
          </div>
          <div className="token-value">
            <span className="usd-value">≈ $125.00 USD</span>
          </div>
          <button className="earn-button">
            <span>Earn More</span>
            <span className="glow-effect"></span>
          </button>
        </div>

        {/* Trending Widget */}
        <div className="widget trending-widget">
          <h3 className="widget-title">Trending on Viurl</h3>
          <div className="trending-list">
            <div className="trending-item">
              <div className="trending-meta">
                <span className="trending-category">Technology · Trending</span>
                <button className="more-btn">⋯</button>
              </div>
              <div className="trending-title">#DecentralizedTruth</div>
              <div className="trending-stats">15.2K verifications</div>
            </div>
            
            <div className="trending-item">
              <div className="trending-meta">
                <span className="trending-category">Crypto · Trending</span>
                <button className="more-btn">⋯</button>
              </div>
              <div className="trending-title">VTOKEN</div>
              <div className="trending-stats">8,543 verifications</div>
            </div>

            <div className="trending-item">
              <div className="trending-meta">
                <span className="trending-category">News · Verified</span>
                <button className="more-btn">⋯</button>
              </div>
              <div className="trending-title">#FactCheck</div>
              <div className="trending-stats">23.1K verifications</div>
            </div>
          </div>
          <button className="show-more">Show more</button>
        </div>

        {/* Who to Follow Widget */}
        <div className="widget follow-widget">
          <h3 className="widget-title">Who to follow</h3>
          <div className="follow-list">
            <div className="follow-item">
              <img 
                src="https://via.placeholder.com/40" 
                alt="User" 
                className="follow-avatar"
              />
              <div className="follow-info">
                <span className="follow-name">Truth Seeker</span>
                <span className="follow-handle">@truthseeker</span>
              </div>
              <button className="follow-btn">Follow</button>
            </div>

            <div className="follow-item">
              <img 
                src="https://via.placeholder.com/40" 
                alt="User" 
                className="follow-avatar"
              />
              <div className="follow-info">
                <span className="follow-name">Fact Checker</span>
                <span className="follow-handle">@factcheck</span>
              </div>
              <button className="follow-btn">Follow</button>
            </div>
          </div>
          <button className="show-more">Show more</button>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Cookies</a>
          <a href="#">About</a>
          <div className="copyright">© 2025 Viurl Protocol</div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        {navItems.slice(0, 4).map((item) => (
          <button
            key={item.path}
            className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => handleNavigation(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
          </button>
        ))}
        <button className="mobile-nav-item">
          <span className="nav-icon">✓</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;