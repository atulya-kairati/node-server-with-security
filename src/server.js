const https = require('https')
const fs = require('fs')
const path = require('path')

const app = require('./app')

const serverOptions = {
    cert: fs.readFileSync(path.resolve(__dirname, '..', 'cert.pem')),
    key: fs.readFileSync(path.resolve(__dirname, '..', 'key.pem')),
}

const server = https.createServer(serverOptions, app)

server.listen(8000, () => {
    console.log("Listening at 8000...");
})