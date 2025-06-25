const express = require("express");
const router = express.Router({MergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema}= require("../schema.js");
const ExpressError = require("../utils/ExpressError.js"); 
const Listing=require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const lisitngController = require("../controllers/listings.js")
const multer = require("multer"); 
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage }); 



const validateListing= (req, res, next)=>{
    let { error }= listingSchema.validate(req.body)
    if (error) {
    throw new ExpressError(404,error)
    } else {
    next();
    }
};


router          
    .route("/")
    .get( wrapAsync (lisitngController.index)) //Index Route 
    .post(   //create route
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
             
        wrapAsync(lisitngController.createListing)
    );
    // .post(upload.single("listing[image]"),(req,res)=>{
    //     res.send(req.body)
    // })
   

//New Route
router.get("/new", isLoggedIn, lisitngController.renderNewForm );


router.get("/search", async (req, res) => {
  const query = req.query.q || "";
  const results = await Listing.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { location: { $regex: query, $options: "i" } },
      { country: { $regex: query, $options: "i" } },
    ],
  });

  const allListings = await Listing.find({ title: new RegExp(req.query.q, "i") });

if (allListings.length === 0) {
  req.flash("error", `No listings found matching "${req.query.q}"`);
  return res.redirect("/listings"); // or wherever you want to redirect
}

// If results found, render normally
  res.render("listings/index.ejs", { allListings: results,q:query  });
});

router
    .route("/:id")
    .get( wrapAsync (lisitngController.showListing))  //Show route
    .put(  //update route
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),   
        validateListing, 
        wrapAsync(lisitngController.updateListing)
    )
    .delete(  //delete route
        isLoggedIn,  
        isOwner,
        wrapAsync(lisitngController.destroyListing)
    );
    
//Edit Route
router.get("/:id/edit", 
    isLoggedIn,
    isOwner,
    wrapAsync(lisitngController.renderEditForm));




module.exports = router;