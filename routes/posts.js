const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

router.post('/', async (req, res) => {
    const { userId, content } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ msg: 'User not found' });

        const newPost = new Post({ user: userId, content });
        await newPost.save();

        res.json(newPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('user').sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:postId/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        post.likes += 1;
        await post.save();

        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:postId/dislike', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        post.dislikes += 1;
        await post.save();

        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:postId/share', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        post.shares += 1;
        await post.save();

        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:postId/comment', async (req, res) => {
    const { userId, content } = req.body;

    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        const newComment = new Comment({ user: userId, post: post._id, content });
        await newComment.save();

        post.comments.push(newComment._id);
        await post.save();

        res.json(newComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:postId/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId }).populate('user').sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
