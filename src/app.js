const path = require('path')
const express = require("express")
const helmet = require("helmet")
const passport = require('passport')
const { Strategy } = require('passport-google-oauth20')

// Add add a .env file with CLIENT_ID and CLIENT_SECRET
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

/**
 * helmet.js adds a lot of security feature such as hsts, and no XSS etc.
 * Since it is a security middleware, it must be the first middleware
 * to used. So that all of our requests go through it.
 */
app.use(helmet())

app.use(passport.initialize())

// Middleware
const checkIfLoggedIn = (req, res, next) => {

    let loggedIn = false

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
        session: false,
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


app.get('/failure', (req, res) => { })


app.use('*', (req, res) => {
    return res.send("404")
})

module.exports = app