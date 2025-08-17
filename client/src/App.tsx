import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector } from './hooks/useRedux';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// App Content Component (needs access to Redux)
const AppContent = () => {
  const { darkMode } = useAppSelector((state) => state.user);
  
  useEffect(() => {
    // Apply dark mode class to body
    document.body.classList.toggle('dark', darkMode);
    
    // Set CSS variables
    if (darkMode) {
      document.documentElement.style.setProperty('--bg-primary', '#000000');
      document.documentElement.style.setProperty('--text-primary', '#e7e9ea');
    } else {
      document.documentElement.style.setProperty('--bg-primary', '#ffffff');
      document.documentElement.style.setProperty('--text-primary', '#0f1419');
    }
  }, [darkMode]);

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes with Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:username" element={<Profile />} />
          <Route path="notifications" element={<div>Notifications Page</div>} />
          <Route path="messages" element={<div>Messages Page</div>} />
          <Route path="bookmarks" element={<div>Bookmarks Page</div>} />
          <Route path="verified" element={<div>Verified Page</div>} />
        </Route>
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;