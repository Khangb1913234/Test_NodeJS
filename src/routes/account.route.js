const express = require("express")
const auth = require('../app/middlewares/auth.middleware');
const accounts = require("../app/controllers/account.controller")
const Account = require("../app/models/account.model")
const upload = require("../app/middlewares/upload.middleware")
const passport = require("passport")
const FacebookStrategy = require("passport-facebook").Strategy
const dotenv = require("dotenv")
dotenv.config()

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_SECRET_KEY,
    callbackURL: "http://localhost:5005/account/login/facebook/callback",
},
  async function(accessToken, refreshToken, profile, cb) {
    const account = await Account.findOne({accountId: profile.id, provider: "facebook"})
    if(account){
        console.log("Chuyển sang đăng nhập do tài khoản facebook đã được sử dụng")
        return cb(null, profile)
    }
    else{
        console.log("Tạo tài khoản mới", profile)
        const newAccount = new Account({
            accountId: profile.id,
            provider: "facebook",
            firstName: profile.displayName,
            lastName: profile.displayName,
            role: 0
        })
        await newAccount.save()
        return cb(null, profile)
    }
  }
));

module.exports = function(app){
    const router = express.Router()
    router.get("/login/facebook/callback", passport.authenticate("facebook", {failureRedirect: "/login"}), accounts.loginFacebook)
    router.get("/login/facebook", passport.authenticate("facebook", {scope: "email"}))
    
    router.post("/register", accounts.register)
    router.post("/login", accounts.login)
    router.put("/update/:id", upload.single("avatar"), auth, accounts.update)   
    router.delete("/delete/:id", auth, accounts.delete)
    router.post("/forgotpassword", accounts.forgotPassword)
    router.put("/resetpassword", accounts.resetPassword)
    router.post("/seeddata/:number", auth, accounts.seedData)
    router.get("/:id", auth, accounts.findOne)
    router.get("/", auth, accounts.findAll)
    app.use("/account", router)
};