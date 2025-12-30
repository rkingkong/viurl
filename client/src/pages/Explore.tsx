import { useState, useEffect } from 'react';

interface TrendingTopic {
  id: string;
  hashtag: string;
  category: string;
  postCount: number;
  verificationRate: number;
}

interface SearchResult {
  id: string;
  type: 'user' | 'post' | 'hashtag';
  // User fields
  username?: string;
  name?: string;
  profilePicture?: string;
  trustScore?: number;
  verificationBadge?: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
  isFollowing?: boolean;
  // Post fields
  content?: string;
  author?: {
    username: string;
    name: string;
    profilePicture?: string;
  };
  verificationCount?: number;
  factCheckStatus?: 'unverified' | 'true' | 'false' | 'misleading' | 'partially_true';
  // Hashtag fields
  hashtag?: string;
  postCount?: number;
}

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'foryou' | 'trending' | 'news' | 'verified'>('foryou');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Mock trending topics
  const [trendingTopics] = useState<TrendingTopic[]>([
    { id: '1', hashtag: 'ClimateAction', category: 'Environment', postCount: 125400, verificationRate: 94.2 },
    { id: '2', hashtag: 'TechNews', category: 'Technology', postCount: 98200, verificationRate: 87.5 },
    { id: '3', hashtag: 'FactCheck', category: 'VIURL Verified', postCount: 76800, verificationRate: 99.1 },
    { id: '4', hashtag: 'Breaking', category: 'News', postCount: 234500, verificationRate: 78.3 },
    { id: '5', hashtag: 'Science', category: 'Education', postCount: 54300, verificationRate: 96.7 },
    { id: '6', hashtag: 'CryptoUpdate', category: 'Finance', postCount: 67800, verificationRate: 72.4 },
    { id: '7', hashtag: 'HealthTips', category: 'Health', postCount: 43200, verificationRate: 91.8 },
    { id: '8', hashtag: 'SportsFinal', category: 'Sports', postCount: 189000, verificationRate: 95.2 },
  ]);

  // Mock categories for "For You"
  const categories = [
    { name: 'Technology', icon: '💻', color: '#00FF00' },
    { name: 'Science', icon: '🔬', color: '#00BFFF' },
    { name: 'Politics', icon: '🏛️', color: '#FFD700' },
    { name: 'Health', icon: '🏥', color: '#FF6B6B' },
    { name: 'Finance', icon: '💰', color: '#50C878' },
    { name: 'Sports', icon: '⚽', color: '#FF8C00' },
    { name: 'Entertainment', icon: '🎬', color: '#DA70D6' },
    { name: 'Environment', icon: '🌍', color: '#32CD32' },
  ];

  // Mock verified news
  const verifiedNews = [
    {
      id: '1',
      title: 'New Study Confirms Renewable Energy Cost Reduction',
      source: 'Science Daily',
      timeAgo: '2h',
      verificationStatus: 'true' as const,
      verifiers: 1247,
      image: null,
    },
    {
      id: '2',
      title: 'Tech Giants Report Q4 Earnings Above Expectations',
      source: 'Reuters',
      timeAgo: '4h',
      verificationStatus: 'true' as const,
      verifiers: 892,
      image: null,
    },
    {
      id: '3',
      title: 'Viral Claim About New Policy - Fact Checked',
      source: 'VIURL Verified',
      timeAgo: '6h',
      verificationStatus: 'partially_true' as const,
      verifiers: 2341,
      image: null,
    },
  ];

  // Simulate search
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      setShowResults(true);
      
      // Simulate API delay
      const timer = setTimeout(() => {
        // Mock search results
        const mockResults: SearchResult[] = [
          {
            id: '1',
            type: 'user',
            username: 'truthseeker',
            name: 'Truth Seeker',
            trustScore: 94,
            verificationBadge: 'gold',
            isFollowing: false,
          },
          {
            id: '2',
            type: 'hashtag',
            hashtag: searchQuery.replace('#', ''),
            postCount: Math.floor(Math.random() * 50000),
          },
          {
            id: '3',
            type: 'post',
            content: `This is a sample post about ${searchQuery}...`,
            author: { username: 'factchecker', name: 'Fact Checker' },
            verificationCount: 156,
            factCheckStatus: 'true',
          },
        ];
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  }, [searchQuery]);

  const formatCount = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getVerificationColor = (status: string): string => {
    switch (status) {
      case 'true': return '#00FF00';
      case 'false': return '#FF4444';
      case 'misleading': return '#FF8800';
      case 'partially_true': return '#FFD700';
      default: return '#888';
    }
  };

  const getBadgeIcon = (badge: string): string => {
    switch (badge) {
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '';
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      borderLeft: '1px solid #333',
      borderRight: '1px solid #333',
    },
    header: {
      position: 'sticky' as const,
      top: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
      padding: '12px 16px',
      borderBottom: '1px solid #333',
    },
    searchContainer: {
      position: 'relative' as const,
    },
    searchInput: {
      width: '100%',
      backgroundColor: '#222',
      border: '1px solid #333',
      borderRadius: '9999px',
      padding: '12px 20px 12px 48px',
      color: '#fff',
      fontSize: '15px',
      outline: 'none',
      transition: 'all 0.2s',
    },
    searchIcon: {
      position: 'absolute' as const,
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#888',
      fontSize: '18px',
    },
    clearButton: {
      position: 'absolute' as const,
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: '#00FF00',
      border: 'none',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      color: '#000',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #333',
    },
    tab: (active: boolean) => ({
      flex: 1,
      padding: '16px',
      backgroundColor: 'transparent',
      border: 'none',
      color: active ? '#fff' : '#888',
      fontSize: '15px',
      fontWeight: active ? 700 : 500,
      cursor: 'pointer',
      position: 'relative' as const,
      transition: 'color 0.2s',
    }),
    tabIndicator: {
      position: 'absolute' as const,
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '60px',
      height: '4px',
      backgroundColor: '#00FF00',
      borderRadius: '2px',
    },
    content: {
      padding: '0',
    },
    searchResults: {
      position: 'absolute' as const,
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: '#000',
      border: '1px solid #333',
      borderRadius: '12px',
      marginTop: '8px',
      maxHeight: '400px',
      overflowY: 'auto' as const,
      zIndex: 200,
    },
    searchResultItem: {
      padding: '12px 16px',
      borderBottom: '1px solid #222',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'background-color 0.2s',
    },
    resultAvatar: {
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      backgroundColor: '#333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#00FF00',
      fontWeight: 700,
      fontSize: '18px',
    },
    resultInfo: {
      flex: 1,
    },
    resultName: {
      color: '#fff',
      fontWeight: 600,
      fontSize: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    resultMeta: {
      color: '#888',
      fontSize: '14px',
    },
    section: {
      padding: '16px',
      borderBottom: '1px solid #333',
    },
    sectionTitle: {
      color: '#fff',
      fontSize: '20px',
      fontWeight: 700,
      marginBottom: '16px',
    },
    categoriesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
    },
    categoryCard: (color: string) => ({
      backgroundColor: '#111',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '20px 16px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative' as const,
      overflow: 'hidden' as const,
    }),
    categoryIcon: {
      fontSize: '32px',
      marginBottom: '8px',
    },
    categoryName: {
      color: '#fff',
      fontSize: '16px',
      fontWeight: 600,
    },
    trendingItem: {
      padding: '12px 16px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      borderBottom: '1px solid #222',
    },
    trendingCategory: {
      color: '#888',
      fontSize: '13px',
      marginBottom: '4px',
    },
    trendingHashtag: {
      color: '#fff',
      fontSize: '16px',
      fontWeight: 700,
      marginBottom: '4px',
    },
    trendingStats: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '13px',
    },
    trendingPosts: {
      color: '#888',
    },
    verificationRate: (rate: number) => ({
      color: rate >= 90 ? '#00FF00' : rate >= 75 ? '#FFD700' : '#FF8800',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    }),
    newsCard: {
      padding: '16px',
      borderBottom: '1px solid #222',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    newsHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '8px',
    },
    newsSource: {
      color: '#888',
      fontSize: '13px',
    },
    newsTime: {
      color: '#666',
      fontSize: '13px',
    },
    newsTitle: {
      color: '#fff',
      fontSize: '16px',
      fontWeight: 600,
      lineHeight: 1.4,
      marginBottom: '12px',
    },
    newsFooter: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    verificationBadge: (status: string) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: '9999px',
      backgroundColor: `${getVerificationColor(status)}20`,
      color: getVerificationColor(status),
      fontSize: '13px',
      fontWeight: 600,
    }),
    verifierCount: {
      color: '#888',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    emptyState: {
      padding: '60px 20px',
      textAlign: 'center' as const,
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px',
    },
    emptyTitle: {
      color: '#fff',
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '8px',
    },
    emptyDescription: {
      color: '#888',
      fontSize: '14px',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header with Search */}
      <div style={styles.header}>
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search VIURL"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#00FF00';
              e.currentTarget.style.backgroundColor = '#000';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#333';
              e.currentTarget.style.backgroundColor = '#222';
            }}
          />
          {searchQuery && (
            <button
              style={styles.clearButton}
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}

          {/* Search Results Dropdown */}
          {showResults && (
            <div style={styles.searchResults}>
              {isSearching ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <div
                    key={result.id}
                    style={styles.searchResultItem}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {result.type === 'user' && (
                      <>
                        <div style={styles.resultAvatar}>
                          {result.name?.charAt(0)}
                        </div>
                        <div style={styles.resultInfo}>
                          <div style={styles.resultName}>
                            {result.name}
                            {result.verificationBadge && result.verificationBadge !== 'none' && (
                              <span>{getBadgeIcon(result.verificationBadge)}</span>
                            )}
                          </div>
                          <div style={styles.resultMeta}>
                            @{result.username} · Trust Score: {result.trustScore}%
                          </div>
                        </div>
                      </>
                    )}
                    {result.type === 'hashtag' && (
                      <>
                        <div style={{ ...styles.resultAvatar, backgroundColor: '#00FF0020', color: '#00FF00' }}>
                          #
                        </div>
                        <div style={styles.resultInfo}>
                          <div style={styles.resultName}>#{result.hashtag}</div>
                          <div style={styles.resultMeta}>{formatCount(result.postCount || 0)} posts</div>
                        </div>
                      </>
                    )}
                    {result.type === 'post' && (
                      <>
                        <div style={{ ...styles.resultAvatar, fontSize: '14px' }}>
                          📝
                        </div>
                        <div style={styles.resultInfo}>
                          <div style={{ ...styles.resultName, fontWeight: 400 }}>{result.content}</div>
                          <div style={styles.resultMeta}>
                            by @{result.author?.username} · {result.verificationCount} verifications
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {(['foryou', 'trending', 'news', 'verified'] as const).map((tab) => (
          <button
            key={tab}
            style={styles.tab(activeTab === tab)}
            onClick={() => setActiveTab(tab)}
            onMouseEnter={(e) => {
              if (activeTab !== tab) e.currentTarget.style.backgroundColor = '#111';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {tab === 'foryou' && 'For You'}
            {tab === 'trending' && 'Trending'}
            {tab === 'news' && 'News'}
            {tab === 'verified' && '✓ Verified'}
            {activeTab === tab && <div style={styles.tabIndicator} />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* For You Tab */}
        {activeTab === 'foryou' && (
          <>
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Explore Topics</h2>
              <div style={styles.categoriesGrid}>
                {categories.map((category) => (
                  <div
                    key={category.name}
                    style={styles.categoryCard(category.color)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = category.color;
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#333';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <div style={styles.categoryIcon}>{category.icon}</div>
                    <div style={styles.categoryName}>{category.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Trending Now</h2>
              {trendingTopics.slice(0, 5).map((topic, index) => (
                <div
                  key={topic.id}
                  style={styles.trendingItem}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={styles.trendingCategory}>
                    {index + 1} · {topic.category}
                  </div>
                  <div style={styles.trendingHashtag}>#{topic.hashtag}</div>
                  <div style={styles.trendingStats}>
                    <span style={styles.trendingPosts}>{formatCount(topic.postCount)} posts</span>
                    <span style={styles.verificationRate(topic.verificationRate)}>
                      ✓ {topic.verificationRate}% verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Trending Tab */}
        {activeTab === 'trending' && (
          <div>
            {trendingTopics.map((topic, index) => (
              <div
                key={topic.id}
                style={styles.trendingItem}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={styles.trendingCategory}>
                  {index + 1} · Trending in {topic.category}
                </div>
                <div style={styles.trendingHashtag}>#{topic.hashtag}</div>
                <div style={styles.trendingStats}>
                  <span style={styles.trendingPosts}>{formatCount(topic.postCount)} posts</span>
                  <span style={styles.verificationRate(topic.verificationRate)}>
                    ✓ {topic.verificationRate}% verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <div>
            {verifiedNews.map((news) => (
              <div
                key={news.id}
                style={styles.newsCard}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={styles.newsHeader}>
                  <span style={styles.newsSource}>{news.source}</span>
                  <span style={styles.newsTime}>{news.timeAgo}</span>
                </div>
                <div style={styles.newsTitle}>{news.title}</div>
                <div style={styles.newsFooter}>
                  <div style={styles.verificationBadge(news.verificationStatus)}>
                    {news.verificationStatus === 'true' && '✅ Verified True'}
                    {news.verificationStatus === 'partially_true' && '⚠️ Partially True'}
                  </div>
                  <div style={styles.verifierCount}>
                    <span>✓</span>
                    <span>{formatCount(news.verifiers)} verifiers</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Verified Tab */}
        {activeTab === 'verified' && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>✅</div>
            <div style={styles.emptyTitle}>Community Verified Content</div>
            <div style={styles.emptyDescription}>
              Browse posts that have been fact-checked and verified by the VIURL community.
              Coming soon!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;