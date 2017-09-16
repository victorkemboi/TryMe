var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express'),
MongoClient = require('mongodb').MongoClient,
mongoUrl = 'mongodb://localhost:27017/textmonkey';
var redisClient = require('redis').createClient;
var redis = redisClient(6379, 'localhost');
var access = require('./access.js');
var bodyParser = require('body-parser');


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.use('/scripts', require('express').static(__dirname + '/node_modules/'));

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

var clientsList ={};
var talkingClients;
var pairRequest = {}
MongoClient.connect(mongoUrl, function (err, db) {
    if (err) throw 'Error connecting to database  ' + err;
    io.on('connection', function(socket){
      console.log('a user connected');
      clientsList[socket.id]=socket.id; //assign to client list
      socket.on('chat message', function(msg){
        console.log('message: ' + msg);
        access.saveMessage(db,msg, function (err) {
          if(err) {console.log('not saved: ' + err)};
      });
        io.emit('chat message', msg);
      });
    
      socket.on('disconnect', function(){
        delete clientsList[socket.id]
        console.log('user disconnected');
        
        io.emit('chat message', 'some user disconnected');
      });
      socket.on('pair',function(){
        pairRequest[socket.id]=socket.id;

      });
    
      
    });

    app.post('/message', function (req, res) {
      console.log(req.body); 
      if (!req.body.message) res.status(400).send("Please send a message");
      else {
          access.saveMessage(db, req.body.message, function (err) {
              if (err) res.status(500).send("Server error");
              else res.status(201).send("Saved");
          });
      }
  });

    http.listen(3000, function(){
        console.log('listening on *:3000');
      });
});
