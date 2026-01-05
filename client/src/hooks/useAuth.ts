import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { login, register, logout, fetchCurrentUser } from '../store/slices/authSlice';
import type { LoginCredentials, RegisterData } from '../types';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, loading, error, isAuthenticated, token } = useAppSelector(
    (state) => state.auth
  );

  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const result = await dispatch(login(credentials)).unwrap();
        return { success: true, data: result };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    },
    [dispatch]
  );

  const handleRegister = useCallback(
    async (data: RegisterData) => {
      try {
        const result = await dispatch(register(data)).unwrap();
        return { success: true, data: result };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    },
    [dispatch]
  );

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const handleCheckAuth = useCallback(async () => {
    try {
      const result = await dispatch(fetchCurrentUser()).unwrap();
      return { success: true, data: result };
    } catch {
      return { success: false, error: 'Not authenticated' };
    }
  }, [dispatch]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    token,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    checkAuth: handleCheckAuth,
  };
}

export default useAuth;
