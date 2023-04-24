const express = require("express")

const app = express()

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