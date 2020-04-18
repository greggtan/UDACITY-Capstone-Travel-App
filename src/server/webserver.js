//webserver to host my client

var path = require('path')
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors');
/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Cors for cross origin allowance
app.use(cors());
app.use(express.static('dist'))

const mockAPIResponse = require('./mockAPI.js')


// designates what port the app will listen to for incoming requests
// app.listen(4040, function () {
//     console.log('Webserver listening on port 4040!')
// })

app.get('/test', function (req, res) {
    // res.send(mockAPIResponse)
    res.send({message: 'pass!'})
})


module.exports = app