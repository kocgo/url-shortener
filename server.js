'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const shortid = require('shortid');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();
// Schema
var Schema = mongoose.Schema;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

// Sequence Model
var sequenceSchema = new Schema({
  _id: String,
  sequence_value: Number
})

var Sequence = mongoose.model('Sequence', sequenceSchema);

// URL Model
var urlSchema = new Schema({
  url: String,
  shorturl: Number
})

var Url = mongoose.model('Url', urlSchema);



// Basic Configuration 
var port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.post("/api/shorturl/new", function (req, res) {
  
  //Validate Url
  var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  var regex = new RegExp(expression);
  if (!req.body.url.match(regex)){
    res.json({"error":"invalid URL"});
  }
  
  // Find Sequence Number And Increment
  Sequence.findOneAndUpdate({_id : "productid"} , {$inc:{sequence_value:1}}, function(err,result){
    var newUrl = new Url({url: req.body.url , shorturl: result.sequence_value})
    newUrl.save( function(err,saveResult){
      console.log(saveResult);
      res.json({url: saveResult.url, shorturl: saveResult.shorturl});
    })
  });
});

// Redirect to Short Url
app.get("/api/shorturl/:url" , (req,res) => {
  Url.findOne({shorturl: Number(req.params.url)}, function(err,result){
    res.redirect(result.url)
  })
})


app.listen(port, function () {
  console.log('Node.js listening ...');
});