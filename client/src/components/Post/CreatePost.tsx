import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { createPost } from '../../store/slices/feedSlice';
import type { CreatePostProps } from '../../types';

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated, placeholder }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_CHARS = 280;
  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canPost = content.trim().length > 0 && !isOverLimit && !isSubmitting;

  const handleSubmit = async () => {
    if (!canPost) return;
    setIsSubmitting(true);
    try {
      await dispatch(createPost({ content })).unwrap();
      setContent('');
      onPostCreated?.();
    } catch (err) {
      console.error('Failed to create post:', err);
    }
    setIsSubmitting(false);
  };

  const getBadge = (score: number) => {
    if (score >= 95) return '💎';
    if (score >= 75) return '🥇';
    if (score >= 50) return '🥈';
    return '🥉';
  };

  const styles = {
    container: {
      display: 'flex',
      gap: '12px',
      padding: '15px 0',
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
    form: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
    } as React.CSSProperties,
    textarea: {
      width: '100%',
      minHeight: '80px',
      backgroundColor: 'transparent',
      border: 'none',
      color: '#fff',
      fontSize: '18px',
      resize: 'none' as const,
      outline: 'none',
      fontFamily: 'inherit',
    } as React.CSSProperties,
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTop: '1px solid #333',
      paddingTop: '12px',
    } as React.CSSProperties,
    actions: {
      display: 'flex',
      gap: '8px',
    } as React.CSSProperties,
    actionBtn: {
      background: 'none',
      border: 'none',
      color: '#00FF00',
      fontSize: '18px',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '50%',
      transition: 'background-color 0.2s',
    } as React.CSSProperties,
    right: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    } as React.CSSProperties,
    charCount: {
      fontSize: '14px',
      color: isOverLimit ? '#F44' : charCount > MAX_CHARS * 0.9 ? '#FA0' : '#888',
    } as React.CSSProperties,
    postBtn: {
      backgroundColor: canPost ? '#00FF00' : '#004400',
      color: canPost ? '#000' : '#888',
      border: 'none',
      borderRadius: '25px',
      padding: '10px 20px',
      fontSize: '15px',
      fontWeight: 'bold' as const,
      cursor: canPost ? 'pointer' : 'not-allowed',
      transition: 'all 0.2s',
    } as React.CSSProperties,
  };

  if (!user) return null;

  return (
    <div style={styles.container}>
      <div style={styles.avatar}>
        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={user.name}
            style={{ width: '100%', height: '100%', borderRadius: '50%' }}
          />
        ) : (
          user.name?.charAt(0).toUpperCase()
        )}
      </div>
      <div style={styles.form}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || "What's happening?"}
          style={styles.textarea}
          maxLength={MAX_CHARS + 50}
        />
        <div style={styles.footer}>
          <div style={styles.actions}>
            <button style={styles.actionBtn} title="Add image">🖼️</button>
            <button style={styles.actionBtn} title="Add GIF">GIF</button>
            <button style={styles.actionBtn} title="Add poll">📊</button>
            <button style={styles.actionBtn} title="Add emoji">😀</button>
          </div>
          <div style={styles.right}>
            <span style={styles.charCount}>
              {charCount}/{MAX_CHARS}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!canPost}
              style={styles.postBtn}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
