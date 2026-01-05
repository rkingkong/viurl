import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onCreatePost?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage = 'home', onNavigate }) => {
  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#000',
    } as React.CSSProperties,
    main: {
      flex: 1,
      marginLeft: '275px',
    } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
