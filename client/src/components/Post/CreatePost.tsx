// CreatePost.tsx - VIURL Post Composer Component
// Location: client/src/components/Post/CreatePost.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { createPost } from '../../store/slices/feedSlice';

interface CreatePostProps {
  placeholder?: string;
  replyTo?: string; // For reply posts
  onPostCreated?: () => void;
  compact?: boolean; // For modal/sidebar usage
}

const MAX_CHARS = 280;

const CreatePost: React.FC<CreatePostProps> = ({
  placeholder = "What's happening?",
  replyTo,
  onPostCreated,
  compact = false
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Character count
  const charCount = content.length;
  const charsRemaining = MAX_CHARS - charCount;
  const isOverLimit = charsRemaining < 0;
  const isNearLimit = charsRemaining <= 20 && charsRemaining >= 0;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Get user avatar
  const getAvatarUrl = () => {
    if (user?.profilePicture) return user.profilePicture;
    if (user?.avatar) return user.avatar;
    const name = user?.name || user?.username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00ff00&color=000&bold=true`;
  };

  // Handle post submission
  const handleSubmit = async () => {
    if (!content.trim() || isOverLimit || isPosting) return;
    
    setIsPosting(true);
    try {
      await dispatch(createPost(content));
      setContent('');
      setIsFocused(false);
      onPostCreated?.();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  // Handle keyboard shortcut (Cmd/Ctrl + Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Quick emoji insertion
  const quickEmojis = ['😀', '🔥', '💯', '✅', '🚀', '💡', '🎯', '💪'];
  
  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + emoji + content.substring(end);
      setContent(newContent);
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setContent(content + emoji);
    }
  };

  // Calculate progress ring
  const getProgressColor = () => {
    if (isOverLimit) return '#FF4444';
    if (isNearLimit) return '#FFD700';
    return '#00FF00';
  };

  const getProgressPercentage = () => {
    return Math.min((charCount / MAX_CHARS) * 100, 100);
  };

  return (
    <div style={{
      ...styles.container,
      ...(compact ? styles.containerCompact : {}),
      ...(isFocused ? styles.containerFocused : {})
    }}>
      <div style={styles.composerWrapper}>
        {/* Avatar */}
        <div style={styles.avatarContainer}>
          <img
            src={getAvatarUrl()}
            alt={user?.username || 'User'}
            style={styles.avatar}
          />
          {/* Trust Score Badge */}
          {user?.trustScore !== undefined && (
            <div 
              style={styles.trustBadge}
              title={`Trust Score: ${user.trustScore}`}
            >
              {user.trustScore}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={styles.inputWrapper}>
          {/* Audience Selector (when focused) */}
          {isFocused && !replyTo && (
            <button style={styles.audienceBtn}>
              <span>🌍</span>
              <span>Everyone</span>
              <span style={styles.dropdownIcon}>▼</span>
            </button>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              ...styles.textarea,
              ...(compact ? styles.textareaCompact : {})
            }}
            rows={compact ? 2 : 3}
          />

          {/* Reply Context */}
          {replyTo && (
            <div style={styles.replyContext}>
              <span style={styles.replyIcon}>↩️</span>
              <span>Replying to a post</span>
            </div>
          )}

          {/* Action Bar */}
          <div style={styles.actionBar}>
            {/* Left Tools */}
            <div style={styles.tools}>
              {/* Image Upload */}
              <button style={styles.toolBtn} title="Add image">
                <span style={styles.toolIcon}>🖼️</span>
              </button>

              {/* GIF */}
              <button style={styles.toolBtn} title="Add GIF">
                <span style={styles.toolIcon}>GIF</span>
              </button>

              {/* Poll */}
              <button style={styles.toolBtn} title="Create poll">
                <span style={styles.toolIcon}>📊</span>
              </button>

              {/* Emoji */}
              <div style={styles.emojiContainer}>
                <button 
                  style={styles.toolBtn} 
                  title="Add emoji"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <span style={styles.toolIcon}>😊</span>
                </button>
                
                {/* Quick Emoji Picker */}
                {showEmojiPicker && (
                  <div style={styles.emojiPicker}>
                    {quickEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        style={styles.emojiBtn}
                        onClick={() => {
                          insertEmoji(emoji);
                          setShowEmojiPicker(false);
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Schedule */}
              <button style={styles.toolBtn} title="Schedule post">
                <span style={styles.toolIcon}>📅</span>
              </button>

              {/* Location */}
              <button style={styles.toolBtn} title="Add location">
                <span style={styles.toolIcon}>📍</span>
              </button>
            </div>

            {/* Right Side */}
            <div style={styles.rightActions}>
              {/* Character Counter */}
              {content.length > 0 && (
                <div style={styles.charCounter}>
                  {/* Progress Ring */}
                  <svg width="24" height="24" style={styles.progressRing}>
                    {/* Background Circle */}
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="#333"
                      strokeWidth="2"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke={getProgressColor()}
                      strokeWidth="2"
                      strokeDasharray={`${getProgressPercentage() * 0.628} 62.8`}
                      strokeLinecap="round"
                      transform="rotate(-90 12 12)"
                      style={{ transition: 'stroke-dasharray 0.2s ease' }}
                    />
                  </svg>
                  
                  {/* Show remaining chars when near limit */}
                  {isNearLimit && (
                    <span style={{
                      ...styles.charCount,
                      color: getProgressColor()
                    }}>
                      {charsRemaining}
                    </span>
                  )}
                </div>
              )}

              {/* Divider */}
              {content.length > 0 && (
                <div style={styles.divider} />
              )}

              {/* Post Button */}
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || isOverLimit || isPosting}
                style={{
                  ...styles.postBtn,
                  ...((!content.trim() || isOverLimit) ? styles.postBtnDisabled : {}),
                  ...(isPosting ? styles.postBtnLoading : {})
                }}
              >
                {isPosting ? (
                  <span style={styles.spinner}>⏳</span>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </div>

          {/* V-TKN Tip */}
          {isFocused && (
            <div style={styles.tokenTip}>
              <span style={styles.tokenIcon}>💡</span>
              <span>Quality posts that get verified earn V-TKN tokens!</span>
            </div>
          )}
        </div>
      </div>

      {/* Over Limit Warning */}
      {isOverLimit && (
        <div style={styles.overLimitWarning}>
          <span>⚠️</span>
          <span>Your post is {Math.abs(charsRemaining)} characters over the limit</span>
        </div>
      )}
    </div>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#000000',
    borderBottom: '1px solid #2a2a2a',
    padding: '12px 16px',
    transition: 'all 0.2s ease',
  },
  containerCompact: {
    padding: '8px 12px',
  },
  containerFocused: {
    borderColor: '#00FF00',
  },
  composerWrapper: {
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
  trustBadge: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    backgroundColor: '#00FF00',
    color: '#000',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 4px',
    borderRadius: '8px',
    border: '2px solid #000',
  },
  inputWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  audienceBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #00FF00',
    borderRadius: '20px',
    color: '#00FF00',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    width: 'fit-content',
    transition: 'all 0.2s ease',
  },
  dropdownIcon: {
    fontSize: '10px',
    marginLeft: '4px',
  },
  textarea: {
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize: '20px',
    lineHeight: '1.4',
    resize: 'none',
    fontFamily: 'inherit',
    minHeight: '80px',
  },
  textareaCompact: {
    fontSize: '16px',
    minHeight: '50px',
  },
  replyContext: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#888',
  },
  replyIcon: {
    fontSize: '14px',
  },
  actionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #2a2a2a',
    paddingTop: '12px',
    marginTop: '8px',
  },
  tools: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  toolBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#00FF00',
  },
  toolIcon: {
    fontSize: '18px',
  },
  emojiContainer: {
    position: 'relative',
  },
  emojiPicker: {
    position: 'absolute',
    bottom: '100%',
    left: '0',
    display: 'flex',
    gap: '4px',
    padding: '8px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    zIndex: 100,
  },
  emojiBtn: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '20px',
    transition: 'background-color 0.2s ease',
  },
  rightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  charCounter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  progressRing: {
    transform: 'rotate(-90deg)',
  },
  charCount: {
    fontSize: '12px',
    fontWeight: 600,
  },
  divider: {
    width: '1px',
    height: '24px',
    backgroundColor: '#333',
  },
  postBtn: {
    padding: '10px 20px',
    backgroundColor: '#00FF00',
    color: '#000000',
    border: 'none',
    borderRadius: '25px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '80px',
  },
  postBtnDisabled: {
    backgroundColor: '#004400',
    color: '#006600',
    cursor: 'not-allowed',
  },
  postBtnLoading: {
    backgroundColor: '#006600',
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
  tokenTip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#00FF00',
  },
  tokenIcon: {
    fontSize: '16px',
  },
  overLimitWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid #FF4444',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#FF4444',
  },
};

export default CreatePost;