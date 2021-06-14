const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  nationality: { type: String },
  description: { type: String, maxlength: 600 },
  myFavoriteTrip: { type: String },
  image: { type: String, default: 'https://media.istockphoto.com/vectors/default-profile-picture-avatar-photo-placeholder-vector-illustration-vector-id1223671392?b=1&k=6&m=1223671392&s=612x612&w=0&h=5VMcL3a_1Ni5rRHX0LkaA25lD_0vkhFsb1iVm1HKVSQ=' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  myPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  favorites: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  myTravelLog: [{ type: Schema.Types.ObjectId, ref: "TravelLog" }]
},
  {
    timestamps: {
      createdAt: 'create_at',
      updatedAt: 'updated_at'
    }
  })

const User = mongoose.model('User', userSchema);
module.exports = User;