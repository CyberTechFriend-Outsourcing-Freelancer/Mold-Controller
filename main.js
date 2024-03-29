var Flow = {};
var Bypass = {};
var Purge = {};
Flow["delay"] = flow.get("delay_1ch_flow") || 1
Flow["runtime"] = flow.get("runtime_1ch_flow") || 1
Bypass["delay"] = flow.get("delay_1ch_bypass") || 1
Bypass["runtime"] = flow.get("runtime_1ch_bypass") || 1
Purge["delay"] = flow.get("delay_1ch_purge") || 1
Purge["runtime"] = flow.get("runtime_1ch_purge") || 1
let mode = flow.get("1ch_mode");
const SW_on = 0;
const SW_off = 1;

if(mode=="auto"){
  auto();
} else if(mode=="manual"){
  manual();
}

function auto(){
  setTimeout(()=>{
    node.send({"topic":"1ch_flow", "payload":SW_on});
    setTimeout(()=>{
      node.send({"topic":"1ch_flow", "payload":SW_off});
      setTimeout(()=>{
        node.send({"topic":"1ch_bypass", "payload":SW_on});
        setTimeout(()=>{
          node.send({"topic":"1ch_bypass", "payload":SW_off});
        },Bypass.runtime*1000);
      },Bypass.delay*1000);
    },Flow.runtime*1000);
  },Flow.delay*1000);
}

function manual(){
  //Flow
  if(msg.topic == "action_1ch_flow"){
    setTimeout(()=>{
      node.send({"topic":"1ch_flow", "payload":SW_on});
      setTimeout(()=>{
        node.send({"topic":"1ch_flow", "payload":SW_off});
      },Flow.runtime*1000);
    },Flow.delay*1000);
  }

  //Bypass
  if(msg.topic == "action_1ch_bypass"){
    setTimeout(()=>{
      node.send({"topic":"1ch_bypass", "payload":SW_on});
      setTimeout(()=>{
        node.send({"topic":"1ch_bypass", "payload":SW_off});
      },Bypass.runtime*1000);
    },Bypass.delay*1000);
  }

  //Purge
  if(msg.topic == "action_1ch_purge"){
    setTimeout(()=>{
      node.send({"topic":"1ch_purge", "payload":SW_on});
      setTimeout(()=>{
        node.send({"topic":"1ch_purge", "payload":SW_off});
      },Purge.runtime*1000);
    },Purge.delay*1000);
  }

  //Reverse - Purge와 switch 반대
  if(msg.topic == "action_1ch_reverse"){
    setTimeout(()=>{
      node.send({"topic":"1ch_purge", "payload":SW_off});
      setTimeout(()=>{
        node.send({"topic":"1ch_purge", "payload":SW_on});
      },Purge.runtime*1000);
    },Purge.delay*1000);
  }
}
