// CreatePost.tsx - VIURL Post Composer
// Location: client/src/components/Post/CreatePost.tsx

import { useState, useRef, useEffect } from 'react';

interface CreatePostProps {
  onPost?: (post: PostData) => void;
  onClose?: () => void;
  isModal?: boolean;
  replyTo?: {
    id: string;
    author: string;
    content: string;
  };
  quotedPost?: {
    id: string;
    author: string;
    content: string;
  };
  user?: {
    name: string;
    username: string;
    profilePicture?: string;
    trustScore: number;
    verificationBadge: string;
  };
}

interface PostData {
  content: string;
  media: MediaItem[];
  poll?: PollData;
  visibility: 'public' | 'followers' | 'verified';
  replyTo?: string;
  quotedPost?: string;
}

interface MediaItem {
  type: 'image' | 'gif' | 'video';
  url: string;
  file?: File;
}

interface PollData {
  options: string[];
  duration: number; // hours
}

const MAX_CHARS = 280;
const MAX_MEDIA = 4;

// Emoji categories
const EMOJI_CATEGORIES = {
  recent: ['👍', '❤️', '🔥', '👏', '😂', '🎉', '💯', '✅'],
  smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😷', '🤒', '🤕'],
  gestures: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✨', '⭐', '🌟', '💫', '⚡', '🔥', '💥', '🎉', '🎊', '✅', '❌', '⚠️', '🔶', '💯', '🏆'],
  objects: ['📱', '💻', '🖥️', '📷', '📹', '🎥', '📺', '📻', '🎙️', '🎚️', '🎛️', '⏱️', '📡', '🔋', '💡', '🔦', '📰', '📚', '📖', '🔗', '📎', '✂️', '📝', '✏️', '🔍', '🔎', '🔐', '🔑', '🗝️'],
};

const CreatePost = ({ 
  onPost, 
  onClose, 
  isModal = false, 
  replyTo, 
  quotedPost,
  user 
}: CreatePostProps) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [poll, setPoll] = useState<PollData | null>(null);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState(24);
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'verified'>('public');
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState<keyof typeof EMOJI_CATEGORIES>('recent');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Character count and progress
  const charCount = content.length;
  const charProgress = (charCount / MAX_CHARS) * 100;
  const isOverLimit = charCount > MAX_CHARS;
  const charsRemaining = MAX_CHARS - charCount;

  // Can post?
  const canPost = (content.trim().length > 0 || media.length > 0 || poll) && !isOverLimit && !isSubmitting;

  // Handle media upload
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newMedia: MediaItem[] = [];
    for (let i = 0; i < files.length && media.length + newMedia.length < MAX_MEDIA; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newMedia.push({
          type: file.type === 'image/gif' ? 'gif' : 'image',
          url: URL.createObjectURL(file),
          file,
        });
      }
    }
    setMedia([...media, ...newMedia]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove media
  const removeMedia = (index: number) => {
    const newMedia = [...media];
    URL.revokeObjectURL(newMedia[index].url);
    newMedia.splice(index, 1);
    setMedia(newMedia);
  };

  // Insert emoji
  const insertEmoji = (emoji: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.substring(0, start) + emoji + content.substring(end);
      setContent(newContent);
      
      // Restore cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + emoji.length;
          textareaRef.current.selectionEnd = start + emoji.length;
          textareaRef.current.focus();
        }
      }, 0);
    } else {
      setContent(content + emoji);
    }
  };

  // Add poll option
  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  // Remove poll option
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    }
  };

  // Update poll option
  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  // Create poll
  const createPoll = () => {
    const validOptions = pollOptions.filter(o => o.trim());
    if (validOptions.length >= 2) {
      setPoll({
        options: validOptions,
        duration: pollDuration,
      });
      setShowPollCreator(false);
    }
  };

  // Remove poll
  const removePoll = () => {
    setPoll(null);
    setPollOptions(['', '']);
    setPollDuration(24);
  };

  // Submit post
  const handleSubmit = async () => {
    if (!canPost) return;

    setIsSubmitting(true);

    const postData: PostData = {
      content: content.trim(),
      media,
      visibility,
      ...(poll && { poll }),
      ...(replyTo && { replyTo: replyTo.id }),
      ...(quotedPost && { quotedPost: quotedPost.id }),
    };

    try {
      if (onPost) {
        await onPost(postData);
      }
      
      // Reset form
      setContent('');
      setMedia([]);
      setPoll(null);
      setPollOptions(['', '']);
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get visibility icon
  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'public': return '🌍';
      case 'followers': return '👥';
      case 'verified': return '✅';
    }
  };

  // Get visibility label
  const getVisibilityLabel = () => {
    switch (visibility) {
      case 'public': return 'Everyone can reply';
      case 'followers': return 'Followers can reply';
      case 'verified': return 'Verified users can reply';
    }
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      backgroundColor: '#000',
      borderRadius: isModal ? '16px' : '0',
      border: isModal ? '1px solid #333' : 'none',
      borderBottom: '1px solid #333',
      padding: '16px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: '1px solid #333',
    },
    closeBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#fff',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '50%',
      transition: 'background-color 0.2s',
    },
    draftsBtn: {
      backgroundColor: 'transparent',
      border: '1px solid #333',
      borderRadius: '9999px',
      padding: '6px 16px',
      color: '#00FF00',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
    },
    composerArea: {
      display: 'flex',
      gap: '12px',
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: '#333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#00FF00',
      fontWeight: 700,
      fontSize: '20px',
      flexShrink: 0,
    },
    inputArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    // Reply indicator
    replyTo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#888',
      fontSize: '14px',
      marginBottom: '8px',
    },
    replyToUser: {
      color: '#00FF00',
    },
    textarea: {
      width: '100%',
      backgroundColor: 'transparent',
      border: 'none',
      color: '#fff',
      fontSize: '20px',
      lineHeight: 1.4,
      resize: 'none',
      outline: 'none',
      fontFamily: 'inherit',
      minHeight: '80px',
      maxHeight: '300px',
    },
    // Quoted post
    quotedPostPreview: {
      backgroundColor: '#111',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '12px',
    },
    quotedPostAuthor: {
      color: '#888',
      fontSize: '14px',
      marginBottom: '4px',
    },
    quotedPostContent: {
      color: '#ccc',
      fontSize: '14px',
    },
    // Media preview
    mediaPreview: {
      display: 'grid',
      gridTemplateColumns: media.length === 1 ? '1fr' : 'repeat(2, 1fr)',
      gap: '8px',
      borderRadius: '16px',
      overflow: 'hidden',
    },
    mediaItem: {
      position: 'relative',
      aspectRatio: media.length === 1 ? '16/9' : '1',
      backgroundColor: '#111',
    },
    mediaImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    mediaRemoveBtn: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      border: 'none',
      color: '#fff',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Poll preview
    pollPreview: {
      backgroundColor: '#111',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '16px',
    },
    pollHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px',
    },
    pollTitle: {
      color: '#fff',
      fontSize: '15px',
      fontWeight: 600,
    },
    pollRemoveBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#888',
      cursor: 'pointer',
      fontSize: '18px',
    },
    pollOption: {
      backgroundColor: '#222',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '8px',
      color: '#fff',
      fontSize: '15px',
    },
    pollDuration: {
      color: '#888',
      fontSize: '13px',
      marginTop: '8px',
    },
    // Poll creator
    pollCreator: {
      backgroundColor: '#111',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
    },
    pollInput: {
      width: '100%',
      backgroundColor: '#000',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '12px',
      color: '#fff',
      fontSize: '15px',
      outline: 'none',
      marginBottom: '8px',
    },
    pollOptionRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px',
    },
    pollOptionRemove: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#888',
      cursor: 'pointer',
      fontSize: '16px',
      padding: '4px',
    },
    addOptionBtn: {
      backgroundColor: 'transparent',
      border: '1px dashed #333',
      borderRadius: '8px',
      padding: '12px',
      color: '#00FF00',
      fontSize: '14px',
      cursor: 'pointer',
      width: '100%',
      marginBottom: '12px',
    },
    pollDurationSelect: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '12px',
    },
    durationLabel: {
      color: '#888',
      fontSize: '14px',
    },
    durationSelect: {
      backgroundColor: '#000',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '8px 12px',
      color: '#fff',
      fontSize: '14px',
      outline: 'none',
    },
    pollActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
    },
    pollCancelBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#888',
      fontSize: '14px',
      cursor: 'pointer',
      padding: '8px 16px',
    },
    pollCreateBtn: {
      backgroundColor: '#00FF00',
      border: 'none',
      borderRadius: '9999px',
      padding: '8px 20px',
      color: '#000',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
    },
    // Visibility selector
    visibilitySelector: {
      position: 'relative',
      marginBottom: '12px',
    },
    visibilityBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: 'transparent',
      border: 'none',
      color: '#00FF00',
      fontSize: '14px',
      cursor: 'pointer',
      padding: '4px 0',
    },
    visibilityMenu: {
      position: 'absolute',
      top: '100%',
      left: 0,
      backgroundColor: '#000',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '8px 0',
      minWidth: '260px',
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    },
    visibilityOption: (selected: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      width: '100%',
      padding: '12px 16px',
      backgroundColor: selected ? '#111' : 'transparent',
      border: 'none',
      color: '#fff',
      fontSize: '15px',
      cursor: 'pointer',
      textAlign: 'left' as const,
    }),
    visibilityIcon: {
      fontSize: '20px',
    },
    visibilityInfo: {
      flex: 1,
    },
    visibilityLabel: {
      fontWeight: 600,
    },
    visibilityDesc: {
      color: '#888',
      fontSize: '13px',
    },
    visibilityCheck: {
      color: '#00FF00',
      fontSize: '18px',
    },
    // Actions bar
    actionsBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: '12px',
      borderTop: '1px solid #333',
    },
    actionButtons: {
      display: 'flex',
      gap: '4px',
    },
    actionBtn: (disabled: boolean) => ({
      backgroundColor: 'transparent',
      border: 'none',
      color: disabled ? '#333' : '#00FF00',
      fontSize: '20px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      padding: '8px',
      borderRadius: '50%',
      transition: 'background-color 0.2s',
    }),
    rightActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    // Character counter
    charCounter: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    charCircle: {
      position: 'relative',
      width: '30px',
      height: '30px',
    },
    charCircleSvg: {
      transform: 'rotate(-90deg)',
    },
    charCircleTrack: {
      fill: 'none',
      stroke: '#333',
      strokeWidth: 2,
    },
    charCircleProgress: (progress: number, isOver: boolean) => ({
      fill: 'none',
      stroke: isOver ? '#FF4444' : progress > 80 ? '#FFD700' : '#00FF00',
      strokeWidth: 2,
      strokeDasharray: `${Math.min(progress, 100) * 0.754} 100`,
      transition: 'stroke-dasharray 0.2s, stroke 0.2s',
    }),
    charText: (isOver: boolean) => ({
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '10px',
      fontWeight: 600,
      color: isOver ? '#FF4444' : charsRemaining <= 20 ? '#FFD700' : '#888',
    }),
    divider: {
      width: '1px',
      height: '24px',
      backgroundColor: '#333',
    },
    postBtn: (enabled: boolean) => ({
      backgroundColor: enabled ? '#00FF00' : '#003300',
      border: 'none',
      borderRadius: '9999px',
      padding: '10px 20px',
      color: enabled ? '#000' : '#006600',
      fontSize: '15px',
      fontWeight: 700,
      cursor: enabled ? 'pointer' : 'not-allowed',
      transition: 'all 0.2s',
    }),
    // Emoji picker
    emojiPicker: {
      position: 'absolute',
      bottom: '100%',
      left: 0,
      backgroundColor: '#000',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '12px',
      width: '320px',
      maxHeight: '300px',
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    },
    emojiCategories: {
      display: 'flex',
      gap: '4px',
      marginBottom: '12px',
      borderBottom: '1px solid #333',
      paddingBottom: '8px',
    },
    emojiCategoryBtn: (active: boolean) => ({
      backgroundColor: active ? '#222' : 'transparent',
      border: 'none',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '16px',
      cursor: 'pointer',
    }),
    emojiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(8, 1fr)',
      gap: '4px',
      maxHeight: '200px',
      overflowY: 'auto',
    },
    emojiBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '22px',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      transition: 'background-color 0.2s',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header (modal only) */}
      {isModal && (
        <div style={styles.header}>
          <button
            style={styles.closeBtn}
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#222'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ✕
          </button>
          <button style={styles.draftsBtn}>Drafts</button>
        </div>
      )}

      {/* Composer Area */}
      <div style={styles.composerArea}>
        {/* Avatar */}
        <div style={styles.avatar}>
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
          ) : (
            user?.name?.charAt(0) || 'U'
          )}
        </div>

        {/* Input Area */}
        <div style={styles.inputArea}>
          {/* Reply indicator */}
          {replyTo && (
            <div style={styles.replyTo}>
              Replying to <span style={styles.replyToUser}>@{replyTo.author}</span>
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            placeholder={replyTo ? "Post your reply" : "What's happening?"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={styles.textarea}
            rows={1}
          />

          {/* Quoted post */}
          {quotedPost && (
            <div style={styles.quotedPostPreview}>
              <div style={styles.quotedPostAuthor}>@{quotedPost.author}</div>
              <div style={styles.quotedPostContent}>{quotedPost.content}</div>
            </div>
          )}

          {/* Media preview */}
          {media.length > 0 && (
            <div style={styles.mediaPreview}>
              {media.map((item, index) => (
                <div key={index} style={styles.mediaItem}>
                  <img src={item.url} alt="" style={styles.mediaImage} />
                  <button
                    style={styles.mediaRemoveBtn}
                    onClick={() => removeMedia(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Poll preview */}
          {poll && (
            <div style={styles.pollPreview}>
              <div style={styles.pollHeader}>
                <span style={styles.pollTitle}>📊 Poll</span>
                <button style={styles.pollRemoveBtn} onClick={removePoll}>✕</button>
              </div>
              {poll.options.map((option, index) => (
                <div key={index} style={styles.pollOption}>{option}</div>
              ))}
              <div style={styles.pollDuration}>
                ⏱️ {poll.duration} hours
              </div>
            </div>
          )}

          {/* Poll creator */}
          {showPollCreator && !poll && (
            <div style={styles.pollCreator}>
              {pollOptions.map((option, index) => (
                <div key={index} style={styles.pollOptionRow}>
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updatePollOption(index, e.target.value)}
                    style={styles.pollInput}
                  />
                  {pollOptions.length > 2 && (
                    <button
                      style={styles.pollOptionRemove}
                      onClick={() => removePollOption(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 4 && (
                <button style={styles.addOptionBtn} onClick={addPollOption}>
                  + Add option
                </button>
              )}
              <div style={styles.pollDurationSelect}>
                <span style={styles.durationLabel}>Poll duration:</span>
                <select
                  value={pollDuration}
                  onChange={(e) => setPollDuration(Number(e.target.value))}
                  style={styles.durationSelect}
                >
                  <option value={1}>1 hour</option>
                  <option value={6}>6 hours</option>
                  <option value={12}>12 hours</option>
                  <option value={24}>1 day</option>
                  <option value={72}>3 days</option>
                  <option value={168}>7 days</option>
                </select>
              </div>
              <div style={styles.pollActions}>
                <button style={styles.pollCancelBtn} onClick={() => setShowPollCreator(false)}>
                  Cancel
                </button>
                <button
                  style={styles.pollCreateBtn}
                  onClick={createPoll}
                  disabled={pollOptions.filter(o => o.trim()).length < 2}
                >
                  Add Poll
                </button>
              </div>
            </div>
          )}

          {/* Visibility selector */}
          <div style={styles.visibilitySelector}>
            <button
              style={styles.visibilityBtn}
              onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
            >
              <span>{getVisibilityIcon()}</span>
              <span>{getVisibilityLabel()}</span>
              <span>▼</span>
            </button>

            {showVisibilityMenu && (
              <div style={styles.visibilityMenu}>
                {[
                  { value: 'public', icon: '🌍', label: 'Everyone', desc: 'Anyone on VIURL can reply' },
                  { value: 'followers', icon: '👥', label: 'Followers', desc: 'Only your followers can reply' },
                  { value: 'verified', icon: '✅', label: 'Verified Only', desc: 'Only verified users can reply' },
                ].map((option) => (
                  <button
                    key={option.value}
                    style={styles.visibilityOption(visibility === option.value)}
                    onClick={() => {
                      setVisibility(option.value as typeof visibility);
                      setShowVisibilityMenu(false);
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = visibility === option.value ? '#111' : 'transparent';
                    }}
                  >
                    <span style={styles.visibilityIcon}>{option.icon}</span>
                    <div style={styles.visibilityInfo}>
                      <div style={styles.visibilityLabel}>{option.label}</div>
                      <div style={styles.visibilityDesc}>{option.desc}</div>
                    </div>
                    {visibility === option.value && (
                      <span style={styles.visibilityCheck}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions bar */}
          <div style={styles.actionsBar}>
            <div style={styles.actionButtons}>
              {/* Image upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleMediaUpload}
                style={{ display: 'none' }}
              />
              <button
                style={styles.actionBtn(media.length >= MAX_MEDIA || !!poll)}
                onClick={() => fileInputRef.current?.click()}
                disabled={media.length >= MAX_MEDIA || !!poll}
                title="Add image"
                onMouseEnter={(e) => {
                  if (media.length < MAX_MEDIA && !poll) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                🖼️
              </button>

              {/* GIF */}
              <button
                style={styles.actionBtn(media.length >= MAX_MEDIA || !!poll)}
                disabled={media.length >= MAX_MEDIA || !!poll}
                title="Add GIF"
                onMouseEnter={(e) => {
                  if (media.length < MAX_MEDIA && !poll) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                📷
              </button>

              {/* Poll */}
              <button
                style={styles.actionBtn(media.length > 0 || !!poll)}
                onClick={() => setShowPollCreator(true)}
                disabled={media.length > 0 || !!poll}
                title="Create poll"
                onMouseEnter={(e) => {
                  if (media.length === 0 && !poll) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                📊
              </button>

              {/* Emoji */}
              <div style={{ position: 'relative' }}>
                <button
                  style={styles.actionBtn(false)}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Add emoji"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  😊
                </button>

                {/* Emoji picker */}
                {showEmojiPicker && (
                  <div style={styles.emojiPicker}>
                    <div style={styles.emojiCategories}>
                      {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                        <button
                          key={cat}
                          style={styles.emojiCategoryBtn(emojiCategory === cat)}
                          onClick={() => setEmojiCategory(cat as keyof typeof EMOJI_CATEGORIES)}
                        >
                          {cat === 'recent' && '🕐'}
                          {cat === 'smileys' && '😀'}
                          {cat === 'gestures' && '👋'}
                          {cat === 'symbols' && '❤️'}
                          {cat === 'objects' && '📱'}
                        </button>
                      ))}
                    </div>
                    <div style={styles.emojiGrid}>
                      {EMOJI_CATEGORIES[emojiCategory].map((emoji, i) => (
                        <button
                          key={i}
                          style={styles.emojiBtn}
                          onClick={() => insertEmoji(emoji)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#222'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              <button
                style={styles.actionBtn(false)}
                title="Add location"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                📍
              </button>
            </div>

            <div style={styles.rightActions}>
              {/* Character counter */}
              {content.length > 0 && (
                <div style={styles.charCounter}>
                  <div style={styles.charCircle}>
                    <svg width="30" height="30" style={styles.charCircleSvg}>
                      <circle cx="15" cy="15" r="12" style={styles.charCircleTrack} />
                      <circle
                        cx="15"
                        cy="15"
                        r="12"
                        style={styles.charCircleProgress(charProgress, isOverLimit)}
                      />
                    </svg>
                    {charsRemaining <= 20 && (
                      <span style={styles.charText(isOverLimit)}>
                        {charsRemaining}
                      </span>
                    )}
                  </div>
                  <div style={styles.divider} />
                </div>
              )}

              {/* Post button */}
              <button
                style={styles.postBtn(canPost)}
                onClick={handleSubmit}
                disabled={!canPost}
              >
                {isSubmitting ? 'Posting...' : replyTo ? 'Reply' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;