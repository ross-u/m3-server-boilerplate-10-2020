const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema(
    {
        description: { type: String, required: true, maxlength: 250 },
        commentAuthor: { type: Schema.Types.ObjectId, ref: "User" },
        post: { type: Schema.Types.ObjectId, ref: "Post" }
    },
    {
        timestamps: {
            createdAt: 'create_at',
            updatedAt: 'updated_at'
        }
    }
)

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;