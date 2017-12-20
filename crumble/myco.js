function DelayValue(delay) {
  return new Promise(function(resolve, reject){
    setTimeout(resolve, delay, 'value after: '+delay);
  });
}

function DelayError(delay) {
  return new Promise(function(resolve, reject){
    setTimeout(reject, delay, new Error('error after: '+delay));
  });
}

function* task() {
  var v1 = yield DelayValue(2000);
  var v2 = yield DelayError(2000);
  return [v1, v2];
}

function co(task) {
  var task = task();
  return new Promise(function(resolve, reject){
    function next(lastPromiseRes) {
      var yieldRes;
      try {
        if (!lastPromiseRes) {
          yieldRes = task.next();
        } else if (lastPromiseRes.type === 'reject') {
          yieldRes = task.throw(lastPromiseRes.res);
        } else if (lastPromiseRes.type === 'resolve') {
          yieldRes = task.next(lastPromiseRes.res);
        }
      } catch(error) {
        reject(error);
        return;
      }
      if (yieldRes.done) {
        resolve(yieldRes.value);
      } else {
        yieldRes.value.then(function(value){
          next({type:'resolve',res:value})
        },function(error){
          next({type:'reject',res:error});
        });
      }
    }
    next();
  });
}

co(task).then(function(value){
  console.log('final value: '+value);
}, function(error){
  console.log('final error: '+error);
});
