// Layout.tsx - VIURL Main Layout Wrapper
// Location: client/src/components/Layout/Layout.tsx

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
  showRightSidebar?: boolean;
  pageTitle?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage = 'home',
  onNavigate,
  showRightSidebar = true,
  pageTitle
}) => {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle navigation
  const handleNavigate = (page: string) => {
    onNavigate?.(page);
    setMobileMenuOpen(false);
  };

  // Handle create post
  const handleCreatePost = () => {
    setShowCreatePostModal(true);
  };

  // Handle search
  const handleSearch = (query: string) => {
    console.log('Search:', query);
    // Navigate to search results
    onNavigate?.('search');
  };

  return (
    <div style={styles.container}>
      {/* Mobile Header */}
      <header style={styles.mobileHeader}>
        <button 
          style={styles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
        <div style={styles.mobileLogo}>
          <span style={styles.mobileLogoText}>V</span>
        </div>
        <div style={styles.mobileHeaderRight}>
          <button style={styles.mobileSearchBtn}>🔍</button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          style={styles.mobileOverlay}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Layout */}
      <div style={styles.layout}>
        {/* Left Sidebar */}
        <div style={{
          ...styles.leftSidebar,
          ...(mobileMenuOpen ? styles.leftSidebarOpen : {})
        }}>
          <Sidebar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onCreatePost={handleCreatePost}
          />
        </div>

        {/* Main Content Area */}
        <main style={styles.mainContent}>
          {/* Page Header */}
          {pageTitle && (
            <header style={styles.pageHeader}>
              <button 
                style={styles.backBtn}
                onClick={() => window.history.back()}
              >
                ←
              </button>
              <div style={styles.pageHeaderContent}>
                <h1 style={styles.pageTitle}>{pageTitle}</h1>
              </div>
            </header>
          )}

          {/* Page Content */}
          <div style={styles.contentWrapper}>
            {children}
          </div>
        </main>

        {/* Right Sidebar */}
        {showRightSidebar && (
          <div style={styles.rightSidebar}>
            <RightSidebar
              onSearch={handleSearch}
              onFollowUser={(userId) => console.log('Follow:', userId)}
              onTopicClick={(topic) => console.log('Topic:', topic)}
            />
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav style={styles.mobileNav}>
        <button 
          style={{
            ...styles.mobileNavBtn,
            ...(currentPage === 'home' ? styles.mobileNavBtnActive : {})
          }}
          onClick={() => handleNavigate('home')}
        >
          <span style={styles.mobileNavIcon}>🏠</span>
        </button>
        <button 
          style={{
            ...styles.mobileNavBtn,
            ...(currentPage === 'explore' ? styles.mobileNavBtnActive : {})
          }}
          onClick={() => handleNavigate('explore')}
        >
          <span style={styles.mobileNavIcon}>🔍</span>
        </button>
        <button 
          style={styles.mobilePostBtn}
          onClick={handleCreatePost}
        >
          <span style={styles.mobilePostIcon}>✏️</span>
        </button>
        <button 
          style={{
            ...styles.mobileNavBtn,
            ...(currentPage === 'notifications' ? styles.mobileNavBtnActive : {})
          }}
          onClick={() => handleNavigate('notifications')}
        >
          <span style={styles.mobileNavIcon}>🔔</span>
        </button>
        <button 
          style={{
            ...styles.mobileNavBtn,
            ...(currentPage === 'messages' ? styles.mobileNavBtnActive : {})
          }}
          onClick={() => handleNavigate('messages')}
        >
          <span style={styles.mobileNavIcon}>✉️</span>
        </button>
      </nav>

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreatePostModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <button 
                style={styles.modalCloseBtn}
                onClick={() => setShowCreatePostModal(false)}
              >
                ✕
              </button>
              <div style={styles.modalTitle}>Create Post</div>
              <div style={styles.modalHeaderRight}>
                <button style={styles.draftsBtn}>Drafts</button>
              </div>
            </div>
            <div style={styles.modalContent}>
              {/* CreatePost component would go here */}
              <div style={styles.modalPostArea}>
                <textarea
                  placeholder="What's happening?"
                  style={styles.modalTextarea}
                  autoFocus
                />
              </div>
              <div style={styles.modalActions}>
                <div style={styles.modalTools}>
                  <button style={styles.modalToolBtn}>🖼️</button>
                  <button style={styles.modalToolBtn}>GIF</button>
                  <button style={styles.modalToolBtn}>📊</button>
                  <button style={styles.modalToolBtn}>😊</button>
                  <button style={styles.modalToolBtn}>📅</button>
                  <button style={styles.modalToolBtn}>📍</button>
                </div>
                <button style={styles.modalPostBtn}>Post</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          background-color: #000000;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          overflow-x: hidden;
        }
        
        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #000;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #00FF00;
        }
        
        /* Selection */
        ::selection {
          background: rgba(0, 255, 0, 0.3);
          color: #fff;
        }
        
        /* Links */
        a {
          color: #00FF00;
          text-decoration: none;
        }
        
        a:hover {
          text-decoration: underline;
        }
        
        /* Button hover effects */
        button:hover {
          opacity: 0.9;
        }
        
        /* Placeholder styling */
        ::placeholder {
          color: #666;
        }
        
        /* Focus styles */
        *:focus {
          outline: none;
        }
        
        /* Animations */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(0, 255, 0, 0.5); }
          50% { box-shadow: 0 0 20px rgba(0, 255, 0, 0.8); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#000000',
  },
  
  // Mobile Header
  mobileHeader: {
    display: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '53px',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #2a2a2a',
    padding: '0 16px',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
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
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  mobileLogoText: {
    fontSize: '28px',
    fontWeight: 900,
    color: '#00FF00',
    textShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
  },
  mobileHeaderRight: {
    display: 'flex',
    alignItems: 'center',
  },
  mobileSearchBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px',
  },
  mobileOverlay: {
    display: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(91, 112, 131, 0.4)',
    zIndex: 998,
  },
  
  // Main Layout
  layout: {
    display: 'flex',
    maxWidth: '1300px',
    margin: '0 auto',
    minHeight: '100vh',
  },
  
  // Left Sidebar
  leftSidebar: {
    width: '275px',
    flexShrink: 0,
  },
  leftSidebarOpen: {
    transform: 'translateX(0)',
  },
  
  // Main Content
  mainContent: {
    flex: 1,
    maxWidth: '600px',
    borderLeft: '1px solid #2a2a2a',
    borderRight: '1px solid #2a2a2a',
    minHeight: '100vh',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '0 16px',
    height: '53px',
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #2a2a2a',
    zIndex: 100,
  },
  backBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
  },
  pageHeaderContent: {
    flex: 1,
  },
  pageTitle: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#fff',
    margin: 0,
  },
  contentWrapper: {
    minHeight: 'calc(100vh - 53px)',
  },
  
  // Right Sidebar
  rightSidebar: {
    width: '350px',
    flexShrink: 0,
  },
  
  // Mobile Navigation
  mobileNav: {
    display: 'none',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '53px',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(12px)',
    borderTop: '1px solid #2a2a2a',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000,
  },
  mobileNavBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: '12px',
    cursor: 'pointer',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
  },
  mobileNavBtnActive: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  mobileNavIcon: {
    fontSize: '26px',
  },
  mobilePostBtn: {
    backgroundColor: '#00FF00',
    border: 'none',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '-20px',
    boxShadow: '0 4px 20px rgba(0, 255, 0, 0.4)',
  },
  mobilePostIcon: {
    fontSize: '24px',
  },
  
  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(91, 112, 131, 0.4)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '5vh',
    zIndex: 2000,
  },
  modal: {
    width: '100%',
    maxWidth: '600px',
    backgroundColor: '#000',
    borderRadius: '16px',
    border: '1px solid #333',
    boxShadow: '0 0 30px rgba(0, 255, 0, 0.2)',
    animation: 'fadeIn 0.2s ease',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    height: '53px',
    borderBottom: '1px solid #2a2a2a',
  },
  modalCloseBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#fff',
  },
  modalHeaderRight: {
    width: '36px',
  },
  draftsBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#00FF00',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  modalContent: {
    padding: '16px',
  },
  modalPostArea: {
    minHeight: '150px',
  },
  modalTextarea: {
    width: '100%',
    minHeight: '150px',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '20px',
    lineHeight: '1.4',
    resize: 'none',
    fontFamily: 'inherit',
  },
  modalActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '12px',
    borderTop: '1px solid #2a2a2a',
  },
  modalTools: {
    display: 'flex',
    gap: '4px',
  },
  modalToolBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#00FF00',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
  },
  modalPostBtn: {
    backgroundColor: '#00FF00',
    color: '#000',
    border: 'none',
    borderRadius: '25px',
    padding: '10px 20px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  },
};

// Add responsive styles via media query
const mediaStyles = `
  @media (max-width: 1280px) {
    .right-sidebar {
      display: none;
    }
  }
  
  @media (max-width: 1000px) {
    .left-sidebar {
      width: 88px;
    }
    .nav-label {
      display: none;
    }
  }
  
  @media (max-width: 700px) {
    .mobile-header {
      display: flex !important;
    }
    .mobile-nav {
      display: flex !important;
    }
    .mobile-overlay {
      display: block !important;
    }
    .left-sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 280px;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      z-index: 999;
      background: #000;
    }
    .left-sidebar-open {
      transform: translateX(0);
    }
    .main-content {
      padding-top: 53px;
      padding-bottom: 53px;
      border: none;
    }
    .right-sidebar {
      display: none;
    }
  }
`;

export default Layout;