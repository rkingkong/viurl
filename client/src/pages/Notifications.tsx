// Notifications.tsx - VIURL Notifications Page
// Location: client/src/pages/Notifications.tsx

import React, { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'verification' | 'verified_your_post' | 'token_reward' | 'follow' | 'mention' | 'repost' | 'comment' | 'badge' | 'milestone' | 'system';
  read: boolean;
  createdAt: string;
  fromUser?: {
    id: string;
    username: string;
    name: string;
    profilePicture?: string;
    verificationBadge?: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
    trustScore?: number;
  };
  post?: {
    id: string;
    content: string;
  };
  verdict?: 'true' | 'false' | 'misleading' | 'partially_true';
  tokenAmount?: number;
  tokenReason?: string;
  badgeType?: 'bronze' | 'silver' | 'gold' | 'platinum';
  milestoneType?: string;
  milestoneValue?: number;
}

interface NotificationsProps {
  onNavigate?: (page: string, params?: any) => void;
}

// Dynamic style functions (defined outside component for TypeScript compatibility)
const getTabStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '16px',
  backgroundColor: 'transparent',
  border: 'none',
  color: active ? '#fff' : '#888',
  fontSize: '15px',
  fontWeight: active ? 700 : 500,
  cursor: 'pointer',
  position: 'relative',
  transition: 'color 0.2s',
});

const getNotificationItemStyle = (read: boolean): React.CSSProperties => ({
  display: 'flex',
  gap: '12px',
  padding: '16px',
  backgroundColor: read ? 'transparent' : 'rgba(0, 255, 0, 0.03)',
  borderBottom: '1px solid #222',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
});

const getIconContainerStyle = (type: string): React.CSSProperties => ({
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  backgroundColor: type === 'token_reward' || type === 'system' ? '#00FF0015' : '#222',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  flexShrink: 0,
  border: type === 'token_reward' ? '2px solid #00FF0040' : 'none',
});

const Notifications = ({ onNavigate }: NotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'verifications' | 'mentions'>('all');
  const [loading, setLoading] = useState(true);

  // Mock notifications data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'token_reward',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        tokenAmount: 15,
        tokenReason: 'Accurate verification of viral claim',
      },
      {
        id: '2',
        type: 'verified_your_post',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        fromUser: {
          id: 'user1',
          username: 'factchecker',
          name: 'Fact Checker Pro',
          verificationBadge: 'gold',
          trustScore: 97,
        },
        post: {
          id: 'post1',
          content: 'New study shows renewable energy adoption increased by 40% in 2024...',
        },
        verdict: 'true',
      },
      {
        id: '3',
        type: 'follow',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        fromUser: {
          id: 'user2',
          username: 'truthseeker',
          name: 'Truth Seeker',
          verificationBadge: 'silver',
          trustScore: 89,
        },
      },
      {
        id: '4',
        type: 'badge',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        badgeType: 'bronze',
      },
      {
        id: '5',
        type: 'mention',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        fromUser: {
          id: 'user3',
          username: 'newsbreaker',
          name: 'News Breaker',
          verificationBadge: 'none',
          trustScore: 72,
        },
        post: {
          id: 'post2',
          content: '@you What do you think about this claim? Can you verify?',
        },
      },
      {
        id: '6',
        type: 'verification',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        fromUser: {
          id: 'user4',
          username: 'verifier',
          name: 'Community Verifier',
          verificationBadge: 'platinum',
          trustScore: 99,
        },
        post: {
          id: 'post3',
          content: 'Breaking: Major tech company announces layoffs...',
        },
        verdict: 'partially_true',
      },
      {
        id: '7',
        type: 'milestone',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        milestoneType: 'verifications',
        milestoneValue: 100,
      },
      {
        id: '8',
        type: 'repost',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        fromUser: {
          id: 'user5',
          username: 'influencer',
          name: 'Top Influencer',
          verificationBadge: 'gold',
          trustScore: 94,
        },
        post: {
          id: 'post4',
          content: 'Your verified analysis on climate data...',
        },
      },
      {
        id: '9',
        type: 'system',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        tokenAmount: 100,
        tokenReason: 'Welcome bonus! Start verifying posts to earn more.',
      },
    ];

    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'verifications') {
      return ['verification', 'verified_your_post', 'token_reward', 'badge', 'milestone'].includes(n.type);
    }
    if (activeTab === 'mentions') {
      return ['mention', 'comment'].includes(n.type);
    }
    return true;
  });

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  const getBadgeIcon = (badge?: string): string => {
    switch (badge) {
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '';
    }
  };

  const getVerdictInfo = (verdict?: string): { icon: string; color: string; label: string } => {
    switch (verdict) {
      case 'true': return { icon: '✅', color: '#00FF00', label: 'True' };
      case 'false': return { icon: '❌', color: '#FF4444', label: 'False' };
      case 'misleading': return { icon: '🔶', color: '#FF8800', label: 'Misleading' };
      case 'partially_true': return { icon: '⚠️', color: '#FFD700', label: 'Partially True' };
      default: return { icon: '❓', color: '#888', label: 'Unknown' };
    }
  };

  const renderNotificationContent = (notification: Notification) => {
    const { type, fromUser, post, verdict, tokenAmount, tokenReason, badgeType, milestoneType, milestoneValue } = notification;

    switch (type) {
      case 'token_reward':
        return (
          <div style={styles.notificationBody}>
            <div style={styles.tokenReward}>
              <span style={styles.tokenIcon}>💰</span>
              <span style={styles.tokenAmount}>+{tokenAmount} V-TKN</span>
            </div>
            <p style={styles.notificationText}>{tokenReason}</p>
          </div>
        );

      case 'verified_your_post':
        const verdictInfo = getVerdictInfo(verdict);
        return (
          <div style={styles.notificationBody}>
            <p style={styles.notificationText}>
              <strong style={styles.username} onClick={() => onNavigate && onNavigate('profile', { userId: fromUser?.username })}>
                {fromUser?.name}
              </strong>
              {' '}verified your post as{' '}
              <span style={{ color: verdictInfo.color, fontWeight: 600 }}>
                {verdictInfo.icon} {verdictInfo.label}
              </span>
            </p>
            {post && (
              <div style={styles.postPreview}>
                {post.content.length > 80 ? post.content.substring(0, 80) + '...' : post.content}
              </div>
            )}
          </div>
        );

      case 'verification':
        const vInfo = getVerdictInfo(verdict);
        return (
          <div style={styles.notificationBody}>
            <p style={styles.notificationText}>
              <strong style={styles.username} onClick={() => onNavigate && onNavigate('profile', { userId: fromUser?.username })}>
                {fromUser?.name}
              </strong>
              {' '}marked a post as{' '}
              <span style={{ color: vInfo.color, fontWeight: 600 }}>
                {vInfo.icon} {vInfo.label}
              </span>
            </p>
            {post && (
              <div style={styles.postPreview}>
                {post.content.length > 80 ? post.content.substring(0, 80) + '...' : post.content}
              </div>
            )}
          </div>
        );

      case 'follow':
        return (
          <div style={styles.notificationBody}>
            <p style={styles.notificationText}>
              <strong style={styles.username} onClick={() => onNavigate && onNavigate('profile', { userId: fromUser?.username })}>
                {fromUser?.name}
              </strong>
              {' '}followed you
            </p>
            {fromUser?.trustScore && (
              <div style={styles.trustBadge}>
                Trust Score: <span style={{ color: '#00FF00' }}>{fromUser.trustScore}%</span>
              </div>
            )}
          </div>
        );

      case 'mention':
      case 'comment':
        return (
          <div style={styles.notificationBody}>
            <p style={styles.notificationText}>
              <strong style={styles.username} onClick={() => onNavigate && onNavigate('profile', { userId: fromUser?.username })}>
                {fromUser?.name}
              </strong>
              {type === 'mention' ? ' mentioned you' : ' commented on your post'}
            </p>
            {post && (
              <div style={styles.postPreview}>
                {post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}
              </div>
            )}
          </div>
        );

      case 'repost':
        return (
          <div style={styles.notificationBody}>
            <p style={styles.notificationText}>
              <strong style={styles.username} onClick={() => onNavigate && onNavigate('profile', { userId: fromUser?.username })}>
                {fromUser?.name}
              </strong>
              {' '}reposted your post
            </p>
            {post && (
              <div style={styles.postPreview}>
                {post.content.length > 80 ? post.content.substring(0, 80) + '...' : post.content}
              </div>
            )}
          </div>
        );

      case 'badge':
        return (
          <div style={styles.notificationBody}>
            <div style={styles.badgeAward}>
              <span style={styles.badgeIcon}>{getBadgeIcon(badgeType)}</span>
              <span style={styles.badgeText}>
                You earned the <strong>{badgeType?.charAt(0).toUpperCase()}{badgeType?.slice(1)} Verifier</strong> badge!
              </span>
            </div>
            <p style={styles.badgeDescription}>
              Keep verifying accurately to unlock higher tiers.
            </p>
          </div>
        );

      case 'milestone':
        return (
          <div style={styles.notificationBody}>
            <div style={styles.milestoneAward}>
              <span style={styles.milestoneIcon}>🏆</span>
              <span style={styles.milestoneText}>
                You reached <strong>{milestoneValue} {milestoneType}</strong>!
              </span>
            </div>
            <p style={styles.milestoneDescription}>
              Congratulations on this achievement!
            </p>
          </div>
        );

      case 'system':
        return (
          <div style={styles.notificationBody}>
            {tokenAmount && (
              <div style={styles.tokenReward}>
                <span style={styles.tokenIcon}>🎁</span>
                <span style={styles.tokenAmount}>+{tokenAmount} V-TKN</span>
              </div>
            )}
            <p style={styles.notificationText}>{tokenReason}</p>
          </div>
        );

      default:
        return null;
    }
  };

  const getNotificationIcon = (type: Notification['type']): string => {
    switch (type) {
      case 'verification': return '✓';
      case 'verified_your_post': return '✅';
      case 'token_reward': return '💰';
      case 'follow': return '👤';
      case 'mention': return '@';
      case 'repost': return '🔄';
      case 'comment': return '💬';
      case 'badge': return '🏅';
      case 'milestone': return '🏆';
      case 'system': return '🔔';
      default: return '📬';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: '100vh',
      borderLeft: '1px solid #333',
      borderRight: '1px solid #333',
    },
    header: {
      position: 'sticky',
      top: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
      borderBottom: '1px solid #333',
    },
    headerTop: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
    },
    headerTitle: {
      color: '#fff',
      fontSize: '20px',
      fontWeight: 800,
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    unreadBadge: {
      backgroundColor: '#00FF00',
      color: '#000',
      fontSize: '12px',
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: '10px',
    },
    markReadBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#00FF00',
      fontSize: '14px',
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: '20px',
      transition: 'background-color 0.2s',
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #333',
    },
    tabIndicator: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '60px',
      height: '4px',
      backgroundColor: '#00FF00',
      borderRadius: '2px',
    },
    notificationsList: {
      padding: '0',
    },
    avatarContainer: {
      position: 'relative',
      width: '44px',
      height: '44px',
      flexShrink: 0,
    },
    avatar: {
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
    avatarBadge: {
      position: 'absolute',
      bottom: '-2px',
      right: '-2px',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      border: '2px solid #000',
    },
    notificationContent: {
      flex: 1,
      minWidth: 0,
    },
    notificationBody: {
      marginBottom: '4px',
    },
    notificationText: {
      color: '#ccc',
      fontSize: '15px',
      lineHeight: 1.4,
      margin: 0,
    },
    username: {
      color: '#fff',
      cursor: 'pointer',
    },
    postPreview: {
      backgroundColor: '#111',
      border: '1px solid #222',
      borderRadius: '8px',
      padding: '10px 12px',
      marginTop: '8px',
      color: '#888',
      fontSize: '14px',
      lineHeight: 1.4,
    },
    tokenReward: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px',
    },
    tokenIcon: {
      fontSize: '20px',
    },
    tokenAmount: {
      color: '#00FF00',
      fontSize: '18px',
      fontWeight: 800,
    },
    trustBadge: {
      marginTop: '8px',
      fontSize: '13px',
      color: '#888',
    },
    badgeAward: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '8px',
    },
    badgeIcon: {
      fontSize: '28px',
    },
    badgeText: {
      color: '#fff',
      fontSize: '15px',
    },
    badgeDescription: {
      color: '#888',
      fontSize: '13px',
      margin: 0,
    },
    milestoneAward: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '8px',
    },
    milestoneIcon: {
      fontSize: '28px',
    },
    milestoneText: {
      color: '#fff',
      fontSize: '15px',
    },
    milestoneDescription: {
      color: '#888',
      fontSize: '13px',
      margin: 0,
    },
    timestamp: {
      color: '#666',
      fontSize: '13px',
      marginTop: '6px',
    },
    unreadDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#00FF00',
      flexShrink: 0,
      marginTop: '6px',
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px',
      gap: '16px',
    },
    emptyIcon: {
      fontSize: '64px',
    },
    emptyTitle: {
      color: '#fff',
      fontSize: '20px',
      fontWeight: 700,
      margin: 0,
    },
    emptyDescription: {
      color: '#888',
      fontSize: '15px',
      textAlign: 'center',
      maxWidth: '280px',
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 20px',
      gap: '16px',
    },
    loadingSpinner: {
      width: '32px',
      height: '32px',
      border: '3px solid #333',
      borderTopColor: '#00FF00',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    loadingText: {
      color: '#888',
      fontSize: '14px',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.headerTitle}>
            Notifications
            {unreadCount > 0 && (
              <span style={styles.unreadBadge}>{unreadCount}</span>
            )}
          </h1>
          {unreadCount > 0 && (
            <button
              style={styles.markReadBtn}
              onClick={markAllAsRead}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00FF0015'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {(['all', 'verifications', 'mentions'] as const).map((tab) => (
            <button
              key={tab}
              style={getTabStyle(activeTab === tab)}
              onClick={() => setActiveTab(tab)}
              onMouseEnter={(e) => {
                if (activeTab !== tab) e.currentTarget.style.backgroundColor = '#111';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {tab === 'all' && 'All'}
              {tab === 'verifications' && '✓ Verifications'}
              {tab === 'mentions' && 'Mentions'}
              {activeTab === tab && <div style={styles.tabIndicator} />}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div style={styles.notificationsList}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner} />
            <p style={styles.loadingText}>Loading notifications...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>🔔</span>
            <h2 style={styles.emptyTitle}>No notifications yet</h2>
            <p style={styles.emptyDescription}>
              When you get notifications, they'll show up here. Start verifying posts to earn rewards!
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              style={getNotificationItemStyle(notification.read)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = notification.read ? '#0a0a0a' : 'rgba(0, 255, 0, 0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notification.read ? 'transparent' : 'rgba(0, 255, 0, 0.03)'}
              onClick={() => {
                setNotifications(notifications.map(n => 
                  n.id === notification.id ? { ...n, read: true } : n
                ));
                if (notification.post) {
                  onNavigate && onNavigate('post', { postId: notification.post.id });
                } else if (notification.fromUser) {
                  onNavigate && onNavigate('profile', { userId: notification.fromUser.username });
                }
              }}
            >
              {/* Icon or Avatar */}
              {notification.fromUser ? (
                <div style={styles.avatarContainer}>
                  <div style={styles.avatar}>
                    {notification.fromUser.profilePicture ? (
                      <img 
                        src={notification.fromUser.profilePicture} 
                        alt="" 
                        style={{ width: '100%', height: '100%', borderRadius: '50%' }} 
                      />
                    ) : (
                      notification.fromUser.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div style={styles.avatarBadge}>
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>
              ) : (
                <div style={getIconContainerStyle(notification.type)}>
                  {getNotificationIcon(notification.type)}
                </div>
              )}

              {/* Content */}
              <div style={styles.notificationContent}>
                {renderNotificationContent(notification)}
                <div style={styles.timestamp}>
                  {getTimeAgo(notification.createdAt)}
                </div>
              </div>

              {/* Unread indicator */}
              {!notification.read && <div style={styles.unreadDot} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default Notifications;
