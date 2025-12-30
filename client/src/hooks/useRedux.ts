// useRedux.ts - VIURL Typed Redux Hooks
// Location: client/src/hooks/useRedux.ts

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

// ============================================
// Typed Hooks
// ============================================

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ============================================
// Custom Hooks for Common Patterns
// ============================================

/**
 * Hook to get current authenticated user
 */
export const useCurrentUser = () => {
  return useAppSelector((state) => state.auth.user);
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
  return useAppSelector((state) => state.auth.isAuthenticated);
};

/**
 * Hook to get user's V-TKN balance
 */
export const useTokenBalance = () => {
  return useAppSelector((state) => state.auth.user?.vtokens || 0);
};

/**
 * Hook to get user's trust score
 */
export const useTrustScore = () => {
  return useAppSelector((state) => state.auth.user?.trustScore || 0);
};

/**
 * Hook to get user's verification badge
 */
export const useVerificationBadge = () => {
  return useAppSelector((state) => state.auth.user?.verificationBadge || 'none');
};

/**
 * Hook to get feed posts
 */
export const useFeedPosts = () => {
  return useAppSelector((state) => state.feed.posts);
};

/**
 * Hook to get feed loading state
 */
export const useFeedLoading = () => {
  return useAppSelector((state) => state.feed.loading);
};

/**
 * Hook to get auth loading state
 */
export const useAuthLoading = () => {
  return useAppSelector((state) => state.auth.loading);
};

/**
 * Hook to get combined loading state
 */
export const useIsLoading = () => {
  const authLoading = useAppSelector((state) => state.auth.loading);
  const feedLoading = useAppSelector((state) => state.feed.loading);
  return authLoading || feedLoading;
};

/**
 * Hook to check if a specific post is being verified
 */
export const useIsVerifyingPost = (postId: string) => {
  return useAppSelector((state) => state.feed.verifyingPostId === postId);
};

/**
 * Hook to get auth error
 */
export const useAuthError = () => {
  return useAppSelector((state) => state.auth.error);
};

/**
 * Hook to get feed error
 */
export const useFeedError = () => {
  return useAppSelector((state) => state.feed.error);
};

/**
 * Hook to get current feed type (for-you / following)
 */
export const useFeedType = () => {
  return useAppSelector((state) => state.feed.feedType);
};

/**
 * Hook to check if user has verified a specific post
 */
export const useHasVerifiedPost = (postId: string) => {
  const user = useAppSelector((state) => state.auth.user);
  const posts = useAppSelector((state) => state.feed.posts);
  
  if (!user) return false;
  
  const post = posts.find(p => p._id === postId);
  if (!post || !post.verifications) return false;
  
  return post.verifications.some(
    (v: any) => v.toString() === user._id || v._id === user._id || v === user._id
  );
};

/**
 * Hook to check if user has bookmarked a specific post
 */
export const useHasBookmarkedPost = (postId: string) => {
  const user = useAppSelector((state) => state.auth.user);
  const posts = useAppSelector((state) => state.feed.posts);
  
  if (!user) return false;
  
  const post = posts.find(p => p._id === postId);
  if (!post || !post.bookmarkedBy) return false;
  
  return post.bookmarkedBy.some(
    (b: any) => b.toString() === user._id || b._id === user._id || b === user._id
  );
};

/**
 * Hook to check if user has reposted a specific post
 */
export const useHasRepostedPost = (postId: string) => {
  const user = useAppSelector((state) => state.auth.user);
  const posts = useAppSelector((state) => state.feed.posts);
  
  if (!user) return false;
  
  const post = posts.find(p => p._id === postId);
  if (!post || !post.repostedBy) return false;
  
  return post.repostedBy.some(
    (r: any) => r.toString() === user._id || r._id === user._id || r === user._id
  );
};