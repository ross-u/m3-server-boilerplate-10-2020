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

router.get('/dashboard', isLoggedIn, (req, res, next) => {
    Post.find()
        .then((foundPosts) => {
            res
                .status(200) //okay 
                .json(foundPosts)
        })
        .catch((err) => {
            res
                .status(400)//stands for bad request
                .json(err) //sends error to json
        });
})


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
        })
        .catch((err) => {
            res
                .status(400)//stands for bad request
                .json(err) //sends error to json
        });
});

// POST '/api/travelPost/add/:postId/:userId'

router.post('/travelPost/add/:postId/:userId', isLoggedIn, (req, res, next) => {
    const { postId, userId } = req.params;
    User
        .findByIdAndUpdate(
            userId,
            { favorites: postId },
            { new: true }
        )
        .then((updatedUser) => {
            res
                .status(200) //okay 
                .json(updatedUser)
        })
        .catch((err) => {
            res
                .status(404)//stands for not found
                .json(err) //sends error to json
        });
});


// GET '/api/profile/:userId'

router.get('/profile/:userId', isLoggedIn, (req, res, next) => {
    const { userId } = req.params;
    console.log('user', req.params);
    User.findById(userId)
        .then((foundUser) => {
            res
                .status(200) //okay
                .json(foundUser)
        })
        .catch((err) => {
            res
                .status(404)//stands for not found
                .json(err) //sends error to json
        });
})

// PUT '/api/editProfile/:userId'

router.put('/editProfile/:userId', isLoggedIn, (req, res, next) => {
    const { userId } = req.params;
    const { name, username, nationality, myFavoriteTrip, description, image } = req.body;
    User.findByIdAndUpdate(
        userId,
        {
            name,
            username,
            nationality,
            myFavoriteTrip,
            description,
            image
        },
        { new: true }
    )
        .then((updatedUser) => {
            res
                .status(200) //okay
                .json(updatedUser)
        })
        .catch((err) => {
            res
                .status(404)//stands for not found
                .json(err) //sends error to json
        });
})


// DELETE '/api/deleteProfileConfirmation/:userId'
router.delete('/deleteProfileConfirmation/:userId', isLoggedIn, (req, res, next) => {
    const { userId } = req.params;
    User.findByIdAndDelete(userId)
        .then(() => {
            res
                .status(200) //okay
                .send(`User ${userId} was removed successfully.`);

        })
        .catch((err) => {
            res
                .status(404)//stands for not found
                .json(err) //sends error to json
        });
})

// GET '/api/myPosts/:userId'

router.get('/myPosts/:userId', isLoggedIn, (req, res, next) => {
    const { userId } = req.params;
    User
        .findById(userId)
        .populate('myPosts')
        .then((foundUser) => {
            res
                .status(200) //okay 
                .json(foundUser.myPosts)
        }).catch((err) => {
            res
                .status(404)//stands for not found
                .json(err) //sends error to json
        });
})

// POST '/api/createPost'

router.post('/createPost', isLoggedIn, (req, res, next) => {

    const { title, country, city, image, description, postAuthor } = req.body;
    const currentUserId = req.session.currentUser._id;
    // console.log('currentUser', currentUsername);
    Post.create({ title, country, city, image, description, postAuthor: currentUserId })
        .then((createdPost) => {
            User.findByIdAndUpdate(
                currentUserId,
                { $push: { myPosts: createdPost } }, { new: true }
            )
                .then(() => {
                    res
                        .status(201) //okay 
                        .send(`Post ${createdPost} was created successfully.`);
                })
        })
        .catch((err) => {
            res
                .status(404)//stands for not found
                .json(err) //sends error to json
        });


})


module.exports = router;
