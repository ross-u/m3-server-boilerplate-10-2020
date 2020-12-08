const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const User = require("../models/user.model");
const Post = require("../models/Post.model");
const Comment = require("../models/comment.model");

// HELPER FUNCTIONS
const {
    isLoggedIn
} = require("../helpers/middlewares");

// GET '/api/dashboard'

// router.get('/dashboard', isLoggedIn, (req, res, next) => {

// })


// GET '/api/travelPost/:postId'

router.get('/travelPost/:postId', isLoggedIn, (req, res, next) => {
    const { postId } = req.params;
    Post
        .findById(postId)
        .then((foundPost) => {
            console.log('found', foundPost);
            res
                .status(200) //okay 
                .json(foundPost)
        }).catch((err) => {
            res
                .status(500)//stands for an internal server error
                .json(err) //sends error to json
        });
});

// POST '/api/travelPost/add/:postId/:userId'

router.post('/travelPost/add/:postId/:userId', isLoggedIn, (req, res, next) => {
    const { postId, userId } = req.params;
    User
        .findByIdAndUpdate(
            userId,
            { favorites: postId }
        )
        .then((updatedUser) => {
            res
                .status(200) //okay 
                .json(updatedUser)
        }).catch((err) => {
            res
                .status(500)//stands for an internal server error
                .json(err) //sends error to json
        });
});



module.exports = router;
