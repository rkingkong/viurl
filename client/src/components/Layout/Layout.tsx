// Layout.tsx - Main Application Layout with TokenWidget and LeaderboardWidget
// Location: client/src/components/Layout/Layout.tsx

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/useRedux';
import TokenWidget from '../Token/TokenWidget';
import LeaderboardWidget from '../Token/LeaderboardWidget';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (route: string) => void;
}

// Navigation items for sidebar
const NAV_ITEMS = [
  { id: 'home', path: '/', icon: '🏠', label: 'Home' },
  { id: 'explore', path: '/explore', icon: '🔍', label: 'Explore' },
  { id: 'notifications', path: '/notifications', icon: '🔔', label: 'Notifications' },
  { id: 'messages', path: '/messages', icon: '✉️', label: 'Messages' },
  { id: 'bookmarks', path: '/bookmarks', icon: '🔖', label: 'Bookmarks' },
  { id: 'profile', path: '/profile', icon: '👤', label: 'Profile' },
];

// Mobile bottom nav items (subset)
const MOBILE_NAV_ITEMS = [
  { id: 'home', path: '/', icon: '🏠' },
  { id: 'explore', path: '/explore', icon: '🔍' },
  { id: 'notifications', path: '/notifications', icon: '🔔' },
  { id: 'messages', path: '/messages', icon: '✉️' },
  { id: 'profile', path: '/profile', icon: '👤' },
];

const Layout: React.FC<LayoutProps> = ({ children, currentPage = 'home', onNavigate }) => {
  const { user } = useAppSelector((state) => state.auth);
  
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadNotifications] = useState(0);
  const [unreadMessages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1280);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle navigation using the passed onNavigate prop
  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
    setShowMobileMenu(false);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onNavigate) {
      // Navigate to explore - search query would need URL params handled by App.tsx
      onNavigate('explore');
    }
  };

  // Handle post button click
  const handlePostClick = () => {
    if (onNavigate) {
      onNavigate('home');
    }
  };

  return (
    <div style={styles.container}>
      {/* Inject responsive CSS */}
      <style>{responsiveStyles}</style>

      {/* Desktop Sidebar - Hidden on mobile */}
      {!isMobile && (
        <aside style={{
          ...styles.sidebar,
          width: isTablet ? '88px' : '275px',
        }} className="sidebar">
          {/* Logo */}
          <div style={styles.logoContainer} onClick={() => handleNavigate('home')}>
            <div style={styles.logo}>
              <span style={styles.logoText}>V</span>
            </div>
          </div>

          {/* Navigation */}
          <nav style={styles.nav}>
            {NAV_ITEMS.map((item) => {
              const isActive = currentPage === item.id;
              const hasNotification = 
                (item.id === 'notifications' && unreadNotifications > 0) ||
                (item.id === 'messages' && unreadMessages > 0);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  style={{
                    ...styles.navItem,
                    ...(isActive ? styles.navItemActive : {}),
                    justifyContent: isTablet ? 'center' : 'flex-start',
                  }}
                  className="nav-item"
                >
                  <span style={styles.navIcon}>
                    {item.icon}
                    {hasNotification && (
                      <span style={styles.notificationBadge}>
                        {item.id === 'notifications' ? unreadNotifications : unreadMessages}
                      </span>
                    )}
                  </span>
                  {!isTablet && (
                    <span 
                      style={{
                        ...styles.navLabel,
                        ...(isActive ? styles.navLabelActive : {}),
                      }}
                      className="nav-label"
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Post Button */}
          <button style={{
            ...styles.postButton,
            padding: isTablet ? '12px' : '16px',
          }} onClick={handlePostClick}>
            {isTablet ? '✏️' : 'Post'}
          </button>

          {/* Token Widget - Hide on tablet */}
          {!isTablet && (
            <div style={styles.tokenWidgetContainer}>
              <TokenWidget />
            </div>
          )}

          {/* User Profile Card */}
          {user && (
            <div 
              style={{
                ...styles.userCard,
                justifyContent: isTablet ? 'center' : 'flex-start',
              }}
              onClick={() => handleNavigate('profile')}
            >
              <img
                src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=00FF00&color=000`}
                alt={user.name}
                style={styles.userAvatar}
              />
              {!isTablet && (
                <>
                  <div style={styles.userInfo}>
                    <span style={styles.userName}>{user.name}</span>
                    <span style={styles.userHandle}>@{user.username}</span>
                  </div>
                  <span style={styles.userMenuIcon}>•••</span>
                </>
              )}
            </div>
          )}
        </aside>
      )}

      {/* Main Content */}
      <main style={{
        ...styles.main,
        marginLeft: isMobile ? 0 : isTablet ? '88px' : '275px',
        marginRight: isMobile || isTablet ? 0 : '350px',
        paddingBottom: isMobile ? '70px' : 0,
      }}>
        {/* Mobile Header */}
        {isMobile && (
          <div style={styles.mobileHeader}>
            <button 
              style={styles.mobileMenuBtn}
              onClick={() => setShowMobileMenu(true)}
            >
              ☰
            </button>
            <div style={styles.mobileLogo} onClick={() => handleNavigate('home')}>
              <span style={styles.mobileLogoText}>V</span>
            </div>
            <div style={styles.mobileHeaderSpacer} />
          </div>
        )}

        {children}
      </main>

      {/* Right Sidebar - Only on desktop */}
      {!isMobile && !isTablet && (
        <aside style={styles.rightSidebar}>
          {/* Search */}
          <form onSubmit={handleSearch} style={styles.searchContainer}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search VIURL"
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Leaderboard Widget */}
          <LeaderboardWidget 
            compact 
            maxEntries={5}
            onUserClick={(username) => handleNavigate('profile')}
          />

          {/* Trending */}
          <div style={styles.trendingCard}>
            <h3 style={styles.trendingTitle}>Trending in VIURL</h3>
            {['#FactCheck', '#Verified', '#TruthMatters', '#VIURL', '#V-TKN'].map((tag, i) => (
              <div 
                key={tag} 
                style={styles.trendingItem}
                onClick={() => handleNavigate('explore')}
              >
                <span style={styles.trendingLabel}>Trending</span>
                <span style={styles.trendingTag}>{tag}</span>
                <span style={styles.trendingCount}>{(5 - i) * 1234} verifications</span>
              </div>
            ))}
            <button 
              style={styles.showMoreBtn}
              onClick={() => handleNavigate('explore')}
            >
              Show more
            </button>
          </div>

          {/* Who to follow */}
          <div style={styles.whoToFollowCard}>
            <h3 style={styles.whoToFollowTitle}>Who to follow</h3>
            <p style={styles.whoToFollowEmpty}>Suggestions coming soon</p>
          </div>

          {/* Footer links */}
          <div style={styles.footerLinks}>
            <span style={styles.footerLink}>Terms</span>
            <span style={styles.footerLink}>Privacy</span>
            <span style={styles.footerLink}>About</span>
            <span style={styles.footerCopy}>© 2026 VIURL</span>
          </div>
        </aside>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav style={styles.mobileNav}>
          {MOBILE_NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                style={{
                  ...styles.mobileNavItem,
                  color: isActive ? '#00FF00' : '#888',
                }}
              >
                <span style={{ fontSize: '24px' }}>{item.icon}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Mobile Floating Post Button */}
      {isMobile && (
        <button style={styles.mobilePostBtn} onClick={handlePostClick}>
          ✏️
        </button>
      )}

      {/* Mobile Slide-out Menu */}
      {isMobile && showMobileMenu && (
        <>
          <div 
            style={styles.mobileMenuOverlay}
            onClick={() => setShowMobileMenu(false)}
          />
          <div style={styles.mobileSlideMenu}>
            {/* User Header */}
            {user && (
              <div style={styles.mobileMenuHeader}>
                <img
                  src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=00FF00&color=000`}
                  alt={user.name}
                  style={styles.mobileMenuAvatar}
                />
                <div style={styles.mobileMenuUserInfo}>
                  <span style={styles.mobileMenuName}>{user.name}</span>
                  <span style={styles.mobileMenuHandle}>@{user.username}</span>
                </div>
                <button 
                  style={styles.mobileMenuClose}
                  onClick={() => setShowMobileMenu(false)}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Token Info in Mobile Menu */}
            <div style={styles.mobileTokenCard}>
              <div style={styles.mobileTokenHeader}>
                <span>🪙</span>
                <span>V-TKN Balance</span>
              </div>
              <div style={styles.mobileTokenAmount}>
                {user?.vtokens?.toLocaleString() || '0'}
              </div>
              <div style={styles.mobileTrustScore}>
                <span>Trust Score: </span>
                <span style={{ color: '#00FF00' }}>{user?.trustScore || 50}/100</span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav style={styles.mobileMenuNav}>
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  style={styles.mobileSlideItem}
                >
                  <span style={styles.mobileSlideIcon}>{item.icon}</span>
                  <span style={styles.mobileSlideLabel}>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Logout */}
            <button 
              style={styles.mobileLogoutBtn}
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
            >
              🚪 Log out @{user?.username}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#000',
    color: '#fff',
  },

  // Desktop Sidebar
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    borderRight: '1px solid #2a2a2a',
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    backgroundColor: '#000',
    zIndex: 100,
    overflowY: 'auto',
  },
  logoContainer: {
    padding: '12px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
  },
  logo: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#00FF00',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(0, 255, 0, 0.4)',
    transition: 'box-shadow 0.2s ease',
  },
  logoText: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#000',
  },

  // Navigation
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '8px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    color: '#fff',
    fontSize: '18px',
    textAlign: 'left',
    transition: 'background-color 0.2s ease',
  },
  navItemActive: {
    fontWeight: '700',
  },
  navIcon: {
    fontSize: '24px',
    position: 'relative',
    width: '28px',
    textAlign: 'center',
  },
  navLabel: {
    fontSize: '18px',
  },
  navLabelActive: {
    fontWeight: '700',
  },
  notificationBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#00FF00',
    color: '#000',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '9999px',
    minWidth: '18px',
    textAlign: 'center',
  },

  // Post Button
  postButton: {
    width: '100%',
    marginTop: '16px',
    backgroundColor: '#00FF00',
    color: '#000',
    border: 'none',
    borderRadius: '9999px',
    fontSize: '17px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)',
    transition: 'all 0.2s ease',
  },

  // Token Widget Container
  tokenWidgetContainer: {
    marginTop: '16px',
    flexShrink: 0,
  },

  // User Card
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    marginTop: 'auto',
    borderRadius: '9999px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  userName: {
    fontWeight: '700',
    fontSize: '15px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userHandle: {
    color: '#888',
    fontSize: '14px',
  },
  userMenuIcon: {
    color: '#888',
    fontSize: '16px',
  },

  // Main Content
  main: {
    flex: 1,
    minHeight: '100vh',
    borderRight: '1px solid #2a2a2a',
    maxWidth: '600px',
  },

  // Right Sidebar
  rightSidebar: {
    width: '350px',
    padding: '12px 24px',
    position: 'fixed',
    right: 0,
    top: 0,
    height: '100vh',
    overflowY: 'auto',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: '9999px',
    padding: '12px 16px',
    marginBottom: '16px',
  },
  searchIcon: {
    marginRight: '12px',
    color: '#888',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '15px',
  },

  // Trending Card
  trendingCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '16px',
    marginTop: '16px',
  },
  trendingTitle: {
    fontSize: '19px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  trendingItem: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 0',
    borderBottom: '1px solid #2a2a2a',
    cursor: 'pointer',
  },
  trendingLabel: {
    fontSize: '13px',
    color: '#888',
  },
  trendingTag: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#00FF00',
  },
  trendingCount: {
    fontSize: '13px',
    color: '#888',
  },
  showMoreBtn: {
    color: '#00FF00',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '12px 0',
    cursor: 'pointer',
    fontSize: '15px',
  },

  // Who to Follow
  whoToFollowCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '16px',
  },
  whoToFollowTitle: {
    fontSize: '19px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  whoToFollowEmpty: {
    color: '#888',
    fontSize: '14px',
  },

  // Footer
  footerLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '12px 0',
  },
  footerLink: {
    color: '#888',
    fontSize: '13px',
    cursor: 'pointer',
  },
  footerCopy: {
    color: '#888',
    fontSize: '13px',
    width: '100%',
    marginTop: '4px',
  },

  // Mobile Header
  mobileHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #2a2a2a',
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(12px)',
    zIndex: 50,
  },
  mobileMenuBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '8px',
  },
  mobileLogo: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#00FF00',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  mobileLogoText: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#000',
  },
  mobileHeaderSpacer: {
    width: '40px',
  },

  // Mobile Bottom Nav
  mobileNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(12px)',
    borderTop: '1px solid #2a2a2a',
    padding: '8px 0',
    paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
    zIndex: 100,
  },
  mobileNavItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  },

  // Mobile Floating Post Button
  mobilePostBtn: {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#00FF00',
    color: '#000',
    border: 'none',
    fontSize: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 255, 0, 0.4)',
    zIndex: 99,
  },

  // Mobile Slide Menu
  mobileMenuOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 200,
  },
  mobileSlideMenu: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '280px',
    backgroundColor: '#000',
    borderRight: '1px solid #2a2a2a',
    zIndex: 201,
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideIn 0.2s ease',
    overflowY: 'auto',
  },
  mobileMenuHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderBottom: '1px solid #2a2a2a',
  },
  mobileMenuAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  mobileMenuUserInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  mobileMenuName: {
    fontWeight: '700',
    fontSize: '16px',
  },
  mobileMenuHandle: {
    color: '#888',
    fontSize: '14px',
  },
  mobileMenuClose: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px',
  },

  // Mobile Token Card
  mobileTokenCard: {
    margin: '16px',
    padding: '16px',
    backgroundColor: '#0a0a0a',
    border: '1px solid #00FF00',
    borderRadius: '12px',
  },
  mobileTokenHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#888',
    fontSize: '14px',
    marginBottom: '8px',
  },
  mobileTokenAmount: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#00FF00',
  },
  mobileTrustScore: {
    marginTop: '8px',
    fontSize: '14px',
    color: '#888',
  },

  // Mobile Menu Nav
  mobileMenuNav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 0',
  },
  mobileSlideItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    color: '#fff',
    transition: 'background-color 0.2s ease',
  },
  mobileSlideIcon: {
    fontSize: '22px',
    width: '28px',
    textAlign: 'center',
  },
  mobileSlideLabel: {
    fontSize: '18px',
    fontWeight: '500',
  },

  // Logout Button
  mobileLogoutBtn: {
    margin: '16px',
    marginTop: 'auto',
    padding: '16px',
    backgroundColor: 'transparent',
    border: '1px solid #333',
    borderRadius: '9999px',
    color: '#FF4444',
    fontSize: '15px',
    cursor: 'pointer',
    textAlign: 'center',
  },
};

// CSS animations
const responsiveStyles = `
  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }

  .nav-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .sidebar::-webkit-scrollbar {
    width: 0;
  }

  /* Safe area for notched phones */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .mobile-nav {
      padding-bottom: calc(8px + env(safe-area-inset-bottom));
    }
  }
`;

export default Layout;