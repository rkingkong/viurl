// App.tsx - VIURL Main Application Router
// Location: client/src/App.tsx
// FIXED: Matched actual component props

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './hooks/useRedux';
import { setUser, logout } from './store/slices/authSlice';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';

// Layout
import Layout from './components/Layout/Layout';

// API Base URL
const API_BASE = '/api';

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

const App = () => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [routeParams, setRouteParams] = useState<RouteParams>({});
  const [appReady, setAppReady] = useState(false);

  // Initialize app - check for existing session
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          // Verify token is still valid
          const response = await fetch(`${API_BASE}/auth/me`, {
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
  const navigate = (route: string, params?: RouteParams) => {
    setCurrentRoute(route as Route);
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
  if (!appReady || loading) {
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
        <style>{loadingAnimations}</style>
      </div>
    );
  }

  // Render current route
  const renderRoute = () => {
    // Auth pages (no layout)
    if (currentRoute === 'login' || currentRoute === 'register') {
      return <Login onSuccess={handleLoginSuccess} />;
    }

    // All other pages use Layout
    return (
      <Layout currentPage={currentRoute} onNavigate={navigate}>
        {renderPageContent()}
      </Layout>
    );
  };

  // Render page content based on route
  const renderPageContent = () => {
    switch (currentRoute) {
      case 'home':
        return <Home />;
      
      case 'profile':
        return <Profile userId={routeParams.userId} onNavigate={navigate} />;
      
      case 'explore':
        return <Explore />;
      
      case 'notifications':
        return <Notifications onNavigate={navigate} />;
      
      case 'messages':
        return <Messages />;
      
      case 'bookmarks':
        return <BookmarksPage />;
      
      case 'verified':
        return <VerificationsPage />;
      
      case 'tokens':
        return <TokensPage />;
      
      case 'settings':
        return <SettingsPage onLogout={handleLogout} />;
      
      case 'search':
        return <SearchPage query={routeParams.query} />;
      
      default:
        return <Home />;
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
// Placeholder Components
// ============================================

const PlaceholderContent = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: string; 
  title: string; 
  description: string;
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

// Bookmarks Page
const BookmarksPage = () => {
  return (
    <PlaceholderContent 
      icon="🔖" 
      title="Bookmarks" 
      description="Save posts to read later. Your bookmarks will appear here." 
    />
  );
};

// Verifications Page
const VerificationsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  return (
    <div style={verificationsStyles.container}>
      <div style={verificationsStyles.statsGrid}>
        <div style={verificationsStyles.statCard}>
          <div style={verificationsStyles.statValue}>{user?.verifiedPosts?.length || 0}</div>
          <div style={verificationsStyles.statLabel}>Posts Verified</div>
        </div>
        <div style={verificationsStyles.statCard}>
          <div style={{ ...verificationsStyles.statValue, color: '#00FF00' }}>
            {user?.trustScore || 0}%
          </div>
          <div style={verificationsStyles.statLabel}>Accuracy Rate</div>
        </div>
        <div style={verificationsStyles.statCard}>
          <div style={verificationsStyles.statValue}>{user?.vtokens || 0}</div>
          <div style={verificationsStyles.statLabel}>V-TKN Earned</div>
        </div>
      </div>

      <div style={verificationsStyles.section}>
        <h3 style={verificationsStyles.sectionTitle}>Recent Verifications</h3>
        <PlaceholderContent 
          icon="✅" 
          title="No Verifications Yet" 
          description="Start verifying posts to earn V-TKN tokens and build your reputation." 
        />
      </div>
    </div>
  );
};

// Tokens/Wallet Page
const TokensPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  return (
    <div style={tokenStyles.container}>
      <div style={tokenStyles.balanceCard}>
        <div style={tokenStyles.balanceIcon}>💰</div>
        <div style={tokenStyles.balanceAmount}>{user?.vtokens || 0}</div>
        <div style={tokenStyles.balanceLabel}>V-TKN Balance</div>
        <div style={tokenStyles.usdValue}>
          ≈ ${((user?.vtokens || 0) * 0.05).toFixed(2)} USD
        </div>
        <div style={tokenStyles.actions}>
          <button style={tokenStyles.btn}><span>↑</span> Send</button>
          <button style={tokenStyles.btn}><span>↓</span> Receive</button>
          <button style={tokenStyles.btnPrimary}><span>✓</span> Earn More</button>
        </div>
      </div>

      <div style={tokenStyles.earnSection}>
        <h3 style={tokenStyles.sectionTitle}>💡 How to Earn V-TKN</h3>
        {[
          { icon: '✅', title: 'Verify Posts Accurately', reward: '+5-15 V-TKN per verification' },
          { icon: '📝', title: 'Create Quality Content', reward: '+2 V-TKN per verified post' },
          { icon: '🏆', title: 'Weekly Leaderboard Rewards', reward: 'Top 100 earn bonus V-TKN' },
          { icon: '🎁', title: 'Daily Login Streak', reward: '+1 V-TKN per day (7-day bonus!)' },
          { icon: '👥', title: 'Refer Friends', reward: '+50 V-TKN per referral' },
        ].map((item, i) => (
          <div key={i} style={tokenStyles.earnItem}>
            <span style={tokenStyles.earnIcon}>{item.icon}</span>
            <div style={tokenStyles.earnInfo}>
              <div style={tokenStyles.earnTitle}>{item.title}</div>
              <div style={tokenStyles.earnReward}>{item.reward}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={tokenStyles.historySection}>
        <h3 style={tokenStyles.sectionTitle}>📊 Transaction History</h3>
        <div style={tokenStyles.emptyHistory}><span>📭</span><p>No transactions yet</p></div>
      </div>
    </div>
  );
};

// Settings Page
const SettingsPage = ({ onLogout }: { onLogout: () => void }) => {
  const { user } = useAppSelector((state) => state.auth);
  
  const settingsItems = [
    { icon: '👤', label: 'Account Information', description: 'Update your profile details' },
    { icon: '🔐', label: 'Security', description: 'Password and authentication' },
    { icon: '🔗', label: 'Connected Wallet', description: 'Manage blockchain wallet' },
    { icon: '🎨', label: 'Display', description: 'Theme and appearance' },
    { icon: '🔔', label: 'Notifications', description: 'Push and email preferences' },
    { icon: '🔒', label: 'Privacy', description: 'Control your data' },
    { icon: '❓', label: 'Help Center', description: 'FAQs and support' },
    { icon: '📄', label: 'Terms of Service', description: 'Legal information' },
  ];

  return (
    <div style={settingsStyles.container}>
      {user && (
        <div style={settingsStyles.userHeader}>
          <div style={settingsStyles.userAvatar}>
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            ) : (user.name?.charAt(0) || 'U')}
          </div>
          <div style={settingsStyles.userInfo}>
            <div style={settingsStyles.userName}>{user.name}</div>
            <div style={settingsStyles.userEmail}>{user.email}</div>
          </div>
        </div>
      )}

      <div style={settingsStyles.section}>
        {settingsItems.map((item, index) => (
          <button key={index} style={settingsStyles.item}>
            <span style={settingsStyles.itemIcon}>{item.icon}</span>
            <div style={settingsStyles.itemContent}>
              <div style={settingsStyles.itemLabel}>{item.label}</div>
              <div style={settingsStyles.itemDescription}>{item.description}</div>
            </div>
            <span style={settingsStyles.itemArrow}>›</span>
          </button>
        ))}
      </div>

      <button style={settingsStyles.logoutBtn} onClick={onLogout}>
        Log out @{user?.username || 'user'}
      </button>

      <div style={settingsStyles.version}>VIURL v1.0.0 · Built with 💚</div>
    </div>
  );
};

// Search Page
const SearchPage = ({ query }: { query?: string }) => {
  const [searchQuery, setSearchQuery] = useState(query || '');
  const [activeTab, setActiveTab] = useState<'top' | 'users' | 'posts'>('top');

  return (
    <div style={searchStyles.container}>
      <div style={searchStyles.searchBox}>
        <span style={searchStyles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search VIURL..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={searchStyles.searchInput}
          autoFocus
        />
        {searchQuery && (
          <button style={searchStyles.clearBtn} onClick={() => setSearchQuery('')}>✕</button>
        )}
      </div>

      <div style={searchStyles.tabs}>
        {(['top', 'users', 'posts'] as const).map((tab) => (
          <button
            key={tab}
            style={{
              ...searchStyles.tab,
              color: activeTab === tab ? '#fff' : '#888',
              fontWeight: activeTab === tab ? 700 : 500,
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && <div style={searchStyles.tabIndicator} />}
          </button>
        ))}
      </div>

      {searchQuery ? (
        <div style={searchStyles.results}>
          <PlaceholderContent icon="🔍" title={`Results for "${searchQuery}"`} description="Search functionality coming soon!" />
        </div>
      ) : (
        <div style={searchStyles.suggestions}>
          <h3 style={searchStyles.suggestionsTitle}>Try searching for</h3>
          <div style={searchStyles.suggestionsList}>
            {['#FactCheck', '#ClimateAction', '#TechNews', 'People you know'].map((suggestion) => (
              <button key={suggestion} style={searchStyles.suggestionItem} onClick={() => setSearchQuery(suggestion)}>
                <span>🔍</span> {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// Styles
// ============================================

const styles: Record<string, React.CSSProperties> = {
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

const placeholderStyles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px' },
  icon: { fontSize: '64px' },
  title: { fontSize: '24px', fontWeight: 800, color: '#fff', margin: 0 },
  description: { fontSize: '15px', color: '#888', textAlign: 'center', maxWidth: '300px' },
  badge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'rgba(0, 255, 0, 0.1)', border: '1px solid rgba(0, 255, 0, 0.3)', borderRadius: '20px', color: '#00FF00', fontSize: '14px', marginTop: '16px' },
};

const verificationsStyles: Record<string, React.CSSProperties> = {
  container: { padding: '16px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' },
  statCard: { backgroundColor: '#111', borderRadius: '12px', padding: '16px', textAlign: 'center', border: '1px solid #222' },
  statValue: { fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: '#888' },
  section: { marginTop: '24px' },
  sectionTitle: { fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px' },
};

const tokenStyles: Record<string, React.CSSProperties> = {
  container: { padding: '16px' },
  balanceCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px', backgroundColor: '#0a0a0a', border: '1px solid #00FF00', borderRadius: '20px', marginBottom: '20px' },
  balanceIcon: { fontSize: '48px', marginBottom: '8px' },
  balanceAmount: { fontSize: '48px', fontWeight: 900, color: '#00FF00', textShadow: '0 0 20px rgba(0, 255, 0, 0.3)' },
  balanceLabel: { fontSize: '16px', color: '#888', marginBottom: '4px' },
  usdValue: { fontSize: '14px', color: '#666', marginBottom: '24px' },
  actions: { display: 'flex', gap: '12px' },
  btn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px', backgroundColor: 'transparent', border: '1px solid #333', borderRadius: '25px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  btnPrimary: { display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px', backgroundColor: '#00FF00', border: 'none', borderRadius: '25px', color: '#000', fontSize: '14px', fontWeight: 700, cursor: 'pointer' },
  earnSection: { backgroundColor: '#0a0a0a', borderRadius: '16px', padding: '20px', border: '1px solid #222', marginBottom: '20px' },
  sectionTitle: { fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 16px 0' },
  earnItem: { display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: '1px solid #222' },
  earnIcon: { fontSize: '24px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', borderRadius: '10px' },
  earnInfo: { flex: 1 },
  earnTitle: { color: '#fff', fontSize: '15px', fontWeight: 600, marginBottom: '2px' },
  earnReward: { color: '#00FF00', fontSize: '13px' },
  historySection: { backgroundColor: '#0a0a0a', borderRadius: '16px', padding: '20px', border: '1px solid #222' },
  emptyHistory: { textAlign: 'center', padding: '40px 20px', color: '#666', fontSize: '14px' },
};

const settingsStyles: Record<string, React.CSSProperties> = {
  container: { padding: '0' },
  userHeader: { display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 16px', borderBottom: '1px solid #222' },
  userAvatar: { width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#00FF00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '24px', fontWeight: 700 },
  userInfo: { flex: 1 },
  userName: { color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '2px' },
  userEmail: { color: '#888', fontSize: '14px' },
  section: { borderBottom: '8px solid #111' },
  item: { display: 'flex', alignItems: 'center', gap: '16px', width: '100%', padding: '16px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #222', cursor: 'pointer', textAlign: 'left' },
  itemIcon: { fontSize: '20px', width: '24px', textAlign: 'center' },
  itemContent: { flex: 1 },
  itemLabel: { color: '#fff', fontSize: '16px', marginBottom: '2px' },
  itemDescription: { color: '#666', fontSize: '13px' },
  itemArrow: { color: '#666', fontSize: '20px' },
  logoutBtn: { width: 'calc(100% - 32px)', margin: '20px 16px', padding: '16px', backgroundColor: 'transparent', border: '1px solid #FF4444', borderRadius: '12px', color: '#FF4444', fontSize: '16px', fontWeight: 600, cursor: 'pointer' },
  version: { textAlign: 'center', padding: '20px', color: '#444', fontSize: '13px' },
};

const searchStyles: Record<string, React.CSSProperties> = {
  container: { padding: '0' },
  searchBox: { position: 'relative', padding: '12px 16px' },
  searchIcon: { position: 'absolute', left: '28px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' },
  searchInput: { width: '100%', backgroundColor: '#222', border: '1px solid #333', borderRadius: '9999px', padding: '12px 20px 12px 44px', color: '#fff', fontSize: '15px', outline: 'none' },
  clearBtn: { position: 'absolute', right: '28px', top: '50%', transform: 'translateY(-50%)', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#00FF00', border: 'none', color: '#000', fontSize: '12px', fontWeight: 700, cursor: 'pointer' },
  tabs: { display: 'flex', borderBottom: '1px solid #333' },
  tab: { flex: 1, padding: '16px', backgroundColor: 'transparent', border: 'none', fontSize: '15px', cursor: 'pointer', position: 'relative' },
  tabIndicator: { position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', width: '50px', height: '4px', backgroundColor: '#00FF00', borderRadius: '2px' },
  results: { padding: '20px' },
  suggestions: { padding: '20px 16px' },
  suggestionsTitle: { color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '16px' },
  suggestionsList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  suggestionItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '15px', cursor: 'pointer', textAlign: 'left' },
};

const loadingAnimations = `
  @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

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
  input:focus { border-color: #00FF00 !important; }
  textarea:focus { border-color: #00FF00 !important; }
`;

export default App;