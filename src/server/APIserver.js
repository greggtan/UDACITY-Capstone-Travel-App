//server for API routes and connection to database
const cors = require('cors');

var path = require('path')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const mysql = require('mysql');

const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'traveldb'
});

db.connect((err)=>{
    if (err) throw err;
    console.log('Database connected!')
});

app.listen(4321, ()=>{
    console.log('API server running on port 4321!')
});


//after establishing connection, write RESTful API routes

app.get('/',(req,res)=>{
    res.send('API server up!')
})

app.get('/getData', (req,res)=>{
    let sql = 'SELECT * FROM traveldata ORDER BY daysDifference';
    // let data = {};
    db.query(sql, (err,result)=>{
        if (err) throw err;
        console.log(result);
        res.send(result);
    })
})

app.post('/addToDB',(req,res)=>{
    let data = req.body;
    console.log(data);
    let sql = 'INSERT INTO traveldata SET ?';
    db.query(sql,data, (err,result)=>{
        if (err) throw err;
        console.log(result);
        res.send('Travel details added...');
    })

});


app.post('/removeData', (req,res)=>{
    let data = req.body;
    let sql = "DELETE FROM traveldata WHERE `departDate` = ?";

    db.query(sql,data.departDate,(err,result)=>{
        if (err) throw err;
        console.log(result);
        res.send('Travel details removed...');
    })

})

app.get('/resetID', (req,res)=>{
    let sql = "ALTER TABLE traveldata AUTO_INCREMENT = 1";

    db.query(sql, (err,result)=>{
        if (err) throw err;
        console.log(result);
        res.send(result);
    })
})

app.get('/getDates', (req,res)=>{
    let sql = 'SELECT departDate, arriveDate FROM traveldata';

    db.query(sql, (err, result)=>{
        if (err) throw err;
        console.log(result);
        res.send(result);
    })
})