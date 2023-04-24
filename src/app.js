const express = require("express")
const helmet = require("helmet")

const app = express()

/**
 * helmet.js adds a lot of security feature such as hsts, and no XSS etc.
 * Since it is a security middleware, it must be the first middleware
 * to used. So that all of our requests go through it.
 */
app.use(helmet()) 

app.get('/', (req, res) => {
    return res.send("Hello there!")
})

app.get('/secret', (req, res) => {
    return res.send("Bing Chilling")
})

app.use('*', (req, res) => {
    return res.send("404")
})

module.exports = app