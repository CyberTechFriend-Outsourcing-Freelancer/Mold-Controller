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
var auto_begin;
var mode;
var flow_delay;
var flow_runtime;
var bypass_delay;
var bypass_runtime;
var purge_delay;
var purge_runtime;
io.sockets.on('connection', function (socket){
  //auto_begin
  socket.on("auto_begin",function(data){
    auto_begin = data;
    if(auto_begin){
      main();
    }
  });
  //mode
  socket.on("mode",function(data){
    mode = data;
  });
  //flow
  socket.on("flow_delay",function(data){
    flow_delay = data;
  });
  socket.on("flow_runtime",function(data){
    flow_runtime = data;
  });
  //bypass
  socket.on("bypass_delay",function(data){
    bypass_delay = data;
  });
  socket.on("bypass_runtime",function(data){
    bypass_runtime = data;
  });
  //purge
  socket.on("purge_delay",function(data){
    purge_delay = data;
  });
  socket.on("purge_runtime",function(data){
    purge_runtime = data;
  });
});

function main(){
  if(mode){
    auto();
  } else{
    manual();
  }
}

function auto(){
  console.log("auto");
  setTimeout(()=>{
    //flowGPIO.writeSync(1);
    setTimeout(()=>{
      //flowGPIO.writeSync(0);
      setTimeout(()=>{
        //bypassGPIO.writeSync(1);
        setTimeout(()=>{
          //bypassGPIO.writeSync(1);
          setTimeout(()=>{
            //purgeGPIO.writeSync(1);
            setTimeout(()=>{
              //purgeGPIO.writeSync(0);
            },document.getElementById("purge_runtime").value*1000);
          },document.getElementById("purge_delay").value*1000);
        },document.getElementById("bypass_runtime").value*1000);
      },document.getElementById("bypass_delay").value*1000);
    },document.getElementById("flow_runtime").value*1000);
  },document.getElementById("flow_delay").value*1000);
}

function manual(){

}
