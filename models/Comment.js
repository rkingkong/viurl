const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true, maxlength: 280 },
    createdAt: { type: Date, default: Date.now }
});

CommentSchema.index({ post: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema);
