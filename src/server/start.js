//designates what port the app will listen to for incoming requests

const app = require('./webserver.js')
// app.use(express.static('dist'))

app.listen(4040, function () {
    console.log('Webserver listening on port 4040!')
})
