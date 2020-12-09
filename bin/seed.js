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

        //mapping over users mock data to hash their passwords 
        const updatedUser = users.map((user) => {
            const salt = bcrypt.genSaltSync(saltRounds);
            user.password = bcrypt.hashSync(user.password, salt);
            return user

        })
        // creating users with already hashed passwords
        const pr = User.create(updatedUser);
        return pr;

    })
    .then((createdUsers) => {

        console.log(`Created ${createdUsers.length} users`);

        // 3. WHEN .create() OPERATION IS DONE
        // UPDATE THE OBJECTS IN THE ARRAY OF user charities
        const updatedPost = posts.map((post, i) => {
            const user = createdUsers[i];
            const userId = user._id;
            post.postAuthor = userId;
            return post; // return the updated userCharity
        });
        const pr = Post.create(updatedPost);
        return pr; // forwards the promise to next `then`
    })
    .then((createdPosts) => {
        console.log(`Created ${createdPosts.length} posts`);

        const updateUserPromisesArr = createdPosts.map((post) => {
            const userId = String(post.postAuthor);
            const postId = post._id;
            return User.findByIdAndUpdate(userId, { $push: { myPosts: postId } }, { new: true });
        })

        const pr = Promise.all(updateUserPromisesArr); //makes one big promise around all promises coming from array

        return pr;

    }).then((updatedUsers) => {

        console.log(`Updated ${updatedUsers.length} users`);
        const usersCopy = [...updatedUsers];

        const updatedComment = comments.map((comment, i) => {
            // Update the userCharity and set the corresponding job id
            // to create the reference
            const randomIndex = Math.floor(Math.random() * usersCopy.length)
            console.log('randomIndex', randomIndex);

            const randomUser = usersCopy.splice(randomIndex, 1)[0]

            const user = updatedUsers[i];
            const postId = user.myPosts[0];
            comment.post = postId;
            comment.commentAuthor = randomUser._id;

            return comment; // return the updated userCharity
        });

        const pr = Comment.create(updatedComment);
        return pr; // forwards the promise to next `then`


    }).then((createdComments) => {
        console.log(`Created ${createdComments.length} comments`);

        const promiseArr = createdComments.map((comment, i) => {
            const postId = String(comment.post);
            const currentComment = comment

            const commentId = currentComment._id

            // const postObj = { volunteer: volunteerUserId, accepted: false }
            return Post.findByIdAndUpdate(postId, { $push: { comments: commentId } }, { new: true });
        })
        const pr = Promise.all(promiseArr); //makes one big promise around all promises coming from array

        return pr

    }).then((updatedPosts) => {
        console.log(`Updated ${updatedPosts.length} posts`);
        const foundComment = Comment.find()
        return foundComment


    })
    // .then((foundComments) => {
    //     const updatedComment = User.find()
    //         .then((foundUsers) => {
    //             const updatedCommentUser = foundComments.map((comment) => {
    //                 let randomNum = Math.floor(Math.random() * foundUsers.length)
    //                 const randomUser = foundUsers[randomNum];
    //                 const randomUserId = randomUser._id
    //                 comment.commentAuthor = [randomUserId];
    //                 return comment
    //             })
    //             return updatedCommentUser

    //         })
    //         .catch((err) => console.log(err));
    //     return updatedComment
    // })
    // .then((comments) => {
    //     const createdComments = Comment.create(comments)

    //     return createdComments

    // })
    .then((updatedComments) => {
        // console.log('updatedComments', updatedComments);

        mongoose.connection.close();

    })


    .catch((err) => console.log(err));
