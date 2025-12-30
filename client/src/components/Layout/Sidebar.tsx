import React from 'react';
import { useAppSelector } from '../../hooks/useRedux';

interface SidebarProps {
  activeRoute?: string;
  onNavigate?: (route: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeRoute = 'home', onNavigate }) => {
  const user = useAppSelector((state) => state.auth.user);

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'explore', label: 'Explore', icon: '🔍' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', badge: user?.notifications },
    { id: 'messages', label: 'Messages', icon: '✉️' },
    { id: 'bookmarks', label: 'Bookmarks', icon: '🔖' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'verify', label: 'Verify', icon: '✓' },
    { id: 'tokens', label: 'Tokens', icon: '🪙' },
  ];

  const getBadge = (score: number) => {
    if (score >= 95) return '💎';
    if (score >= 75) return '🥇';
    if (score >= 50) return '🥈';
    return '🥉';
  };

  const styles = {
    container: {
      width: '275px',
      height: '100vh',
      position: 'fixed' as const,
      left: 0,
      top: 0,
      backgroundColor: '#000',
      borderRight: '1px solid #333',
      display: 'flex',
      flexDirection: 'column' as const,
      padding: '10px 15px',
    } as React.CSSProperties,
    logo: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#00FF00',
      padding: '15px',
      marginBottom: '10px',
    } as React.CSSProperties,
    nav: {
      flex: 1,
    } as React.CSSProperties,
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '14px 15px',
      borderRadius: '30px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      color: '#fff',
      fontSize: '18px',
      textDecoration: 'none',
    } as React.CSSProperties,
    menuItemActive: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '14px 15px',
      borderRadius: '30px',
      cursor: 'pointer',
      backgroundColor: '#111',
      color: '#00FF00',
      fontSize: '18px',
      fontWeight: 'bold' as const,
      textDecoration: 'none',
    } as React.CSSProperties,
    menuIcon: {
      fontSize: '22px',
      width: '28px',
      textAlign: 'center' as const,
    } as React.CSSProperties,
    badge: {
      backgroundColor: '#00FF00',
      color: '#000',
      fontSize: '12px',
      fontWeight: 'bold' as const,
      padding: '2px 8px',
      borderRadius: '10px',
      marginLeft: 'auto',
    } as React.CSSProperties,
    postBtn: {
      backgroundColor: '#00FF00',
      color: '#000',
      border: 'none',
      borderRadius: '30px',
      padding: '15px',
      fontSize: '16px',
      fontWeight: 'bold' as const,
      cursor: 'pointer',
      width: '100%',
      marginTop: '15px',
      transition: 'background-color 0.2s',
    } as React.CSSProperties,
    userSection: {
      padding: '15px',
      borderTop: '1px solid #333',
      marginTop: 'auto',
    } as React.CSSProperties,
    userCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px',
      borderRadius: '30px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    } as React.CSSProperties,
    avatar: {
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      backgroundColor: '#333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
    } as React.CSSProperties,
    userInfo: {
      flex: 1,
      minWidth: 0,
    } as React.CSSProperties,
    userName: {
      fontWeight: 'bold' as const,
      fontSize: '14px',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    } as React.CSSProperties,
    userHandle: {
      fontSize: '13px',
      color: '#888',
    } as React.CSSProperties,
    tokenDisplay: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: '#00FF0020',
      color: '#00FF00',
      padding: '8px 12px',
      borderRadius: '15px',
      fontSize: '13px',
      fontWeight: 'bold' as const,
      marginTop: '10px',
    } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      <div style={styles.logo}>VIURL</div>

      <nav style={styles.nav}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            style={activeRoute === item.id ? styles.menuItemActive : styles.menuItem}
            onClick={() => onNavigate?.(item.id)}
          >
            <span style={styles.menuIcon}>{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && item.badge > 0 && (
              <span style={styles.badge}>{item.badge}</span>
            )}
          </div>
        ))}

        <button style={styles.postBtn} onClick={() => onNavigate?.('compose')}>
          Post
        </button>
      </nav>

      {user && (
        <div style={styles.userSection}>
          <div style={styles.tokenDisplay}>
            🪙 {user.vtokens || 0} V-TKN
          </div>
          <div style={styles.userCard} onClick={() => onNavigate?.('profile')}>
            <div style={styles.avatar}>
              {user.profilePicture || user.avatar ? (
                <img
                  src={user.profilePicture || user.avatar}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                />
              ) : (
                user.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div style={styles.userInfo}>
              <div style={styles.userName}>
                {user.name} {getBadge(user.trustScore || 0)}
                {user.verificationBadge && <span>✓</span>}
              </div>
              <div style={styles.userHandle}>@{user.username}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
