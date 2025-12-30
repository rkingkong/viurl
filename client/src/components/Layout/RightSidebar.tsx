// RightSidebar.tsx - VIURL Right Sidebar Widgets
// Location: client/src/components/Layout/RightSidebar.tsx

import React, { useState } from 'react';

interface TrendingTopic {
  id: string;
  category: string;
  topic: string;
  postCount: number;
  isVerified?: boolean;
}

interface SuggestedUser {
  _id: string;
  username: string;
  name: string;
  profilePicture?: string;
  isVerified?: boolean;
  verificationBadge?: string;
  trustScore?: number;
  bio?: string;
}

interface LeaderboardUser {
  _id: string;
  username: string;
  name: string;
  profilePicture?: string;
  vtokens: number;
  verificationBadge?: string;
  rank: number;
}

interface RightSidebarProps {
  trendingTopics?: TrendingTopic[];
  suggestedUsers?: SuggestedUser[];
  leaderboard?: LeaderboardUser[];
  onSearch?: (query: string) => void;
  onFollowUser?: (userId: string) => void;
  onTopicClick?: (topic: string) => void;
}

// Mock data for demonstration
const DEFAULT_TRENDING: TrendingTopic[] = [
  { id: '1', category: 'Technology', topic: 'Blockchain', postCount: 12500, isVerified: true },
  { id: '2', category: 'Crypto', topic: 'Bitcoin', postCount: 8900 },
  { id: '3', category: 'VIURL', topic: 'TruthVerification', postCount: 5600, isVerified: true },
  { id: '4', category: 'Science', topic: 'AIResearch', postCount: 4200 },
  { id: '5', category: 'Politics', topic: 'Election2024', postCount: 3800 },
];

const DEFAULT_SUGGESTED: SuggestedUser[] = [
  { _id: '1', username: 'satoshi', name: 'Satoshi N.', isVerified: true, verificationBadge: 'platinum', trustScore: 98, bio: 'Bitcoin creator' },
  { _id: '2', username: 'vitalik', name: 'Vitalik B.', isVerified: true, verificationBadge: 'gold', trustScore: 95, bio: 'Ethereum co-founder' },
  { _id: '3', username: 'truthseeker', name: 'Truth Seeker', verificationBadge: 'silver', trustScore: 87, bio: 'Fact-checker' },
];

const DEFAULT_LEADERBOARD: LeaderboardUser[] = [
  { _id: '1', username: 'verifier_king', name: 'Verification King', vtokens: 125000, verificationBadge: 'platinum', rank: 1 },
  { _id: '2', username: 'truth_hunter', name: 'Truth Hunter', vtokens: 98500, verificationBadge: 'gold', rank: 2 },
  { _id: '3', username: 'fact_master', name: 'Fact Master', vtokens: 87200, verificationBadge: 'gold', rank: 3 },
];

const RightSidebar: React.FC<RightSidebarProps> = ({
  trendingTopics = DEFAULT_TRENDING,
  suggestedUsers = DEFAULT_SUGGESTED,
  leaderboard = DEFAULT_LEADERBOARD,
  onSearch,
  onFollowUser,
  onTopicClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Get avatar URL
  const getAvatarUrl = (user: any) => {
    if (user?.profilePicture) return user.profilePicture;
    const name = user?.name || user?.username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00ff00&color=000&bold=true`;
  };

  // Get badge icon
  const getBadgeIcon = (badge?: string) => {
    const badges: { [key: string]: string } = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎'
    };
    return badges[badge || ''] || '';
  };

  // Get rank medal
  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // Format number
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
    }
  };

  return (
    <aside style={styles.sidebar}>
      {/* Search Box */}
      <div style={styles.searchContainer}>
        <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
          <div style={{
            ...styles.searchBox,
            ...(searchFocused ? styles.searchBoxFocused : {})
          }}>
            <span style={{
              ...styles.searchIcon,
              ...(searchFocused ? styles.searchIconFocused : {})
            }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Search VIURL"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={styles.clearBtn}
              >
                ✕
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Token Leaderboard */}
      <div style={styles.widget}>
        <h2 style={styles.widgetTitle}>
          <span>🏆</span> V-TKN Leaderboard
        </h2>
        <div style={styles.leaderboardList}>
          {leaderboard.map((user) => (
            <div key={user._id} style={styles.leaderboardItem}>
              <span style={styles.rankMedal}>{getRankMedal(user.rank)}</span>
              <img
                src={getAvatarUrl(user)}
                alt={user.username}
                style={styles.leaderboardAvatar}
              />
              <div style={styles.leaderboardInfo}>
                <div style={styles.leaderboardName}>
                  {user.name}
                  {getBadgeIcon(user.verificationBadge) && (
                    <span style={styles.badge}>{getBadgeIcon(user.verificationBadge)}</span>
                  )}
                </div>
                <div style={styles.leaderboardHandle}>@{user.username}</div>
              </div>
              <div style={styles.leaderboardTokens}>
                <span style={styles.tokenAmount}>{formatNumber(user.vtokens)}</span>
                <span style={styles.tokenLabel}>V-TKN</span>
              </div>
            </div>
          ))}
        </div>
        <button style={styles.showMoreBtn}>
          Show more
        </button>
      </div>

      {/* Trending Topics */}
      <div style={styles.widget}>
        <h2 style={styles.widgetTitle}>
          <span>🔥</span> Trending
        </h2>
        <div style={styles.trendingList}>
          {trendingTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onTopicClick?.(topic.topic)}
              style={styles.trendingItem}
            >
              <div style={styles.trendingCategory}>
                {topic.category} · Trending
              </div>
              <div style={styles.trendingTopic}>
                #{topic.topic}
                {topic.isVerified && (
                  <span style={styles.verifiedTopic}>✅</span>
                )}
              </div>
              <div style={styles.trendingCount}>
                {formatNumber(topic.postCount)} posts
              </div>
              <button style={styles.trendingMore}>•••</button>
            </button>
          ))}
        </div>
        <button style={styles.showMoreBtn}>
          Show more
        </button>
      </div>

      {/* Who to Follow */}
      <div style={styles.widget}>
        <h2 style={styles.widgetTitle}>
          <span>👥</span> Who to follow
        </h2>
        <div style={styles.suggestedList}>
          {suggestedUsers.map((user) => (
            <div key={user._id} style={styles.suggestedItem}>
              <img
                src={getAvatarUrl(user)}
                alt={user.username}
                style={styles.suggestedAvatar}
              />
              <div style={styles.suggestedInfo}>
                <div style={styles.suggestedName}>
                  {user.name}
                  {user.isVerified && (
                    <span style={styles.verifiedCheck}>✓</span>
                  )}
                  {getBadgeIcon(user.verificationBadge) && (
                    <span style={styles.badge}>{getBadgeIcon(user.verificationBadge)}</span>
                  )}
                </div>
                <div style={styles.suggestedHandle}>@{user.username}</div>
                {user.trustScore && (
                  <div style={styles.trustScoreSmall}>
                    Trust: {user.trustScore}
                  </div>
                )}
              </div>
              <button
                onClick={() => onFollowUser?.(user._id)}
                style={styles.followBtn}
              >
                Follow
              </button>
            </div>
          ))}
        </div>
        <button style={styles.showMoreBtn}>
          Show more
        </button>
      </div>

      {/* Verification Stats */}
      <div style={styles.widget}>
        <h2 style={styles.widgetTitle}>
          <span>📊</span> Platform Stats
        </h2>
        <div style={styles.statsGrid}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>1.2M</div>
            <div style={styles.statLabel}>Verifications</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>98.7%</div>
            <div style={styles.statLabel}>Accuracy</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>45K</div>
            <div style={styles.statLabel}>Verifiers</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>2.5M</div>
            <div style={styles.statLabel}>V-TKN Earned</div>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div style={styles.footer}>
        <a href="/terms" style={styles.footerLink}>Terms of Service</a>
        <a href="/privacy" style={styles.footerLink}>Privacy Policy</a>
        <a href="/cookies" style={styles.footerLink}>Cookie Policy</a>
        <a href="/accessibility" style={styles.footerLink}>Accessibility</a>
        <a href="/ads" style={styles.footerLink}>Ads info</a>
        <a href="/about" style={styles.footerLink}>About</a>
        <span style={styles.footerLink}>© 2024 VIURL</span>
      </div>
    </aside>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: '350px',
    height: '100vh',
    padding: '0 20px',
    overflowY: 'auto',
    position: 'sticky',
    top: 0,
  },
  searchContainer: {
    position: 'sticky',
    top: 0,
    paddingTop: '12px',
    paddingBottom: '12px',
    backgroundColor: '#000',
    zIndex: 10,
  },
  searchForm: {
    width: '100%',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#202020',
    borderRadius: '25px',
    border: '1px solid transparent',
    transition: 'all 0.2s ease',
  },
  searchBoxFocused: {
    backgroundColor: '#000',
    border: '1px solid #00FF00',
    boxShadow: '0 0 10px rgba(0, 255, 0, 0.2)',
  },
  searchIcon: {
    fontSize: '16px',
    color: '#888',
    transition: 'color 0.2s ease',
  },
  searchIconFocused: {
    color: '#00FF00',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '15px',
  },
  clearBtn: {
    backgroundColor: '#00FF00',
    color: '#000',
    border: 'none',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  widget: {
    backgroundColor: '#101010',
    borderRadius: '16px',
    marginBottom: '16px',
    overflow: 'hidden',
  },
  widgetTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    margin: 0,
    fontSize: '20px',
    fontWeight: 800,
    color: '#fff',
    borderBottom: '1px solid #2a2a2a',
  },
  leaderboardList: {
    padding: '0',
  },
  leaderboardItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid #1a1a1a',
    transition: 'background-color 0.2s ease',
    cursor: 'pointer',
  },
  rankMedal: {
    fontSize: '20px',
    width: '28px',
    textAlign: 'center',
  },
  leaderboardAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  leaderboardInfo: {
    flex: 1,
    minWidth: 0,
  },
  leaderboardName: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '15px',
    fontWeight: 700,
    color: '#fff',
  },
  leaderboardHandle: {
    fontSize: '13px',
    color: '#888',
  },
  leaderboardTokens: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  tokenAmount: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#00FF00',
  },
  tokenLabel: {
    fontSize: '11px',
    color: '#666',
  },
  trendingList: {
    padding: '0',
  },
  trendingItem: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '1px solid #1a1a1a',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    position: 'relative',
  },
  trendingCategory: {
    fontSize: '13px',
    color: '#888',
    marginBottom: '2px',
  },
  trendingTopic: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '15px',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '2px',
  },
  verifiedTopic: {
    fontSize: '14px',
  },
  trendingCount: {
    fontSize: '13px',
    color: '#888',
  },
  trendingMore: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '50%',
    fontSize: '14px',
  },
  suggestedList: {
    padding: '0',
  },
  suggestedItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid #1a1a1a',
    transition: 'background-color 0.2s ease',
  },
  suggestedAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  suggestedInfo: {
    flex: 1,
    minWidth: 0,
  },
  suggestedName: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '15px',
    fontWeight: 700,
    color: '#fff',
  },
  verifiedCheck: {
    backgroundColor: '#00FF00',
    color: '#000',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  badge: {
    fontSize: '14px',
  },
  suggestedHandle: {
    fontSize: '14px',
    color: '#888',
  },
  trustScoreSmall: {
    fontSize: '12px',
    color: '#00FF00',
    marginTop: '2px',
  },
  followBtn: {
    padding: '8px 16px',
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  showMoreBtn: {
    display: 'block',
    width: '100%',
    padding: '16px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#00FF00',
    fontSize: '15px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1px',
    backgroundColor: '#2a2a2a',
  },
  statItem: {
    padding: '16px',
    backgroundColor: '#101010',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#00FF00',
    textShadow: '0 0 10px rgba(0, 255, 0, 0.3)',
  },
  statLabel: {
    fontSize: '13px',
    color: '#888',
    marginTop: '4px',
  },
  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '16px 0',
  },
  footerLink: {
    fontSize: '13px',
    color: '#666',
    textDecoration: 'none',
    cursor: 'pointer',
  },
};

export default RightSidebar;