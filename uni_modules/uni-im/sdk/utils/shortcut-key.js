let ctrlKeydown = false;
function withCtrl(callback){
  document.addEventListener('keydown', function(e) {
    // console.log("e,e.keyCode",e.key);
    if(e.key == "Control"){
      ctrlKeydown = true;
    }
    if(ctrlKeydown){
      callback(e.key)
    }
  });
  document.addEventListener('keyup', function(e) {
    // console.log("e,e.keyCode",e,e.keyCode);
    if(e.key == "Control"){
      ctrlKeydown = false;
    }
  });
}

let shiftKeydown = false;
function withShift(callback){
  document.addEventListener('keydown', function(e) {
    // console.log("e,e.keyCode",e.key);
    if(e.key == "Shift"){
      shiftKeydown = true;
    }
    if(shiftKeydown){
      callback(e.key)
    }
  });
  document.addEventListener('keyup', function(e) {
    // console.log("e,e.keyCode",e,e.keyCode);
    if(e.key == "Shift"){
      shiftKeydown = false;
    }
  });
}

let metaKeydown = false;
function withMeta(callback){
  document.addEventListener('keydown', function(e) {
    // console.log("e,e.keyCode",e.key);
    if(e.key == "Meta"){
      metaKeydown = true;
    }
    if(metaKeydown){
      callback(e.key,e)
    }
  });
  document.addEventListener('keyup', function(e) {
    // console.log("e,e.keyCode",e,e.keyCode);
    if(e.key == "Meta"){
      metaKeydown = false;
    }
  });
}


export default {withCtrl,withMeta}