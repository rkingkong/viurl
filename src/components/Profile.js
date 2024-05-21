import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = ({ userId }) => {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`/api/auth/user/${userId}`);
                setUser(res.data);
            } catch (err) {
                console.error(err.response.data);
            }
        };

        const fetchPosts = async () => {
            try {
                const res = await axios.get(`/api/posts/user/${userId}`);
                setPosts(res.data);
            } catch (err) {
                console.error(err.response.data);
            }
        };

        fetchUser();
        fetchPosts();
    }, [userId]);

    if (!user) return <div>Loading...</div>;

    return (
        <div>
            <h1>{user.username}</h1>
            <h2>{user.email}</h2>
            <h3>Posts</h3>
            <div>
                {posts.map(post => (
                    <div key={post._id}>
                        <p>{post.content}</p>
                        <p>Likes: {post.likes} Dislikes: {post.dislikes} Shares: {post.shares}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;
