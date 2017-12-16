var STATE = {
  pending: 0,
  resolved: 1,
  rejected: 2
};

function noop() {}

function MyPromise(executor) {
  this.state = STATE.pending;
  this.value = null;
  this.error = null;
  this.callbacks = []
  try{
    executor(resolve.bind(this), reject.bind(this));
  } catch(error) {
    reject.call(this, error);
  }
}

function handleCallback(callback) {
  try {
    var nextValue;
    if (this.state === STATE.rejected) {
      if (callback.rejectCallback) {
        nextValue = callback.rejectCallback(this.error);
      } else {
        throw this.error;
      }
    } else {
      nextValue = callback.resolveCallback(this.value);
    }
    resolve.call(callback.nextPromise, nextValue);
  } catch(nextError) {
    reject.call(callback.nextPromise, nextError);
  }
}

function resolve(value) {
  if (value instanceof MyPromise) {
    value.then(resolve.bind(this), reject.bind(this));
  } else if (this.state === STATE.pending) {
    this.state = STATE.resolved;
    this.value = value;
    this.callbacks.forEach(function(callback){
      handleCallback.call(this, callback);
    }, this);
  }
}

function reject(error) {
  if (this.state === STATE.pending) {
    this.state = STATE.rejected;
    this.error = error;
    this.callbacks.forEach(function(callback){
      handleCallback.call(this, callback);
    });
  }
}

function then(resolveCallback, rejectCallback){
  var nextPromise = new MyPromise(noop);
  var callback = {
    resolveCallback: resolveCallback,
    rejectCallback: rejectCallback,
    nextPromise: nextPromise
  };
  switch (this.state) {
    case STATE.pending:
      this.callbacks.push(callback);
      break;
    case STATE.resolved:
    case STATE.rejected:
      handleCallback.call(this, callback);
      break;
    default:
      break;
  }
  return nextPromise;
};

MyPromise.prototype.then = then;
