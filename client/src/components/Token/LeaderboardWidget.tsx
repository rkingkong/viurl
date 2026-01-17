// LeaderboardWidget.tsx - Shows top earners and verifiers
// Location: client/src/components/Token/LeaderboardWidget.tsx

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/useRedux';

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    username: string;
    name: string;
    profilePicture?: string;
    verificationBadge?: string;
  };
  totalEarned: number;
}

interface LeaderboardData {
  period: string;
  entries: LeaderboardEntry[];
}

type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime';

interface LeaderboardWidgetProps {
  compact?: boolean;
  maxEntries?: number;
  onUserClick?: (username: string) => void;
}

const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({
  compact = false,
  maxEntries = 5,
  onUserClick,
}) => {
  const { token } = useAppSelector((state) => state.auth);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tokens/leaderboard?period=${period}&limit=${maxEntries}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        // Handle { success: true, data: { entries: [...] } } structure
        if (data.success && data.data?.entries) {
          setLeaderboard(data.data.entries);
        } else if (data.entries) {
          // Also handle flat structure
          setLeaderboard(data.entries);
        } else if (data.leaderboard) {
          // Handle { leaderboard: [...] } structure
          setLeaderboard(data.leaderboard);
        }
      } else {
        setError('Failed to load leaderboard');
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badge?: string): string => {
    switch (badge) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      default: return '';
    }
  };

  const getRankStyle = (rank: number): React.CSSProperties => {
    switch (rank) {
      case 1:
        return { backgroundColor: '#FFD700', color: '#000' };
      case 2:
        return { backgroundColor: '#C0C0C0', color: '#000' };
      case 3:
        return { backgroundColor: '#CD7F32', color: '#000' };
      default:
        return { backgroundColor: '#1a1a1a', color: '#888' };
    }
  };

  const getRankEmoji = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const periodLabels: Record<LeaderboardPeriod, string> = {
    daily: 'Today',
    weekly: 'This Week',
    monthly: 'This Month',
    allTime: 'All Time',
  };

  if (compact) {
    return (
      <div style={styles.compactContainer}>
        <div style={styles.compactHeader}>
          <span style={styles.compactTitle}>🏆 Top Earners</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as LeaderboardPeriod)}
            style={styles.compactSelect}
          >
            {Object.entries(periodLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={styles.compactLoading}>Loading...</div>
        ) : error ? (
          <div style={styles.compactError}>{error}</div>
        ) : leaderboard.length === 0 ? (
          <div style={styles.compactEmpty}>No data yet</div>
        ) : (
          <div style={styles.compactList}>
            {leaderboard.slice(0, 3).map((entry) => (
              <div
                key={entry.user.id}
                style={styles.compactEntry}
                onClick={() => onUserClick?.(entry.user.username)}
              >
                <span style={styles.compactRank}>{getRankEmoji(entry.rank)}</span>
                <span style={styles.compactUsername}>@{entry.user.username}</span>
                <span style={styles.compactAmount}>{entry.totalEarned.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>🏆 Leaderboard</h3>
        <div style={styles.periodTabs}>
          {(Object.entries(periodLabels) as [LeaderboardPeriod, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              style={{
                ...styles.periodTab,
                ...(period === key ? styles.periodTabActive : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.loadingSpinner}>🔄</div>
            <span>Loading leaderboard...</span>
          </div>
        ) : error ? (
          <div style={styles.error}>
            <span>⚠️ {error}</span>
            <button style={styles.retryBtn} onClick={fetchLeaderboard}>
              Retry
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}>📊</span>
            <span style={styles.emptyText}>No rankings yet for this period</span>
            <span style={styles.emptySubtext}>Start verifying to earn V-TKN!</span>
          </div>
        ) : (
          <div style={styles.list}>
            {leaderboard.map((entry) => (
              <div
                key={entry.user.id}
                style={styles.entry}
                onClick={() => onUserClick?.(entry.user.username)}
              >
                {/* Rank */}
                <div style={{ ...styles.rank, ...getRankStyle(entry.rank) }}>
                  {entry.rank <= 3 ? getRankEmoji(entry.rank) : entry.rank}
                </div>

                {/* Avatar */}
                <img
                  src={entry.user.profilePicture || `https://ui-avatars.com/api/?name=${entry.user.name || entry.user.username}&background=00FF00&color=000`}
                  alt={entry.user.name}
                  style={styles.avatar}
                />

                {/* User Info */}
                <div style={styles.userInfo}>
                  <div style={styles.userName}>
                    {entry.user.name || entry.user.username}
                    {entry.user.verificationBadge && entry.user.verificationBadge !== 'none' && (
                      <span style={styles.userBadge}>
                        {getBadgeIcon(entry.user.verificationBadge)}
                      </span>
                    )}
                  </div>
                  <div style={styles.userHandle}>@{entry.user.username}</div>
                </div>

                {/* Earnings */}
                <div style={styles.earnings}>
                  <span style={styles.earningsAmount}>
                    {entry.totalEarned.toLocaleString()}
                  </span>
                  <span style={styles.earningsLabel}>V-TKN</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && !error && leaderboard.length > 0 && (
        <div style={styles.footer}>
          <button style={styles.viewAllBtn}>
            View Full Leaderboard →
          </button>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  // Main Container
  container: {
    backgroundColor: '#0a0a0a',
    borderRadius: '16px',
    border: '1px solid #2a2a2a',
    overflow: 'hidden',
  },

  // Header
  header: {
    padding: '16px',
    borderBottom: '1px solid #2a2a2a',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
    marginBottom: '12px',
  },
  periodTabs: {
    display: 'flex',
    gap: '4px',
  },
  periodTab: {
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #2a2a2a',
    borderRadius: '9999px',
    color: '#888',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  periodTabActive: {
    backgroundColor: '#00FF00',
    borderColor: '#00FF00',
    color: '#000',
    fontWeight: '600',
  },

  // Content
  content: {
    padding: '8px',
  },

  // Loading
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px',
    gap: '8px',
    color: '#888',
  },
  loadingSpinner: {
    fontSize: '24px',
    animation: 'spin 1s linear infinite',
  },

  // Error
  error: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px',
    gap: '12px',
    color: '#FF8800',
  },
  retryBtn: {
    padding: '8px 16px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
  },

  // Empty
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px',
    gap: '8px',
  },
  emptyIcon: {
    fontSize: '32px',
  },
  emptyText: {
    color: '#888',
    fontSize: '14px',
  },
  emptySubtext: {
    color: '#00FF00',
    fontSize: '13px',
  },

  // List
  list: {
    display: 'flex',
    flexDirection: 'column',
  },

  // Entry
  entry: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  rank: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    flexShrink: 0,
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  userBadge: {
    fontSize: '14px',
  },
  userHandle: {
    fontSize: '13px',
    color: '#888',
  },
  earnings: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  earningsAmount: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#00FF00',
  },
  earningsLabel: {
    fontSize: '11px',
    color: '#888',
  },

  // Footer
  footer: {
    padding: '12px 16px',
    borderTop: '1px solid #2a2a2a',
  },
  viewAllBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#00FF00',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'center',
  },

  // Compact Version
  compactContainer: {
    backgroundColor: '#0a0a0a',
    borderRadius: '12px',
    padding: '12px',
    border: '1px solid #2a2a2a',
  },
  compactHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  compactTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
  },
  compactSelect: {
    padding: '4px 8px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '12px',
    cursor: 'pointer',
  },
  compactLoading: {
    color: '#888',
    fontSize: '13px',
    textAlign: 'center',
    padding: '12px',
  },
  compactError: {
    color: '#FF8800',
    fontSize: '13px',
    textAlign: 'center',
    padding: '12px',
  },
  compactEmpty: {
    color: '#888',
    fontSize: '13px',
    textAlign: 'center',
    padding: '12px',
  },
  compactList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  compactEntry: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  compactRank: {
    fontSize: '16px',
  },
  compactUsername: {
    flex: 1,
    fontSize: '13px',
    color: '#fff',
  },
  compactAmount: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#00FF00',
  },
};

export default LeaderboardWidget;
