const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const diarySchema = new Schema({
    title: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    description: { type: String, required: true },
    diaryAuthor: { type: Schema.Types.ObjectId, ref: "User" }
},
    {
        timestamps: {
            createdAt: 'create_at',
            updatedAt: 'updated_at'
        }
    }
)

const Diary = mongoose.model('Diary', diarySchema);

module.exports = Diary;
