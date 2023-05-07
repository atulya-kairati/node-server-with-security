const path = require('path')
const express = require("express")
const helmet = require("helmet")
const passport = require('passport')
const { Strategy } = require('passport-google-oauth20')
const cookieSession = require('cookie-session')

// Add add a .env file with CLIENT_ID and CLIENT_SECRET at project root
require('dotenv').config()

const app = express()

const AUTH_OPTIONS = {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
}

function verifyCallback(accessToken, refreshToken, profile, done) {
    // here we can do whatever we want with the incoming creds
    console.log('Google profile', profile)

    // If the creds are invalid we can call done with an error as the first args
    // it tells passport if everything was successful
    done(null, profile)
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback))

// save the session to the cookie
passport.serializeUser((user, done) => {
    // user --> cookie session

    // we are directly populating the cookie here: not recommended
    // done(null, user) // null means no error
    done(null, user.id) // we minimize what we store in the cookies 
    // done(error, user) if there was any error
})


// read the session from the cookie
passport.deserializeUser((obj, done) => {
    // cookie session --> user

    done(null, obj)
})

/**
 * helmet.js adds a lot of security feature such as hsts, and no XSS etc.
 * Since it is a security middleware, it must be the first middleware
 * to used. So that all of our requests go through it.
 */
app.use(helmet()) // always on top
app.use(cookieSession({ // use this before passport, since passport will be using the session
    name: "session",
    maxAge: 7 * 24 * 60 * 60 * 1000, // a week till user has to login again
    keys: [process.env.COOKIE_KEY_1, process.env.COOKIE_KEY_2] // multiple keys to help with rotation in case one of the keys is compromised.
}))
app.use(passport.initialize())
app.use(passport.session()) // this is to use sessions

// Middleware
const checkIfLoggedIn = (req, res, next) => {

    let loggedIn = false

    // TODO: Write logic to detect if user is logged in

    if (loggedIn) return next()

    return res.status(401).json({ error: "Login required" })
}

app.get('/', (req, res) => {
    return res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'))
})


// endpoint which will handle google oauth
app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['email']
    }),
    (req, res) => { }
)


// endpoint to which google will redirect to after auth is done
// it must be same as "Authorized redirect URIs" we mention 
// when creating the OAuth creds on google
app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/failure',
        successRedirect: '/',
        session: true, // to use session
    }),
    (req, res) => {
        console.log("Google callback");
    }
)


/**
 * We want to show our secret only to logged in user so
 * we use our [checkIfLoggedIn] middleware
 */
app.get('/secret', checkIfLoggedIn, (req, res) => {
    return res.send("Bing Chilling")
})


// endpoint to logout, it is same for any oauth provider
app.get('/auth/logout', (req, res) => {
    res.status(400).json({ error: "Failed!" })
})


app.get('/failure', (req, res) => {
    return res.json({ err: "Failed to authenticate." })
})


app.use('*', (req, res) => {
    return res.send("404")
})

module.exports = app