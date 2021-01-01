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
var mode = false;
var flow_delay = 0;
var flow_runtime = 0;
var bypass_delay = 0;
var bypass_runtime = 0;
var purge_delay = 0;
var purge_runtime = 0;
var global_socket;
io.sockets.on('connection', function (socket){
  global_socket = socket;
  //begin
  socket.on("begin",function(data){
    main(data);
  });
  //----------------------------------------------------------
  //mode
  socket.on("mode",function(data){
    mode = data;
  });
  //----------------------------------------------------------
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

function main(com){
  if(mode && com=="auto"){
    global_socket.emit("error","none");
    auto();
  } else if(!mode && com!="auto"){
    global_socket.emit("error","none");
    manual(com);
  } else if(mode && com!="auto"){
    global_socket.emit("error","please change mode to manual");
  } else if(!mode && com=="auto"){
    global_socket.emit("error","please change mode to auto");
  }
}

function auto(){
  console.log("auto");
  setTimeout(()=>{
    global_socket.emit("flow",1);
    setTimeout(()=>{
      global_socket.emit("flow",0);
      setTimeout(()=>{
        global_socket.emit("bypass",1);
        setTimeout(()=>{
          global_socket.emit("bypass",0);
          setTimeout(()=>{
            global_socket.emit("purge",1);
            setTimeout(()=>{
              global_socket.emit("purge",0);
            },purge_runtime*1000);
          },purge_delay*1000);
        },bypass_runtime*1000);
      },bypass_delay*1000);
    },flow_runtime*1000);
  },flow_delay*1000);
}

function manual(command){
  console.log("manual");
  if(command == "flow"){
    setTimeout(()=>{
      global_socket.emit("flow", 1);
      setTimeout(()=>{
        global_socket.emit("flow", 0);
      },flow_runtime*1000);
    },flow_delay*1000);
  }

  if(command == "bypass"){
    setTimeout(()=>{
      global_socket.emit("bypass", 1);
      setTimeout(()=>{
        global_socket.emit("bypass", 0);
      },bypass_runtime*1000);
    },bypass_delay*1000);
  }

  if(command == "purge"){
    setTimeout(()=>{
      global_socket.emit("purge", 1);
      setTimeout(()=>{
        global_socket.emit("purge", 0);
      },purge_runtime*1000);
    },purge_delay*1000);
  }
}
