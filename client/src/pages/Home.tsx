import React, { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchFeed, refreshFeed, likePost, repostPost, bookmarkPost, verifyPost } from '../store/slices/feedSlice';
import PostCard from '../components/Post/PostCard';
import CreatePost from '../components/Post/CreatePost';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { posts, loading, hasMore, page } = useAppSelector((state) => state.feed);

  useEffect(() => {
    dispatch(fetchFeed(1));
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(refreshFeed());
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      dispatch(fetchFeed(page + 1));
    }
  }, [dispatch, hasMore, loading, page]);

  const handleVerify = async (postId: string) => {
    await dispatch(verifyPost({
      postId,
      verdict: 'true',
      confidence: 80,
      evidence: [],
      reasoning: 'Verified as accurate',
    }));
  };

  const handleRepost = async (postId: string) => {
    await dispatch(repostPost(postId));
  };

  const handleBookmark = async (postId: string) => {
    await dispatch(bookmarkPost(postId));
  };

  const handleComment = (postId: string) => {
    console.log('Comment on:', postId);
  };

  const handleShare = async (postId: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'VIURL Post',
          url: `${window.location.origin}/post/${postId}`,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#000',
      minHeight: '100vh',
      color: '#fff',
    } as React.CSSProperties,
    header: {
      position: 'sticky' as const,
      top: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #333',
      padding: '15px 20px',
      zIndex: 100,
    } as React.CSSProperties,
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as React.CSSProperties,
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
    } as React.CSSProperties,
    tokenBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: '#00FF0020',
      color: '#00FF00',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 'bold' as const,
    } as React.CSSProperties,
    createSection: {
      padding: '0 20px',
      borderBottom: '1px solid #333',
    } as React.CSSProperties,
    feedSection: {
    } as React.CSSProperties,
    loadingText: {
      textAlign: 'center' as const,
      padding: '40px',
      color: '#888',
    } as React.CSSProperties,
    emptyState: {
      textAlign: 'center' as const,
      padding: '60px 20px',
      color: '#888',
    } as React.CSSProperties,
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px',
    } as React.CSSProperties,
    loadMoreBtn: {
      display: 'block',
      width: '100%',
      padding: '15px',
      backgroundColor: 'transparent',
      border: 'none',
      color: '#00FF00',
      fontSize: '14px',
      cursor: 'pointer',
    } as React.CSSProperties,
    refreshBtn: {
      backgroundColor: 'transparent',
      border: '1px solid #333',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '13px',
    } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Home</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={handleRefresh} style={styles.refreshBtn}>
              ↻ Refresh
            </button>
            {user && (
              <div style={styles.tokenBadge}>
                🪙 {user.vtokens || 0} V-TKN
              </div>
            )}
          </div>
        </div>
      </div>

      {user && (
        <div style={styles.createSection}>
          <CreatePost onPostCreated={handleRefresh} />
        </div>
      )}

      <div style={styles.feedSection}>
        {loading && posts.length === 0 ? (
          <div style={styles.loadingText}>Loading feed...</div>
        ) : posts.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <div>No posts yet</div>
            <div style={{ marginTop: '8px', fontSize: '14px' }}>
              Be the first to post something!
            </div>
          </div>
        ) : (
          <>
            {posts.map((post) => (
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
            {hasMore && (
              <button onClick={handleLoadMore} style={styles.loadMoreBtn} disabled={loading}>
                {loading ? 'Loading...' : 'Load more'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
