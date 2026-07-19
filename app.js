if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); 
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");   // listing router
const reviewRouter = require("./routes/review.js"); // review router
const userRouter = require("./routes/user.js"); // user router
const { default: MongoStore } = require('connect-mongo');

const dbUrl = process.env.ATLASDB_URL;

main()
.then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine('ejs' , ejsMate);
app.use(express.static(path.join(__dirname , "/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter : 24 * 3600,
});

store.on("error" , () => {
    console.log("ERROR in MONGO SESSION STORE" , err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET ,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());    // serialize user information during that session. for ex:- when user signup or login then its all signup/login info will be stored till that session ends.
passport.deserializeUser(User.deserializeUser()); // when session ends user information will be deserialize or removed.

// app.get("/" , (req , res) => {
//     res.send("Hi, I am root");
// });

app.use((req , res , next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demoUser" , async (req , res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "alpha-student",
//     });

//     let registeredUser = await User.register(fakeUser , "Hello123");
//     res.send(registeredUser);
// });

app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/" , userRouter);

//Only for checking errors and error handling middlewares
app.all("/random" , (req , res , next) => {
    next(new ExpressError(404 , "Page Not Found!"));
});

//Error handling middleware
app.use((err, req , res , next) => {
    let {statusCode = 500 , message = "Something Went Wrong!"} = err;
    res.status(statusCode).render("error.ejs" , {message});
});

app.listen(3030, () => {
    console.log("server is listening on port 3030");
});