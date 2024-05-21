const express = require('express');
const { check, validationResult } = require('express-validator');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Create Post
router.post('/', authMiddleware, [
    check('content', 'Content is required').notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;
    try {
        const post = new Post({ user: req.user.id, content });
        await post.save();
        res.json(post);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Posts
router.get('/', authMiddleware, async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Like Post
router.put('/like/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        if (post.likes.includes(req.user.id)) {
            return res.status(400).json({ error: 'Post already liked' });
        }
        post.likes.push(req.user.id);
        await post.save();
        res.json(post);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Dislike Post
router.put('/dislike/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        if (post.dislikes.includes(req.user.id)) {
            return res.status(400).json({ error: 'Post already disliked' });
        }
        post.dislikes.push(req.user.id);
        await post.save();
        res.json(post);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
