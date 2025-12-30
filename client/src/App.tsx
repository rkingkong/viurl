// App.tsx - VIURL Main Application Router
// Location: client/src/App.tsx

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './hooks/useRedux';
import { setUser, setLoading, logout } from './store/slices/authSlice';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';

// API Base URL
const API_BASE = 'https://viurl.com';

// Route types
type Route = 
  | 'home' 
  | 'explore' 
  | 'notifications' 
  | 'messages' 
  | 'bookmarks' 
  | 'verified' 
  | 'tokens' 
  | 'profile' 
  | 'settings' 
  | 'login' 
  | 'register'
  | 'post'
  | 'search';

interface RouteParams {
  userId?: string;
  postId?: string;
  query?: string;
}

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading: authLoading } = useAppSelector((state) => state.auth);
  
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [routeParams, setRouteParams] = useState<RouteParams>({});
  const [appReady, setAppReady] = useState(false);

  // Initialize app - check for existing session
  useEffect(() => {
    const initializeApp = async () => {
      dispatch(setLoading(true));
      
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          // Verify token is still valid
          const response = await fetch(`${API_BASE}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            dispatch(setUser(data.user || JSON.parse(savedUser)));
          } else {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Use cached user data if available
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          dispatch(setUser(JSON.parse(savedUser)));
        }
      } finally {
        dispatch(setLoading(false));
        setAppReady(true);
      }
    };

    initializeApp();
    
    // Handle browser back/forward
    window.addEventListener('popstate', handlePopState);
    
    // Parse initial URL
    parseUrl(window.location.pathname);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [dispatch]);

  // Handle browser navigation
  const handlePopState = () => {
    parseUrl(window.location.pathname);
  };

  // Parse URL to route
  const parseUrl = (pathname: string) => {
    const parts = pathname.split('/').filter(Boolean);
    
    if (parts.length === 0) {
      setCurrentRoute('home');
      return;
    }

    const [first, second] = parts;

    switch (first) {
      case 'login':
      case 'register':
        setCurrentRoute(first);
        break;
      case 'explore':
      case 'notifications':
      case 'messages':
      case 'bookmarks':
      case 'settings':
        setCurrentRoute(first as Route);
        break;
      case 'verified':
      case 'verifications':
        setCurrentRoute('verified');
        break;
      case 'tokens':
      case 'wallet':
        setCurrentRoute('tokens');
        break;
      case 'profile':
        setCurrentRoute('profile');
        if (second) {
          setRouteParams({ userId: second });
        }
        break;
      case 'post':
        setCurrentRoute('post');
        if (second) {
          setRouteParams({ postId: second });
        }
        break;
      case 'search':
        setCurrentRoute('search');
        const urlParams = new URLSearchParams(window.location.search);
        setRouteParams({ query: urlParams.get('q') || '' });
        break;
      default:
        // Check if it's a username (e.g., /johndoe)
        if (first && !first.startsWith('_')) {
          setCurrentRoute('profile');
          setRouteParams({ userId: first });
        } else {
          setCurrentRoute('home');
        }
    }
  };

  // Navigate to a route
  const navigate = (route: Route, params?: RouteParams) => {
    setCurrentRoute(route);
    setRouteParams(params || {});
    
    // Update URL
    let path = '/';
    switch (route) {
      case 'home':
        path = '/';
        break;
      case 'profile':
        path = params?.userId ? `/${params.userId}` : '/profile';
        break;
      case 'post':
        path = params?.postId ? `/post/${params.postId}` : '/';
        break;
      case 'search':
        path = params?.query ? `/search?q=${encodeURIComponent(params.query)}` : '/search';
        break;
      default:
        path = `/${route}`;
    }
    
    window.history.pushState({}, '', path);
  };

  // Handle login success
  const handleLoginSuccess = () => {
    navigate('home');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(logout());
    navigate('home');
  };

  // Show loading screen while initializing
  if (!appReady) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingContent}>
          <div style={styles.loadingLogo}>
            <span style={styles.loadingLogoText}>V</span>
            <div style={styles.loadingGlow} />
          </div>
          <div style={styles.loadingSpinner}>
            <div style={styles.spinnerRing} />
          </div>
          <p style={styles.loadingText}>Loading VIURL...</p>
        </div>
        
        {/* Loading animation styles */}
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Render current route
  const renderRoute = () => {
    switch (currentRoute) {
      case 'login':
      case 'register':
        return (
          <Login 
            onNavigate={(page) => navigate(page as Route)}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      
      case 'profile':
        return (
          <Profile 
            userId={routeParams.userId}
            onNavigate={(page) => navigate(page as Route)}
          />
        );
      
      case 'explore':
        return <ExplorePage onNavigate={(page) => navigate(page as Route)} />;
      
      case 'notifications':
        return <NotificationsPage onNavigate={(page) => navigate(page as Route)} />;
      
      case 'messages':
        return <MessagesPage onNavigate={(page) => navigate(page as Route)} />;
      
      case 'bookmarks':
        return <BookmarksPage onNavigate={(page) => navigate(page as Route)} />;
      
      case 'verified':
        return <VerificationsPage onNavigate={(page) => navigate(page as Route)} />;
      
      case 'tokens':
        return <TokensPage onNavigate={(page) => navigate(page as Route)} />;
      
      case 'settings':
        return <SettingsPage onNavigate={(page) => navigate(page as Route)} onLogout={handleLogout} />;
      
      case 'search':
        return <SearchPage query={routeParams.query} onNavigate={(page) => navigate(page as Route)} />;
      
      case 'home':
      default:
        return <Home onNavigate={(page) => navigate(page as Route)} />;
    }
  };

  return (
    <div style={styles.app}>
      {renderRoute()}
      <style>{globalStyles}</style>
    </div>
  );
};

// ============================================
// Placeholder Pages (Coming Soon)
// ============================================

interface PageProps {
  onNavigate: (page: string) => void;
}

const PlaceholderContent: React.FC<{ icon: string; title: string; description: string }> = ({ 
  icon, title, description 
}) => (
  <div style={placeholderStyles.container}>
    <span style={placeholderStyles.icon}>{icon}</span>
    <h2 style={placeholderStyles.title}>{title}</h2>
    <p style={placeholderStyles.description}>{description}</p>
    <div style={placeholderStyles.badge}>
      <span>🚧</span> Coming Soon
    </div>
  </div>
);

const ExplorePage: React.FC<PageProps> = ({ onNavigate }) => {
  const Layout = require('./components/Layout/Layout').default;
  return (
    <Layout currentPage="explore" onNavigate={onNavigate} pageTitle="Explore">
      <PlaceholderContent icon="🔍" title="Explore" description="Discover trending topics and verified content." />
    </Layout>
  );
};

const NotificationsPage: React.FC<PageProps> = ({ onNavigate }) => {
  const Layout = require('./components/Layout/Layout').default;
  return (
    <Layout currentPage="notifications" onNavigate={onNavigate} pageTitle="Notifications">
      <PlaceholderContent icon="🔔" title="Notifications" description="Stay updated with verifications and mentions." />
    </Layout>
  );
};

const MessagesPage: React.FC<PageProps> = ({ onNavigate }) => {
  const Layout = require('./components/Layout/Layout').default;
  return (
    <Layout currentPage="messages" onNavigate={onNavigate} pageTitle="Messages">
      <PlaceholderContent icon="✉️" title="Messages" description="Direct messages with other users." />
    </Layout>
  );
};

const BookmarksPage: React.FC<PageProps> = ({ onNavigate }) => {
  const Layout = require('./components/Layout/Layout').default;
  return (
    <Layout currentPage="bookmarks" onNavigate={onNavigate} pageTitle="Bookmarks">
      <PlaceholderContent icon="🔖" title="Bookmarks" description="Posts you've saved for later." />
    </Layout>
  );
};

const VerificationsPage: React.FC<PageProps> = ({ onNavigate }) => {
  const Layout = require('./components/Layout/Layout').default;
  return (
    <Layout currentPage="verified" onNavigate={onNavigate} pageTitle="My Verifications">
      <PlaceholderContent icon="✅" title="My Verifications" description="Track your verification history." />
    </Layout>
  );
};

const TokensPage: React.FC<PageProps> = ({ onNavigate }) => {
  const Layout = require('./components/Layout/Layout').default;
  return (
    <Layout currentPage="tokens" onNavigate={onNavigate} pageTitle="V-TKN Tokens">
      <div style={tokenStyles.container}>
        <div style={tokenStyles.balanceCard}>
          <div style={tokenStyles.balanceIcon}>💰</div>
          <div style={tokenStyles.balanceAmount}>0</div>
          <div style={tokenStyles.balanceLabel}>V-TKN Balance</div>
          <div style={tokenStyles.actions}>
            <button style={tokenStyles.btn}>Send</button>
            <button style={tokenStyles.btn}>Receive</button>
            <button style={tokenStyles.btnPrimary}>Earn More</button>
          </div>
        </div>
        <div style={tokenStyles.earnSection}>
          <h3 style={tokenStyles.sectionTitle}>How to Earn V-TKN</h3>
          <div style={tokenStyles.earnItem}><span>✅</span> Verify posts accurately</div>
          <div style={tokenStyles.earnItem}><span>📝</span> Create quality content</div>
          <div style={tokenStyles.earnItem}><span>🏆</span> Climb the leaderboard</div>
          <div style={tokenStyles.earnItem}><span>🎁</span> Daily login bonus</div>
        </div>
      </div>
    </Layout>
  );
};

const SettingsPage: React.FC<PageProps & { onLogout: () => void }> = ({ onNavigate, onLogout }) => {
  const Layout = require('./components/Layout/Layout').default;
  return (
    <Layout currentPage="settings" onNavigate={onNavigate} pageTitle="Settings">
      <div style={settingsStyles.container}>
        <button style={settingsStyles.item}><span>👤</span> Account Information</button>
        <button style={settingsStyles.item}><span>🔐</span> Security</button>
        <button style={settingsStyles.item}><span>🔗</span> Connected Wallet</button>
        <button style={settingsStyles.item}><span>🎨</span> Display</button>
        <button style={settingsStyles.item}><span>🔔</span> Notifications</button>
        <button style={settingsStyles.item}><span>🔒</span> Privacy</button>
        <button style={settingsStyles.logoutBtn} onClick={onLogout}>Log out</button>
      </div>
    </Layout>
  );
};

const SearchPage: React.FC<PageProps & { query?: string }> = ({ query, onNavigate }) => {
  const Layout = require('./components/Layout/Layout').default;
  return (
    <Layout currentPage="search" onNavigate={onNavigate} pageTitle="Search">
      <PlaceholderContent icon="🔍" title={query ? `"${query}"` : "Search"} description="Search for people and posts." />
    </Layout>
  );
};

// ============================================
// Styles
// ============================================

const styles: { [key: string]: React.CSSProperties } = {
  app: { minHeight: '100vh', backgroundColor: '#000' },
  loadingScreen: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#000' },
  loadingContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' },
  loadingLogo: { position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingLogoText: { fontSize: '60px', fontWeight: 900, color: '#00FF00', textShadow: '0 0 30px rgba(0, 255, 0, 0.5)', fontFamily: 'Arial Black', animation: 'pulse 2s ease-in-out infinite' },
  loadingGlow: { position: 'absolute', width: '150%', height: '150%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,0,0.2) 0%, transparent 70%)' },
  loadingSpinner: { width: '40px', height: '40px' },
  spinnerRing: { width: '100%', height: '100%', border: '3px solid #333', borderTopColor: '#00FF00', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingText: { color: '#888', fontSize: '14px' },
};

const placeholderStyles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px' },
  icon: { fontSize: '64px' },
  title: { fontSize: '24px', fontWeight: 800, color: '#fff', margin: 0 },
  description: { fontSize: '15px', color: '#888', textAlign: 'center', maxWidth: '300px' },
  badge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'rgba(0, 255, 0, 0.1)', border: '1px solid rgba(0, 255, 0, 0.3)', borderRadius: '20px', color: '#00FF00', fontSize: '14px', marginTop: '16px' },
};

const tokenStyles: { [key: string]: React.CSSProperties } = {
  container: { padding: '20px' },
  balanceCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px', backgroundColor: '#0a0a0a', border: '1px solid #00FF00', borderRadius: '20px', marginBottom: '20px' },
  balanceIcon: { fontSize: '48px', marginBottom: '8px' },
  balanceAmount: { fontSize: '48px', fontWeight: 900, color: '#00FF00', textShadow: '0 0 20px rgba(0, 255, 0, 0.3)' },
  balanceLabel: { fontSize: '16px', color: '#888', marginBottom: '24px' },
  actions: { display: 'flex', gap: '12px' },
  btn: { padding: '12px 24px', backgroundColor: 'transparent', border: '1px solid #333', borderRadius: '25px', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer' },
  btnPrimary: { padding: '12px 24px', backgroundColor: '#00FF00', border: 'none', borderRadius: '25px', color: '#000', fontSize: '15px', fontWeight: 700, cursor: 'pointer' },
  earnSection: { backgroundColor: '#101010', borderRadius: '16px', padding: '20px' },
  sectionTitle: { fontSize: '18px', fontWeight: 800, color: '#fff', margin: '0 0 16px 0' },
  earnItem: { display: 'flex', gap: '12px', padding: '12px 0', color: '#fff', fontSize: '15px', borderBottom: '1px solid #2a2a2a' },
};

const settingsStyles: { [key: string]: React.CSSProperties } = {
  container: { padding: '0' },
  item: { display: 'flex', alignItems: 'center', gap: '16px', width: '100%', padding: '20px 16px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #2a2a2a', cursor: 'pointer', textAlign: 'left', color: '#fff', fontSize: '16px' },
  logoutBtn: { width: 'calc(100% - 32px)', margin: '20px 16px', padding: '16px', backgroundColor: 'transparent', border: '1px solid #FF4444', borderRadius: '12px', color: '#FF4444', fontSize: '16px', fontWeight: 700, cursor: 'pointer' },
};

const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background-color: #000; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #000; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #00FF00; }
  ::selection { background: rgba(0, 255, 0, 0.3); }
  a { color: #00FF00; text-decoration: none; }
  button { font-family: inherit; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
`;

export default App;