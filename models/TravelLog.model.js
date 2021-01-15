const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const travelLogSchema = new Schema({
    title: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    description: { type: String, required: true },
    travelLogAuthor: { type: Schema.Types.ObjectId, ref: "User" }
},
    {
        timestamps: {
            createdAt: 'create_at',
            updatedAt: 'updated_at'
        }
    }
)

const TravelLog = mongoose.model('TravelLog', travelLogSchema);
module.exports = TravelLog;
