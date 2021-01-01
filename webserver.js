var http = require('http').createServer(handler);
var fs = require('fs');
var io = require('socket.io')(http)
console.log('start2');
http.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/index2.html', function(err, data) {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      return res.end("404 Not Found");
    }
    var headers = {
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': 'http://localhost:8080',
      'Access-Control-Allow-Credentials': true
    };
    res.writeHead(200, headers);
    res.write(data);
    return res.end();
  });
}

io.sockets.on('connection', function (socket){
  var signal = false;
  socket.on("mode",function(data){
    signal = data;
    console.log("signal : "+signal);
  });
});
