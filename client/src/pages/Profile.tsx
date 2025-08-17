import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchUserProfile } from '../store/slices/userSlice';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((state) => state.user);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (username) {
      dispatch(fetchUserProfile(username));
    }
  }, [username, dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === profile._id;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600"></div>
        <div className="px-6 pb-6">
          <div className="-mt-16 mb-4">
            <img
              src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}`}
              alt={profile.username}
              className="w-32 h-32 rounded-full border-4 border-white"
            />
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{profile.name || profile.username}</h1>
              <p className="text-gray-500">@{profile.username}</p>
              {profile.bio && <p className="mt-2">{profile.bio}</p>}
              <div className="flex gap-4 mt-3 text-sm text-gray-500">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-2.829 2.829a4 4 0 101.414 1.414l2.829-2.829a4 4 0 005.656 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 8.828a4 4 0 10-5.656 5.656l2.829 2.829a4 4 0 005.656 0l2.829-2.829a4 4 0 00-1.414-1.414l-2.829 2.829" />
                    </svg>
                    {profile.website}
                  </a>
                )}
              </div>
              <div className="flex gap-4 mt-4">
                <span><strong>{profile.following.length}</strong> Following</span>
                <span><strong>{profile.followers.length}</strong> Followers</span>
              </div>
            </div>
            {isOwnProfile && (
              <button className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50">
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
