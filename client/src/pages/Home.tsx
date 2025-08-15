import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { addPost } from '../store/slices/feedSlice';
import './Home.css';

interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  verifications: number;
  comments: number;
  shares: number;
  isVerified: boolean;
  hasLiked: boolean;
  hasVerified: boolean;
}

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { posts } = useAppSelector((state) => state.feed);
  const { user } = useAppSelector((state) => state.auth);
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Sample posts for demo
  const [feedPosts, setFeedPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'Truth Seeker',
        username: 'truthseeker',
        avatar: 'https://via.placeholder.com/48',
        verified: true
      },
      content: 'Just verified my first piece of content on Viurl! The future of truth verification is here. 🚀 #DecentralizedTruth #VTOKEN',
      timestamp: '2h',
      likes: 42,
      verifications: 128,
      comments: 8,
      shares: 15,
      isVerified: true,
      hasLiked: false,
      hasVerified: false
    },
    {
      id: '2',
      author: {
        name: 'Crypto News',
        username: 'cryptonews',
        avatar: 'https://via.placeholder.com/48',
        verified: true
      },
      content: 'BREAKING: VTOKEN price surges 45% as more users join the truth verification protocol. The community-driven approach to fighting misinformation is gaining traction! 📈',
      timestamp: '5h',
      likes: 234,
      verifications: 567,
      comments: 45,
      shares: 89,
      isVerified: true,
      hasLiked: true,
      hasVerified: true
    },
    {
      id: '3',
      author: {
        name: 'Tech Reporter',
        username: 'techreporter',
        avatar: 'https://via.placeholder.com/48',
        verified: false
      },
      content: 'Viurl Protocol analysis: Byzantine fault tolerance ensures 99.9% uptime even with 33% malicious nodes. Mathematical proof beats fake news every time.',
      timestamp: '8h',
      likes: 89,
      verifications: 203,
      comments: 23,
      shares: 34,
      isVerified: true,
      hasLiked: false,
      hasVerified: false
    }
  ]);

  const handlePost = async () => {
    if (!postContent.trim()) return;
    
    setIsPosting(true);
    
    // Create new post
    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        name: user?.name || 'User',
        username: user?.username || 'username',
        avatar: user?.avatar || 'https://via.placeholder.com/48',
        verified: false
      },
      content: postContent,
      timestamp: 'now',
      likes: 0,
      verifications: 0,
      comments: 0,
      shares: 0,
      isVerified: false,
      hasLiked: false,
      hasVerified: false
    };

    // Add to feed
    setFeedPosts([newPost, ...feedPosts]);
    setPostContent('');
    
    // Simulate API call
    setTimeout(() => {
      setIsPosting(false);
    }, 500);
  };

  const handleVerify = (postId: string) => {
    setFeedPosts(feedPosts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            hasVerified: !post.hasVerified,
            verifications: post.hasVerified ? post.verifications - 1 : post.verifications + 1
          }
        : post
    ));
  };

  const handleLike = (postId: string) => {
    setFeedPosts(feedPosts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            hasLiked: !post.hasLiked,
            likes: post.hasLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  return (
    <div className="home">
      {/* Header */}
      <div className="home-header">
        <h1>Home</h1>
        <div className="header-tabs">
          <button className="tab active">For you</button>
          <button className="tab">Following</button>
          <button className="tab">Verified</button>
        </div>
      </div>

      {/* Post Composer */}
      <div className="post-composer">
        <div className="composer-main">
          <img 
            src={user?.avatar || 'https://via.placeholder.com/48'} 
            alt="Your avatar" 
            className="composer-avatar"
          />
          <div className="composer-input-area">
            <textarea
              className="composer-input"
              placeholder="What's the truth?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              maxLength={280}
            />
            
            {postContent && (
              <div className="composer-footer">
                <div className="composer-actions">
                  <button className="composer-action-btn" title="Add image">
                    🖼️
                  </button>
                  <button className="composer-action-btn" title="Add GIF">
                    🎬
                  </button>
                  <button className="composer-action-btn" title="Add poll">
                    📊
                  </button>
                  <button className="composer-action-btn" title="Add emoji">
                    😊
                  </button>
                  <button className="composer-action-btn" title="Schedule">
                    📅
                  </button>
                </div>
                <div className="composer-submit">
                  <span className="char-count">
                    {280 - postContent.length}
                  </span>
                  <button 
                    className="verify-btn"
                    onClick={handlePost}
                    disabled={!postContent.trim() || isPosting}
                  >
                    {isPosting ? 'Posting...' : 'Verify'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="feed">
        {feedPosts.map((post) => (
          <article key={post.id} className="post">
            <div className="post-avatar">
              <img src={post.author.avatar} alt={post.author.name} />
            </div>
            <div className="post-content">
              <div className="post-header">
                <span className="post-author">{post.author.name}</span>
                {post.author.verified && (
                  <span className="verified-badge">✓</span>
                )}
                <span className="post-username">@{post.author.username}</span>
                <span className="post-timestamp">· {post.timestamp}</span>
                <button className="post-more">⋯</button>
              </div>
              
              <div className="post-text">{post.content}</div>
              
              {post.isVerified && (
                <div className="verification-badge">
                  <span className="badge-icon">✓</span>
                  <span className="badge-text">Verified Content</span>
                </div>
              )}
              
              <div className="post-actions">
                <button className="post-action">
                  <span className="action-icon">💬</span>
                  <span className="action-count">{post.comments}</span>
                </button>
                
                <button className="post-action">
                  <span className="action-icon">🔄</span>
                  <span className="action-count">{post.shares}</span>
                </button>
                
                <button 
                  className={`post-action ${post.hasLiked ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  <span className="action-icon">{post.hasLiked ? '❤️' : '🤍'}</span>
                  <span className="action-count">{post.likes}</span>
                </button>
                
                <button 
                  className={`post-action verify-action ${post.hasVerified ? 'verified' : ''}`}
                  onClick={() => handleVerify(post.id)}
                >
                  <span className="action-icon">✓</span>
                  <span className="action-count">{post.verifications}</span>
                </button>
                
                <button className="post-action">
                  <span className="action-icon">📤</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Home;