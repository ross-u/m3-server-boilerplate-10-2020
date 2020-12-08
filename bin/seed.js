require("dotenv").config();

const mongoose = require('mongoose');

//requiring the schema
const User = require('../models/User.model');
const Post = require('../models/Post.model');
const Comment = require('../models/Comment.model')
const saltRounds = 10;
const bcrypt = require('bcrypt');



//requiring the 'fake' objects
const users = require('./user-mock-data');
const posts = require('./post-mock-data');
const comments = require('./comment-mock-data');

const DB_NAME = "travel-guru";

// SEED SEQUENCE
// 0. ESTABLISH CONNECTION TO MONGO DATABASE
mongoose
    .connect(process.env.MONGODB_URI, {

        // .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then((x) => {
        // 1. DROP THE DATABASE
        const pr = x.connection.dropDatabase();

        return pr;
    })
    .then(() => {
        // 2.  CREATE THE DOCUMENTS FROM ARRAY OF USERS
        const pr = User.create(users);
        // const salt = bcrypt.genSaltSync(saltRounds);
        // userCharity.password = bcrypt.hashSync(userCharity.password, salt);
        return pr;
    })
    .then((createdUsers) => {
        console.log(`Created ${createdUsers.length} users`);

        // 3. WHEN .create() OPERATION IS DONE
        // UPDATE THE OBJECTS IN THE ARRAY OF user charities
        const updatedPost = posts.map((post, i) => {
            // Update the userCharity and set the corresponding job id
            // to create the reference
            const user = createdUsers[i];
            const userId = user._id;
            post.postAuthor = [userId];


            return post; // return the updated userCharity
        });

        const pr = Post.create(updatedPost);
        return pr; // forwards the promise to next `then`
    })
    .then((createdPosts) => {
        console.log(`Created ${createdPosts.length} posts`);

        const promiseArr = createdPosts.map((post) => {
            const userId = String(post.postAuthor);
            const postId = post._id;
            // const postObj = { volunteer: volunteerUserId, accepted: false }
            return User.findByIdAndUpdate(userId, { $push: { myPosts: postId } }, { new: true });
        })
        const pr = Promise.all(promiseArr); //makes one big promise around all promises coming from array
        return pr

    }).then((updatedUser) => {
        console.log(`Updated ${updatedUser.length} users`);

        mongoose.connection.close();

    })

    .catch((err) => console.log(err));
