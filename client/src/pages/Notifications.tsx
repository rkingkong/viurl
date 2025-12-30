import React, { useState } from 'react';
import type { Notification, User } from '../types';

const mockNotifications: Notification[] = [
  { _id: '1', type: 'verification_result', from: { _id: '2', username: 'system', name: 'VIURL System', email: '', trustScore: 100, vtokens: 0, followers: [], following: [], createdAt: '' }, message: 'Your verification was accurate! +15 V-TKN', amount: 15, read: false, createdAt: new Date().toISOString() },
  { _id: '2', type: 'token_reward', from: { _id: '2', username: 'system', name: 'VIURL System', email: '', trustScore: 100, vtokens: 0, followers: [], following: [], createdAt: '' }, message: 'Daily login bonus claimed', amount: 5, read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: '3', type: 'follow', from: { _id: '3', username: 'truthseeker', name: 'Truth Seeker', email: '', trustScore: 85, vtokens: 500, followers: [], following: [], createdAt: '' }, read: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: '4', type: 'like', from: { _id: '4', username: 'factchecker', name: 'Fact Checker Pro', email: '', trustScore: 92, vtokens: 1200, followers: [], following: [], createdAt: '' }, read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<'all' | 'mentions' | 'tokens'>('all');

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getIcon = (type: string) => {
    const icons: Record<string, string> = { like: '❤️', comment: '💬', repost: '🔄', follow: '👤', mention: '@', verification_result: '✅', token_reward: '🪙', badge_earned: '🏆' };
    return icons[type] || '🔔';
  };

  const getIconBg = (type: string) => {
    const colors: Record<string, string> = { like: '#ff4444', comment: '#1DA1F2', repost: '#17BF63', follow: '#794BC4', verification_result: '#00FF00', token_reward: '#00FF0030', badge_earned: '#FFD700' };
    return colors[type] || '#333';
  };

  const getText = (n: Notification) => {
    switch (n.type) {
      case 'like': return `${n.from.name} liked your post`;
      case 'comment': return `${n.from.name} commented: "${n.message}"`;
      case 'repost': return `${n.from.name} reposted your post`;
      case 'follow': return `${n.from.name} started following you`;
      case 'verification_result': return n.message || 'Your verification was processed';
      case 'token_reward': return `${n.message || 'You earned tokens!'} ${n.amount ? `+${n.amount} V-TKN` : ''}`;
      case 'badge_earned': return n.message || 'You earned a new badge!';
      default: return 'New notification';
    }
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'mentions') return ['mention', 'comment', 'like', 'repost', 'follow'].includes(n.type);
    if (activeTab === 'tokens') return ['token_reward', 'verification_result', 'badge_earned'].includes(n.type);
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const tabs: Array<'all' | 'mentions' | 'tokens'> = ['all', 'mentions', 'tokens'];

  const styles = {
    container: { maxWidth: '600px', margin: '0 auto', backgroundColor: '#000', minHeight: '100vh', color: '#fff' } as React.CSSProperties,
    header: { position: 'sticky' as const, top: 0, backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #333', zIndex: 100 } as React.CSSProperties,
    headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px' } as React.CSSProperties,
    title: { fontSize: '20px', fontWeight: 'bold' } as React.CSSProperties,
    markAllBtn: { backgroundColor: 'transparent', border: 'none', color: '#00FF00', fontSize: '14px', cursor: 'pointer' } as React.CSSProperties,
    tabs: { display: 'flex', borderBottom: '1px solid #333' } as React.CSSProperties,
    tab: { flex: 1, padding: '15px', backgroundColor: 'transparent', border: 'none', color: '#888', fontSize: '14px', cursor: 'pointer', borderBottom: '2px solid transparent' } as React.CSSProperties,
    tabActive: { flex: 1, padding: '15px', backgroundColor: 'transparent', border: 'none', color: '#00FF00', fontSize: '14px', fontWeight: 600, cursor: 'pointer', borderBottom: '2px solid #00FF00' } as React.CSSProperties,
    itemUnread: { display: 'flex', gap: '12px', padding: '15px 20px', backgroundColor: '#0a0a0a', borderBottom: '1px solid #222', cursor: 'pointer' } as React.CSSProperties,
    itemRead: { display: 'flex', gap: '12px', padding: '15px 20px', backgroundColor: 'transparent', borderBottom: '1px solid #222', cursor: 'pointer' } as React.CSSProperties,
    iconContainer: { width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 } as React.CSSProperties,
    content: { flex: 1, minWidth: 0 } as React.CSSProperties,
    text: { fontSize: '15px', lineHeight: 1.4, marginBottom: '4px' } as React.CSSProperties,
    time: { fontSize: '13px', color: '#888' } as React.CSSProperties,
    tokenAmount: { color: '#00FF00', fontWeight: 'bold' } as React.CSSProperties,
    unreadDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00FF00', alignSelf: 'center' } as React.CSSProperties,
    emptyState: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '60px 20px', color: '#888' } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.title}>Notifications {unreadCount > 0 && `(${unreadCount})`}</h1>
          {unreadCount > 0 && <button onClick={markAllRead} style={styles.markAllBtn}>Mark all as read</button>}
        </div>
        <div style={styles.tabs}>
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={activeTab === tab ? styles.tabActive : styles.tab}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
          <div>No notifications yet</div>
        </div>
      ) : (
        filtered.map((n) => (
          <div key={n._id} onClick={() => markAsRead(n._id)} style={n.read ? styles.itemRead : styles.itemUnread}>
            <div style={{ ...styles.iconContainer, backgroundColor: getIconBg(n.type) }}>{getIcon(n.type)}</div>
            <div style={styles.content}>
              <div style={styles.text}>{getText(n)}</div>
              <div style={styles.time}>
                {formatTime(n.createdAt)}
                {n.amount && <span style={styles.tokenAmount}> · +{n.amount} V-TKN</span>}
              </div>
            </div>
            {!n.read && <div style={styles.unreadDot} />}
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;
