require("dotenv").config();

const express=require("express");

const app =express();
const Listing=require("./models/listing.js");
const path = require("path");//to setup ejs
const ejsMate = require("ejs-mate");//help to create template or layout like nav bar and footer
app.engine("ejs",ejsMate);

const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js"); 
// const { listingSchema}= require("./scehma.js");
const Review = require("./models/review.js");
const listingRouter = require("./routes/listing.js")
const userRouter = require("./routes/user.js")
const reviewRouter = require("./routes/review.js");

const mongoose=require("mongoose");
app.use(express.static('public'));
app.use('/css', express.static(__dirname + '/css'));

app.use(express.urlencoded({ extended:true }));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"))

const methodOverride=require("method-override");
app.use(methodOverride("_method"))

const session = require("express-session");
const MongoStore = require("connect-mongo"); // to store session in mongoDB
const flash = require("connect-flash");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose")
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())


const dbUrl=process.env.DB_URL

main().then(()=>{
    console.log("conection successfull")
})
.catch((err)=>{
    console.log(err)
})



 async function main(){
    await mongoose.connect(dbUrl);
}


const store = MongoStore.create({
    mongoUrl:   dbUrl,
    crypto: {
        secret: process.env.SESSION_SECRET,
        touchAfter: 24 * 3600, // 24 hours
    }
}) 

store.on("error", function(e){
    console.log("Session store error", e);
});

const sessionOptions = {
  store: store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, // <--- Change here
  cookie: {
    expires: new Date(Date.now() + 24 * 7 * 60 * 60 * 1000), // <--- Change here
    maxAge: 24 * 7 * 60 * 60 * 1000,
    httpOnly: true,
  }
};


app.use(flash())


app.use(session(sessionOptions))

app.use(passport.initialize()) ;
app.use(passport.session());

// Place this after passport.session()
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})


app.get("/demo", async (req,res)=>{
    let fakeUser = new User({
        email: "a@gmail.com",
        username:"delta-student",
    });
    let registeredUser = await User.register(fakeUser,"hello");
    res.send(registeredUser);


})
app.use("/listings",listingRouter);
app.use("/",userRouter); 
app.use("/listings/:id/reviews",reviewRouter)


//if any route doesnt match
app.all("*",(err,req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
})





//error handler
app.use((err,req,res,next)=>{
    let{statusCode =500,message="Something went wrong"}=err;
    // res.status(statusCode).send(message);

    res.status(statusCode).render( "error.ejs",{ message } ) ;

    // res.send("Somethings went wrong");
    console.log(err.name);
    console.log(err.message);

})

let port = 3000;
app.listen(port,()=>{
    console.log("listning on port 3000");
})

