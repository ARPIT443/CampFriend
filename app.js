const express = require('express');
const app = express();
const ejs = require('ejs');
const ejsMate = require('ejs-mate');      // For layouts
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')
const { campgroundSchema, reviewSchema } = require('./joiSchemas.js');
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Review = require('./models/review');

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
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

const validateReview = (req, res, next) => {
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

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect MongoDB at default port 27017.
mongoose.connect('mongodb://localhost:27017/campfriend', {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false}, (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
    } else {
        console.log('Error in DB connection: ' + err)
    }
});

app.get('/', (req,res) => {
    res.render('home')
});

app.get('/campgrounds', catchAsync(async(req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}));

app.get('/campgrounds/new', (req,res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds', validateCampground, catchAsync(async(req,res,next) => {
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
}));


app.get('/campgrounds/:id', catchAsync(async(req,res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', {campground});
}));


app.get('/campgrounds/:id/edit', catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id' ,validateCampground, catchAsync(async(req,res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async(req,res) => {
    const {id} = req.params;
    const reviewId = '5ffaff4b020aab17d8c32be6';
    await Campground.findByIdAndDelete(id);
    await Review.findByIdAndDelete(reviewId);
    res.redirect('/campgrounds');
}));

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await campground.save();
    await review.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async(req,res) => {
    const { id, reviewId } = req.params;
    console.log(reviewId);
    console.log(typeof reviewId);
    await Review.findByIdAndDelete(reviewId);
    //await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    //res.send("Hello");
    //res.redirect('/campgrounds');
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = "Oh No !! Something went Wrong";
    res.status(statusCode).render('error', {err});
});

app.listen(3000, () => {
    console.log("Server Started on port 3000")
});