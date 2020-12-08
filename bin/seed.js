require("dotenv").config();

const mongoose = require('mongoose');

//requiring the schema
const User = require('../models/User.model');
const Post = require('../models/Post.model');
const Comment = require('../models/Comment.model')
const saltRounds = 10;
const bcrypt = require('bcrypt');



//requiring the 'fake' objects
const user = require('./user-mock-data');
const post = require('./post-mock-data');
const comment = require('./comment-mock-data');

const DB_NAME = "travel-guru";

// SEED SEQUENCE