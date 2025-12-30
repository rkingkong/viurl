// PostCard.tsx - VIURL Post Component with Verification System
// Location: client/src/components/Post/PostCard.tsx

import { useState } from 'react';
import VerificationModal from '../Verification/VerificationModal';

interface Author {
  id: string;
  username: string;
  name: string;
  profilePicture?: string;
  trustScore: number;
  verificationBadge: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
  isVerified?: boolean;
}

interface Post {
  id: string;
  author: Author;
  content: string;
  media?: {
    type: 'image' | 'video' | 'gif';
    url: string;
  }[];
  createdAt: string;
  // VIURL Specific
  verificationCount: number;
  factCheckStatus: 'unverified' | 'true' | 'false' | 'misleading' | 'partially_true';
  trustScore: number;
  // Engagement
  commentCount: number;
  repostCount: number;
  bookmarkCount: number;
  // User state
  isVerified?: boolean;
  isReposted?: boolean;
  isBookmarked?: boolean;
}

interface PostCardProps {
  post: Post;
  onNavigate?: (page: string, params?: any) => void;
  onVerify?: (postId: string, data: any) => void;
  onRepost?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

const PostCard = ({ 
  post, 
  onNavigate, 
  onVerify, 
  onRepost, 
  onBookmark, 
  onComment,
  onShare 
}: PostCardProps) => {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerified, setIsVerified] = useState(post.isVerified || false);
  const [verificationCount, setVerificationCount] = useState(post.verificationCount);
  const [isReposted, setIsReposted] = useState(post.isReposted || false);
  const [repostCount, setRepostCount] = useState(post.repostCount);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [bookmarkCount, setBookmarkCount] = useState(post.bookmarkCount);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Get badge icon
  const getBadgeIcon = (badge: string): string => {
    switch (badge) {
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '';
    }
  };

  // Get fact-check badge info
  const getFactCheckInfo = (status: string): { icon: string; label: string; color: string; bgColor: string } => {
    switch (status) {
      case 'true':
        return { icon: '✅', label: 'Verified True', color: '#00FF00', bgColor: 'rgba(0, 255, 0, 0.1)' };
      case 'false':
        return { icon: '❌', label: 'Verified False', color: '#FF4444', bgColor: 'rgba(255, 68, 68, 0.1)' };
      case 'misleading':
        return { icon: '🔶', label: 'Misleading', color: '#FF8800', bgColor: 'rgba(255, 136, 0, 0.1)' };
      case 'partially_true':
        return { icon: '⚠️', label: 'Partially True', color: '#FFD700', bgColor: 'rgba(255, 215, 0, 0.1)' };
      default:
        return { icon: '', label: '', color: '', bgColor: '' };
    }
  };

  // Format time ago
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format count
  const formatCount = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Handle verify click
  const handleVerifyClick = () => {
    if (isVerified) {
      // Already verified - could show details or undo
      return;
    }
    setShowVerificationModal(true);
  };

  // Handle verification submit
  const handleVerificationSubmit = async (data: any) => {
    try {
      // Call API
      if (onVerify) {
        await onVerify(post.id, data);
      }
      
      // Update local state
      setIsVerified(true);
      setVerificationCount(prev => prev + 1);
      
      // Close modal
      setShowVerificationModal(false);
    } catch (error) {
      console.error('Verification failed:', error);
      throw error;
    }
  };

  // Handle repost
  const handleRepost = () => {
    setIsReposted(!isReposted);
    setRepostCount(prev => isReposted ? prev - 1 : prev + 1);
    if (onRepost) onRepost(post.id);
  };

  // Handle bookmark
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    setBookmarkCount(prev => isBookmarked ? prev - 1 : prev + 1);
    if (onBookmark) onBookmark(post.id);
  };

  // Handle comment
  const handleComment = () => {
    if (onComment) onComment(post.id);
  };

  // Handle share
  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  // Copy link
  const copyLink = () => {
    navigator.clipboard.writeText(`https://viurl.com/post/${post.id}`);
    setShowShareMenu(false);
    // Could show toast notification
  };

  const factCheck = getFactCheckInfo(post.factCheckStatus);

  const styles: Record<string, React.CSSProperties> = {
    card: {
      backgroundColor: '#000',
      borderBottom: '1px solid #222',
      padding: '16px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    cardInner: {
      display: 'flex',
      gap: '12px',
    },
    // Avatar with trust ring
    avatarContainer: {
      position: 'relative',
      width: '48px',
      height: '48px',
      flexShrink: 0,
    },
    trustRing: {
      position: 'absolute',
      top: '-3px',
      left: '-3px',
      width: '54px',
      height: '54px',
      borderRadius: '50%',
      background: `conic-gradient(#00FF00 ${post.author.trustScore * 3.6}deg, #333 0deg)`,
      padding: '3px',
    },
    trustRingInner: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
      overflow: 'hidden',
    },
    avatarImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    // Content
    content: {
      flex: 1,
      minWidth: 0,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginBottom: '4px',
      flexWrap: 'wrap',
    },
    name: {
      color: '#fff',
      fontWeight: 700,
      fontSize: '15px',
    },
    badge: {
      fontSize: '14px',
    },
    username: {
      color: '#888',
      fontSize: '15px',
    },
    dot: {
      color: '#888',
      fontSize: '15px',
    },
    time: {
      color: '#888',
      fontSize: '15px',
    },
    moreBtn: {
      marginLeft: 'auto',
      background: 'none',
      border: 'none',
      color: '#888',
      fontSize: '18px',
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: '50%',
      transition: 'all 0.2s',
    },
    // Post content
    postText: {
      color: '#e7e9ea',
      fontSize: '15px',
      lineHeight: 1.5,
      marginBottom: '12px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },
    // Media
    mediaContainer: {
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '12px',
      border: '1px solid #333',
    },
    mediaImage: {
      width: '100%',
      maxHeight: '500px',
      objectFit: 'cover',
      display: 'block',
    },
    // Fact check badge
    factCheckBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 600,
      marginBottom: '12px',
      backgroundColor: factCheck.bgColor,
      color: factCheck.color,
      border: `1px solid ${factCheck.color}30`,
    },
    factCheckIcon: {
      fontSize: '14px',
    },
    // Trust score badge
    trustBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      backgroundColor: '#00FF0015',
      color: '#00FF00',
      marginLeft: '8px',
    },
    // Actions
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '12px',
      maxWidth: '425px',
    },
    actionBtn: (active: boolean, color: string) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'none',
      border: 'none',
      color: active ? color : '#888',
      fontSize: '14px',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '9999px',
      transition: 'all 0.2s',
    }),
    actionIcon: {
      fontSize: '18px',
    },
    // Verify button (special)
    verifyBtn: (active: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: active ? '#00FF00' : 'transparent',
      border: active ? 'none' : '1px solid #00FF00',
      color: active ? '#000' : '#00FF00',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      padding: '6px 14px',
      borderRadius: '9999px',
      transition: 'all 0.2s',
    }),
    // Share menu
    shareMenu: {
      position: 'absolute',
      bottom: '100%',
      right: 0,
      backgroundColor: '#000',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '8px 0',
      minWidth: '200px',
      zIndex: 100,
      boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
    },
    shareMenuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      width: '100%',
      padding: '12px 16px',
      background: 'none',
      border: 'none',
      color: '#fff',
      fontSize: '15px',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'background-color 0.2s',
    },
    // Verification count
    verificationStats: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '8px 0',
      borderTop: '1px solid #222',
      marginTop: '8px',
      fontSize: '13px',
      color: '#888',
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    statValue: {
      color: '#fff',
      fontWeight: 600,
    },
  };

  return (
    <>
      <article
        style={styles.card}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#080808'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000'}
        onClick={() => onNavigate && onNavigate('post', { postId: post.id })}
      >
        <div style={styles.cardInner}>
          {/* Avatar with Trust Ring */}
          <div 
            style={styles.avatarContainer}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate && onNavigate('profile', { userId: post.author.username });
            }}
          >
            <div style={styles.trustRing}>
              <div style={styles.trustRingInner}>
                <div style={styles.avatar}>
                  {post.author.profilePicture ? (
                    <img src={post.author.profilePicture} alt="" style={styles.avatarImg} />
                  ) : (
                    post.author.name.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={styles.content}>
            {/* Header */}
            <div style={styles.header}>
              <span 
                style={styles.name}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate && onNavigate('profile', { userId: post.author.username });
                }}
              >
                {post.author.name}
              </span>
              {post.author.verificationBadge !== 'none' && (
                <span style={styles.badge}>{getBadgeIcon(post.author.verificationBadge)}</span>
              )}
              <span style={styles.username}>@{post.author.username}</span>
              <span style={styles.dot}>·</span>
              <span style={styles.time}>{getTimeAgo(post.createdAt)}</span>
              {post.author.trustScore >= 90 && (
                <span style={styles.trustBadge}>
                  <span>✓</span> {post.author.trustScore}%
                </span>
              )}
              <button
                style={styles.moreBtn}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a1a';
                  e.currentTarget.style.color = '#00FF00';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#888';
                }}
              >
                •••
              </button>
            </div>

            {/* Post Text */}
            <p style={styles.postText}>{post.content}</p>

            {/* Media */}
            {post.media && post.media.length > 0 && (
              <div style={styles.mediaContainer}>
                {post.media[0].type === 'image' && (
                  <img src={post.media[0].url} alt="" style={styles.mediaImage} />
                )}
              </div>
            )}

            {/* Fact Check Badge */}
            {post.factCheckStatus !== 'unverified' && (
              <div style={styles.factCheckBadge}>
                <span style={styles.factCheckIcon}>{factCheck.icon}</span>
                <span>{factCheck.label}</span>
                <span style={{ color: '#888', fontWeight: 400 }}>
                  · {formatCount(verificationCount)} verifications
                </span>
              </div>
            )}

            {/* Actions */}
            <div style={styles.actions} onClick={(e) => e.stopPropagation()}>
              {/* Comment */}
              <button
                style={styles.actionBtn(false, '#1D9BF0')}
                onClick={handleComment}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#1D9BF0';
                  e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#888';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={styles.actionIcon}>💬</span>
                {post.commentCount > 0 && <span>{formatCount(post.commentCount)}</span>}
              </button>

              {/* Repost */}
              <button
                style={styles.actionBtn(isReposted, '#00BA7C')}
                onClick={handleRepost}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#00BA7C';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 186, 124, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isReposted ? '#00BA7C' : '#888';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={styles.actionIcon}>{isReposted ? '🔄' : '🔁'}</span>
                {repostCount > 0 && <span>{formatCount(repostCount)}</span>}
              </button>

              {/* VERIFY - The Main VIURL Action */}
              <button
                style={styles.verifyBtn(isVerified)}
                onClick={handleVerifyClick}
                onMouseEnter={(e) => {
                  if (!isVerified) {
                    e.currentTarget.style.backgroundColor = '#00FF00';
                    e.currentTarget.style.color = '#000';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isVerified) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#00FF00';
                  }
                }}
              >
                <span>✓</span>
                <span>{isVerified ? 'Verified' : 'Verify'}</span>
                {verificationCount > 0 && <span>({formatCount(verificationCount)})</span>}
              </button>

              {/* Bookmark */}
              <button
                style={styles.actionBtn(isBookmarked, '#F91880')}
                onClick={handleBookmark}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#F91880';
                  e.currentTarget.style.backgroundColor = 'rgba(249, 24, 128, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isBookmarked ? '#F91880' : '#888';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={styles.actionIcon}>{isBookmarked ? '🔖' : '📑'}</span>
              </button>

              {/* Share */}
              <div style={{ position: 'relative' }}>
                <button
                  style={styles.actionBtn(false, '#1D9BF0')}
                  onClick={handleShare}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#1D9BF0';
                    e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#888';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={styles.actionIcon}>↗️</span>
                </button>

                {/* Share Menu */}
                {showShareMenu && (
                  <div style={styles.shareMenu}>
                    <button
                      style={styles.shareMenuItem}
                      onClick={copyLink}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <span>🔗</span> Copy link
                    </button>
                    <button
                      style={styles.shareMenuItem}
                      onClick={() => {
                        window.open(`https://twitter.com/intent/tweet?url=https://viurl.com/post/${post.id}`, '_blank');
                        setShowShareMenu(false);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <span>🐦</span> Share on X
                    </button>
                    <button
                      style={styles.shareMenuItem}
                      onClick={() => setShowShareMenu(false)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <span>✉️</span> Send via DM
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        post={{
          id: post.id,
          content: post.content,
          author: {
            username: post.author.username,
            name: post.author.name,
            profilePicture: post.author.profilePicture,
          },
        }}
        onSubmit={handleVerificationSubmit}
      />
    </>
  );
};

export default PostCard;