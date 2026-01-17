import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/useRedux';

interface TokenData {
  balance: number;
  trustScore: number;
  loginStreak: number;
  canClaimDaily: boolean;
  verificationBadge: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
  totalVerifications: number;
  accurateVerifications: number;
}

const TokenWidget: React.FC = () => {
  const { user, token } = useAppSelector((state) => state.auth);
  const [tokenData, setTokenData] = useState<TokenData>({
    balance: user?.vtokens || 100,
    trustScore: user?.trustScore || 50,
    loginStreak: 0,
    canClaimDaily: true,
    verificationBadge: user?.verificationBadge || 'none',
    totalVerifications: 0,
    accurateVerifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  // Fetch token data on mount
  useEffect(() => {
    if (token) {
      fetchTokenData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchTokenData = async () => {
    try {
      // Fetch balance from /api/tokens/balance
      const balanceResponse = await fetch('/api/tokens/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Fetch daily status from /api/tokens/daily-status
      const dailyResponse = await fetch('/api/tokens/daily-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let balance = user?.vtokens || 100;
      let canClaimDaily = true;
      let loginStreak = 0;

      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        // Handle the { success: true, data: { balance: ... } } structure
        if (balanceData.success && balanceData.data) {
          balance = balanceData.data.balance || balance;
        } else if (balanceData.balance !== undefined) {
          // Also handle flat structure just in case
          balance = balanceData.balance;
        }
      }

      if (dailyResponse.ok) {
        const dailyData = await dailyResponse.json();
        if (dailyData.success && dailyData.data) {
          canClaimDaily = dailyData.data.canClaim ?? true;
          loginStreak = dailyData.data.currentStreak || 0;
        }
      }

      setTokenData({
        balance,
        trustScore: user?.trustScore || 50,
        loginStreak,
        canClaimDaily,
        verificationBadge: user?.verificationBadge || 'none',
        totalVerifications: 0,
        accurateVerifications: 0,
      });
    } catch (error) {
      console.error('Failed to fetch token data:', error);
      // Use user data as fallback
      if (user) {
        setTokenData({
          balance: user.vtokens || 100,
          trustScore: user.trustScore || 50,
          loginStreak: 0,
          canClaimDaily: true,
          verificationBadge: user.verificationBadge || 'none',
          totalVerifications: 0,
          accurateVerifications: 0,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDaily = async () => {
    if (claiming || !tokenData.canClaimDaily) return;
    
    setClaiming(true);
    setClaimSuccess(null);
    
    try {
      const response = await fetch('/api/tokens/claim-daily', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Handle { success: true, data: { amount, streak, newBalance, ... } }
        const reward = data.data?.amount || 5;
        const newBalance = data.data?.newBalance || tokenData.balance + reward;
        const newStreak = data.data?.streak || tokenData.loginStreak + 1;
        
        setTokenData(prev => ({
          ...prev,
          balance: newBalance,
          loginStreak: newStreak,
          canClaimDaily: false,
        }));
        
        setClaimSuccess(data.data?.message || `+${reward} V-TKN claimed!`);
        setTimeout(() => setClaimSuccess(null), 3000);
      } else {
        // Handle error response
        setClaimSuccess(data.error || 'Already claimed today');
        setTokenData(prev => ({ ...prev, canClaimDaily: false }));
        setTimeout(() => setClaimSuccess(null), 3000);
      }
    } catch (error) {
      console.error('Failed to claim daily bonus:', error);
      setClaimSuccess('Failed to claim');
      setTimeout(() => setClaimSuccess(null), 3000);
    } finally {
      setClaiming(false);
    }
  };

  const getBadgeIcon = (badge: string): string => {
    switch (badge) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      default: return '';
    }
  };

  const getTrustScoreColor = (score: number): string => {
    if (score >= 80) return '#00FF00';
    if (score >= 60) return '#7FFF00';
    if (score >= 40) return '#FFD700';
    if (score >= 20) return '#FF8800';
    return '#FF4444';
  };

  const getStreakBonus = (streak: number): string => {
    if (streak >= 30) return '+10 bonus';
    if (streak >= 14) return '+5 bonus';
    if (streak >= 7) return '+3 bonus';
    if (streak >= 3) return '+1 bonus';
    return '';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingPulse}>
          <div style={styles.loadingIcon}>🪙</div>
          <div style={styles.loadingText}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* V-TKN Balance */}
      <div style={styles.balanceSection}>
        <div style={styles.balanceHeader}>
          <span style={styles.tokenIcon}>🪙</span>
          <span style={styles.balanceLabel}>V-TKN Balance</span>
        </div>
        <div style={styles.balanceAmount}>
          {tokenData.balance.toLocaleString()}
        </div>
      </div>

      {/* Trust Score */}
      <div style={styles.trustSection}>
        <div style={styles.trustHeader}>
          <span style={styles.trustLabel}>Trust Score</span>
          {tokenData.verificationBadge !== 'none' && (
            <span style={styles.badge}>
              {getBadgeIcon(tokenData.verificationBadge)}
            </span>
          )}
        </div>
        <div style={styles.trustBarContainer}>
          <div 
            style={{
              ...styles.trustBar,
              width: `${tokenData.trustScore}%`,
              backgroundColor: getTrustScoreColor(tokenData.trustScore),
            }}
          />
        </div>
        <div style={styles.trustValue}>
          {tokenData.trustScore}/100
        </div>
      </div>

      {/* Login Streak */}
      {tokenData.loginStreak > 0 && (
        <div style={styles.streakSection}>
          <div style={styles.streakHeader}>
            <span style={styles.fireIcon}>🔥</span>
            <span style={styles.streakValue}>{tokenData.loginStreak} day streak</span>
          </div>
          {getStreakBonus(tokenData.loginStreak) && (
            <span style={styles.streakBonus}>{getStreakBonus(tokenData.loginStreak)}</span>
          )}
        </div>
      )}

      {/* Daily Bonus Button */}
      <button
        style={{
          ...styles.claimButton,
          ...(tokenData.canClaimDaily ? styles.claimButtonActive : styles.claimButtonDisabled),
          ...(claiming ? styles.claimButtonLoading : {}),
        }}
        onClick={handleClaimDaily}
        disabled={!tokenData.canClaimDaily || claiming}
      >
        {claiming ? (
          <span>Claiming...</span>
        ) : tokenData.canClaimDaily ? (
          <>
            <span style={styles.giftIcon}>🎁</span>
            <span>Claim Daily Bonus</span>
          </>
        ) : (
          <>
            <span style={styles.checkIcon}>✓</span>
            <span>Claimed Today</span>
          </>
        )}
      </button>

      {/* Success Message */}
      {claimSuccess && (
        <div style={{
          ...styles.successMessage,
          backgroundColor: claimSuccess.includes('Already') || claimSuccess.includes('Failed') 
            ? 'rgba(255, 136, 0, 0.1)' 
            : 'rgba(0, 255, 0, 0.1)',
          color: claimSuccess.includes('Already') || claimSuccess.includes('Failed') 
            ? '#FF8800' 
            : '#00FF00',
        }}>
          {claimSuccess}
        </div>
      )}

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <button style={styles.actionBtn} title="View History">
          📊
        </button>
        <button style={styles.actionBtn} title="Leaderboard">
          🏆
        </button>
        <button style={styles.actionBtn} title="Transfer">
          💸
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#0a0a0a',
    borderRadius: '16px',
    padding: '16px',
    border: '1px solid #2a2a2a',
    marginBottom: '16px',
  },
  
  // Loading
  loadingPulse: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    gap: '8px',
  },
  loadingIcon: {
    fontSize: '24px',
    animation: 'pulse 1.5s infinite',
  },
  loadingText: {
    color: '#666',
    fontSize: '13px',
  },
  
  // Balance Section
  balanceSection: {
    marginBottom: '16px',
  },
  balanceHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  tokenIcon: {
    fontSize: '16px',
  },
  balanceLabel: {
    color: '#888',
    fontSize: '13px',
  },
  balanceAmount: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#00FF00',
    textShadow: '0 0 10px rgba(0, 255, 0, 0.3)',
  },

  // Trust Section
  trustSection: {
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #2a2a2a',
  },
  trustHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  trustLabel: {
    color: '#888',
    fontSize: '13px',
  },
  badge: {
    fontSize: '18px',
  },
  trustBarContainer: {
    height: '8px',
    backgroundColor: '#1a1a1a',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '4px',
  },
  trustBar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  trustValue: {
    fontSize: '12px',
    color: '#666',
    textAlign: 'right' as const,
  },

  // Streak Section
  streakSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  streakHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  fireIcon: {
    fontSize: '16px',
  },
  streakValue: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
  },
  streakBonus: {
    color: '#00FF00',
    fontSize: '12px',
    fontWeight: '500',
  },

  // Claim Button
  claimButton: {
    width: '100%',
    padding: '12px',
    borderRadius: '9999px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    marginBottom: '8px',
  },
  claimButtonActive: {
    backgroundColor: '#00FF00',
    color: '#000',
  },
  claimButtonDisabled: {
    backgroundColor: '#1a1a1a',
    color: '#666',
    cursor: 'not-allowed',
  },
  claimButtonLoading: {
    opacity: 0.7,
  },
  giftIcon: {
    fontSize: '16px',
  },
  checkIcon: {
    fontSize: '14px',
  },

  // Success Message
  successMessage: {
    textAlign: 'center' as const,
    fontSize: '14px',
    fontWeight: '600',
    padding: '8px',
    borderRadius: '8px',
    marginBottom: '12px',
  },

  // Quick Actions
  quickActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    paddingTop: '12px',
    borderTop: '1px solid #2a2a2a',
  },
  actionBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
};

export default TokenWidget;