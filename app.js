const express = require('express');
const app = express();
const ejs = require('ejs');
const ejsMate = require('ejs-mate');      // For layouts
const ExpressError = require('./utils/ExpressError')
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

// Connect MongoDB at default port 27017.
mongoose.connect('mongodb://localhost:27017/campfriend', {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false}, (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
    } else {
        console.log('Error in DB connection: ' + err)
    }
});

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: "Hellohiibyebye",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,      // (1000 * 60 * 60 * 24 * 7) means 7 days in milisecond
        maxAge: 1000 * 60 * 60 * 24 * 7                       
    }
}
app.use(session(sessionConfig));
app.use(flash());




app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews',reviews)



app.get('/', (req,res) => {
    res.render('home')
});

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