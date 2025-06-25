const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const { reviewSchema,listingSchema } = require("./schema.js"); // Assuming you're using Joi validation


// Middleware to check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {

  // to check what it return.
  // console.log("Authenticated?", req.isAuthenticated());
  // console.log("User:", req.user);

  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }
  next();
};

// Middleware to store redirect URL
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// Middleware to check if user is owner of the listing
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id).populate("owner");
  console.log(listing.owner)
  if (!listing.owner.equals(res.locals.currUser._id)) {  
    req.flash("error", "You don't have permission to edit");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

//mdw for listing
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new Error(msg);
  }
  next();
};

// ✅ Middleware to validate review
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new Error(msg);
  }
  next();
};

// ✅ Middleware to check if user is review author
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id,reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission to delete this review");
    return res.redirect(`/listings/${req.params.id}`);
  }
  next();
};
