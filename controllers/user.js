
const User = require("../models/user");


module.exports.rendersignupForm = (req, res) => { 
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {   
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);

        // after signup redirect to home page , no need to login again
        req.login(registeredUser, (err) => {
        if(err) {
          return next(err);
        }
          req.flash("success", "Welcome to Wanderlust");
          res.redirect("/listings");
        });
        }  catch(e) {
         req.flash("error",e.message);
         res.redirect("/signup");
    }  
};

module.exports.renderLoginForm = (req, res) => { 
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome to WanderLust!! You are logged in");
//   to check 
  const redirectUrl = req.session.redirectUrl || "/listings";
  delete req.session.redirectUrl;  // Clear it so it doesn't persist
  
  res.redirect(redirectUrl);
};


module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err) {
           return next(err);
        }
        req.flash("success", "you are logged out now");
        res.redirect("/listings");
    });
};