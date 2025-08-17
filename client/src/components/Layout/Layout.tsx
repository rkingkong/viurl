import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { logout } from '../../store/slices/authSlice';
import './Layout.css';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { darkMode } = useAppSelector((state) => state.user);

  const navItems = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/explore', label: 'Explore', icon: '🔍' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' },
    { path: '/messages', label: 'Messages', icon: '✉️' },
    { path: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
    { path: '/verified', label: 'Verified', icon: '✓' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className={`layout ${darkMode ? 'dark' : 'light'}`}>
      <div className="layout-container">
        {/* Left Sidebar */}
        <header className="sidebar">
          <div className="sidebar-content">
            <h1 className="logo">
              <span className="logo-text" onClick={() => navigate('/home')}>Viurl</span>
            </h1>
            
            <nav className="nav-menu">
              {navItems.map((item) => (
                <div
                  key={item.path}
                  className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="nav-icon">{item.icon}</div>
                  <span className="nav-label">{item.label}</span>
                </div>
              ))}
              
              <div className="nav-item">
                <div className="nav-icon">⋯</div>
                <span className="nav-label">More</span>
              </div>
            </nav>

            <button className="post-button">
              <span className="post-text">Verify</span>
              <span className="post-icon">✓</span>
            </button>

            {user && (
              <div className="user-section" onClick={() => dispatch(logout())}>
                <div className="user-info">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user.username}&background=00ff00&color=000`}
                    alt="User"
                    className="user-avatar"
                  />
                  <div className="user-details">
                    <div className="user-name">{user.name || user.username}</div>
                    <div className="user-handle">@{user.username}</div>
                  </div>
                </div>
                <div className="more-btn">⋯</div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <Outlet />
        </main>

        {/* Right Sidebar */}
        <aside className="right-sidebar">
          <div className="search-container">
            <input 
              type="text"
              placeholder="Search Viurl"
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          {/* Token Widget */}
          <div className="widget token-widget">
            <h2 className="widget-title">Your VTOKENS</h2>
            <div className="token-balance">
              <span className="token-amount">1,250</span>
              <span className="token-symbol">VTK</span>
            </div>
            <div className="usd-value">≈ $125.00 USD</div>
            <button className="earn-button">Earn More</button>
          </div>

          {/* Trending Widget */}
          <div className="widget">
            <h2 className="widget-title">Trending on Viurl</h2>
            <div className="trending-item">
              <div className="trending-category">Technology · Trending</div>
              <div className="trending-title">#DecentralizedTruth</div>
              <div className="trending-stats">15.2K verifications</div>
            </div>
            <div className="trending-item">
              <div className="trending-category">Crypto · Trending</div>
              <div className="trending-title">VTOKEN</div>
              <div className="trending-stats">8,543 verifications</div>
            </div>
            <div className="trending-item">
              <div className="trending-category">News · Verified</div>
              <div className="trending-title">#FactCheck</div>
              <div className="trending-stats">23.1K verifications</div>
            </div>
            <button className="show-more">Show more</button>
          </div>

          {/* Who to Follow Widget */}
          <div className="widget">
            <h2 className="widget-title">Who to follow</h2>
            <div className="follow-item">
              <img 
                src="https://ui-avatars.com/api/?name=Truth+Seeker&background=00ff00&color=000"
                alt="User"
                className="follow-avatar"
              />
              <div className="follow-info">
                <div className="follow-name">Truth Seeker</div>
                <div className="follow-handle">@truthseeker</div>
              </div>
              <button className="follow-btn">Follow</button>
            </div>
            <div className="follow-item">
              <img 
                src="https://ui-avatars.com/api/?name=Fact+Checker&background=00ff00&color=000"
                alt="User"
                className="follow-avatar"
              />
              <div className="follow-info">
                <div className="follow-name">Fact Checker</div>
                <div className="follow-handle">@factcheck</div>
              </div>
              <button className="follow-btn">Follow</button>
            </div>
            <button className="show-more">Show more</button>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <nav className="mobile-nav">
          {navItems.slice(0, 5).map((item) => (
            <div
              key={item.path}
              className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
