// Sidebar.tsx - VIURL Left Navigation Sidebar
// Location: client/src/components/Layout/Sidebar.tsx

import React, { useState } from 'react';
import { useAppSelector } from '../../hooks/useRedux';

interface SidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onCreatePost?: () => void;
}

// Navigation Items
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: '🏠', iconActive: '🏠' },
  { id: 'explore', label: 'Explore', icon: '🔍', iconActive: '🔎' },
  { id: 'notifications', label: 'Notifications', icon: '🔔', iconActive: '🔔' },
  { id: 'messages', label: 'Messages', icon: '✉️', iconActive: '📩' },
  { id: 'bookmarks', label: 'Bookmarks', icon: '🔖', iconActive: '🔖' },
  { id: 'verified', label: 'My Verifications', icon: '✅', iconActive: '✅' },
  { id: 'tokens', label: 'Tokens', icon: '💰', iconActive: '💰' },
  { id: 'profile', label: 'Profile', icon: '👤', iconActive: '👤' },
  { id: 'settings', label: 'Settings', icon: '⚙️', iconActive: '⚙️' },
];

const Sidebar: React.FC<SidebarProps> = ({
  currentPage = 'home',
  onNavigate,
  onCreatePost
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Get user avatar
  const getAvatarUrl = () => {
    if (user?.profilePicture) return user.profilePicture;
    if (user?.avatar) return user.avatar;
    const name = user?.name || user?.username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00ff00&color=000&bold=true`;
  };

  // Get verification badge
  const getBadgeIcon = () => {
    const badge = user?.verificationBadge || 'none';
    const badges: { [key: string]: string } = {
      none: '',
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎'
    };
    return badges[badge] || '';
  };

  // Format token amount
  const formatTokens = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toString();
  };

  // Handle navigation
  const handleNavClick = (pageId: string) => {
    onNavigate?.(pageId);
  };

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoContainer}>
        <a href="/" style={styles.logoLink}>
          <div style={styles.logo}>
            <span style={styles.logoText}>V</span>
            <span style={styles.logoGlow}></span>
          </div>
        </a>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              }}
            >
              <span style={styles.navIcon}>
                {isActive ? item.iconActive : item.icon}
              </span>
              <span style={{
                ...styles.navLabel,
                ...(isActive ? styles.navLabelActive : {})
              }}>
                {item.label}
              </span>
              {/* Notification Badge */}
              {item.id === 'notifications' && (user?.notifications?.filter((n: any) => !n.read)?.length ?? 0) > 0 && (
                <span style={styles.notificationBadge}>
                  {user?.notifications?.filter((n: any) => !n.read).length}
                </span>
              )}
            </button>
          );
        })}

        {/* More Menu */}
        <div style={styles.moreContainer}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            style={styles.navItem}
          >
            <span style={styles.navIcon}>•••</span>
            <span style={styles.navLabel}>More</span>
          </button>

          {showMoreMenu && (
            <div style={styles.moreMenu}>
              <button style={styles.menuItem}>
                <span>📋</span> Lists
              </button>
              <button style={styles.menuItem}>
                <span>👥</span> Communities
              </button>
              <button style={styles.menuItem}>
                <span>⚡</span> Premium
              </button>
              <button style={styles.menuItem}>
                <span>📊</span> Analytics
              </button>
              <button style={styles.menuItem}>
                <span>🎨</span> Display
              </button>
              <div style={styles.menuDivider} />
              <button style={styles.menuItem}>
                <span>❓</span> Help Center
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Post Button */}
      <button
        onClick={onCreatePost}
        style={styles.postButton}
      >
        <span style={styles.postButtonIcon}>✏️</span>
        <span style={styles.postButtonText}>Post</span>
      </button>

      {/* Token Balance Card */}
      <div style={styles.tokenCard}>
        <div style={styles.tokenHeader}>
          <span style={styles.tokenIcon}>💰</span>
          <span style={styles.tokenTitle}>V-TKN Balance</span>
        </div>
        <div style={styles.tokenAmount}>
          {formatTokens(user?.vtokens || 0)}
        </div>
        <div style={styles.tokenStats}>
          <div style={styles.tokenStat}>
            <span style={styles.tokenStatLabel}>Trust Score</span>
            <span style={styles.tokenStatValue}>{user?.trustScore || 0}</span>
          </div>
          <div style={styles.tokenStat}>
            <span style={styles.tokenStatLabel}>Verifications</span>
            <span style={styles.tokenStatValue}>
              {user?.verifiedPosts?.length || 0}
            </span>
          </div>
        </div>
        <button style={styles.earnMoreBtn}>
          Earn More →
        </button>
      </div>

      {/* User Profile Section */}
      <div style={styles.profileSection}>
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          style={styles.profileButton}
        >
          <img
            src={getAvatarUrl()}
            alt={user?.username || 'User'}
            style={styles.profileAvatar}
          />
          <div style={styles.profileInfo}>
            <div style={styles.profileName}>
              {user?.name || user?.username || 'User'}
              {user?.isVerified && (
                <span style={styles.verifiedCheck}>✓</span>
              )}
              {getBadgeIcon() && (
                <span style={styles.profileBadge}>{getBadgeIcon()}</span>
              )}
            </div>
            <div style={styles.profileHandle}>
              @{user?.username || 'username'}
            </div>
          </div>
          <span style={styles.profileMore}>•••</span>
        </button>

        {/* Profile Dropdown Menu */}
        {showProfileMenu && (
          <div style={styles.profileMenu}>
            <div style={styles.profileMenuHeader}>
              <img
                src={getAvatarUrl()}
                alt={user?.username}
                style={styles.profileMenuAvatar}
              />
              <div>
                <div style={styles.profileMenuName}>
                  {user?.name || user?.username}
                </div>
                <div style={styles.profileMenuHandle}>
                  @{user?.username}
                </div>
              </div>
            </div>
            <div style={styles.menuDivider} />
            <button style={styles.menuItem}>
              Add an existing account
            </button>
            <button style={{...styles.menuItem, color: '#FF4444'}}>
              Log out @{user?.username}
            </button>
          </div>
        )}
      </div>

      {/* Footer Links */}
      <div style={styles.footer}>
        <a href="/terms" style={styles.footerLink}>Terms</a>
        <a href="/privacy" style={styles.footerLink}>Privacy</a>
        <a href="/about" style={styles.footerLink}>About</a>
        <span style={styles.footerLink}>© 2024 VIURL</span>
      </div>
    </aside>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    width: '275px',
    height: '100vh',
    padding: '0 12px',
    borderRight: '1px solid #2a2a2a',
    backgroundColor: '#000000',
    position: 'sticky',
    top: 0,
    overflowY: 'auto',
  },
  logoContainer: {
    padding: '12px',
    marginBottom: '8px',
  },
  logoLink: {
    textDecoration: 'none',
  },
  logo: {
    position: 'relative',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    transition: 'background-color 0.2s ease',
    cursor: 'pointer',
  },
  logoText: {
    fontSize: '32px',
    fontWeight: 900,
    color: '#00FF00',
    textShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
    fontFamily: 'Arial Black, sans-serif',
  },
  logoGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,255,0,0.2) 0%, transparent 70%)',
    animation: 'pulse 2s infinite',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
    textAlign: 'left',
  },
  navItemActive: {
    fontWeight: 700,
  },
  navIcon: {
    fontSize: '26px',
    width: '26px',
    textAlign: 'center',
  },
  navLabel: {
    fontSize: '20px',
    color: '#ffffff',
    fontWeight: 400,
  },
  navLabelActive: {
    fontWeight: 700,
    color: '#00FF00',
  },
  notificationBadge: {
    backgroundColor: '#00FF00',
    color: '#000',
    fontSize: '12px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '10px',
    marginLeft: 'auto',
  },
  moreContainer: {
    position: 'relative',
  },
  moreMenu: {
    position: 'absolute',
    bottom: '100%',
    left: '0',
    width: '250px',
    backgroundColor: '#000',
    border: '1px solid #333',
    borderRadius: '16px',
    padding: '8px 0',
    boxShadow: '0 0 20px rgba(0, 255, 0, 0.2)',
    zIndex: 100,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '16px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '15px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.2s ease',
  },
  menuDivider: {
    height: '1px',
    backgroundColor: '#333',
    margin: '8px 0',
  },
  postButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '90%',
    padding: '16px',
    margin: '16px auto',
    backgroundColor: '#00FF00',
    color: '#000000',
    border: 'none',
    borderRadius: '30px',
    fontSize: '17px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)',
  },
  postButtonIcon: {
    fontSize: '20px',
  },
  postButtonText: {
    letterSpacing: '0.5px',
  },
  tokenCard: {
    margin: '16px 8px',
    padding: '16px',
    backgroundColor: '#0a0a0a',
    border: '1px solid #00FF00',
    borderRadius: '16px',
    boxShadow: '0 0 15px rgba(0, 255, 0, 0.1)',
  },
  tokenHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  tokenIcon: {
    fontSize: '20px',
  },
  tokenTitle: {
    fontSize: '14px',
    color: '#888',
    fontWeight: 500,
  },
  tokenAmount: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#00FF00',
    textShadow: '0 0 10px rgba(0, 255, 0, 0.3)',
    marginBottom: '12px',
  },
  tokenStats: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  tokenStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  tokenStatLabel: {
    fontSize: '12px',
    color: '#666',
  },
  tokenStatValue: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#fff',
  },
  earnMoreBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'transparent',
    border: '1px solid #00FF00',
    borderRadius: '20px',
    color: '#00FF00',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  profileSection: {
    marginTop: 'auto',
    padding: '12px 0',
    position: 'relative',
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  profileAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  profileInfo: {
    flex: 1,
    textAlign: 'left',
    overflow: 'hidden',
  },
  profileName: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '15px',
    fontWeight: 700,
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  verifiedCheck: {
    backgroundColor: '#00FF00',
    color: '#000',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  profileBadge: {
    fontSize: '14px',
    flexShrink: 0,
  },
  profileHandle: {
    fontSize: '14px',
    color: '#888',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  profileMore: {
    color: '#888',
    fontSize: '16px',
  },
  profileMenu: {
    position: 'absolute',
    bottom: '100%',
    left: '0',
    right: '0',
    backgroundColor: '#000',
    border: '1px solid #333',
    borderRadius: '16px',
    padding: '12px 0',
    boxShadow: '0 0 20px rgba(0, 255, 0, 0.2)',
    zIndex: 100,
  },
  profileMenuHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
  },
  profileMenuAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  profileMenuName: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#fff',
  },
  profileMenuHandle: {
    fontSize: '14px',
    color: '#888',
  },
  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '12px',
    marginTop: '8px',
  },
  footerLink: {
    fontSize: '13px',
    color: '#666',
    textDecoration: 'none',
    cursor: 'pointer',
  },
};

export default Sidebar;