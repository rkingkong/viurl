export const getAvatarUrl = (user: any): string => {
  if (user?.profilePicture) {
    return user.profilePicture;
  }
  if (user?.avatar) {
    return user.avatar;
  }
  // Use UI Avatars service with HTTPS
  const name = user?.name || user?.username || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00ff00&color=000&bold=true`;
};
