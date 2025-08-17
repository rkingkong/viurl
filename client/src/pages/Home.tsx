import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { createPost, fetchFeed } from '../store/slices/feedSlice';
import type { Post } from '../types';
import './Home.css';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { posts, loading } = useAppSelector((state) => state.feed);
  const { user } = useAppSelector((state) => state.auth);
  const [postContent, setPostContent] = useState('');

  useEffect(() => {
    dispatch(fetchFeed(1));
  }, [dispatch]);

  const handleCreatePost = async () => {
    if (postContent.trim()) {
      await dispatch(createPost(postContent));
      setPostContent('');
    }
  };

  const getAvatarUrl = (userData: any) => {
    if (userData?.profilePicture) return userData.profilePicture;
    if (userData?.avatar) return userData.avatar;
    const name = userData?.name || userData?.username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00ff00&color=000`;
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <h1 className="home-title">Home</h1>
      </header>

      {/* Create Post */}
      <div className="create-post-container">
        <div className="create-post-wrapper">
          <img
            src={getAvatarUrl(user)}
            alt={user?.username}
            className="post-avatar"
          />
          <div className="post-form">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="post-input"
              placeholder="What's happening?"
              rows={2}
            />
            <div className="post-actions">
              <div className="post-tools">
                <button className="tool-btn">📷</button>
                <button className="tool-btn">🎥</button>
                <button className="tool-btn">📊</button>
                <button className="tool-btn">😊</button>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={!postContent.trim()}
                className="post-submit-btn"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="feed-container">
        {loading && posts.length === 0 ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-feed">
            <p>No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post: Post) => (
            <article key={post._id} className="post-card">
              <div className="post-content-wrapper">
                <img
                  src={getAvatarUrl(post.author)}
                  alt={post.author.username}
                  className="post-author-avatar"
                />
                <div className="post-main">
                  <div className="post-header">
                    <span className="post-author-name">
                      {post.author.name || post.author.username}
                    </span>
                    <span className="post-author-handle">
                      @{post.author.username}
                    </span>
                    <span className="post-date">·</span>
                    <span className="post-date">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="post-text">{post.content}</div>
                  <div className="post-actions-bar">
                    <button className="post-action-btn">
                      💬 {post.comments?.length || 0}
                    </button>
                    <button className="post-action-btn">
                      🔄 {post.retweets?.length || 0}
                    </button>
                    <button className="post-action-btn">
                      ❤️ {post.likes?.length || 0}
                    </button>
                    <button className="post-action-btn">
                      📤
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
