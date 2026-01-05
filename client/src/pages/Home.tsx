// Home.tsx - VIURL Main Feed Page
// Location: client/src/pages/Home.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchFeed, resetFeed } from '../store/slices/feedSlice';
import CreatePost from '../components/Post/CreatePost';
import PostCard from '../components/Post/PostCard';
import type { Post } from '../types';

// API Base URL
const API_BASE = 'https://viurl.com';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { posts, loading, error, hasMore, page } = useAppSelector((state) => state.feed);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch feed on mount
  useEffect(() => {
    dispatch(fetchFeed(1));
  }, [dispatch]);

  // Handle tab change
  const handleTabChange = (tab: 'for-you' | 'following') => {
    setActiveTab(tab);
    dispatch(resetFeed());
    dispatch(fetchFeed(1));
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    dispatch(resetFeed());
    await dispatch(fetchFeed(1));
    setIsRefreshing(false);
  };

  // Handle load more (infinite scroll)
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      dispatch(fetchFeed(page + 1));
    }
  }, [dispatch, loading, hasMore, page]);

  // Infinite scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 1000) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleLoadMore]);

  // Handle post verification
  const handleVerify = async (postId: string) => {
    if (!isAuthenticated) {
      alert('Please login to verify posts');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/posts/${postId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Refresh feed to show updated verification
        dispatch(fetchFeed(1));
      }
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  // Handle repost
  const handleRepost = async (postId: string) => {
    if (!isAuthenticated) {
      alert('Please login to repost');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/posts/${postId}/repost`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        dispatch(fetchFeed(1));
      }
    } catch (error) {
      console.error('Repost failed:', error);
    }
  };

  // Handle bookmark
  const handleBookmark = async (postId: string) => {
    if (!isAuthenticated) {
      alert('Please login to bookmark');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        dispatch(fetchFeed(1));
      }
    } catch (error) {
      console.error('Bookmark failed:', error);
    }
  };

  // Handle comment click
  const handleComment = (postId: string) => {
    // Navigate to post detail or open comment modal
    console.log('Open comments for:', postId);
  };

  // Handle share
  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}/post/${postId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post on VIURL',
          url: url
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
      {/* Header with Tabs */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.headerTitle}>Home</h1>
          {/* Refresh Button */}
          <button 
            style={styles.refreshBtn}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <span style={{
              ...styles.refreshIcon,
              ...(isRefreshing ? styles.refreshIconSpinning : {})
            }}>
              🔄
            </span>
          </button>
        </div>
        
        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'for-you' ? styles.tabActive : {})
            }}
            onClick={() => handleTabChange('for-you')}
          >
            <span style={styles.tabText}>For you</span>
            {activeTab === 'for-you' && <div style={styles.tabIndicator} />}
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'following' ? styles.tabActive : {})
            }}
            onClick={() => handleTabChange('following')}
          >
            <span style={styles.tabText}>Following</span>
            {activeTab === 'following' && <div style={styles.tabIndicator} />}
          </button>
        </div>
      </div>

      {/* Create Post Section */}
      {isAuthenticated && (
        <div style={styles.createPostSection}>
          <CreatePost 
            onPost={() => dispatch(fetchFeed(1))}
          />
        </div>
      )}

      {/* Not Logged In Banner */}
      {!isAuthenticated && (
        <div style={styles.loginBanner}>
          <div style={styles.loginBannerContent}>
            <span style={styles.loginIcon}>🔐</span>
            <div style={styles.loginText}>
              <strong>Join VIURL Today</strong>
              <p>Sign up to verify content and earn V-TKN tokens!</p>
            </div>
            <button style={styles.loginBtn}>Sign up</button>
            <button style={styles.loginBtnOutline}>Log in</button>
          </div>
        </div>
      )}

      {/* Feed Divider */}
      <div style={styles.feedDivider} />

      {/* Posts Feed */}
      <div style={styles.feed}>
        {/* Loading State (Initial) */}
        {loading && posts.length === 0 && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}>
              <div style={styles.spinnerRing} />
            </div>
            <p style={styles.loadingText}>Loading your feed...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={styles.errorContainer}>
            <span style={styles.errorIcon}>⚠️</span>
            <p style={styles.errorText}>{error}</p>
            <button 
              style={styles.retryBtn}
              onClick={() => dispatch(fetchFeed(1))}
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div style={styles.emptyContainer}>
            <span style={styles.emptyIcon}>📭</span>
            <h3 style={styles.emptyTitle}>No posts yet</h3>
            <p style={styles.emptyText}>
              {activeTab === 'following' 
                ? "Follow some people to see their posts here!"
                : "Be the first to share something with the VIURL community!"}
            </p>
            {isAuthenticated && (
              <button style={styles.createFirstBtn}>
                Create your first post
              </button>
            )}
          </div>
        )}

        {/* Posts List */}
        {posts.map((post: Post) => (
          <PostCard
            key={post._id}
            post={post}
            onVerify={handleVerify}
            onRepost={handleRepost}
            onBookmark={handleBookmark}
            onComment={handleComment}
            onShare={handleShare}
          />
        ))}

        {/* Loading More Indicator */}
        {loading && posts.length > 0 && (
          <div style={styles.loadingMore}>
            <div style={styles.spinnerSmall} />
            <span>Loading more...</span>
          </div>
        )}

        {/* End of Feed */}
        {!loading && !hasMore && posts.length > 0 && (
          <div style={styles.endOfFeed}>
            <div style={styles.endLine} />
            <span style={styles.endText}>You're all caught up! ✅</span>
            <div style={styles.endLine} />
          </div>
        )}
      </div>

      {/* Floating "New Posts" Button */}
      {/* This would show when new posts are available */}
      {/* 
      <button style={styles.newPostsBtn}>
        <span>↑</span> New posts available
      </button>
      */}
    </>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #2a2a2a',
    zIndex: 100,
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#fff',
    margin: 0,
  },
  refreshBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    transition: 'background-color 0.2s ease',
  },
  refreshIcon: {
    fontSize: '20px',
    display: 'inline-block',
    transition: 'transform 0.3s ease',
  },
  refreshIconSpinning: {
    animation: 'spin 1s linear infinite',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #2a2a2a',
  },
  tab: {
    flex: 1,
    padding: '16px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s ease',
  },
  tabActive: {},
  tabText: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#888',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '56px',
    height: '4px',
    backgroundColor: '#00FF00',
    borderRadius: '2px',
  },
  createPostSection: {
    borderBottom: '1px solid #2a2a2a',
  },
  loginBanner: {
    padding: '16px',
    backgroundColor: '#0a0a0a',
    borderBottom: '1px solid #2a2a2a',
  },
  loginBannerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  loginIcon: {
    fontSize: '32px',
  },
  loginText: {
    flex: 1,
    minWidth: '200px',
    color: '#fff',
  },
  loginBtn: {
    padding: '10px 20px',
    backgroundColor: '#00FF00',
    color: '#000',
    border: 'none',
    borderRadius: '25px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  loginBtnOutline: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: '#00FF00',
    border: '1px solid #00FF00',
    borderRadius: '25px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  feedDivider: {
    height: '8px',
    backgroundColor: '#101010',
    borderBottom: '1px solid #2a2a2a',
  },
  feed: {
    minHeight: '50vh',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '20px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    position: 'relative',
  },
  spinnerRing: {
    width: '100%',
    height: '100%',
    border: '3px solid #333',
    borderTopColor: '#00FF00',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#888',
    fontSize: '15px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '16px',
  },
  errorIcon: {
    fontSize: '48px',
  },
  errorText: {
    color: '#FF4444',
    fontSize: '15px',
    textAlign: 'center',
  },
  retryBtn: {
    padding: '10px 24px',
    backgroundColor: 'transparent',
    color: '#00FF00',
    border: '1px solid #00FF00',
    borderRadius: '25px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '16px',
  },
  emptyIcon: {
    fontSize: '64px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#fff',
    margin: 0,
  },
  emptyText: {
    color: '#888',
    fontSize: '15px',
    textAlign: 'center',
    maxWidth: '300px',
  },
  createFirstBtn: {
    padding: '12px 24px',
    backgroundColor: '#00FF00',
    color: '#000',
    border: 'none',
    borderRadius: '25px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '8px',
  },
  loadingMore: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '20px',
    color: '#888',
    fontSize: '14px',
  },
  spinnerSmall: {
    width: '20px',
    height: '20px',
    border: '2px solid #333',
    borderTopColor: '#00FF00',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  endOfFeed: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '40px 20px',
  },
  endLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#2a2a2a',
  },
  endText: {
    color: '#00FF00',
    fontSize: '14px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  newPostsBtn: {
    position: 'fixed',
    top: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 24px',
    backgroundColor: '#00FF00',
    color: '#000',
    border: 'none',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0, 255, 0, 0.4)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
};

// Add keyframes for spinner
const spinKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Inject keyframes
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}
export default Home;