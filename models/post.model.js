const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema(
    {
        title: { type: String, required: true },
        country: { type: String, required: true },
        city: { type: String, required: true },
        description: { type: String, required: true },
        image: { type: String, default: 'https://www.irantravelingcenter.com/wp-content/plugins/all-in-one-video-gallery/public/assets/images/placeholder-image.png' },
        postAuthor: { type: Schema.Types.ObjectId, ref: "User" },
        comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }]
    },
    {
        timestamps: {
            createdAt: 'create_at',
            updatedAt: 'updated_at'
        }
    }
)
const Post = mongoose.model('Post', postSchema);

module.exports = Post;