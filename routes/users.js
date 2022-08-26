const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const mongodb = require('mongodb');
const passport = require('passport');
const { createUser, loginUser, logoutUser, renderLogin, renderRegister } = require('../controllers/users')
const MongoServerError = mongodb.MongoServerError;
router.route('/register')
    .get(renderRegister)
    .post(catchAsync(createUser));

const authenticate = passport.authenticate('local', {
    failureFlash: true, failureRedirect: '/login', keepSessionInfo: true
})

router.route('/login')
    .get(renderLogin)
    .post(authenticate, loginUser);




router.get('/logout', catchAsync(logoutUser));

module.exports = router;