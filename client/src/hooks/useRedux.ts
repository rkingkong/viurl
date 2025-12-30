import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useCurrentUser = () => {
  return useAppSelector((state) => state.auth.user);
};

export const useIsAuthenticated = () => {
  return useAppSelector((state) => state.auth.isAuthenticated);
};

export const useAuthLoading = () => {
  return useAppSelector((state) => state.auth.loading);
};

export const useAuthError = () => {
  return useAppSelector((state) => state.auth.error);
};

export const useAuthToken = () => {
  return useAppSelector((state) => state.auth.token);
};

export const useFeedPosts = () => {
  return useAppSelector((state) => state.feed.posts);
};

export const useFeedLoading = () => {
  return useAppSelector((state) => state.feed.loading);
};

export const useFeedError = () => {
  return useAppSelector((state) => state.feed.error);
};

export const useFeedHasMore = () => {
  return useAppSelector((state) => state.feed.hasMore);
};

export const useTokenBalance = (): number => {
  const user = useCurrentUser();
  return user?.vtokens || 0;
};

export const useTrustScore = (): number => {
  const user = useCurrentUser();
  return user?.trustScore || 0;
};

export const useUserBadge = (): string => {
  const user = useCurrentUser();
  if (!user) return '🥉';
  const score = user.trustScore || 0;
  if (score >= 95) return '💎';
  if (score >= 75) return '🥇';
  if (score >= 50) return '🥈';
  return '🥉';
};

export const useAuth = () => {
  const user = useCurrentUser();
  const isAuthenticated = useIsAuthenticated();
  const loading = useAuthLoading();
  const error = useAuthError();
  const token = useAuthToken();
  return { user, isAuthenticated, loading, error, token };
};

export const useFeed = () => {
  const posts = useFeedPosts();
  const loading = useFeedLoading();
  const error = useFeedError();
  const hasMore = useFeedHasMore();
  return { posts, loading, error, hasMore };
};
