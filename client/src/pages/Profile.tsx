import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import './Profile.css';

interface ProfileTab {
  id: string;
  label: string;
  count?: number;
}

const Profile: React.FC = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  // Demo profile data
  const profileData = {
    name: user?.name || 'Truth Seeker',
    username: user?.username || 'truthseeker',
    avatar: user?.avatar || 'https://via.placeholder.com/200',
    banner: 'https://via.placeholder.com/600x200',
    bio: 'Verifying truth, one post at a time. Early adopter of the Viurl Protocol. 🚀 VTOKEN holder.',
    location: 'Decentralized Web',
    website: 'viurl.com',
    joined: 'January 2025',
    following: 342,
    followers: 1289,
    verified: true,
    tokens: 5420,
    verifications: 892,
    trustScore: 98.5
  };

  const tabs: ProfileTab[] = [
    { id: 'posts', label: 'Posts', count: 234 },
    { id: 'replies', label: 'Replies', count: 89 },
    { id: 'media', label: 'Media', count: 45 },
    { id: 'verified', label: 'Verified', count: 156 },
    { id: 'likes', label: 'Likes', count: 423 }
  ];

  const posts = [
    {
      id: '1',
      content: 'Just reached 1000 verifications on Viurl! The community-driven truth verification is the future. 🎉',
      timestamp: '2h ago',
      likes: 45,
      verifications: 89,
      comments: 12,
      shares: 8,
      isVerified: true
    },
    {
      id: '2',
      content: 'The mathematical proof behind Viurl Protocol is fascinating. Byzantine fault tolerance ensures truth prevails even with 33% bad actors.',
      timestamp: '1d ago',
      likes: 123,
      verifications: 234,
      comments: 34,
      shares: 45,
      isVerified: true
    },
    {
      id: '3',
      content: 'Earned 50 VTOKENS today by verifying content! The reward mechanism really incentivizes quality fact-checking. 💚',
      timestamp: '2d ago',
      likes: 67,
      verifications: 145,
      comments: 23,
      shares: 19,
      isVerified: false
    }
  ];

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleEditProfile = () => {
    // Navigate to edit profile page
    console.log('Edit profile');
  };

  return (
    <div className="profile">
      {/* Header */}
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="profile-header-info">
          <h2>{profileData.name}</h2>
          <span className="post-count">{tabs[0].count} posts</span>
        </div>
      </div>

      {/* Banner */}
      <div className="profile-banner">
        <img src={profileData.banner} alt="Profile banner" />
      </div>

      {/* Profile Info */}
      <div className="profile-info">
        <div className="profile-avatar-section">
          <img 
            src={profileData.avatar} 
            alt={profileData.name}
            className="profile-avatar"
          />
          <div className="profile-actions">
            {user?.username === profileData.username ? (
              <button className="edit-profile-btn" onClick={handleEditProfile}>
                Edit profile
              </button>
            ) : (
              <>
                <button className="profile-action-btn">
                  <span>⋯</span>
                </button>
                <button className="profile-action-btn">
                  <span>✉️</span>
                </button>
                <button 
                  className={`follow-btn ${isFollowing ? 'following' : ''}`}
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="profile-details">
          <div className="profile-names">
            <h1 className="profile-name">
              {profileData.name}
              {profileData.verified && (
                <span className="verified-badge">✓</span>
              )}
            </h1>
            <span className="profile-username">@{profileData.username}</span>
          </div>

          <p className="profile-bio">{profileData.bio}</p>

          <div className="profile-meta">
            <span className="meta-item">
              <span className="meta-icon">📍</span>
              {profileData.location}
            </span>
            <span className="meta-item">
              <span className="meta-icon">🔗</span>
              <a href={`https://${profileData.website}`}>{profileData.website}</a>
            </span>
            <span className="meta-item">
              <span className="meta-icon">📅</span>
              Joined {profileData.joined}
            </span>
          </div>

          <div className="profile-stats">
            <button className="stat-link">
              <span className="stat-value">{profileData.following}</span>
              <span className="stat-label">Following</span>
            </button>
            <button className="stat-link">
              <span className="stat-value">{profileData.followers}</span>
              <span className="stat-label">Followers</span>
            </button>
          </div>
        </div>

        {/* Viurl Stats Card */}
        <div className="viurl-stats-card">
          <h3 className="stats-card-title">Viurl Stats</h3>
          <div className="viurl-stats">
            <div className="viurl-stat">
              <span className="viurl-stat-label">VTOKENS</span>
              <span className="viurl-stat-value">{profileData.tokens.toLocaleString()}</span>
            </div>
            <div className="viurl-stat">
              <span className="viurl-stat-label">Verifications</span>
              <span className="viurl-stat-value">{profileData.verifications}</span>
            </div>
            <div className="viurl-stat">
              <span className="viurl-stat-label">Trust Score</span>
              <span className="viurl-stat-value">{profileData.trustScore}%</span>
            </div>
          </div>
          <div className="trust-bar">
            <div 
              className="trust-progress" 
              style={{ width: `${profileData.trustScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
            {tab.count && <span className="tab-count">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="profile-feed">
        {posts.map((post) => (
          <article key={post.id} className="profile-post">
            <div className="post-avatar">
              <img src={profileData.avatar} alt={profileData.name} />
            </div>
            <div className="post-content">
              <div className="post-header">
                <span className="post-author">{profileData.name}</span>
                {profileData.verified && (
                  <span className="verified-badge">✓</span>
                )}
                <span className="post-username">@{profileData.username}</span>
                <span className="post-timestamp">· {post.timestamp}</span>
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
                
                <button className="post-action">
                  <span className="action-icon">🤍</span>
                  <span className="action-count">{post.likes}</span>
                </button>
                
                <button className="post-action verify-action">
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

export default Profile;