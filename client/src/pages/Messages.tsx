import React, { useState, useEffect, useRef } from 'react';

interface User {
  id: string;
  username: string;
  name: string;
  profilePicture?: string;
  trustScore: number;
  verificationBadge: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
  isOnline?: boolean;
  lastSeen?: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'post_share' | 'verification_share';
  sharedPost?: {
    id: string;
    content: string;
    author: string;
  };
}

interface Conversation {
  id: string;
  participant: User;
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}

interface MessagesProps {
  onNavigate?: (page: string, params?: any) => void;
}

// Dynamic style functions (defined outside component for TypeScript compatibility)
const getConversationItemStyle = (selected: boolean, hasUnread: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px',
  cursor: 'pointer',
  backgroundColor: selected ? '#111' : hasUnread ? 'rgba(0, 255, 0, 0.03)' : 'transparent',
  borderBottom: '1px solid #222',
  transition: 'background-color 0.2s',
});

const getLastMessageStyle = (unread: boolean): React.CSSProperties => ({
  color: unread ? '#fff' : '#888',
  fontSize: '14px',
  fontWeight: unread ? 600 : 400,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  margin: 0,
});

const getMessageWrapperStyle = (isOwn: boolean): React.CSSProperties => ({
  display: 'flex',
  justifyContent: isOwn ? 'flex-end' : 'flex-start',
});

const getMessageBubbleStyle = (isOwn: boolean): React.CSSProperties => ({
  maxWidth: '70%',
  padding: '12px 16px',
  borderRadius: isOwn ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
  backgroundColor: isOwn ? '#00FF00' : '#222',
  color: isOwn ? '#000' : '#fff',
});

const getMessageTimestampStyle = (isOwn: boolean): React.CSSProperties => ({
  fontSize: '11px',
  color: isOwn ? 'rgba(0,0,0,0.6)' : '#888',
  marginTop: '4px',
  textAlign: 'right',
});

const getSendBtnStyle = (hasContent: boolean): React.CSSProperties => ({
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  backgroundColor: hasContent ? '#00FF00' : '#333',
  border: 'none',
  color: hasContent ? '#000' : '#666',
  fontSize: '18px',
  cursor: hasContent ? 'pointer' : 'not-allowed',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
  flexShrink: 0,
});

const Messages = ({ onNavigate }: MessagesProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentUserId = 'current-user';

  // Mock data
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: 'conv1',
        participant: {
          id: 'user1',
          username: 'factchecker',
          name: 'Fact Checker Pro',
          trustScore: 97,
          verificationBadge: 'gold',
          isOnline: true,
        },
        lastMessage: {
          id: 'msg1',
          senderId: 'user1',
          content: 'Great verification on that climate post! 🌍',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          read: false,
          type: 'text',
        },
        unreadCount: 2,
        updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
      {
        id: 'conv2',
        participant: {
          id: 'user2',
          username: 'truthseeker',
          name: 'Truth Seeker',
          trustScore: 89,
          verificationBadge: 'silver',
          isOnline: false,
          lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        lastMessage: {
          id: 'msg2',
          senderId: 'current-user',
          content: 'Can you help verify this news article?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: true,
          type: 'text',
        },
        unreadCount: 0,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: 'conv3',
        participant: {
          id: 'user3',
          username: 'verifier_elite',
          name: 'Elite Verifier',
          trustScore: 99,
          verificationBadge: 'platinum',
          isOnline: true,
        },
        lastMessage: {
          id: 'msg3',
          senderId: 'user3',
          content: 'Welcome to VIURL! Let me know if you need any tips.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          read: true,
          type: 'text',
        },
        unreadCount: 0,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: 'conv4',
        participant: {
          id: 'user4',
          username: 'newsbreaker',
          name: 'News Breaker',
          trustScore: 72,
          verificationBadge: 'bronze',
          isOnline: false,
          lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        },
        lastMessage: {
          id: 'msg4',
          senderId: 'user4',
          content: 'Thanks for the follow! 🙏',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          read: true,
          type: 'text',
        },
        unreadCount: 0,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
    ];

    setTimeout(() => {
      setConversations(mockConversations);
      setLoading(false);
    }, 500);

    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      const mockMessages: Message[] = [
        {
          id: 'm1',
          senderId: selectedConversation.participant.id,
          content: 'Hey! I saw your verification work. Really impressive accuracy! 👏',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          read: true,
          type: 'text',
        },
        {
          id: 'm2',
          senderId: 'current-user',
          content: 'Thanks! I try to be thorough with my sources.',
          timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
          read: true,
          type: 'text',
        },
        {
          id: 'm3',
          senderId: selectedConversation.participant.id,
          content: "Would you mind taking a look at this post? I'm not sure if it's accurate.",
          timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
          read: true,
          type: 'text',
        },
        {
          id: 'm4',
          senderId: selectedConversation.participant.id,
          content: '',
          timestamp: new Date(Date.now() - 1000 * 60 * 49).toISOString(),
          read: true,
          type: 'post_share',
          sharedPost: {
            id: 'post123',
            content: 'Breaking: New study shows 50% increase in renewable energy adoption...',
            author: '@newsbreaker',
          },
        },
        {
          id: 'm5',
          senderId: 'current-user',
          content: "Let me check the sources on that one. I'll get back to you! 🔍",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: true,
          type: 'text',
        },
        {
          id: 'm6',
          senderId: selectedConversation.participant.id,
          content: selectedConversation.lastMessage.content,
          timestamp: selectedConversation.lastMessage.timestamp,
          read: selectedConversation.lastMessage.read,
          type: 'text',
        },
      ];
      setMessages(mockMessages);
      
      setConversations(convs => 
        convs.map(c => 
          c.id === selectedConversation.id ? { ...c, unreadCount: 0 } : c
        )
      );
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getBadgeIcon = (badge: string): string => {
    switch (badge) {
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '';
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 1000 * 60 * 60 * 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    if (diff < 1000 * 60 * 60 * 24 * 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text',
    };

    setMessages([...messages, message]);
    setNewMessage('');

    setConversations(convs =>
      convs.map(c =>
        c.id === selectedConversation.id
          ? { ...c, lastMessage: message, updatedAt: message.timestamp }
          : c
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    );

    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const styles: Record<string, React.CSSProperties> = {
    container: {
      display: 'flex',
      height: '100vh',
      backgroundColor: '#000',
    },
    sidebar: {
      width: isMobileView && selectedConversation ? '0' : isMobileView ? '100%' : '380px',
      borderRight: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'width 0.3s',
    },
    sidebarHeader: {
      padding: '16px',
      borderBottom: '1px solid #333',
    },
    sidebarTitle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
    },
    title: {
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
    newMessageBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#00FF00',
      fontSize: '24px',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '50%',
      transition: 'background-color 0.2s',
    },
    searchBox: {
      position: 'relative',
    },
    searchInput: {
      width: '100%',
      backgroundColor: '#222',
      border: '1px solid #333',
      borderRadius: '9999px',
      padding: '10px 16px 10px 40px',
      color: '#fff',
      fontSize: '14px',
      outline: 'none',
    },
    searchIcon: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#888',
      fontSize: '14px',
    },
    conversationList: {
      flex: 1,
      overflowY: 'auto',
    },
    avatarContainer: {
      position: 'relative',
      flexShrink: 0,
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
      fontSize: '18px',
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: '2px',
      right: '2px',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: '#00FF00',
      border: '2px solid #000',
    },
    conversationInfo: {
      flex: 1,
      minWidth: 0,
    },
    conversationHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '4px',
    },
    participantName: {
      color: '#fff',
      fontWeight: 600,
      fontSize: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    messageTime: {
      color: '#888',
      fontSize: '13px',
    },
    unreadDot: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: '#00FF00',
      flexShrink: 0,
    },
    chatArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      width: isMobileView && !selectedConversation ? '0' : 'auto',
      overflow: 'hidden',
    },
    chatHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      borderBottom: '1px solid #333',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
    },
    backBtn: {
      display: isMobileView ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      backgroundColor: 'transparent',
      border: 'none',
      color: '#fff',
      fontSize: '20px',
      cursor: 'pointer',
      borderRadius: '50%',
    },
    chatUserInfo: {
      flex: 1,
    },
    chatUserName: {
      color: '#fff',
      fontWeight: 700,
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    chatUserStatus: {
      color: '#888',
      fontSize: '13px',
    },
    chatActions: {
      display: 'flex',
      gap: '8px',
    },
    chatActionBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#888',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '50%',
      transition: 'all 0.2s',
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    messageText: {
      fontSize: '15px',
      lineHeight: 1.4,
      margin: 0,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },
    sharedPost: {
      backgroundColor: '#111',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '8px',
    },
    sharedPostContent: {
      color: '#ccc',
      fontSize: '14px',
      marginBottom: '4px',
    },
    sharedPostAuthor: {
      color: '#00FF00',
      fontSize: '13px',
    },
    composer: {
      padding: '16px',
      borderTop: '1px solid #333',
      display: 'flex',
      alignItems: 'flex-end',
      gap: '12px',
    },
    composerInput: {
      flex: 1,
      backgroundColor: '#222',
      border: '1px solid #333',
      borderRadius: '20px',
      padding: '12px 16px',
      color: '#fff',
      fontSize: '15px',
      outline: 'none',
      resize: 'none',
      maxHeight: '120px',
      fontFamily: 'inherit',
    },
    emptyState: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      gap: '16px',
    },
    emptyIcon: {
      fontSize: '64px',
    },
    emptyTitle: {
      color: '#fff',
      fontSize: '24px',
      fontWeight: 700,
      margin: 0,
    },
    emptyDescription: {
      color: '#888',
      fontSize: '15px',
      textAlign: 'center',
      maxWidth: '300px',
    },
    startChatBtn: {
      backgroundColor: '#00FF00',
      border: 'none',
      borderRadius: '9999px',
      padding: '14px 28px',
      color: '#000',
      fontSize: '16px',
      fontWeight: 700,
      cursor: 'pointer',
      marginTop: '16px',
      transition: 'transform 0.2s',
    },
  };

  return (
    <div style={styles.container}>
      {/* Conversation List */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarTitle}>
            <h1 style={styles.title}>
              Messages
              {totalUnread > 0 && (
                <span style={styles.unreadBadge}>{totalUnread}</span>
              )}
            </h1>
            <button
              style={styles.newMessageBtn}
              onClick={() => setShowNewMessage(true)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              ✏️
            </button>
          </div>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        <div style={styles.conversationList}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                style={getConversationItemStyle(
                  selectedConversation?.id === conversation.id,
                  conversation.unreadCount > 0
                )}
                onClick={() => setSelectedConversation(conversation)}
                onMouseEnter={(e) => {
                  if (selectedConversation?.id !== conversation.id) {
                    e.currentTarget.style.backgroundColor = '#0a0a0a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedConversation?.id !== conversation.id) {
                    e.currentTarget.style.backgroundColor = conversation.unreadCount > 0 
                      ? 'rgba(0, 255, 0, 0.03)' 
                      : 'transparent';
                  }
                }}
              >
                <div style={styles.avatarContainer}>
                  <div style={styles.avatar}>
                    {conversation.participant.profilePicture ? (
                      <img 
                        src={conversation.participant.profilePicture} 
                        alt="" 
                        style={{ width: '100%', height: '100%', borderRadius: '50%' }} 
                      />
                    ) : (
                      conversation.participant.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {conversation.participant.isOnline && (
                    <div style={styles.onlineIndicator} />
                  )}
                </div>
                <div style={styles.conversationInfo}>
                  <div style={styles.conversationHeader}>
                    <span style={styles.participantName}>
                      {conversation.participant.name}
                      {conversation.participant.verificationBadge !== 'none' && (
                        <span>{getBadgeIcon(conversation.participant.verificationBadge)}</span>
                      )}
                    </span>
                    <span style={styles.messageTime}>
                      {formatTime(conversation.updatedAt)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={getLastMessageStyle(conversation.unreadCount > 0)}>
                      {conversation.lastMessage.senderId === currentUserId && 'You: '}
                      {conversation.lastMessage.content}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <div style={styles.unreadDot} />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div style={styles.chatHeader}>
              <button
                style={styles.backBtn}
                onClick={() => setSelectedConversation(null)}
              >
                ←
              </button>
              <div 
                style={styles.avatar}
                onClick={() => onNavigate && onNavigate('profile', { userId: selectedConversation.participant.username })}
              >
                {selectedConversation.participant.profilePicture ? (
                  <img 
                    src={selectedConversation.participant.profilePicture} 
                    alt="" 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', cursor: 'pointer' }} 
                  />
                ) : (
                  selectedConversation.participant.name.charAt(0).toUpperCase()
                )}
              </div>
              <div style={styles.chatUserInfo}>
                <div style={styles.chatUserName}>
                  {selectedConversation.participant.name}
                  {selectedConversation.participant.verificationBadge !== 'none' && (
                    <span>{getBadgeIcon(selectedConversation.participant.verificationBadge)}</span>
                  )}
                </div>
                <div style={styles.chatUserStatus}>
                  {selectedConversation.participant.isOnline ? (
                    <span style={{ color: '#00FF00' }}>● Online</span>
                  ) : (
                    `Last seen ${formatTime(selectedConversation.participant.lastSeen || '')}`
                  )}
                </div>
              </div>
              <div style={styles.chatActions}>
                <button
                  style={styles.chatActionBtn}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#222';
                    e.currentTarget.style.color = '#00FF00';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#888';
                  }}
                >
                  ℹ️
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={styles.messagesContainer}>
              {messages.map((message) => {
                const isOwn = message.senderId === currentUserId;
                return (
                  <div key={message.id} style={getMessageWrapperStyle(isOwn)}>
                    <div style={getMessageBubbleStyle(isOwn)}>
                      {message.type === 'post_share' && message.sharedPost && (
                        <div style={styles.sharedPost}>
                          <p style={styles.sharedPostContent}>{message.sharedPost.content}</p>
                          <span style={styles.sharedPostAuthor}>{message.sharedPost.author}</span>
                        </div>
                      )}
                      {message.content && (
                        <p style={styles.messageText}>{message.content}</p>
                      )}
                      <div style={getMessageTimestampStyle(isOwn)}>
                        {formatMessageTime(message.timestamp)}
                        {isOwn && (message.read ? ' ✓✓' : ' ✓')}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div style={styles.composer}>
              <textarea
                ref={inputRef}
                placeholder="Start a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                style={styles.composerInput}
                rows={1}
              />
              <button
                style={getSendBtnStyle(newMessage.trim().length > 0)}
                onClick={sendMessage}
                disabled={!newMessage.trim()}
              >
                ➤
              </button>
            </div>
          </>
        ) : (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>💬</span>
            <h2 style={styles.emptyTitle}>Your Messages</h2>
            <p style={styles.emptyDescription}>
              Connect with other truth-seekers. Share posts, discuss verifications, and build your network.
            </p>
            <button
              style={styles.startChatBtn}
              onClick={() => setShowNewMessage(true)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Start a Conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Messages;
