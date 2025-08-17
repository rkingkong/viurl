import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { createPost } from '../../store/slices/feedSlice';

const CreatePost: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    if (content.trim()) {
      await dispatch(createPost(content));
      setContent('');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex space-x-3">
        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}`}
          alt={user?.username}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What's happening?"
            rows={3}
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
