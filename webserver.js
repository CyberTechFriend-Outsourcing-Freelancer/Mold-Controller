var http = require('http').createServer(handler);
var fs = require('fs');
var io = require('socket.io')(http)
var Gpio = require('onoff').Gpio
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

var mode = 0;
var flow_delay = 0;
var flow_runtime = 0;
var bypass_delay = 0;
var bypass_runtime = 0;
var purge_delay = 0;
var purge_runtime = 0;
var global_socket;
const FLOW_GPIO_PORT = 1;
const BYPASS_GPIO_PORT = 2;
const PURGE_GPIO_PORT = 3;
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
    control_GPIO_flow(1);
    setTimeout(()=>{
      control_GPIO_flow(0);
      setTimeout(()=>{
        control_GPIO_bypass(1);
        setTimeout(()=>{
          control_GPIO_bypass(0);
          setTimeout(()=>{
            control_GPIO_purge(1);
            setTimeout(()=>{
              control_GPIO_purge(0);
            },purge_runtime*1000);
          },purge_delay*1000);
        },bypass_runtime*1000);
      },bypass_delay*1000);
    },flow_runtime*1000);
  },flow_delay*1000);
}

function manual(command){
  console.log("manual : "+command);
  if(command == "flow"){
    setTimeout(()=>{
      control_GPIO_flow(1);
      setTimeout(()=>{
        control_GPIO_flow(0);
      },flow_runtime*1000);
    },flow_delay*1000);
  }

  if(command == "bypass"){
    setTimeout(()=>{
      control_GPIO_bypass(1);
      setTimeout(()=>{
        control_GPIO_bypass(0);
      },bypass_runtime*1000);
    },bypass_delay*1000);
  }

  if(command == "purge"){
    setTimeout(()=>{
      control_GPIO_purge(1);
      setTimeout(()=>{
        control_GPIO_purge(0);
      },purge_runtime*1000);
    },purge_delay*1000);
  }
}

//control GPIO
function control_GPIO_flow(sign){
  let GPIO_flow = new Gpio(FLOW_GPIO_PORT, 'out');
  GPIO_flow.writeSync(sign);
  give_status("flow",sign);
}
function control_GPIO_bypass(sign){
  var GPIO_bypass = new Gpio(BYPASS_GPIO_PORT, 'out');
  GPIO_bypass.writeSync(sign);
  give_status("bypass",sign);
}
function control_GPIO_purge(sign){
  var GPIO_purge = new Gpio(PURGE_GPIO_PORT, 'out');
  GPIO_purge.writeSync(sign);
  give_status("purge",sign);
}

//GPIO status to front
function give_status(process,sign){
  global_socket.emit(process,sign);
}
