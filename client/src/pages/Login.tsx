import React, { useState } from 'react';
import { useAppDispatch } from '../hooks/useRedux';
import { login, register } from '../store/slices/authSlice';

export interface LoginProps {
  onSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await dispatch(login({ email, password })).unwrap();
      } else {
        await dispatch(register({ email, username, password, name })).unwrap();
      }
      onSuccess?.();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Authentication failed');
    }
    setLoading(false);
  };

  const styles = {
    container: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#000', color: '#fff', padding: '20px' } as React.CSSProperties,
    card: { width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: '#111', borderRadius: '16px', border: '1px solid #333' } as React.CSSProperties,
    logo: { fontSize: '36px', fontWeight: 'bold', color: '#00FF00', textAlign: 'center' as const, marginBottom: '10px' } as React.CSSProperties,
    tagline: { textAlign: 'center' as const, color: '#888', marginBottom: '30px', fontSize: '14px' } as React.CSSProperties,
    title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' as const } as React.CSSProperties,
    form: { display: 'flex', flexDirection: 'column' as const, gap: '15px' } as React.CSSProperties,
    input: { width: '100%', padding: '14px 16px', backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '16px', outline: 'none', boxSizing: 'border-box' as const } as React.CSSProperties,
    btn: { width: '100%', padding: '14px', backgroundColor: '#00FF00', color: '#000', border: 'none', borderRadius: '25px', fontSize: '16px', fontWeight: 'bold' as const, cursor: 'pointer' } as React.CSSProperties,
    btnDisabled: { width: '100%', padding: '14px', backgroundColor: '#004400', color: '#888', border: 'none', borderRadius: '25px', fontSize: '16px', fontWeight: 'bold' as const, cursor: 'not-allowed' } as React.CSSProperties,
    error: { backgroundColor: '#ff444420', border: '1px solid #ff4444', color: '#ff4444', padding: '12px', borderRadius: '8px', fontSize: '14px', textAlign: 'center' as const } as React.CSSProperties,
    switch: { textAlign: 'center' as const, marginTop: '20px', color: '#888', fontSize: '14px' } as React.CSSProperties,
    switchLink: { color: '#00FF00', cursor: 'pointer', marginLeft: '5px' } as React.CSSProperties,
    features: { display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #333' } as React.CSSProperties,
    feature: { textAlign: 'center' as const, fontSize: '12px', color: '#888' } as React.CSSProperties,
    featureIcon: { fontSize: '24px', marginBottom: '5px' } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>VIURL</div>
        <div style={styles.tagline}>Verify Information, Earn Rewards</div>
        <h1 style={styles.title}>{isLogin ? 'Welcome Back' : 'Join VIURL'}</h1>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                required
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" disabled={loading} style={loading ? styles.btnDisabled : styles.btn}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={styles.switch}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <span style={styles.switchLink} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </div>

        <div style={styles.features}>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>✓</div>
            <div>Verify Facts</div>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>🪙</div>
            <div>Earn Tokens</div>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>📈</div>
            <div>Build Trust</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
