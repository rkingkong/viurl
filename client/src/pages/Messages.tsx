import React, { useState } from 'react';
import { useAppSelector } from '../hooks/useRedux';
import type { Conversation, Message, User } from '../types';

const mockConversations: Conversation[] = [
  {
    _id: '1',
    participants: [
      { _id: '2', username: 'truthseeker', name: 'Truth Seeker', email: '', trustScore: 85, vtokens: 500, followers: [], following: [], createdAt: '' },
    ],
    lastMessage: { _id: 'm1', conversation: '1', sender: { _id: '2', username: 'truthseeker', name: 'Truth Seeker', email: '', trustScore: 85, vtokens: 500, followers: [], following: [], createdAt: '' }, content: 'Great verification!', read: false, createdAt: new Date().toISOString() },
    unreadCount: 2,
    updatedAt: new Date().toISOString(),
  },
];

const Messages: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const getOther = (conv: Conversation): User => conv.participants[0];

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const styles = {
    container: { display: 'flex', height: 'calc(100vh - 60px)', backgroundColor: '#000', color: '#fff' } as React.CSSProperties,
    sidebar: { width: '350px', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' as const } as React.CSSProperties,
    sidebarHeader: { padding: '20px', borderBottom: '1px solid #333' } as React.CSSProperties,
    title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' } as React.CSSProperties,
    searchInput: { width: '100%', padding: '12px 16px', backgroundColor: '#111', border: '1px solid #333', borderRadius: '25px', color: '#fff', fontSize: '14px', outline: 'none' } as React.CSSProperties,
    convList: { flex: 1, overflowY: 'auto' as const } as React.CSSProperties,
    convItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid #222' } as React.CSSProperties,
    convItemSelected: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid #222', backgroundColor: '#111' } as React.CSSProperties,
    avatar: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' } as React.CSSProperties,
    convInfo: { flex: 1, minWidth: 0 } as React.CSSProperties,
    convName: { fontWeight: 'bold', fontSize: '15px' } as React.CSSProperties,
    convLast: { color: '#888', fontSize: '14px', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' } as React.CSSProperties,
    convLastUnread: { color: '#fff', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' } as React.CSSProperties,
    convTime: { fontSize: '12px', color: '#888' } as React.CSSProperties,
    unreadBadge: { backgroundColor: '#00FF00', color: '#000', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' } as React.CSSProperties,
    chatArea: { flex: 1, display: 'flex', flexDirection: 'column' as const } as React.CSSProperties,
    chatHeader: { padding: '15px 20px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: '12px' } as React.CSSProperties,
    chatName: { fontWeight: 'bold', fontSize: '16px' } as React.CSSProperties,
    chatMeta: { fontSize: '13px', color: '#888' } as React.CSSProperties,
    messagesArea: { flex: 1, overflowY: 'auto' as const, padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '10px' } as React.CSSProperties,
    msgOwn: { display: 'flex', justifyContent: 'flex-end' } as React.CSSProperties,
    msgOther: { display: 'flex', justifyContent: 'flex-start' } as React.CSSProperties,
    bubbleOwn: { maxWidth: '70%', padding: '12px 16px', borderRadius: '18px', backgroundColor: '#00FF00', color: '#000' } as React.CSSProperties,
    bubbleOther: { maxWidth: '70%', padding: '12px 16px', borderRadius: '18px', backgroundColor: '#222', color: '#fff' } as React.CSSProperties,
    inputArea: { padding: '15px 20px', borderTop: '1px solid #333', display: 'flex', gap: '12px', alignItems: 'center' } as React.CSSProperties,
    msgInput: { flex: 1, padding: '12px 20px', backgroundColor: '#111', border: '1px solid #333', borderRadius: '25px', color: '#fff', fontSize: '15px', outline: 'none' } as React.CSSProperties,
    sendBtn: { width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#00FF00', border: 'none', color: '#000', fontSize: '18px', cursor: 'pointer' } as React.CSSProperties,
    sendBtnDisabled: { width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#333', border: 'none', color: '#666', fontSize: '18px', cursor: 'not-allowed' } as React.CSSProperties,
    emptyState: { flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', color: '#888' } as React.CSSProperties,
    emptyIcon: { fontSize: '64px', marginBottom: '20px' } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h1 style={styles.title}>Messages</h1>
          <input type="text" placeholder="Search conversations..." style={styles.searchInput} />
        </div>
        <div style={styles.convList}>
          {conversations.map((conv) => {
            const other = getOther(conv);
            const isSelected = selectedConv?._id === conv._id;
            return (
              <div
                key={conv._id}
                style={isSelected ? styles.convItemSelected : styles.convItem}
                onClick={() => setSelectedConv(conv)}
              >
                <div style={styles.avatar}>{other.name.charAt(0)}</div>
                <div style={styles.convInfo}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={styles.convName}>{other.name}</span>
                    <span style={styles.convTime}>{formatTime(conv.updatedAt)}</span>
                  </div>
                  <p style={conv.unreadCount > 0 ? styles.convLastUnread : styles.convLast}>
                    {conv.lastMessage.content}
                  </p>
                </div>
                {conv.unreadCount > 0 && <span style={styles.unreadBadge}>{conv.unreadCount}</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.chatArea}>
        {selectedConv ? (
          <>
            <div style={styles.chatHeader}>
              <div style={styles.avatar}>{getOther(selectedConv).name.charAt(0)}</div>
              <div>
                <div style={styles.chatName}>{getOther(selectedConv).name}</div>
                <div style={styles.chatMeta}>@{getOther(selectedConv).username}</div>
              </div>
            </div>
            <div style={styles.messagesArea}>
              {messages.map((msg) => {
                const isOwn = msg.sender._id === user?._id;
                return (
                  <div key={msg._id} style={isOwn ? styles.msgOwn : styles.msgOther}>
                    <div style={isOwn ? styles.bubbleOwn : styles.bubbleOther}>{msg.content}</div>
                  </div>
                );
              })}
            </div>
            <div style={styles.inputArea}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={styles.msgInput}
              />
              <button style={newMessage.trim() ? styles.sendBtn : styles.sendBtnDisabled}>➤</button>
            </div>
          </>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💬</div>
            <div>Select a conversation</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
