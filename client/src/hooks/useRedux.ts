// useRedux.ts - VIURL Redux Hooks
// Location: client/src/hooks/useRedux.ts
// VERSION: Fixed with type-only imports for verbatimModuleSyntax

import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

// Typed dispatch hook
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Typed selector hook
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ============================================
// AUTH SELECTORS
// ============================================

export const useCurrentUser = () => useAppSelector((state) => state.auth.user);
export const useIsAuthenticated = () => useAppSelector((state) => state.auth.isAuthenticated);
export const useAuthToken = () => useAppSelector((state) => state.auth.token);
export const useAuthLoading = () => useAppSelector((state) => state.auth.loading);
export const useAuthError = () => useAppSelector((state) => state.auth.error);
export const useTokenBalance = () => useAppSelector((state) => state.auth.user?.vtokens ?? 0);
export const useTrustScore = () => useAppSelector((state) => state.auth.user?.trustScore ?? 0);
export const useVerificationBadge = () => useAppSelector((state) => state.auth.user?.verificationBadge ?? 'none');

// ============================================
// FEED SELECTORS
// ============================================

export const useFeedPosts = () => useAppSelector((state) => state.feed.posts);
export const useFeedLoading = () => useAppSelector((state) => state.feed.loading);
export const useFeedError = () => useAppSelector((state) => state.feed.error);
export const useFeedHasMore = () => useAppSelector((state) => state.feed.hasMore);
export const useFeedPage = () => useAppSelector((state) => state.feed.page);
export const useFeedType = () => useAppSelector((state) => state.feed.feedType);
export const useFeedRefreshing = () => useAppSelector((state) => state.feed.refreshing);

// Post by ID
export const usePostById = (postId: string) => useAppSelector(
  (state) => state.feed.posts.find((p) => p._id === postId)
);

// Has user verified this post?
export const useHasVerifiedPost = (postId: string) => useAppSelector(
  (state) => {
    const post = state.feed.posts.find((p) => p._id === postId);
    if (!post) return false;
    return post.isVerifiedByMe ?? false;
  }
);

// Has user bookmarked this post?
export const useHasBookmarkedPost = (postId: string) => useAppSelector(
  (state) => {
    const post = state.feed.posts.find((p) => p._id === postId);
    if (!post) return false;
    return post.isBookmarkedByMe ?? false;
  }
);

// Has user reposted this post?
export const useHasRepostedPost = (postId: string) => useAppSelector(
  (state) => {
    const post = state.feed.posts.find((p) => p._id === postId);
    if (!post) return false;
    return post.isRepostedByMe ?? false;
  }
);

// ============================================
// COMBINED SELECTORS
// ============================================

// Get auth state
export const useAuth = () => useAppSelector((state) => state.auth);

// Get feed state
export const useFeed = () => useAppSelector((state) => state.feed);

// Get user stats
export const useUserStats = () => useAppSelector((state) => ({
  vtokens: state.auth.user?.vtokens ?? 0,
  trustScore: state.auth.user?.trustScore ?? 0,
  badge: state.auth.user?.verificationBadge ?? 'none',
  followers: state.auth.user?.followers ?? 0,
  following: state.auth.user?.following ?? 0,
}));

export default {
  useAppDispatch,
  useAppSelector,
  useCurrentUser,
  useIsAuthenticated,
  useAuthToken,
  useAuthLoading,
  useAuthError,
  useTokenBalance,
  useTrustScore,
  useVerificationBadge,
  useFeedPosts,
  useFeedLoading,
  useFeedError,
  useFeedHasMore,
  useFeedPage,
  useFeedType,
  useFeedRefreshing,
  usePostById,
  useHasVerifiedPost,
  useHasBookmarkedPost,
  useHasRepostedPost,
  useAuth,
  useFeed,
  useUserStats,
};