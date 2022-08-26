// Will be used for authenticating whether a user is logged in or not
// Then display the pages that require authentication
const Campground = require('./models/campground');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas/schemas');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in to view this page');
        return res.redirect('/login');
    }
    next();
}
module.exports.validateCampground = (req, res, next) => {

    console.log("**********\n");
    console.log(req.body)
    const { error } = campgroundSchema.validate(req.body);
    // console.log(error.details);

    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground.author._id.equals(req.user._id)) {
        req.flash('error', 'Only creators can edit the campground');
        return res.redirect(`/campgrounds/${campground._id}`);

    }
    next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(req.params.reviewId);
    if (!review.author._id.equals(req.user._id)) {
        req.flash('error', 'Only review authors can delete the review');
        return res.redirect(`/campgrounds/${id}`);

    }
    next()
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    // console.log(error.details);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}