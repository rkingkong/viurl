import React from 'react';
import type { PostCardProps } from '../../types';

const PostCard: React.FC<PostCardProps> = ({
  post,
  onVerify,
  onRepost,
  onBookmark,
  onComment,
  onShare,
}) => {
  const isLiked = post.isLikedByMe || false;
  const isReposted = post.isRepostedByMe || false;
  const isBookmarked = post.isBookmarkedByMe || false;
  const isVerified = post.isVerifiedByMe || false;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const getBadge = (score: number) => {
    if (score >= 95) return '💎';
    if (score >= 75) return '🥇';
    if (score >= 50) return '🥈';
    return '🥉';
  };

  const styles = {
    container: {
      borderBottom: '1px solid #333',
      padding: '15px 20px',
      backgroundColor: '#000',
      transition: 'background-color 0.2s',
    } as React.CSSProperties,
    header: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    } as React.CSSProperties,
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: '#333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      flexShrink: 0,
    } as React.CSSProperties,
    content: {
      flex: 1,
      minWidth: 0,
    } as React.CSSProperties,
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '4px',
      flexWrap: 'wrap' as const,
    } as React.CSSProperties,
    name: {
      fontWeight: 'bold',
      color: '#fff',
      fontSize: '15px',
    } as React.CSSProperties,
    username: {
      color: '#888',
      fontSize: '14px',
    } as React.CSSProperties,
    time: {
      color: '#888',
      fontSize: '14px',
    } as React.CSSProperties,
    text: {
      color: '#fff',
      fontSize: '15px',
      lineHeight: '1.4',
      marginBottom: '12px',
      wordWrap: 'break-word' as const,
    } as React.CSSProperties,
    verificationBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      backgroundColor: '#00FF0020',
      color: '#00FF00',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
    } as React.CSSProperties,
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      maxWidth: '400px',
      marginTop: '12px',
    } as React.CSSProperties,
    actionBtnBase: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: 'none',
      border: 'none',
      fontSize: '13px',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '20px',
      transition: 'all 0.2s',
    } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.avatar}>
          {post.author.profilePicture ? (
            <img
              src={post.author.profilePicture}
              alt={post.author.name}
              style={{ width: '100%', height: '100%', borderRadius: '50%' }}
            />
          ) : (
            post.author.name?.charAt(0).toUpperCase()
          )}
        </div>
        <div style={styles.content}>
          <div style={styles.userInfo}>
            <span style={styles.name}>
              {post.author.name} {getBadge(post.author.trustScore || 0)}
            </span>
            <span style={styles.username}>@{post.author.username}</span>
            <span style={styles.time}>· {formatTime(post.createdAt)}</span>
          </div>
          
          <div style={styles.text}>{post.content}</div>
          
          {post.verificationStatus === 'verified' && (
            <div style={styles.verificationBadge}>
              ✓ Verified · {post.verifications?.length || 0} verifiers
            </div>
          )}
          
          <div style={styles.actions}>
            <button
              onClick={() => onComment?.(post._id)}
              style={{ ...styles.actionBtnBase, color: '#888' }}
            >
              💬 {post.comments?.length || 0}
            </button>
            
            <button
              onClick={() => onRepost?.(post._id)}
              style={{ ...styles.actionBtnBase, color: isReposted ? '#00BA7C' : '#888' }}
            >
              🔄 {post.reposts || 0}
            </button>
            
            <button
              onClick={() => onVerify?.(post._id)}
              style={{
                ...styles.actionBtnBase,
                color: isVerified ? '#00FF00' : '#888',
                fontWeight: isVerified ? 600 : 400,
              }}
            >
              ✓ {isVerified ? 'Verified' : 'Verify'}
            </button>
            
            <button
              onClick={() => onBookmark?.(post._id)}
              style={{ ...styles.actionBtnBase, color: isBookmarked ? '#F91880' : '#888' }}
            >
              {isBookmarked ? '🔖' : '📑'}
            </button>
            
            <button
              onClick={() => onShare?.(post._id)}
              style={{ ...styles.actionBtnBase, color: '#888' }}
            >
              ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
