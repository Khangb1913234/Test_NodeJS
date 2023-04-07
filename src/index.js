const express = require("express")
const session = require('express-session')
const path = require("path")
const cors = require('cors')
const app = express()
const PORT = 5005
const passport = require("passport")
const dotenv = require("dotenv")
dotenv.config()


const setupAccountRoutes = require("./routes/account.route")
const db = require("./config/db")

db.connect()

app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

setupAccountRoutes(app)

app.listen(PORT, function(){
    console.log(`Runing at: http://localhost:${PORT}`)
})
