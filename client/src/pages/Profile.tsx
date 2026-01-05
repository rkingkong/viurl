// Profile.tsx - VIURL User Profile Page
// Location: client/src/pages/Profile.tsx

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../hooks/useRedux';
import Layout from '../components/Layout/Layout';
import PostCard from '../components/Post/PostCard';
import type { Post, User } from '../types';

// API Base URL
const API_BASE = 'https://viurl.com';

interface ProfileProps {
  userId?: string; // If viewing another user's profile
  onNavigate?: (page: string) => void;
}

// Tab options
type ProfileTab = 'posts' | 'verifications' | 'replies' | 'media' | 'likes';

const Profile: React.FC<ProfileProps> = ({ userId, onNavigate }) => {
  const { user: currentUser, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Determine if viewing own profile
  const isOwnProfile = !userId || userId === currentUser?._id;
  const displayUser = isOwnProfile ? currentUser : profileUser;

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const targetId = userId || currentUser?._id;
        if (!targetId) return;

        const token = localStorage.getItem('token');
        
        // Fetch user profile
        const userResponse = await fetch(`${API_BASE}/api/users/${targetId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setProfileUser(userData.user || userData);
          setIsFollowing(userData.isFollowing || false);
        }

        // Fetch user posts
        const postsResponse = await fetch(`${API_BASE}/api/users/${targetId}/posts`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(postsData.posts || []);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUser?._id]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!isAuthenticated || !profileUser) return;
    
    setFollowLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = isFollowing 
        ? `/api/users/${profileUser._id}/follow`
        : `/api/users/${profileUser._id}/follow`;
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
        // Update follower count
        setProfileUser(prev => prev ? {
          ...prev,
          followers: (typeof prev.followers === 'number' ? prev.followers : (prev.followers?.length || 0)) + (isFollowing ? -1 : 1)
        } : null);
      }
    } catch (error) {
      console.error('Follow action failed:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  // Get avatar URL
  const getAvatarUrl = (user: any) => {
    if (user?.profilePicture) return user.profilePicture;
    if (user?.avatar) return user.avatar;
    const name = user?.name || user?.username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00ff00&color=000&bold=true&size=200`;
  };

  // Get banner URL
  const getBannerUrl = (user: any) => {
    if (user?.bannerImage) return user.bannerImage;
    return 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&h=300&fit=crop';
  };

  // Get verification badge
  const getBadgeInfo = (badge?: string) => {
    const badges: { [key: string]: { icon: string; label: string; color: string } } = {
      bronze: { icon: '🥉', label: 'Bronze Verifier', color: '#CD7F32' },
      silver: { icon: '🥈', label: 'Silver Verifier', color: '#C0C0C0' },
      gold: { icon: '🥇', label: 'Gold Verifier', color: '#FFD700' },
      platinum: { icon: '💎', label: 'Platinum Verifier', color: '#E5E4E2' }
    };
    return badges[badge || ''] || null;
  };

  // Format number
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  // Format date
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Recently joined';
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  };

  // Get trust score color
  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return '#00FF00';
    if (score >= 60) return '#90EE90';
    if (score >= 40) return '#FFD700';
    if (score >= 20) return '#FFA500';
    return '#FF4444';
  };

  const badge = getBadgeInfo(displayUser?.verificationBadge);

  return (
    <Layout 
      currentPage="profile" 
      onNavigate={onNavigate}
      
    >
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p>Loading profile...</p>
        </div>
      ) : !displayUser ? (
        <div style={styles.errorContainer}>
          <span style={styles.errorIcon}>👤</span>
          <h3>User not found</h3>
          <p>This account doesn't exist or has been removed.</p>
        </div>
      ) : (
        <>
          {/* Banner */}
          <div style={styles.bannerContainer}>
            <img
              src={getBannerUrl(displayUser)}
              alt="Profile banner"
              style={styles.banner}
            />
            <div style={styles.bannerOverlay} />
          </div>

          {/* Profile Header */}
          <div style={styles.profileHeader}>
            {/* Avatar */}
            <div style={styles.avatarContainer}>
              <img
                src={getAvatarUrl(displayUser)}
                alt={displayUser.username}
                style={styles.avatar}
              />
              {/* Trust Score Ring */}
              <svg style={styles.trustRing} viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="56"
                  fill="none"
                  stroke="#333"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="56"
                  fill="none"
                  stroke={getTrustScoreColor(displayUser.trustScore || 0)}
                  strokeWidth="8"
                  strokeDasharray={`${(displayUser.trustScore || 0) * 3.52} 352`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div style={styles.trustScoreLabel}>
                {displayUser.trustScore || 0}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.actionButtons}>
              {isOwnProfile ? (
                <button 
                  style={styles.editProfileBtn}
                  onClick={() => setShowEditModal(true)}
                >
                  Edit profile
                </button>
              ) : (
                <>
                  <button style={styles.iconBtn}>
                    <span>•••</span>
                  </button>
                  <button style={styles.iconBtn}>
                    <span>✉️</span>
                  </button>
                  <button
                    style={{
                      ...styles.followBtn,
                      ...(isFollowing ? styles.followingBtn : {})
                    }}
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                  >
                    {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div style={styles.profileInfo}>
            {/* Name & Username */}
            <div style={styles.nameSection}>
              <h1 style={styles.displayName}>
                {displayUser.name || displayUser.username}
                {displayUser.isVerified && (
                  <span style={styles.verifiedBadge}>✓</span>
                )}
                {badge && (
                  <span style={styles.levelBadge} title={badge.label}>
                    {badge.icon}
                  </span>
                )}
              </h1>
              <span style={styles.username}>@{displayUser.username}</span>
            </div>

            {/* Bio */}
            {displayUser.bio && (
              <p style={styles.bio}>{displayUser.bio}</p>
            )}

            {/* Meta Info */}
            <div style={styles.metaInfo}>
              {displayUser.location && (
                <span style={styles.metaItem}>
                  <span>📍</span> {displayUser.location}
                </span>
              )}
              {displayUser.website && (
                <a href={displayUser.website} style={styles.metaLink}>
                  <span>🔗</span> {displayUser.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              <span style={styles.metaItem}>
                <span>📅</span> {formatJoinDate(displayUser.joinedDate)}
              </span>
            </div>

            {/* Follow Stats */}
            <div style={styles.followStats}>
              <button style={styles.followStat}>
                <strong>{formatNumber(typeof displayUser.following === 'number' ? displayUser.following : (displayUser.following?.length || 0))}</strong>
                <span>Following</span>
              </button>
              <button style={styles.followStat}>
                <strong>{formatNumber(typeof displayUser.followers === 'number' ? displayUser.followers : (displayUser.followers?.length || 0))}</strong>
                <span>Followers</span>
              </button>
            </div>
          </div>

          {/* VIURL Stats Cards */}
          <div style={styles.viurlStats}>
            {/* Trust Score Card */}
            <div style={styles.statCard}>
              <div style={styles.statIcon}>🛡️</div>
              <div style={styles.statContent}>
                <div style={{
                  ...styles.statValue,
                  color: getTrustScoreColor(displayUser.trustScore || 0)
                }}>
                  {displayUser.trustScore || 0}
                </div>
                <div style={styles.statLabel}>Trust Score</div>
              </div>
            </div>

            {/* V-TKN Balance Card */}
            <div style={styles.statCard}>
              <div style={styles.statIcon}>💰</div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>
                  {formatNumber(displayUser.vtokens || 0)}
                </div>
                <div style={styles.statLabel}>V-TKN</div>
              </div>
            </div>

            {/* Verifications Card */}
            <div style={styles.statCard}>
              <div style={styles.statIcon}>✅</div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>
                  {formatNumber(displayUser.verifiedPosts?.length || 0)}
                </div>
                <div style={styles.statLabel}>Verifications</div>
              </div>
            </div>

            {/* Badge Card */}
            <div style={styles.statCard}>
              <div style={styles.statIcon}>{badge?.icon || '🏅'}</div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>
                  {badge?.label || 'No Badge'}
                </div>
                <div style={styles.statLabel}>Verifier Level</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={styles.tabs}>
            {(['posts', 'verifications', 'replies', 'media', 'likes'] as ProfileTab[]).map((tab) => (
              <button
                key={tab}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab ? styles.tabActive : {})
                }}
                onClick={() => setActiveTab(tab)}
              >
                <span style={styles.tabText}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>
                {activeTab === tab && <div style={styles.tabIndicator} />}
              </button>
            ))}
          </div>

          {/* Posts Feed */}
          <div style={styles.postsContainer}>
            {posts.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>
                  {activeTab === 'posts' ? '📝' : 
                   activeTab === 'verifications' ? '✅' :
                   activeTab === 'media' ? '🖼️' : '💬'}
                </span>
                <h3 style={styles.emptyTitle}>
                  {activeTab === 'posts' ? 'No posts yet' :
                   activeTab === 'verifications' ? 'No verifications yet' :
                   activeTab === 'media' ? 'No media posts' : 'Nothing here yet'}
                </h3>
                <p style={styles.emptyText}>
                  {isOwnProfile 
                    ? activeTab === 'posts' 
                      ? 'Share your first post with the VIURL community!'
                      : activeTab === 'verifications'
                      ? 'Start verifying posts to earn V-TKN tokens!'
                      : 'Your activity will appear here.'
                    : `@${displayUser.username} hasn't ${activeTab === 'posts' ? 'posted' : 'verified'} anything yet.`
                  }
                </p>
                {isOwnProfile && activeTab === 'posts' && (
                  <button style={styles.createPostBtn}>
                    Create your first post
                  </button>
                )}
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <button 
                style={styles.modalCloseBtn}
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
              <h2 style={styles.modalTitle}>Edit profile</h2>
              <button style={styles.modalSaveBtn}>Save</button>
            </div>
            <div style={styles.modalContent}>
              {/* Banner Edit */}
              <div style={styles.editBanner}>
                <img src={getBannerUrl(displayUser)} alt="Banner" style={styles.editBannerImg} />
                <div style={styles.editOverlay}>
                  <button style={styles.editMediaBtn}>📷</button>
                  <button style={styles.editMediaBtn}>✕</button>
                </div>
              </div>
              
              {/* Avatar Edit */}
              <div style={styles.editAvatarContainer}>
                <img src={getAvatarUrl(displayUser)} alt="Avatar" style={styles.editAvatar} />
                <div style={styles.editOverlay}>
                  <button style={styles.editMediaBtn}>📷</button>
                </div>
              </div>

              {/* Form Fields */}
              <div style={styles.editForm}>
                <div style={styles.editField}>
                  <label>Name</label>
                  <input 
                    type="text" 
                    defaultValue={displayUser?.name}
                    style={styles.editInput}
                  />
                </div>
                <div style={styles.editField}>
                  <label>Bio</label>
                  <textarea 
                    defaultValue={displayUser?.bio}
                    style={styles.editTextarea}
                    maxLength={280}
                  />
                </div>
                <div style={styles.editField}>
                  <label>Location</label>
                  <input 
                    type="text" 
                    defaultValue={displayUser?.location}
                    style={styles.editInput}
                  />
                </div>
                <div style={styles.editField}>
                  <label>Website</label>
                  <input 
                    type="url" 
                    defaultValue={displayUser?.website}
                    style={styles.editInput}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '16px',
    color: '#888',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #333',
    borderTopColor: '#00FF00',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '16px',
    color: '#888',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '64px',
  },
  bannerContainer: {
    position: 'relative',
    height: '200px',
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
  },
  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '0 16px',
    marginTop: '-70px',
    position: 'relative',
    zIndex: 10,
  },
  avatarContainer: {
    position: 'relative',
    width: '134px',
    height: '134px',
  },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '4px solid #000',
    objectFit: 'cover',
    position: 'absolute',
    top: '7px',
    left: '7px',
  },
  trustRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '134px',
    height: '134px',
  },
  trustScoreLabel: {
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#00FF00',
    color: '#000',
    fontSize: '12px',
    fontWeight: 800,
    padding: '4px 10px',
    borderRadius: '12px',
    border: '2px solid #000',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    marginTop: '80px',
  },
  editProfileBtn: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: '#fff',
    border: '1px solid #536471',
    borderRadius: '25px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  iconBtn: {
    width: '40px',
    height: '40px',
    backgroundColor: 'transparent',
    border: '1px solid #536471',
    borderRadius: '50%',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBtn: {
    padding: '10px 20px',
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '25px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  followingBtn: {
    backgroundColor: 'transparent',
    color: '#fff',
    border: '1px solid #536471',
  },
  profileInfo: {
    padding: '16px',
  },
  nameSection: {
    marginBottom: '12px',
  },
  displayName: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '20px',
    fontWeight: 800,
    color: '#fff',
    margin: 0,
  },
  verifiedBadge: {
    backgroundColor: '#00FF00',
    color: '#000',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  levelBadge: {
    fontSize: '18px',
  },
  username: {
    fontSize: '15px',
    color: '#888',
  },
  bio: {
    fontSize: '15px',
    color: '#fff',
    lineHeight: '1.5',
    marginBottom: '12px',
    whiteSpace: 'pre-wrap',
  },
  metaInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '12px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '15px',
    color: '#888',
  },
  metaLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '15px',
    color: '#00FF00',
    textDecoration: 'none',
  },
  followStats: {
    display: 'flex',
    gap: '20px',
  },
  followStat: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    color: '#888',
    fontSize: '15px',
  },
  viurlStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1px',
    backgroundColor: '#2a2a2a',
    margin: '16px 0',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#000',
  },
  statIcon: {
    fontSize: '24px',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 800,
    color: '#00FF00',
  },
  statLabel: {
    fontSize: '12px',
    color: '#888',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #2a2a2a',
  },
  tab: {
    flex: 1,
    padding: '16px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s ease',
  },
  tabActive: {},
  tabText: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#888',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '56px',
    height: '4px',
    backgroundColor: '#00FF00',
    borderRadius: '2px',
  },
  postsContainer: {
    minHeight: '200px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '12px',
  },
  emptyIcon: {
    fontSize: '48px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#fff',
    margin: 0,
  },
  emptyText: {
    fontSize: '15px',
    color: '#888',
    textAlign: 'center',
    maxWidth: '300px',
  },
  createPostBtn: {
    padding: '12px 24px',
    backgroundColor: '#00FF00',
    color: '#000',
    border: 'none',
    borderRadius: '25px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '8px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(91, 112, 131, 0.4)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '5vh',
    zIndex: 2000,
  },
  modal: {
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    backgroundColor: '#000',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    height: '53px',
    borderBottom: '1px solid #2a2a2a',
  },
  modalCloseBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
  },
  modalSaveBtn: {
    padding: '8px 16px',
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  modalContent: {
    overflowY: 'auto',
    maxHeight: 'calc(90vh - 53px)',
  },
  editBanner: {
    position: 'relative',
    height: '150px',
    backgroundColor: '#333',
  },
  editBannerImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.6,
  },
  editOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  editMediaBtn: {
    width: '44px',
    height: '44px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    border: 'none',
    borderRadius: '50%',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
  },
  editAvatarContainer: {
    position: 'relative',
    width: '112px',
    height: '112px',
    marginTop: '-56px',
    marginLeft: '16px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '4px solid #000',
  },
  editAvatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.6,
  },
  editForm: {
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  editField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  editInput: {
    padding: '16px',
    backgroundColor: 'transparent',
    border: '1px solid #333',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '17px',
    outline: 'none',
  },
  editTextarea: {
    padding: '16px',
    backgroundColor: 'transparent',
    border: '1px solid #333',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '17px',
    outline: 'none',
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
};

export default Profile;