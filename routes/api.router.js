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

})


module.exports = router;
