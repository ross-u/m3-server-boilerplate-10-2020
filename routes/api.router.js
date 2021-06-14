const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const User = require("../models/user.model");
const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const TravelLog = require("../models/TravelLog.model");

//require uploader, already exported from cloudinary-setup.js
const uploader = require("./../config/cloudinary-setup");

// include CLOUDINARY:
//upload a single image per once.
// ADD an horitzontal middleware
router.post("/upload", uploader.single("image"), (req, res, next) => {
    if (!req.file) {
        next(new Error("No file uploaded!"));
        return;
    }
    // get secure_url from the file object and save it in the
    // variable 'secure_url', but this can be any name, just make sure you remember to use the same in frontend
    res.json({ secure_url: req.file.secure_url });
});

// HELPER FUNCTIONS
const {
    isLoggedIn
} = require("../helpers/middlewares");

// GET '/api/dashboard'
router.get('/dashboard', isLoggedIn, (req, res, next) => {
    Post.find()
        .then((foundPosts) => {
            res
                .status(200)
                .json(foundPosts)
        })
        .catch((err) => next(createError(err)))
})

// GET '/api/post/:postId'
router.get('/post/:postId', isLoggedIn, (req, res, next) => {
    const { postId } = req.params;
    Post
        .findById(postId)
        .populate('postAuthor')
        .populate({
            path: 'comments',
            model: 'Comment',
            populate: {
                path: 'commentAuthor',
                model: 'User'
            }
        })
        .then((foundPost) => {
            res
                .status(200)
                .json(foundPost)
        })
        .catch((err) => next(createError(err)))
});

// GET '/api/profile/:userId'
router.get('/profile/:userId', (req, res, next) => {
    const { userId } = req.params;
    User.findById(userId)
        .then((foundUser) => {
            res
                .status(200)
                .json(foundUser)
        })
        .catch((err) => next(createError(err)))
})

// PUT '/api/editProfile/:userId'
router.put('/editProfile/:userId', (req, res, next) => {

    const { userId } = req.params;
    const { name, username, nationality, myFavoriteTrip, description, image } = req.body;
    let uploadedImage = image ? image : req.session.currentUser.image;

    User.findByIdAndUpdate(
        userId,
        {
            name,
            username,
            nationality,
            myFavoriteTrip,
            description,
            image: uploadedImage
        },
        { new: true }
    )
        .then((updatedUser) => {
            res
                .status(200)
                .json(updatedUser)
        })
        .catch((err) => next(createError(err)))
})

// DELETE '/api/deleteProfileConfirmation/:userId'
router.delete('/deleteProfileConfirmation/:userId', isLoggedIn, (req, res, next) => {
    const { userId } = req.params;
    Post.deleteMany({ postAuthor: userId })
        .then(() => {
            TravelLog.deleteMany({ travelLogAuthor: userId })
                .then(() => {
                    User.findByIdAndDelete(userId)
                        .then(() => {
                            res
                                .status(200)
                                .send(`User ${userId} was removed successfully.`);
                        })
                })
        })
        .catch((err) => next(createError(err)))
})

// GET '/api/myPosts/:userId'
router.get('/myPosts/:userId', isLoggedIn, (req, res, next) => {
    const { userId } = req.params;
    User
        .findById(userId)
        .populate('myPosts')
        .then((foundUser) => {
            res
                .status(200)
                .json(foundUser.myPosts)
        })
        .catch((err) => next(createError(err)))
})

// POST '/api/createPost'
router.post('/createPost', isLoggedIn, (req, res, next) => {

    const { title, country, city, image, description } = req.body;
    const currentUserId = req.session.currentUser._id;

    Post.create({ title, country, city, image, description, postAuthor: currentUserId })
        .then((createdPost) => {
            User.findByIdAndUpdate(
                currentUserId,
                { $push: { myPosts: createdPost } }, { new: true }
            )
                .then(() => {
                    res
                        .status(201)
                        .send(`Post ${createdPost} was created successfully.`);
                })
        })
        .catch((err) => next(createError(err)))
})


// PUT '/api/editPost/:postId'
router.put('/editPost/:postId', isLoggedIn, (req, res, next) => {

    const { postId } = req.params;
    const { title, country, description, city, image } = req.body;

    Post.findByIdAndUpdate(postId, {
        title,
        country,
        description,
        city,
        image
    },
        { new: true }
    ).then((updatedPost) => {
        res
            .status(200)
            .json(updatedPost)
    })
        .catch((err) => next(createError(err)))
})

// DELETE '/api/deletePost/:postId'
router.delete('/deletePost/:postId', isLoggedIn, (req, res, next) => {

    const { postId } = req.params;
    const currentUserId = req.session.currentUser._id;

    User.findByIdAndUpdate(
        currentUserId,
        { $pull: { myPosts: postId } },
        { new: true }
    )
        .then(() => {
            Post.findByIdAndDelete(postId)
                .then((response) => {
                    res
                        .status(200)
                        .send(`Post ${response} was removed successfully.`);
                })
        })
        .catch((err) => next(createError(err)))
})

// GET '/api/favoritePosts/:userId'
router.get('/favoritePosts/:userId', isLoggedIn, (req, res, next) => {
    const { userId } = req.params;
    User
        .findById(userId)
        .populate('favorites')
        .then((foundUser) => {
            res
                .status(200)
                .json(foundUser.favorites)
        })
        .catch((err) => next(createError(err)))
})

// POST '/api/favoritePost/add/:postId/:userId'
router.post('/favoritePost/add/:postId/:userId', (req, res, next) => {
    const { postId, userId } = req.params;
    User
        .findByIdAndUpdate(
            userId,
            { $push: { favorites: postId } },
            { new: true }
        )
        .then((updatedUser) => {
            res
                .status(200)
                .json(updatedUser)
        })
        .catch((err) => next(createError(err)))
});


// DELETE '/api/deleteFavorite/:favoritePostId'
router.delete('/deleteFavorite/:favoritePostId', isLoggedIn, (req, res, next) => {

    const currentUserId = req.session.currentUser._id;
    const { favoritePostId } = req.params;

    User.findByIdAndUpdate(
        currentUserId,
        { $pull: { favorites: favoritePostId } },
        { new: true }
    )
        .then((updatedUser) => {
            res
                .status(200)
                .send(`User favorites ${updatedUser} was updated successfully.`);

        })
        .catch((err) => next(createError(err)))
})

// POST '/api/createComment/'
router.post('/createComment/:postId', isLoggedIn, (req, res, next) => {

    const { description } = req.body;
    const currentUserId = req.session.currentUser._id;
    const { postId } = req.params;

    Comment.create({ description, commentAuthor: currentUserId, post: postId })
        .then((createdCommment) => {
            Post.findByIdAndUpdate(
                postId,
                { $push: { comments: createdCommment } },
                { new: true }
            )
                .then(() => {
                    res
                        .status(201)
                        .send(`Comment ${createdCommment} was updated successfully.`);
                })
        })
        .catch((err) => next(createError(err)))
})

// GET '/api/travelLogs/'
router.get('/travelLogs', isLoggedIn, (req, res, next) => {
    const currentUserId = req.session.currentUser._id;
    User
        .findById(currentUserId)
        .populate('myTravelLog')
        .then((foundUser) => {
            const travelLogArr = foundUser.myTravelLog
            res
                .status(200)
                .json(travelLogArr)
        })
        .catch((err) => next(createError(err)))
})

// POST '/api/createTravelLog/'
router.post('/createTravelLog', isLoggedIn, (req, res, next) => {

    const { title, country, city, description } = req.body;
    const currentUserId = req.session.currentUser._id;

    TravelLog.create({ title, country, city, description, travelLogAuthor: currentUserId })
        .then((createdTravelLog) => {
            User.findByIdAndUpdate(
                currentUserId,
                { $push: { myTravelLog: createdTravelLog } },
                { new: true }
            )
                .then(() => {
                    res
                        .status(201)
                        .send(`User travelLog ${createdTravelLog} was updated successfully.`);
                })
        })
        .catch((err) => next(createError(err)))
})

// DELETE '/api/deleteTravelLog/:travelLogId'
router.delete('/deleteTravelLog/:travelLogId', isLoggedIn, (req, res, next) => {

    const { travelLogId } = req.params;
    const currentUserId = req.session.currentUser._id;

    TravelLog.findByIdAndDelete(travelLogId)
        .then(() => {
            User.findByIdAndUpdate(
                currentUserId,
                {
                    $pull: {
                        myTravelLog: travelLogId
                    }
                },
                { new: true }
            )
                .then((updatedUser) => {
                    res
                        .status(200)
                        .send(`Travel Log ${updatedUser} was removed successfully from user.`);
                })
        })
        .catch((err) => next(createError(err)))
})

module.exports = router;
