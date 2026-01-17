// VerificationStatus.tsx - Shows verification/fact-check status on posts
// Location: client/src/components/Verification/VerificationStatus.tsx

import React from 'react';

type FactCheckStatus = 
  | 'unverified' 
  | 'verified_true' 
  | 'verified_false' 
  | 'partially_true' 
  | 'misleading' 
  | 'disputed'
  | 'pending';

interface VerificationStatusProps {
  status: FactCheckStatus;
  verificationCount: number;
  consensusScore?: number;
  compact?: boolean;
  onClick?: () => void;
}

const STATUS_CONFIG: Record<FactCheckStatus, {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  unverified: {
    icon: '○',
    label: 'Unverified',
    color: '#888888',
    bgColor: 'rgba(136, 136, 136, 0.1)',
    description: 'This post has not been verified yet',
  },
  verified_true: {
    icon: '✓',
    label: 'Verified True',
    color: '#00FF00',
    bgColor: 'rgba(0, 255, 0, 0.1)',
    description: 'Community consensus: This information is accurate',
  },
  verified_false: {
    icon: '✗',
    label: 'False',
    color: '#FF4444',
    bgColor: 'rgba(255, 68, 68, 0.1)',
    description: 'Community consensus: This information is false',
  },
  partially_true: {
    icon: '◐',
    label: 'Partially True',
    color: '#FFD700',
    bgColor: 'rgba(255, 215, 0, 0.1)',
    description: 'Contains some accurate and some inaccurate information',
  },
  misleading: {
    icon: '⚠',
    label: 'Misleading',
    color: '#FF8800',
    bgColor: 'rgba(255, 136, 0, 0.1)',
    description: 'May be technically true but presented in a misleading way',
  },
  disputed: {
    icon: '⟳',
    label: 'Disputed',
    color: '#9966FF',
    bgColor: 'rgba(153, 102, 255, 0.1)',
    description: 'Verifiers disagree on the accuracy of this content',
  },
  pending: {
    icon: '◔',
    label: 'Pending Review',
    color: '#00BFFF',
    bgColor: 'rgba(0, 191, 255, 0.1)',
    description: 'Currently being reviewed by verifiers',
  },
};

const VerificationStatus: React.FC<VerificationStatusProps> = ({
  status,
  verificationCount,
  consensusScore,
  compact = false,
  onClick,
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unverified;

  // Don't show anything for unverified posts in compact mode
  if (compact && status === 'unverified') {
    return null;
  }

  if (compact) {
    return (
      <button
        onClick={onClick}
        style={{
          ...styles.compactContainer,
          color: config.color,
          backgroundColor: config.bgColor,
          border: `1px solid ${config.color}30`,
        }}
        title={config.description}
      >
        <span style={styles.compactIcon}>{config.icon}</span>
        <span style={styles.compactLabel}>{config.label}</span>
      </button>
    );
  }

  return (
    <div 
      style={{
        ...styles.container,
        backgroundColor: config.bgColor,
        borderColor: `${config.color}40`,
      }}
      onClick={onClick}
    >
      {/* Status Header */}
      <div style={styles.header}>
        <div style={{ ...styles.iconWrapper, backgroundColor: config.color }}>
          <span style={styles.icon}>{config.icon}</span>
        </div>
        <div style={styles.headerText}>
          <span style={{ ...styles.label, color: config.color }}>
            {config.label}
          </span>
          <span style={styles.description}>{config.description}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.stat}>
          <span style={styles.statIcon}>👥</span>
          <span style={styles.statValue}>{verificationCount}</span>
          <span style={styles.statLabel}>
            {verificationCount === 1 ? 'verifier' : 'verifiers'}
          </span>
        </div>

        {consensusScore !== undefined && consensusScore > 0 && (
          <div style={styles.stat}>
            <span style={styles.statIcon}>📊</span>
            <span style={styles.statValue}>{consensusScore}%</span>
            <span style={styles.statLabel}>consensus</span>
          </div>
        )}

        {status !== 'unverified' && (
          <button style={styles.detailsBtn}>
            View details →
          </button>
        )}
      </div>
    </div>
  );
};

// Compact inline badge version for use in post headers
export const VerificationBadge: React.FC<{
  status: FactCheckStatus;
  size?: 'sm' | 'md';
}> = ({ status, size = 'sm' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unverified;
  
  if (status === 'unverified') return null;

  const sizes = {
    sm: { fontSize: '11px', padding: '2px 6px', iconSize: '10px' },
    md: { fontSize: '13px', padding: '4px 10px', iconSize: '12px' },
  };

  const s = sizes[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: s.fontSize,
        padding: s.padding,
        borderRadius: '9999px',
        backgroundColor: config.bgColor,
        color: config.color,
        fontWeight: '600',
        border: `1px solid ${config.color}30`,
      }}
      title={config.description}
    >
      <span style={{ fontSize: s.iconSize }}>{config.icon}</span>
      {config.label}
    </span>
  );
};

// Trust Score Badge for users
export const TrustScoreBadge: React.FC<{
  score: number;
  badge?: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ score, badge = 'none', showScore = false, size = 'sm' }) => {
  const getBadgeIcon = (b: string): string => {
    switch (b) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      default: return '';
    }
  };

  const getScoreColor = (s: number): string => {
    if (s >= 80) return '#00FF00';
    if (s >= 60) return '#7FFF00';
    if (s >= 40) return '#FFD700';
    if (s >= 20) return '#FF8800';
    return '#FF4444';
  };

  const badgeIcon = getBadgeIcon(badge);
  const scoreColor = getScoreColor(score);

  const sizes = {
    sm: { fontSize: '14px', scoreFontSize: '11px' },
    md: { fontSize: '18px', scoreFontSize: '13px' },
    lg: { fontSize: '24px', scoreFontSize: '15px' },
  };

  const s = sizes[size];

  if (!badgeIcon && !showScore) return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
      title={`Trust Score: ${score}/100`}
    >
      {badgeIcon && (
        <span style={{ fontSize: s.fontSize }}>{badgeIcon}</span>
      )}
      {showScore && (
        <span
          style={{
            fontSize: s.scoreFontSize,
            fontWeight: '600',
            color: scoreColor,
          }}
        >
          {score}
        </span>
      )}
    </span>
  );
};

// Verification Progress indicator
export const VerificationProgress: React.FC<{
  currentVerifications: number;
  requiredVerifications?: number;
}> = ({ currentVerifications, requiredVerifications = 10 }) => {
  const progress = Math.min((currentVerifications / requiredVerifications) * 100, 100);
  const isComplete = currentVerifications >= requiredVerifications;

  return (
    <div style={styles.progressContainer}>
      <div style={styles.progressHeader}>
        <span style={styles.progressLabel}>Verification Progress</span>
        <span style={styles.progressCount}>
          {currentVerifications}/{requiredVerifications}
        </span>
      </div>
      <div style={styles.progressBarBg}>
        <div
          style={{
            ...styles.progressBar,
            width: `${progress}%`,
            backgroundColor: isComplete ? '#00FF00' : '#00BFFF',
          }}
        />
      </div>
      {!isComplete && (
        <span style={styles.progressHint}>
          {requiredVerifications - currentVerifications} more verifications needed
        </span>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  // Full status container
  container: {
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid',
    marginTop: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  iconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: '16px',
    color: '#000',
    fontWeight: '700',
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '700',
  },
  description: {
    fontSize: '13px',
    color: '#888',
    lineHeight: '1.3',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  statIcon: {
    fontSize: '14px',
  },
  statValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
  },
  statLabel: {
    fontSize: '13px',
    color: '#888',
  },
  detailsBtn: {
    marginLeft: 'auto',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#00FF00',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '4px 8px',
  },

  // Compact version
  compactContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    border: '1px solid',
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
  },
  compactIcon: {
    fontSize: '12px',
  },
  compactLabel: {
    fontSize: '12px',
  },

  // Progress
  progressContainer: {
    marginTop: '12px',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  progressLabel: {
    fontSize: '12px',
    color: '#888',
  },
  progressCount: {
    fontSize: '12px',
    color: '#fff',
    fontWeight: '600',
  },
  progressBarBg: {
    height: '4px',
    backgroundColor: '#1a1a1a',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  progressHint: {
    fontSize: '11px',
    color: '#666',
    marginTop: '4px',
    display: 'block',
  },
};

export default VerificationStatus;