import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from './useRedux';
import { loginUser, registerUser, logout } from '../store/slices/authSlice';
import type { LoginCredentials, RegisterCredentials } from '../types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      await dispatch(loginUser(credentials)).unwrap();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);
    try {
      await dispatch(registerUser(credentials)).unwrap();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    dispatch(logout());
    navigate('/login');
  };

  return {
    login,
    register,
    signOut,
    loading,
    error
  };
};
