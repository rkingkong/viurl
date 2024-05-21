import React, { useState } from 'react';
import axios from 'axios';

const PostForm = ({ userId }) => {
    const [content, setContent] = useState('');

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/posts', { userId, content });
            console.log(res.data);
        } catch (err) {
            console.error(err.response.data);
        }
    };

    return (
        <form onSubmit={onSubmit}>
            <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                required
            />
            <button type="submit">Post</button>
        </form>
    );
};

export default PostForm;
