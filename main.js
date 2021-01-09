var Flow = flow.get("flow") || {};
var Bypass = flow.get("bypass") || {};
var Purge = flow.get("purge") || {};
const mode = flow.get("mode");
if(JSON.stringify(Flow).length===0 || JSON.stringify(Bypass).length===0 || JSON.stringify(Purge).length===0){
  return {"topic":"error","payload":"time setting error"};
} else if(msg.payload === "" && mode===false){
  return {"topic":"error","payload":"turn into Manual mode"};
} else if(msg.payload !== "" && mode===true){
  return {"topic":"error","payload":"turn into Auto mode"};
}

if(mode=="auto"){
  auto();
} else if(mode=="manual"){
  manual();
}

function auto(){
  setTimeout(()=>{
    node.send({"topic":"flow", "payload":1});
    setTimeout(()=>{
      node.send({"topic":"flow", "payload":0});
      setTimeout(()=>{
        node.send({"topic":"bypass", "payload":1});
        setTimeout(()=>{
          node.send({"topic":"bypass", "payload":0});
        },Bypass.runtime*1000);
      },Bypass.delay*1000);
    },Flow.runtime*1000);
  },Flow.delay*1000);
}

function manual(){
  if(msg.payload == "flow"){
    setTimeout(()=>{
      node.send({"topic":"flow", "payload":1});
      setTimeout(()=>{
        node.send({"topic":"flow", "payload":0});
      },Flow.runtime*1000);
    },Flow.delay*1000);
  }

  if(msg.payload == "bypass"){
    setTimeout(()=>{
      node.send({"topic":"bypass", "payload":1});
      setTimeout(()=>{
        node.send({"topic":"bypass", "payload":0});
      },Bypass.runtime*1000);
    },Bypass.delay*1000);
  }

  if(msg.payload == "purge"){
    setTimeout(()=>{
      node.send({"topic":"purge", "payload":1});
      setTimeout(()=>{
        node.send({"topic":"purge", "payload":0});
      },Purge.runtime*1000);
    },Purge.delay*1000);
  }
}
