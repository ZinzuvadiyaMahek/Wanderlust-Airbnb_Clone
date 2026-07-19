const Listing = require("./models/listing");
const Review = require("./models/reviews");
const {listingSchema , reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn =  (req , res , next) => {
    // console.log(req);  // req gives us all information of incoming request when isLoggedIn trigger.
    if(!req.isAuthenticated()) {
        console.log(req.path , "..." , req.originalUrl);
        // saving redirect url where redirect that page after logged in.
        req.session.redirectUrl = req.originalUrl;
        req.flash("error" , "you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
}

// if there are any redirectUrl info in the session before login then save into locals.
module.exports.saveRedirectUrl = (req , res , next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

//isOwner is middleware which is used to check or verify that current user is owner of that listing or not.
module.exports.isOwner = async (req , res , next) => {
    let {id} = req.params;
     let listing = await Listing.findById(id);
    
    if(!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error" , "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

//middleware to validate individual schema
module.exports.validateListing = (req , res , next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        console.log(error.details.map((el) => el.message).join(","));
        throw new ExpressError(400 , errMsg);
    }else{
        next();
    }
}

//middleware to validate review
module.exports.validateReview = (req , res , next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        console.log(error.details.map((el) => el.message).join(","));
        throw new ExpressError(400 , errMsg);
    }else{
        next();
    }
}

module.exports.isReviewAuthor = async (req , res , next) => {
    let {id , reviewId} = req.params;
     let review = await Review.findById(reviewId);
    
    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error" , "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
};
    