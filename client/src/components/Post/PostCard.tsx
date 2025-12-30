// PostCard.tsx - VIURL Enhanced Post Card with Verification System
// Location: client/src/components/Post/PostCard.tsx

import React, { useState } from 'react';
import type { Post, User } from '../../types';

interface PostCardProps {
  post: Post;
  currentUser?: User | null;
  onVerify?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

// Fact Check Status Configuration
const FACT_CHECK_CONFIG = {
  unverified: {
    label: 'Unverified',
    color: '#888888',
    icon: '❓',
    bgColor: 'rgba(136, 136, 136, 0.1)'
  },
  true: {
    label: 'Verified True',
    color: '#00FF00',
    icon: '✅',
    bgColor: 'rgba(0, 255, 0, 0.1)'
  },
  partially_true: {
    label: 'Partially True',
    color: '#FFD700',
    icon: '⚠️',
    bgColor: 'rgba(255, 215, 0, 0.1)'
  },
  false: {
    label: 'False',
    color: '#FF4444',
    icon: '❌',
    bgColor: 'rgba(255, 68, 68, 0.1)'
  },
  misleading: {
    label: 'Misleading',
    color: '#FF8800',
    icon: '🔶',
    bgColor: 'rgba(255, 136, 0, 0.1)'
  }
};

// Verification Badge Configuration
const BADGE_CONFIG = {
  none: { label: '', color: 'transparent', icon: '' },
  bronze: { label: 'Bronze Verifier', color: '#CD7F32', icon: '🥉' },
  silver: { label: 'Silver Verifier', color: '#C0C0C0', icon: '🥈' },
  gold: { label: 'Gold Verifier', color: '#FFD700', icon: '🥇' },
  platinum: { label: 'Platinum Verifier', color: '#E5E4E2', icon: '💎' }
};

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onVerify,
  onRepost,
  onBookmark,
  onComment,
  onShare
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerifyTooltip, setShowVerifyTooltip] = useState(false);
  
  // Check if current user has verified this post
  const hasVerified = currentUser && post.verifications?.some(
    (v: any) => v.toString() === currentUser._id || v._id === currentUser._id
  );
  
  // Check if current user has bookmarked this post
  const hasBookmarked = currentUser && post.bookmarkedBy?.some(
    (b: any) => b.toString() === currentUser._id || b._id === currentUser._id
  );
  
  // Check if current user has reposted
  const hasReposted = currentUser && post.repostedBy?.some(
    (r: any) => r.toString() === currentUser._id || r._id === currentUser._id
  );

  // Get author avatar
  const getAvatarUrl = (author: any) => {
    if (author?.profilePicture) return author.profilePicture;
    if (author?.avatar) return author.avatar;
    const name = author?.name || author?.username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00ff00&color=000&bold=true`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Handle verify click
  const handleVerify = async () => {
    if (!currentUser || isVerifying) return;
    setIsVerifying(true);
    try {
      onVerify?.(post._id);
    } finally {
      setIsVerifying(false);
    }
  };

  // Get fact check status config
  const factCheckStatus = post.factCheckStatus || 'unverified';
  const factCheck = FACT_CHECK_CONFIG[factCheckStatus as keyof typeof FACT_CHECK_CONFIG];
  
  // Get author badge
  const authorBadge = post.author?.verificationBadge || 'none';
  const badge = BADGE_CONFIG[authorBadge as keyof typeof BADGE_CONFIG];

  return (
    <article style={styles.postCard}>
      {/* Repost Header (if applicable) */}
      {post.repostedBy && post.repostedBy.length > 0 && (
        <div style={styles.repostHeader}>
          <span style={styles.repostIcon}>🔄</span>
          <span style={styles.repostText}>Reposted</span>
        </div>
      )}

      <div style={styles.postContent}>
        {/* Avatar */}
        <div style={styles.avatarContainer}>
          <img
            src={getAvatarUrl(post.author)}
            alt={post.author?.username || 'User'}
            style={styles.avatar}
          />
          {/* Trust Score Ring */}
          <div 
            style={{
              ...styles.trustRing,
              background: `conic-gradient(#00FF00 ${(post.author?.trustScore || 0) * 3.6}deg, #333 0deg)`
            }}
            title={`Trust Score: ${post.author?.trustScore || 0}`}
          />
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Header */}
          <div style={styles.postHeader}>
            <div style={styles.authorInfo}>
              <span style={styles.authorName}>
                {post.author?.name || post.author?.username}
              </span>
              {post.author?.isVerified && (
                <span style={styles.verifiedBadge} title="Verified Account">✓</span>
              )}
              {badge.icon && (
                <span style={styles.authorBadge} title={badge.label}>
                  {badge.icon}
                </span>
              )}
              <span style={styles.authorHandle}>
                @{post.author?.username}
              </span>
              <span style={styles.dot}>·</span>
              <span style={styles.postDate}>
                {formatDate(post.createdAt)}
              </span>
            </div>
            
            {/* More Options */}
            <button style={styles.moreBtn} title="More options">
              •••
            </button>
          </div>

          {/* Post Text */}
          <div style={styles.postText}>
            {post.content}
          </div>

          {/* Media (if any) */}
          {post.media && post.media.length > 0 && (
            <div style={styles.mediaContainer}>
              {post.media.map((media: any, index: number) => (
                <img
                  key={index}
                  src={media.url}
                  alt={media.alt || 'Post media'}
                  style={styles.mediaImage}
                />
              ))}
            </div>
          )}

          {/* Fact Check Badge */}
          {factCheckStatus !== 'unverified' && (
            <div 
              style={{
                ...styles.factCheckBadge,
                backgroundColor: factCheck.bgColor,
                borderColor: factCheck.color
              }}
            >
              <span>{factCheck.icon}</span>
              <span style={{ color: factCheck.color, fontWeight: 600 }}>
                {factCheck.label}
              </span>
              {post.factCheckDetails?.explanation && (
                <span style={styles.factCheckExplanation}>
                  - {post.factCheckDetails.explanation}
                </span>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div style={styles.actionBar}>
            {/* Comment */}
            <button 
              style={styles.actionBtn}
              onClick={() => onComment?.(post._id)}
              title="Comment"
            >
              <span style={styles.actionIcon}>💬</span>
              <span style={styles.actionCount}>
                {post.comments?.length || 0}
              </span>
            </button>

            {/* Repost */}
            <button 
              style={{
                ...styles.actionBtn,
                ...(hasReposted ? styles.actionBtnActive : {})
              }}
              onClick={() => onRepost?.(post._id)}
              title="Repost"
            >
              <span style={styles.actionIcon}>🔄</span>
              <span style={{
                ...styles.actionCount,
                color: hasReposted ? '#00FF00' : 'inherit'
              }}>
                {post.reposts || 0}
              </span>
            </button>

            {/* VERIFY - The VIURL Special Button! */}
            <div 
              style={styles.verifyContainer}
              onMouseEnter={() => setShowVerifyTooltip(true)}
              onMouseLeave={() => setShowVerifyTooltip(false)}
            >
              <button 
                style={{
                  ...styles.actionBtn,
                  ...styles.verifyBtn,
                  ...(hasVerified ? styles.verifyBtnActive : {})
                }}
                onClick={handleVerify}
                disabled={isVerifying || !currentUser}
                title={hasVerified ? "You verified this" : "Verify this post"}
              >
                <span style={{
                  ...styles.verifyIcon,
                  ...(hasVerified ? styles.verifyIconActive : {})
                }}>
                  {hasVerified ? '✅' : '✓'}
                </span>
                <span style={{
                  ...styles.actionCount,
                  ...(hasVerified ? styles.verifyCountActive : {})
                }}>
                  {post.verificationCount || post.verifications?.length || 0}
                </span>
              </button>
              
              {/* Verify Tooltip */}
              {showVerifyTooltip && !hasVerified && (
                <div style={styles.verifyTooltip}>
                  <strong>Verify this post</strong>
                  <p>Confirm this information is accurate</p>
                  <small>Earn V-TKN for accurate verifications!</small>
                </div>
              )}
            </div>

            {/* Bookmark */}
            <button 
              style={{
                ...styles.actionBtn,
                ...(hasBookmarked ? styles.actionBtnActive : {})
              }}
              onClick={() => onBookmark?.(post._id)}
              title={hasBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <span style={styles.actionIcon}>
                {hasBookmarked ? '🔖' : '📑'}
              </span>
            </button>

            {/* Share */}
            <button 
              style={styles.actionBtn}
              onClick={() => onShare?.(post._id)}
              title="Share"
            >
              <span style={styles.actionIcon}>📤</span>
            </button>
          </div>

          {/* Token Rewards Display (if any) */}
          {post.tokenRewards && post.tokenRewards.total > 0 && (
            <div style={styles.tokenRewards}>
              <span style={styles.tokenIcon}>💰</span>
              <span style={styles.tokenAmount}>
                {post.tokenRewards.total} V-TKN earned
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  postCard: {
    backgroundColor: '#000000',
    borderBottom: '1px solid #2a2a2a',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  repostHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginLeft: '52px',
    marginBottom: '4px',
    fontSize: '13px',
    color: '#888',
  },
  repostIcon: {
    fontSize: '12px',
  },
  repostText: {
    fontWeight: 500,
  },
  postContent: {
    display: 'flex',
    gap: '12px',
  },
  avatarContainer: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  trustRing: {
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '2px solid #000',
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
  },
  postHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  authorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexWrap: 'wrap',
  },
  authorName: {
    fontWeight: 700,
    color: '#ffffff',
    fontSize: '15px',
  },
  verifiedBadge: {
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
  authorBadge: {
    fontSize: '14px',
  },
  authorHandle: {
    color: '#888888',
    fontSize: '15px',
  },
  dot: {
    color: '#888888',
  },
  postDate: {
    color: '#888888',
    fontSize: '15px',
  },
  moreBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '50%',
    fontSize: '14px',
    letterSpacing: '1px',
  },
  postText: {
    color: '#ffffff',
    fontSize: '15px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    marginBottom: '12px',
  },
  mediaContainer: {
    marginTop: '12px',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    maxHeight: '500px',
    objectFit: 'cover',
    borderRadius: '16px',
    border: '1px solid #2a2a2a',
  },
  factCheckBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '12px',
    fontSize: '13px',
  },
  factCheckExplanation: {
    color: '#888',
    fontSize: '12px',
  },
  actionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '425px',
    marginTop: '12px',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    color: '#888888',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50px',
    transition: 'all 0.2s ease',
    fontSize: '13px',
  },
  actionBtnActive: {
    color: '#00FF00',
  },
  actionIcon: {
    fontSize: '18px',
  },
  actionCount: {
    fontSize: '13px',
    minWidth: '20px',
  },
  verifyContainer: {
    position: 'relative',
  },
  verifyBtn: {
    position: 'relative',
  },
  verifyBtnActive: {
    color: '#00FF00',
  },
  verifyIcon: {
    fontSize: '18px',
    transition: 'all 0.3s ease',
  },
  verifyIconActive: {
    color: '#00FF00',
    textShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
  },
  verifyCountActive: {
    color: '#00FF00',
    fontWeight: 600,
  },
  verifyTooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#1a1a1a',
    border: '1px solid #00FF00',
    borderRadius: '8px',
    padding: '12px',
    minWidth: '200px',
    zIndex: 100,
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0, 255, 0, 0.2)',
  },
  tokenRewards: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '8px',
    padding: '6px 12px',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderRadius: '20px',
    width: 'fit-content',
    fontSize: '12px',
    color: '#00FF00',
  },
  tokenIcon: {
    fontSize: '14px',
  },
  tokenAmount: {
    fontWeight: 600,
  },
};

export default PostCard;