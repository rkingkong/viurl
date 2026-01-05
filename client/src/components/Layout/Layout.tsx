// Layout.tsx - VIURL Responsive Layout Component
// Location: client/src/components/Layout/Layout.tsx

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onCreatePost?: () => void;
}

// Mobile navigation items
const MOBILE_NAV_ITEMS = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'explore', icon: '🔍', label: 'Explore' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'messages', icon: '✉️', label: 'Messages' },
  { id: 'profile', icon: '👤', label: 'Profile' },
];

const Layout: React.FC<LayoutProps> = ({ children, currentPage = 'home', onNavigate }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle navigation
  const handleNavigate = (page: string) => {
    onNavigate?.(page);
    setShowMobileMenu(false);
  };

  return (
    <div style={styles.container}>
      {/* Desktop Sidebar - Hidden on mobile */}
      {!isMobile && (
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      )}

      {/* Main Content */}
      <main style={{
        ...styles.main,
        marginLeft: isMobile ? 0 : '275px',
        paddingBottom: isMobile ? '70px' : 0, // Space for mobile nav
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
            <div style={styles.mobileLogo}>
              <span style={styles.mobileLogoText}>V</span>
            </div>
            <div style={styles.mobileHeaderSpacer} />
          </div>
        )}

        {children}
      </main>

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
                <span style={styles.mobileNavIcon}>{item.icon}</span>
                {isActive && <div style={styles.mobileNavIndicator} />}
              </button>
            );
          })}
        </nav>
      )}

      {/* Mobile Slide-out Menu */}
      {isMobile && showMobileMenu && (
        <>
          <div 
            style={styles.mobileOverlay}
            onClick={() => setShowMobileMenu(false)}
          />
          <div style={styles.mobileSlideMenu}>
            <div style={styles.mobileSlideHeader}>
              <span style={styles.mobileSlideLogoText}>V</span>
              <button 
                style={styles.mobileCloseBtn}
                onClick={() => setShowMobileMenu(false)}
              >
                ✕
              </button>
            </div>
            
            <nav style={styles.mobileSlideNav}>
              {[
                { id: 'home', icon: '🏠', label: 'Home' },
                { id: 'explore', icon: '🔍', label: 'Explore' },
                { id: 'notifications', icon: '🔔', label: 'Notifications' },
                { id: 'messages', icon: '✉️', label: 'Messages' },
                { id: 'bookmarks', icon: '🔖', label: 'Bookmarks' },
                { id: 'verified', icon: '✅', label: 'My Verifications' },
                { id: 'tokens', icon: '💰', label: 'Tokens' },
                { id: 'profile', icon: '👤', label: 'Profile' },
                { id: 'settings', icon: '⚙️', label: 'Settings' },
              ].map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    style={{
                      ...styles.mobileSlideItem,
                      backgroundColor: isActive ? 'rgba(0, 255, 0, 0.1)' : 'transparent',
                      color: isActive ? '#00FF00' : '#fff',
                    }}
                  >
                    <span style={styles.mobileSlideIcon}>{item.icon}</span>
                    <span style={styles.mobileSlideLabel}>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Token Balance in Mobile Menu */}
            <div style={styles.mobileTokenCard}>
              <div style={styles.mobileTokenHeader}>
                <span>💰</span>
                <span>V-TKN Balance</span>
              </div>
              <div style={styles.mobileTokenAmount}>0</div>
            </div>
          </div>
        </>
      )}

      {/* Inject responsive styles */}
      <style>{responsiveStyles}</style>
    </div>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#000',
  },
  main: {
    flex: 1,
    minHeight: '100vh',
    maxWidth: '100%',
  },
  
  // Mobile Header
  mobileHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#000',
    borderBottom: '1px solid #2a2a2a',
    position: 'sticky',
    top: 0,
    zIndex: 100,
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileLogoText: {
    fontSize: '28px',
    fontWeight: 900,
    color: '#00FF00',
    textShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
    fontFamily: 'Arial Black, sans-serif',
  },
  mobileHeaderSpacer: {
    width: '40px', // Balance the menu button
  },

  // Mobile Bottom Navigation
  mobileNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000',
    borderTop: '1px solid #2a2a2a',
    padding: '8px 0',
    paddingBottom: 'env(safe-area-inset-bottom, 8px)', // iPhone notch support
    zIndex: 1000,
  },
  mobileNavItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 16px',
    position: 'relative',
  },
  mobileNavIcon: {
    fontSize: '24px',
  },
  mobileNavIndicator: {
    position: 'absolute',
    bottom: '0',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#00FF00',
  },

  // Mobile Slide-out Menu
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1001,
  },
  mobileSlideMenu: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '280px',
    maxWidth: '80vw',
    backgroundColor: '#000',
    borderRight: '1px solid #2a2a2a',
    zIndex: 1002,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    animation: 'slideIn 0.2s ease-out',
  },
  mobileSlideHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #2a2a2a',
  },
  mobileSlideLogoText: {
    fontSize: '32px',
    fontWeight: 900,
    color: '#00FF00',
    textShadow: '0 0 15px rgba(0, 255, 0, 0.5)',
    fontFamily: 'Arial Black, sans-serif',
  },
  mobileCloseBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px',
  },
  mobileSlideNav: {
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
    transition: 'background-color 0.2s ease',
  },
  mobileSlideIcon: {
    fontSize: '22px',
    width: '28px',
    textAlign: 'center',
  },
  mobileSlideLabel: {
    fontSize: '18px',
    fontWeight: 500,
  },
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
    fontWeight: 700,
    color: '#00FF00',
  },
};

// CSS animations and additional responsive styles
const responsiveStyles = `
  @keyframes slideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  /* Tablet adjustments (768px - 1024px) */
  @media (min-width: 768px) and (max-width: 1024px) {
    .sidebar {
      width: 88px !important;
    }
    .nav-label {
      display: none !important;
    }
  }

  /* Ensure content doesn't overflow on mobile */
  @media (max-width: 767px) {
    body {
      overflow-x: hidden;
    }
    
    img, video {
      max-width: 100%;
      height: auto;
    }
  }

  /* Safe area support for notched phones */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .mobile-nav {
      padding-bottom: calc(8px + env(safe-area-inset-bottom));
    }
  }
`;

export default Layout;