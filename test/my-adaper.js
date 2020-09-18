function MyPromise(executor){
  const self = this;
  self.data = undefined;
  self.status = 'pending';
  self.onFulfilledQueue = [];
  self.onRejectedQueue = [];

  function resolve(value){
    // if(value instanceof MyPromise) {
    //   return value.then(resolve, reject);
    // }

    setTimeout(() => {
      if(self.status === 'pending'){
        self.status = 'fulfilled';
        self.data = value;
        self.onFulfilledQueue.forEach(onFulfilled => onFulfilled(value))
      }
    }, 0);
  }

  function reject(reason){
    setTimeout(() => {
      if(self.status === 'pending'){
        self.status = 'rejected';
        self.data = reason;
        self.onRejectedQueue.forEach(onRejected => onRejected(reason))
      }
    }, 0);
  }

  try {
    executor(resolve, reject);
  } catch (e) {
    reject(e)
  }
}

MyPromise.prototype.then = function(onFulfilled, onRejected){
  const self = this;
  let promise2;
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
  onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
  
  if(self.status === 'pending'){
    return promise2 = new MyPromise((resolve, reject) => {
      self.onFulfilledQueue.push(function(value){
        try {
          const x = onFulfilled(value);
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
      self.onRejectedQueue.push(function(reason){
        try {
          const x = onRejected(reason);
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    });
  }

  if(self.status === 'fulfilled'){
    return promise2 = new MyPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          const x = onFulfilled(self.data);
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      }, 0);
    })
  }

  if(self.status === 'rejected'){
    return promise2 = new MyPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          const x = onRejected(self.data);
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      }, 0);
    })
  }
}


function resolvePromise(promise2, x, resolve, reject) {
  if(promise2 === x) {
    reject(new TypeError('Chaining cycle detected for promise!'));
  }else if((x !== null) && ((typeof x === 'function') || (typeof x === 'object'))) {
    let called = false;
    try {
      const then = x.then;
      if(typeof then === 'function'){
        then.call(x, function(value){
          if(called) return;
          called = true;
          resolvePromise(promise2, value, resolve, reject);
        }, function(e){
          if(called) return;
          called = true;
          reject(e);
        })
      } else {
        resolve(x);
      }
    } catch (e) {
      if(called) return;
      called = true;
      reject(e)
    }
  } else {
    resolve(x)
  }
}


MyPromise.prototype.catch = function(onRejected){
  return this.then(null, onRejected)
}

MyPromise.resolve = function(data) {
  return new Promise((resolve, reject) => resolve(data))
}

MyPromise.reject = function(reason) {
  return new Promise((resolve, reject) => reject(reason))
}

MyPromise.all = function(promises) {
  const result = [];
  let count = 0;
  return new Promise((resolve, reject) => {
    promises.forEach((promise, i) => {
      promise.then((value) => {
        result[i] = value
        if( ++count === promises.length) {
          resolve(result)
        }
      }, reject)
    })
  })
}

MyPromise.race = function(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach(promise => {
      promise.then(resolve, reject);
    })
  })
}

// MyPromise.resolve(1).then(value => {
//   console.log(value);
//   return new MyPromise((resolve, reject) => {
//     resolve(2)
//   })
// }).then(value => {
//   console.log(value)
// })

// //////////////////////////
MyPromise.deferred = MyPromise.defer = function() {
  var defer = {}
  defer.promise = new MyPromise(function(resolve, reject) {
    defer.resolve = resolve
    defer.reject = reject
  })
  return defer
}

try {
  module.exports = MyPromise
} catch (e) {
}

// Promise核心内容完整测试方法
let promisesAplusTests =  require("promises-aplus-tests")
promisesAplusTests(MyPromise, function(e){
  console.log('e:', e);
  //全部完成;输出在控制台中。或者检查`e`表示失败次数。 
})
