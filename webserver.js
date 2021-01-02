var http = require('http').createServer(handler);
var fs = require('fs');
var io = require('socket.io')(http)
var Gpio = require('onoff').Gpio
console.log('start2');
http.listen(8080);

var mode = 0;
var timer_setting = {
  "flow" : {delay : 0, runtime : 0},
  "bypass" : {delay : 0, runtime : 0},
  "purge" : {delay : 0, runtime : 0}
};
var global_socket;
const FLOW_GPIO_PORT = 1;
const BYPASS_GPIO_PORT = 2;
const PURGE_GPIO_PORT = 3;
const front_file = '/index2.html';

function handler (req, res) {
  fs.readFile(__dirname + front_file, function(err, data) {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      return res.end("404 Not Found");
    }
    let headers = {
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': 'http://localhost:8080',
      'Access-Control-Allow-Credentials': true
    };
    res.writeHead(200, headers);
    res.write(data);
    return res.end();
  });
}

//connect
io.sockets.on('connection', function (socket){
  global_socket = socket;

  //begin process
  socket.on("begin",function(data){
    main(data);
  });

  //mode : auto or manual
  socket.on("mode",function(data){
    mode = data;
  });

  //flow
  socket.on("flow_delay",function(data){
    timer_setting.flow.delay = data;
  });
  socket.on("flow_runtime",function(data){
    timer_setting.flow.runtime = data;
  });
  //bypass
  socket.on("bypass_delay",function(data){
    timer_setting.bypass.delay = data;
  });
  socket.on("bypass_runtime",function(data){
    timer_setting.bypass.runtime = data;
  });
  //purge
  socket.on("purge_delay",function(data){
    timer_setting.purge.delay = data;
  });
  socket.on("purge_runtime",function(data){
    timer_setting.purge.runtime = data;
  });
});

//control GPIO
function control_GPIO_flow(sign){
  let GPIO_flow = new Gpio(FLOW_GPIO_PORT, 'out');
  GPIO_flow.writeSync(sign);
  give_process_status("flow",sign);
}
function control_GPIO_bypass(sign){
  var GPIO_bypass = new Gpio(BYPASS_GPIO_PORT, 'out');
  GPIO_bypass.writeSync(sign);
  give_process_status("bypass",sign);
}
function control_GPIO_purge(sign){
  var GPIO_purge = new Gpio(PURGE_GPIO_PORT, 'out');
  GPIO_purge.writeSync(sign);
  give_process_status("purge",sign);
}

//GPIO status to front
function give_process_status(process,sign){
  global_socket.emit(process,sign);
}

//error status to front
function give_error_status(msg){
  global_socket.emit("error",msg);
}

//check any of timer_setting is 0;
function validate_timer_setting(){
  for(let key1 in timer_setting){
    for(let key2 in timer_setting[key1]){
      if(timer_setting[key1][key2]==0){
          return 1;
      }
    }
  }
}

function main(com){
  if(validate_timer_setting()){
    give_error_status("some timer setting is missing");
  } else if(mode && com!="auto"){
    give_error_status("please change mode to manual");
  } else if(!mode && com=="auto"){
    give_error_status("please change mode to auto");
  }else if(mode && com=="auto"){
    auto();
  } else if(!mode && com!="auto"){
    manual(com);
  } 
}

function auto(){
  give_error_status("none");
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
            },timer_setting.purge.runtime*1000);
          },timer_setting.purge.delay*1000);
        },timer_setting.bypass.runtime*1000);
      },timer_setting.bypass.delay*1000);
    },timer_setting.flow.runtime*1000);
  },timer_setting.flow.delay*1000);
}

function manual(command){
  give_error_status("none");
  console.log("manual : "+command);
  if(command == "flow"){
    setTimeout(()=>{
      control_GPIO_flow(1);
      setTimeout(()=>{
        control_GPIO_flow(0);
      },timer_setting.flow.runtime*1000);
    },timer_setting.flow.delay*1000);
  }

  if(command == "bypass"){
    setTimeout(()=>{
      control_GPIO_bypass(1);
      setTimeout(()=>{
        control_GPIO_bypass(0);
      },timer_setting.bypass.runtime*1000);
    },timer_setting.bypass.delay*1000);
  }

  if(command == "purge"){
    setTimeout(()=>{
      control_GPIO_purge(1);
      setTimeout(()=>{
        control_GPIO_purge(0);
      },timer_setting.purge.runtime*1000);
    },timer_setting.purge.delay*1000);
  }
}