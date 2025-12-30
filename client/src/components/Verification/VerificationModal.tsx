import { useState } from 'react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    content: string;
    author: {
      username: string;
      name: string;
      profilePicture?: string;
    };
  };
  onSubmit: (verification: VerificationData) => void;
}

interface VerificationData {
  postId: string;
  verdict: 'true' | 'false' | 'misleading' | 'partially_true';
  sources: string[];
  explanation: string;
}

const VerificationModal = ({ isOpen, onClose, post, onSubmit }: VerificationModalProps) => {
  const [verdict, setVerdict] = useState<string>('');
  const [sources, setSources] = useState<string[]>(['']);
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Token rewards based on verdict complexity
  const tokenRewards = {
    true: 5,
    false: 10,
    misleading: 15,
    partially_true: 12,
  };

  const verdictOptions = [
    { value: 'true', label: 'True', icon: '✅', color: '#00FF00', description: 'Completely accurate and factual' },
    { value: 'false', label: 'False', icon: '❌', color: '#FF4444', description: 'Contains false information' },
    { value: 'misleading', label: 'Misleading', icon: '🔶', color: '#FF8800', description: 'True but presented deceptively' },
    { value: 'partially_true', label: 'Partially True', icon: '⚠️', color: '#FFD700', description: 'Mix of true and false claims' },
  ];

  const addSource = () => {
    if (sources.length < 5) {
      setSources([...sources, '']);
    }
  };

  const removeSource = (index: number) => {
    if (sources.length > 1) {
      setSources(sources.filter((_, i) => i !== index));
    }
  };

  const updateSource = (index: number, value: string) => {
    const newSources = [...sources];
    newSources[index] = value;
    setSources(newSources);
  };

  const handleSubmit = async () => {
    if (!verdict || !explanation.trim()) return;
    
    setIsSubmitting(true);
    
    const verificationData: VerificationData = {
      postId: post.id,
      verdict: verdict as VerificationData['verdict'],
      sources: sources.filter(s => s.trim() !== ''),
      explanation: explanation.trim(),
    };

    try {
      await onSubmit(verificationData);
      // Reset form
      setVerdict('');
      setSources(['']);
      setExplanation('');
      setCurrentStep(1);
      onClose();
    } catch (error) {
      console.error('Verification submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 = verdict !== '';
  const canProceedStep2 = sources.some(s => s.trim() !== '');
  const canSubmit = verdict && explanation.trim().length >= 20;

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modal: {
      backgroundColor: '#000',
      border: '1px solid #333',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      borderBottom: '1px solid #333',
    },
    headerTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    logo: {
      fontSize: '24px',
      color: '#00FF00',
    },
    title: {
      color: '#fff',
      fontSize: '20px',
      fontWeight: 700,
      margin: 0,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: '#888',
      fontSize: '24px',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
    },
    progressBar: {
      display: 'flex',
      padding: '16px 20px',
      gap: '8px',
      borderBottom: '1px solid #222',
    },
    progressStep: (active: boolean, completed: boolean) => ({
      flex: 1,
      height: '4px',
      borderRadius: '2px',
      backgroundColor: completed ? '#00FF00' : active ? '#00FF00' : '#333',
      opacity: active || completed ? 1 : 0.5,
      transition: 'all 0.3s',
    }),
    content: {
      padding: '20px',
      overflowY: 'auto' as const,
      flex: 1,
    },
    postPreview: {
      backgroundColor: '#111',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      border: '1px solid #222',
    },
    postAuthor: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px',
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#00FF00',
      fontWeight: 700,
    },
    authorInfo: {
      display: 'flex',
      flexDirection: 'column' as const,
    },
    authorName: {
      color: '#fff',
      fontWeight: 600,
      fontSize: '15px',
    },
    authorUsername: {
      color: '#888',
      fontSize: '14px',
    },
    postContent: {
      color: '#ccc',
      fontSize: '15px',
      lineHeight: 1.5,
    },
    stepTitle: {
      color: '#fff',
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '8px',
    },
    stepDescription: {
      color: '#888',
      fontSize: '14px',
      marginBottom: '20px',
    },
    verdictGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      marginBottom: '20px',
    },
    verdictOption: (selected: boolean, color: string) => ({
      backgroundColor: selected ? `${color}15` : '#111',
      border: `2px solid ${selected ? color : '#333'}`,
      borderRadius: '12px',
      padding: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'left' as const,
    }),
    verdictIcon: {
      fontSize: '28px',
      marginBottom: '8px',
    },
    verdictLabel: {
      color: '#fff',
      fontSize: '16px',
      fontWeight: 600,
      marginBottom: '4px',
    },
    verdictDescription: {
      color: '#888',
      fontSize: '13px',
    },
    sourceInput: {
      display: 'flex',
      gap: '8px',
      marginBottom: '12px',
    },
    input: {
      flex: 1,
      backgroundColor: '#111',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#fff',
      fontSize: '15px',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    removeButton: {
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '12px',
      color: '#888',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    addSourceButton: {
      backgroundColor: 'transparent',
      border: '1px dashed #333',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#00FF00',
      cursor: 'pointer',
      width: '100%',
      fontSize: '14px',
      transition: 'all 0.2s',
      marginBottom: '20px',
    },
    textarea: {
      width: '100%',
      backgroundColor: '#111',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#fff',
      fontSize: '15px',
      outline: 'none',
      resize: 'vertical' as const,
      minHeight: '120px',
      fontFamily: 'inherit',
      transition: 'border-color 0.2s',
    },
    charCount: {
      color: '#888',
      fontSize: '13px',
      textAlign: 'right' as const,
      marginTop: '8px',
    },
    rewardBanner: {
      backgroundColor: '#00FF0010',
      border: '1px solid #00FF0030',
      borderRadius: '12px',
      padding: '16px',
      marginTop: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rewardText: {
      color: '#888',
      fontSize: '14px',
    },
    rewardAmount: {
      color: '#00FF00',
      fontSize: '24px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '16px 20px',
      borderTop: '1px solid #333',
      gap: '12px',
    },
    backButton: {
      backgroundColor: 'transparent',
      border: '1px solid #333',
      borderRadius: '9999px',
      padding: '12px 24px',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: 600,
      transition: 'all 0.2s',
    },
    nextButton: (disabled: boolean) => ({
      backgroundColor: disabled ? '#333' : '#00FF00',
      border: 'none',
      borderRadius: '9999px',
      padding: '12px 32px',
      color: disabled ? '#666' : '#000',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '15px',
      fontWeight: 700,
      transition: 'all 0.2s',
      flex: 1,
      maxWidth: '200px',
    }),
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <span style={styles.logo}>✓</span>
            <h2 style={styles.title}>Verify This Post</h2>
          </div>
          <button 
            style={styles.closeButton}
            onClick={onClose}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#222'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <div style={styles.progressStep(currentStep >= 1, currentStep > 1)} />
          <div style={styles.progressStep(currentStep >= 2, currentStep > 2)} />
          <div style={styles.progressStep(currentStep >= 3, false)} />
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Post Preview */}
          <div style={styles.postPreview}>
            <div style={styles.postAuthor}>
              <div style={styles.avatar}>
                {post.author.profilePicture ? (
                  <img src={post.author.profilePicture} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                ) : (
                  post.author.name.charAt(0).toUpperCase()
                )}
              </div>
              <div style={styles.authorInfo}>
                <span style={styles.authorName}>{post.author.name}</span>
                <span style={styles.authorUsername}>@{post.author.username}</span>
              </div>
            </div>
            <p style={styles.postContent}>{post.content}</p>
          </div>

          {/* Step 1: Choose Verdict */}
          {currentStep === 1 && (
            <>
              <h3 style={styles.stepTitle}>Step 1: Choose Your Verdict</h3>
              <p style={styles.stepDescription}>
                Based on your research, what is your assessment of this post's accuracy?
              </p>
              <div style={styles.verdictGrid}>
                {verdictOptions.map(option => (
                  <div
                    key={option.value}
                    style={styles.verdictOption(verdict === option.value, option.color)}
                    onClick={() => setVerdict(option.value)}
                    onMouseEnter={e => {
                      if (verdict !== option.value) {
                        e.currentTarget.style.borderColor = '#555';
                      }
                    }}
                    onMouseLeave={e => {
                      if (verdict !== option.value) {
                        e.currentTarget.style.borderColor = '#333';
                      }
                    }}
                  >
                    <div style={styles.verdictIcon}>{option.icon}</div>
                    <div style={styles.verdictLabel}>{option.label}</div>
                    <div style={styles.verdictDescription}>{option.description}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Step 2: Add Sources */}
          {currentStep === 2 && (
            <>
              <h3 style={styles.stepTitle}>Step 2: Provide Sources</h3>
              <p style={styles.stepDescription}>
                Add credible sources that support your verdict. More sources = higher credibility.
              </p>
              {sources.map((source, index) => (
                <div key={index} style={styles.sourceInput}>
                  <input
                    type="url"
                    placeholder="https://example.com/article..."
                    value={source}
                    onChange={e => updateSource(index, e.target.value)}
                    style={styles.input}
                    onFocus={e => e.currentTarget.style.borderColor = '#00FF00'}
                    onBlur={e => e.currentTarget.style.borderColor = '#333'}
                  />
                  {sources.length > 1 && (
                    <button
                      style={styles.removeButton}
                      onClick={() => removeSource(index)}
                      onMouseEnter={e => e.currentTarget.style.color = '#FF4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#888'}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
              {sources.length < 5 && (
                <button
                  style={styles.addSourceButton}
                  onClick={addSource}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#00FF00';
                    e.currentTarget.style.backgroundColor = '#00FF0010';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  + Add Another Source ({sources.length}/5)
                </button>
              )}
            </>
          )}

          {/* Step 3: Write Explanation */}
          {currentStep === 3 && (
            <>
              <h3 style={styles.stepTitle}>Step 3: Explain Your Verdict</h3>
              <p style={styles.stepDescription}>
                Provide a clear explanation of why you chose this verdict. Minimum 20 characters.
              </p>
              <textarea
                placeholder="Explain why this post is true/false/misleading based on your sources..."
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                style={styles.textarea}
                onFocus={e => e.currentTarget.style.borderColor = '#00FF00'}
                onBlur={e => e.currentTarget.style.borderColor = '#333'}
              />
              <div style={styles.charCount}>
                {explanation.length} characters {explanation.length < 20 && `(${20 - explanation.length} more needed)`}
              </div>

              {/* Reward Preview */}
              {verdict && (
                <div style={styles.rewardBanner}>
                  <div>
                    <div style={styles.rewardText}>You'll earn for this verification:</div>
                  </div>
                  <div style={styles.rewardAmount}>
                    <span>+{tokenRewards[verdict as keyof typeof tokenRewards]}</span>
                    <span style={{ fontSize: '14px', color: '#888' }}>V-TKN</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          {currentStep > 1 ? (
            <button
              style={styles.backButton}
              onClick={() => setCurrentStep(currentStep - 1)}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#111'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Back
            </button>
          ) : (
            <div />
          )}
          
          {currentStep < 3 ? (
            <button
              style={styles.nextButton(
                currentStep === 1 ? !canProceedStep1 : !canProceedStep2
              )}
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={currentStep === 1 ? !canProceedStep1 : !canProceedStep2}
            >
              Next Step
            </button>
          ) : (
            <button
              style={styles.nextButton(!canSubmit || isSubmitting)}
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : '✓ Submit Verification'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;