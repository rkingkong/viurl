import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './hooks/useRedux';
import { checkAuth } from './store/slices/authSlice';
import Sidebar from './components/Layout/Sidebar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Explore from './pages/Explore';
import Login from './pages/Login';

interface RouteParams {
  userId?: string;
  postId?: string;
}

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const [currentRoute, setCurrentRoute] = useState('home');
  const [routeParams, setRouteParams] = useState<RouteParams>({});

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const handleNavigate = (route: string, params?: RouteParams) => {
    setCurrentRoute(route);
    if (params) setRouteParams(params);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingLogo}>VIURL</div>
        <div style={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onSuccess={() => handleNavigate('home')} />;
  }

  const renderPage = () => {
    switch (currentRoute) {
      case 'home':
        return <Home />;
      case 'profile':
        return <Profile userId={routeParams.userId} />;
      case 'messages':
        return <Messages />;
      case 'notifications':
        return <Notifications />;
      case 'explore':
        return <Explore />;
      default:
        return <Home />;
    }
  };

  return (
    <div style={styles.appContainer}>
      <Sidebar activeRoute={currentRoute} onNavigate={handleNavigate} />
      <main style={styles.mainContent}>
        {renderPage()}
      </main>
    </div>
  );
};

const styles = {
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#000',
  } as React.CSSProperties,
  mainContent: {
    flex: 1,
    marginLeft: '275px',
  } as React.CSSProperties,
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#000',
    color: '#fff',
  } as React.CSSProperties,
  loadingLogo: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#00FF00',
    marginBottom: '20px',
  } as React.CSSProperties,
  loadingText: {
    fontSize: '16px',
    color: '#888',
  } as React.CSSProperties,
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
