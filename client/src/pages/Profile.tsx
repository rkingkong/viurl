import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { fetchUserPosts } from '../store/slices/feedSlice';
import PostCard from '../components/Post/PostCard';
import type { User } from '../types';

interface ProfileProps {
  userId?: string;
}

const Profile: React.FC<ProfileProps> = ({ userId }) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const posts = useAppSelector((state) => state.feed.posts);
  const loading = useAppSelector((state) => state.feed.loading);

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'verifications' | 'likes'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?._id;
  const displayUser = isOwnProfile ? currentUser : profileUser;

  useEffect(() => {
    const targetId = userId || currentUser?._id;
    if (targetId) {
      dispatch(fetchUserPosts({ userId: targetId, page: 1 }));
    }
    if (!isOwnProfile && userId) {
      // Fetch profile user data
      fetch(`/api/users/${userId}`)
        .then((res) => res.json())
        .then((data) => setProfileUser(data.user || data))
        .catch(console.error);
    }
  }, [userId, currentUser?._id, isOwnProfile, dispatch]);

  const handleFollow = async () => {
    if (!displayUser) return;
    try {
      const endpoint = isFollowing
        ? `/api/users/${displayUser._id}/follow`
        : `/api/users/${displayUser._id}/follow`;
      const method = isFollowing ? 'DELETE' : 'POST';
      await fetch(endpoint, { method, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const getBadge = (score: number) => {
    if (score >= 95) return '💎';
    if (score >= 75) return '🥇';
    if (score >= 50) return '🥈';
    return '🥉';
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatJoinDate = (date?: string): string => {
    if (!date) return 'Recently joined';
    const d = new Date(date);
    return `Joined ${d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  };

  const styles = {
    container: { maxWidth: '600px', margin: '0 auto', backgroundColor: '#000', minHeight: '100vh', color: '#fff' } as React.CSSProperties,
    banner: { height: '200px', backgroundColor: '#1a1a1a', position: 'relative' as const } as React.CSSProperties,
    avatarSection: { padding: '0 20px', position: 'relative' as const, marginTop: '-70px' } as React.CSSProperties,
    avatar: { width: '140px', height: '140px', borderRadius: '50%', backgroundColor: '#333', border: '4px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' } as React.CSSProperties,
    editBtn: { position: 'absolute' as const, right: '20px', top: '85px', padding: '10px 20px', borderRadius: '25px', border: '1px solid #333', backgroundColor: 'transparent', color: '#fff', fontWeight: 'bold' as const, cursor: 'pointer' } as React.CSSProperties,
    followBtn: { position: 'absolute' as const, right: '20px', top: '85px', padding: '10px 20px', borderRadius: '25px', border: 'none', backgroundColor: '#00FF00', color: '#000', fontWeight: 'bold' as const, cursor: 'pointer' } as React.CSSProperties,
    unfollowBtn: { position: 'absolute' as const, right: '20px', top: '85px', padding: '10px 20px', borderRadius: '25px', border: '1px solid #333', backgroundColor: 'transparent', color: '#fff', fontWeight: 'bold' as const, cursor: 'pointer' } as React.CSSProperties,
    info: { padding: '15px 20px' } as React.CSSProperties,
    name: { fontSize: '22px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' } as React.CSSProperties,
    username: { color: '#888', fontSize: '15px', marginTop: '2px' } as React.CSSProperties,
    bio: { marginTop: '12px', fontSize: '15px', lineHeight: 1.4 } as React.CSSProperties,
    meta: { display: 'flex', flexWrap: 'wrap' as const, gap: '15px', marginTop: '12px', color: '#888', fontSize: '14px' } as React.CSSProperties,
    stats: { display: 'flex', gap: '20px', marginTop: '15px' } as React.CSSProperties,
    stat: { display: 'flex', gap: '5px' } as React.CSSProperties,
    statNum: { fontWeight: 'bold', color: '#fff' } as React.CSSProperties,
    statLabel: { color: '#888' } as React.CSSProperties,
    trustSection: { margin: '20px', padding: '15px', backgroundColor: '#111', borderRadius: '12px', border: '1px solid #333' } as React.CSSProperties,
    trustHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' } as React.CSSProperties,
    trustTitle: { fontWeight: 'bold', color: '#888', fontSize: '14px' } as React.CSSProperties,
    trustScore: { fontSize: '24px', fontWeight: 'bold', color: '#00FF00' } as React.CSSProperties,
    trustBar: { height: '6px', backgroundColor: '#333', borderRadius: '3px', overflow: 'hidden' } as React.CSSProperties,
    trustFill: { height: '100%', backgroundColor: '#00FF00', borderRadius: '3px' } as React.CSSProperties,
    tokenSection: { display: 'flex', justifyContent: 'space-around', margin: '0 20px 20px', padding: '15px', backgroundColor: '#111', borderRadius: '12px', border: '1px solid #333' } as React.CSSProperties,
    tokenItem: { textAlign: 'center' as const } as React.CSSProperties,
    tokenValue: { fontSize: '20px', fontWeight: 'bold', color: '#00FF00' } as React.CSSProperties,
    tokenLabel: { fontSize: '12px', color: '#888', marginTop: '4px' } as React.CSSProperties,
    tabs: { display: 'flex', borderBottom: '1px solid #333' } as React.CSSProperties,
    tab: { flex: 1, padding: '15px', backgroundColor: 'transparent', border: 'none', color: '#888', fontSize: '14px', cursor: 'pointer' } as React.CSSProperties,
    tabActive: { flex: 1, padding: '15px', backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 'bold' as const, cursor: 'pointer', borderBottom: '2px solid #00FF00' } as React.CSSProperties,
    postsSection: { } as React.CSSProperties,
    loadingText: { textAlign: 'center' as const, padding: '40px', color: '#888' } as React.CSSProperties,
    emptyText: { textAlign: 'center' as const, padding: '40px', color: '#888' } as React.CSSProperties,
  };

  if (!displayUser) {
    return <div style={styles.container}><div style={styles.loadingText}>Loading profile...</div></div>;
  }

  const followersCount = Array.isArray(displayUser.followers) ? displayUser.followers.length : 0;
  const followingCount = Array.isArray(displayUser.following) ? displayUser.following.length : 0;
  const verifiedCount = Array.isArray(displayUser.verifiedPosts) ? displayUser.verifiedPosts.length : 0;

  return (
    <div style={styles.container}>
      <div style={styles.banner}>
        {displayUser.bannerImage && (
          <img src={displayUser.bannerImage} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>

      <div style={styles.avatarSection}>
        <div style={styles.avatar}>
          {displayUser.profilePicture || displayUser.avatar ? (
            <img src={displayUser.profilePicture || displayUser.avatar} alt={displayUser.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
          ) : (
            displayUser.name?.charAt(0).toUpperCase()
          )}
        </div>
        {isOwnProfile ? (
          <button style={styles.editBtn}>Edit profile</button>
        ) : (
          <button onClick={handleFollow} style={isFollowing ? styles.unfollowBtn : styles.followBtn}>
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      <div style={styles.info}>
        <div style={styles.name}>
          {displayUser.name} {getBadge(displayUser.trustScore || 0)}
          {displayUser.verificationBadge && <span>✓</span>}
        </div>
        <div style={styles.username}>@{displayUser.username}</div>
        {displayUser.bio && <div style={styles.bio}>{displayUser.bio}</div>}
        <div style={styles.meta}>
          {displayUser.location && <span>📍 {displayUser.location}</span>}
          {displayUser.website && <span>🔗 {displayUser.website}</span>}
          <span>📅 {formatJoinDate(displayUser.joinedDate || displayUser.createdAt)}</span>
        </div>
        <div style={styles.stats}>
          <div style={styles.stat}>
            <span style={styles.statNum}>{formatNumber(followingCount)}</span>
            <span style={styles.statLabel}>Following</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNum}>{formatNumber(followersCount)}</span>
            <span style={styles.statLabel}>Followers</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNum}>{formatNumber(verifiedCount)}</span>
            <span style={styles.statLabel}>Verified</span>
          </div>
        </div>
      </div>

      <div style={styles.trustSection}>
        <div style={styles.trustHeader}>
          <span style={styles.trustTitle}>TRUST SCORE</span>
          <span style={styles.trustScore}>{displayUser.trustScore || 0}</span>
        </div>
        <div style={styles.trustBar}>
          <div style={{ ...styles.trustFill, width: `${displayUser.trustScore || 0}%` }} />
        </div>
      </div>

      <div style={styles.tokenSection}>
        <div style={styles.tokenItem}>
          <div style={styles.tokenValue}>{formatNumber(displayUser.vtokens || 0)}</div>
          <div style={styles.tokenLabel}>V-TKN Balance</div>
        </div>
        <div style={styles.tokenItem}>
          <div style={styles.tokenValue}>{formatNumber(verifiedCount)}</div>
          <div style={styles.tokenLabel}>Verifications</div>
        </div>
      </div>

      <div style={styles.tabs}>
        {(['posts', 'verifications', 'likes'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={activeTab === tab ? styles.tabActive : styles.tab}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.postsSection}>
        {loading ? (
          <div style={styles.loadingText}>Loading...</div>
        ) : posts.length === 0 ? (
          <div style={styles.emptyText}>No posts yet</div>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default Profile;
