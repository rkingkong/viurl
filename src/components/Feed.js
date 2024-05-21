import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Post from './Post';

const Feed = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axios.get('/api/posts');
                const postsWithComments = await Promise.all(
                    res.data.map(async (post) => {
                        const commentsRes = await axios.get(`/api/posts/${post._id}/comments`);
                        return { ...post, comments: commentsRes.data };
                    })
                );
                setPosts(postsWithComments);
            } catch (err) {
                console.error(err.response.data);
            }
        };

        fetchPosts();
    }, []);

    const handleLike = async postId => {
        try {
            const res = await axios.post(`/api/posts/${postId}/like`);
            setPosts(posts.map(post => (post._id === postId ? res.data : post)));
        } catch (err) {
            console.error(err.response.data);
        }
    };

    const handleDislike = async postId => {
        try {
            const res = await axios.post(`/api/posts/${postId}/dislike`);
            setPosts(posts.map(post => (post._id === postId ? res.data : post)));
        } catch (err) {
            console.error(err.response.data);
        }
    };

    const handleShare = async postId => {
        try {
            const res = await axios.post(`/api/posts/${postId}/share`);
            setPosts(posts.map(post => (post._id === postId ? res.data : post)));
        } catch (err) {
            console.error(err.response.data);
        }
    };

    const handleComment = async (postId, content) => {
        try {
            const res = await axios.post(`/api/posts/${postId}/comment`, { userId: 'yourUserId', content });
            setPosts(posts.map(post => (post._id === postId ? { ...post, comments: [...post.comments, res.data] } : post)));
        } catch (err) {
            console.error(err.response.data);
        }
    };

    return (
        <div>
            {posts.map(post => (
                <Post
                    key={post._id}
                    post={post}
                    onLike={handleLike}
                    onDislike={handleDislike}
                    onShare={handleShare}
                    onComment={handleComment}
                />
            ))}
        </div>
    );
};

export default Feed;
