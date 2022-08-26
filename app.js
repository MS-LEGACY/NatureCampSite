if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const morgan = require('morgan');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users');
const passport = require('passport')
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const MongoStore = require('connect-mongo')
// const dbUrl = process.env.DB_URL;
// const helmet = require('helmet');
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp'
const mongoSanitize = require('express-mongo-sanitize')
mongoose.connect(dbUrl);
const secret = process.env.SECRET || "thisisarandomsecret";
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log("Database Connected");
});

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(morgan('tiny'))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com",
//     "https://api.tiles.mapbox.com",
//     "https://api.mapbox.com",
//     "https://kit.fontawesome.com",
//     "https://cdnjs.cloudflare.com",
//     "https://cdn.jsdelivr.net",
//     "https://cdn.maptiler.com"
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com",
//     "https://stackpath.bootstrapcdn.com",
//     "https://api.mapbox.com",
//     "https://api.tiles.mapbox.com",
//     "https://fonts.googleapis.com",
//     "https://use.fontawesome.com",
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com",
//     "https://*.tiles.mapbox.com",
//     "https://events.mapbox.com",
//     "https://api.maptiler.com"
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             childSrc: ["blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/dgfuwjgtd/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//                 "https://images.unsplash.com",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: secret
    },
    touchAfter: 24 * 60 * 60
})

store.on('error', function (e) {
    console.log("Session Store Error", e)
})

const sessionConfig = {
    store,
    name: 'YelpCampCookie',
    secret: secret,
    resave: false,
    // secure:true
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 60 * 34 * 7
    },
}

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(
    mongoSanitize({
        allowDots: true,
    }),
);
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})

app.get('/', (req, res) => {
    res.render('home');
});
// All users routes grouped together 

app.use('/', usersRoutes);



// All Campgrounds Routes Grouped Together With Express Router


app.use('/campgrounds', campgroundsRoutes)

// All Reviews Routes Grouped Together 

app.use('/campgrounds/:id/reviews', reviewsRoutes)



app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    console.log("I have been executed", err);
    if (!err.message) err.message = "Oh No, Something Went Wrong!";
    res.status(statusCode).render('error', { err });
})

app.listen(port, () => {
    console.log(`Listening on ${port}`);
})