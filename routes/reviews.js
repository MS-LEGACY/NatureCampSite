const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const { createReview, deleteReview } = require('../controllers/reviews');




//Reviewing a Campground 

router.post('/', isLoggedIn, validateReview, catchAsync(createReview));

// Deleting a review 

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(deleteReview))


module.exports = router;