import React from 'react';
import type { Post } from '../../types';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
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
            <button className="text-gray-500 hover:text-blue-500 flex items-center space-x-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments?.length || 0}</span>
            </button>
            <button className="text-gray-500 hover:text-green-500 flex items-center space-x-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{post.retweets?.length || 0}</span>
            </button>
            <button className="text-gray-500 hover:text-red-500 flex items-center space-x-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post.likes?.length || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
