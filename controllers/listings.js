
const Listing = require("../models/listing"); 

module.exports.index = async (req, res) => { 
    const allListings = await Listing.find({});
    // console.log(allListings);
    res.render ("listings/listing", {allListings});
};


module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};


module.exports.showListing = async (req, res) => {
    let {id} = req.params;
   const listing = await Listing.findById(id)
    .populate({ 
        path: "reviews",  // plural, matches your schema
        populate: { path: "author"}
    })
    .populate("owner");

    if(!listing) {
        req.flash("error", "listing you requested for does not exist")
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
};


module.exports.createListing = async (req, res, next) => {

    let url = req.file.path;
    let filename = req.file.filename;

    //when creating listing with new user this owned by the curr user
    const newListing = new Listing( req.body.listing);
    newListing.owner = req.user._id;
    

    newListing.image = { url, filename };

    await newListing.save();
    res.redirect("/listings");
};


module.exports.renderEditForm = async (req, res ) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "listing you requested for does not exist")
        res.redirect("/listings");
    }
    //for preview 
        let originalImageUrl = listing.image.url;
     
    if (originalImageUrl.includes("res.cloudinary.com")) {
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250,h_250,c_fill");
    } else if (originalImageUrl.includes("images.unsplash.com")) {
        const url = new URL(originalImageUrl);
        url.searchParams.set("w", "250");
        url.searchParams.set("h", "250");
        url.searchParams.set("fit", "crop");
        originalImageUrl = url.toString();
    }

    
        res.render("listings/edit", { listing, originalImageUrl });
};


module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined") {
        let url = req.file.path; 
        let filename = req.file.filename;  
        listing.image = { url, filename }; 
        await listing.save();    
    }
    req.flash("success","Listing Updated!!");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "listing deleted");
    res.redirect("/listings");
};