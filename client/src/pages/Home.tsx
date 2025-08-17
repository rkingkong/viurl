import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { createPost, fetchFeed } from '../store/slices/feedSlice';
import type { Post } from '../types';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { posts, loading } = useAppSelector((state) => state.feed);
  const { user } = useAppSelector((state) => state.auth);
  const [postContent, setPostContent] = useState('');

  // Fetch posts on component mount
  useEffect(() => {
    dispatch(fetchFeed(1));
  }, [dispatch]);

  const handleCreatePost = async () => {
    if (postContent.trim()) {
      await dispatch(createPost(postContent));
      setPostContent('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="flex space-x-3">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}`}
            alt={user?.username}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's happening?"
              rows={3}
            />
            <div className="mt-3 flex justify-between items-center">
              <div className="flex space-x-3">
                <button className="text-blue-500 hover:bg-blue-50 p-2 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={!postContent.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading && posts.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          posts.map((post: Post) => (
            <div key={post._id} className="bg-white shadow rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <img
                  src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.username}`}
                  alt={post.author.username}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-1">
                    <h3 className="font-semibold">{post.author.name || post.author.username}</h3>
                    <span className="text-gray-500">@{post.author.username}</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1">{post.content}</p>
                  <div className="mt-3 flex items-center space-x-6">
                    <button className="text-gray-500 hover:text-blue-500">💬 {post.comments?.length || 0}</button>
                    <button className="text-gray-500 hover:text-green-500">🔄 {post.retweets?.length || 0}</button>
                    <button className="text-gray-500 hover:text-red-500">❤️ {post.likes?.length || 0}</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
