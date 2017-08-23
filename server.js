var express = require('express');
var app = express();

var http = require('http');
var server = http.Server(app);

app.use(express.static('client'));

var io = require('socket.io')(server);

function isQuestion(msg) {
  return msg.match(/\?$/)
}

function askingTime(msg) {
  return msg.match(/time/i)
}

io.on('connection', function (socket) {
  
  socket.on('message', function (msg) {
    console.log('Received Message: ', msg);
    if (!isQuestion(msg)) {
      io.emit('message', msg);
    } else if (askingTime(msg)) {
      io.emit('message', new Date);
    } 
  });
});

server.listen(8080, function() {
  console.log('Chat server running');
});