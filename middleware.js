const { campgroundSchema, reviewSchema } = require('./joiSchemas.js');
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground');
const Review = require('./models/review');


module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        // store the URL user is requesting
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in first.')
        res.redirect('/login');
    }
    else{
        next();
    }
}

module.exports.validateCampground = (req, res, next) => {
    const result = campgroundSchema.validate(req.body);
    //console.log(result);
    const { error } = result;
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const result = reviewSchema.validate(req.body);
    //console.log(result);
    const { error } = result;
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'Sorry, You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(id);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'Sorry, You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}