import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Explore.css';

interface TrendingItem {
  id: string;
  category: string;
  title: string;
  verifications: number;
  change: number;
  isVerified?: boolean;
}

interface TopVerifier {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verifications: number;
  tokens: number;
  trustScore: number;
  isFollowing: boolean;
}

const Explore: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('trending');

  // Trending topics data
  const trendingTopics: TrendingItem[] = [
    {
      id: '1',
      category: 'Technology · Trending',
      title: '#DecentralizedTruth',
      verifications: 45823,
      change: 12.5,
      isVerified: true
    },
    {
      id: '2',
      category: 'Crypto · Trending',
      title: 'VTOKEN',
      verifications: 38492,
      change: 45.2,
      isVerified: true
    },
    {
      id: '3',
      category: 'News · Verified',
      title: '#FactCheckFriday',
      verifications: 29384,
      change: -2.1,
      isVerified: true
    },
    {
      id: '4',
      category: 'Politics · Trending',
      title: 'Election Verification',
      verifications: 23847,
      change: 8.7,
      isVerified: false
    },
    {
      id: '5',
      category: 'Science · Verified',
      title: 'Climate Data',
      verifications: 19234,
      change: 15.3,
      isVerified: true
    },
    {
      id: '6',
      category: 'Entertainment · Trending',
      title: '#CelebFactCheck',
      verifications: 15672,
      change: 22.1,
      isVerified: false
    },
    {
      id: '7',
      category: 'Sports · Trending',
      title: 'Match Results',
      verifications: 12456,
      change: 5.8,
      isVerified: true
    },
    {
      id: '8',
      category: 'Business · Verified',
      title: 'Earnings Reports',
      verifications: 10234,
      change: -1.2,
      isVerified: true
    }
  ];

  // Top Verifiers data
  const topVerifiers: TopVerifier[] = [
    {
      id: '1',
      name: 'Truth Guardian',
      username: 'truthguardian',
      avatar: 'https://via.placeholder.com/48',
      verifications: 5823,
      tokens: 125000,
      trustScore: 99.8,
      isFollowing: false
    },
    {
      id: '2',
      name: 'Fact Hunter',
      username: 'facthunter',
      avatar: 'https://via.placeholder.com/48',
      verifications: 4562,
      tokens: 98500,
      trustScore: 98.5,
      isFollowing: true
    },
    {
      id: '3',
      name: 'Data Validator',
      username: 'datavalidator',
      avatar: 'https://via.placeholder.com/48',
      verifications: 3892,
      tokens: 87200,
      trustScore: 97.2,
      isFollowing: false
    },
    {
      id: '4',
      name: 'News Checker',
      username: 'newschecker',
      avatar: 'https://via.placeholder.com/48',
      verifications: 3421,
      tokens: 76800,
      trustScore: 96.8,
      isFollowing: false
    },
    {
      id: '5',
      name: 'Source Verifier',
      username: 'sourceverifier',
      avatar: 'https://via.placeholder.com/48',
      verifications: 2987,
      tokens: 65400,
      trustScore: 95.4,
      isFollowing: true
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality
    }
  };

  const handleFollowToggle = (userId: string) => {
    // Toggle follow state
    console.log('Toggle follow for user:', userId);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="explore">
      {/* Header */}
      <div className="explore-header">
        <h1>Explore</h1>
      </div>

      {/* Search Bar */}
      <div className="explore-search">
        <form onSubmit={handleSearch}>
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search for truth"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabs */}
      <div className="explore-tabs">
        <button
          className={`explore-tab ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => setActiveTab('trending')}
        >
          Trending
        </button>
        <button
          className={`explore-tab ${activeTab === 'verified' ? 'active' : ''}`}
          onClick={() => setActiveTab('verified')}
        >
          Verified Only
        </button>
        <button
          className={`explore-tab ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          News
        </button>
        <button
          className={`explore-tab ${activeTab === 'verifiers' ? 'active' : ''}`}
          onClick={() => setActiveTab('verifiers')}
        >
          Top Verifiers
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="explore-content">
        {activeTab === 'trending' && (
          <div className="trending-list">
            <div className="section-header">
              <h2>Trending on Viurl</h2>
              <span className="section-subtitle">Most verified topics in the last 24 hours</span>
            </div>
            
            {trendingTopics.map((topic, index) => (
              <div key={topic.id} className="trending-item">
                <div className="trending-rank">#{index + 1}</div>
                <div className="trending-content">
                  <div className="trending-header">
                    <span className="trending-category">{topic.category}</span>
                    {topic.isVerified && (
                      <span className="verified-indicator">✓ Verified</span>
                    )}
                  </div>
                  <div className="trending-title">{topic.title}</div>
                  <div className="trending-stats">
                    <span className="verification-count">
                      {formatNumber(topic.verifications)} verifications
                    </span>
                    <span className={`trend-change ${topic.change > 0 ? 'positive' : 'negative'}`}>
                      {topic.change > 0 ? '↑' : '↓'} {Math.abs(topic.change)}%
                    </span>
                  </div>
                </div>
                <button className="trending-more">⋯</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'verifiers' && (
          <div className="verifiers-list">
            <div className="section-header">
              <h2>Top Truth Verifiers</h2>
              <span className="section-subtitle">Most trusted users this week</span>
            </div>

            <div className="verifiers-grid">
              {topVerifiers.map((verifier) => (
                <div key={verifier.id} className="verifier-card">
                  <div className="verifier-header">
                    <img
                      src={verifier.avatar}
                      alt={verifier.name}
                      className="verifier-avatar"
                      onClick={() => navigate(`/profile/${verifier.username}`)}
                    />
                    <button
                      className={`follow-btn ${verifier.isFollowing ? 'following' : ''}`}
                      onClick={() => handleFollowToggle(verifier.id)}
                    >
                      {verifier.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                  
                  <div className="verifier-info">
                    <h3 className="verifier-name">{verifier.name}</h3>
                    <span className="verifier-username">@{verifier.username}</span>
                  </div>

                  <div className="verifier-stats">
                    <div className="stat">
                      <span className="stat-value">{formatNumber(verifier.verifications)}</span>
                      <span className="stat-label">Verifications</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{formatNumber(verifier.tokens)}</span>
                      <span className="stat-label">VTOKENS</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{verifier.trustScore}%</span>
                      <span className="stat-label">Trust Score</span>
                    </div>
                  </div>

                  <div className="trust-bar">
                    <div 
                      className="trust-progress"
                      style={{ width: `${verifier.trustScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'verified' && (
          <div className="verified-content">
            <div className="section-header">
              <h2>Verified Content Only</h2>
              <span className="section-subtitle">Community-verified truth</span>
            </div>
            <div className="verified-notice">
              <span className="notice-icon">✓</span>
              <div className="notice-text">
                <p>This section shows only content that has been verified by the Viurl community.</p>
                <p>Each piece has passed our consensus verification protocol.</p>
              </div>
            </div>
            {trendingTopics.filter(t => t.isVerified).map((topic, index) => (
              <div key={topic.id} className="trending-item">
                <div className="trending-rank">#{index + 1}</div>
                <div className="trending-content">
                  <div className="trending-header">
                    <span className="trending-category">{topic.category}</span>
                    <span className="verified-indicator">✓ Verified</span>
                  </div>
                  <div className="trending-title">{topic.title}</div>
                  <div className="trending-stats">
                    <span className="verification-count">
                      {formatNumber(topic.verifications)} verifications
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'news' && (
          <div className="news-content">
            <div className="section-header">
              <h2>Breaking News</h2>
              <span className="section-subtitle">Real-time verified news</span>
            </div>
            <div className="coming-soon">
              <span className="coming-soon-icon">📰</span>
              <h3>News Verification Coming Soon</h3>
              <p>Real-time news verification powered by the Viurl Protocol</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;