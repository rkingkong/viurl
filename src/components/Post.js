import React, { useState } from 'react';

const Post = ({ post, onLike, onDislike, onShare, onComment }) => {
    const [comment, setComment] = useState('');

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        onComment(post._id, comment);
        setComment('');
    };

    return (
        <div>
            <p>{post.content}</p>
            <p>By: {post.user.username}</p>
            <p>Likes: {post.likes} Dislikes: {post.dislikes} Shares: {post.shares}</p>
            <button onClick={() => onLike(post._id)}>Like</button>
            <button onClick={() => onDislike(post._id)}>Dislike</button>
            <button onClick={() => onShare(post._id)}>Share</button>
            <form onSubmit={handleCommentSubmit}>
                <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment"
                />
                <button type="submit">Comment</button>
            </form>
            {post.comments.map((comment, index) => (
                <p key={index}>{comment.content} by {comment.user.username}</p>
            ))}
        </div>
    );
};

export default Post;
