# es6 之 promise async await

### calback

在 js 中为了避免 io 类操作阻塞主线程，通常在回调函数的形式将耗时的操作放进事件队列中执行来保证当前的操作不受限制，这点在 nodejs 中表现的特别明显，
例如 nodejs 中 fs 模块

```js
const fs = require("fs");
fs.open("/open/some/file.txt", "r", (err, fd) => {
  if (err) throw err;
  fs.close(fd, err => {
    if (err) throw err;
  });
});
```

这段函数将.text 打开后的结果赋值进回调函数中去了，当这个回调函数里有嵌套回调函数时我们的代码看起来就比较乱了，由此引入了 promise API

### Promise

promise 是一个代理对象，代理一个状态，他有三种状态，pending, resolved, rejected。

```js
    const promise = new Promise( function(resolve, reject){
        Do something
    })
```

当由 pending => resolve 为成功时的回调， pending => reject 则为失败时的回调，例如我们写个简单的测试函数

```js
function testPromise(resolve, rejcet) {
  let value = Math.random() * 2;
  if (value > 1) {
    resolve("more than one");
  } else {
    reject("less than one");
  }
}
const promise = new Promise(testPromise);
const promiseThen = promise.then(function(result) {
  console.log(result); // more than one
});
const promiseError = promise.catch(function(result) {
  console.log(result); //less than one
});
const promiseStatus = promise.then(
  function(value) {
    console.log(vlue);
  },
  function(error) {
    console.log(error);
  }
);
```

在会到前面的当回调函数里又有一个回调函数怎么办呢，promise 还支持链式调用，

```js
function p1() {
  return new Promise(function testPromise1(resolve, rejcet) {
    let value = 2;
    if (value > 1) {
      console.log("more than one1");
      resolve("more than one1");
    } else {
      reject("less than one");
    }
  });
}

function p2() {
  new Promise(function testPromise2(resolve, rejcet) {
    let value = 2;
    if (value > 1) {
      console.log("more than one2");
      resolve("more than one2");
    } else {
      reject("less than one");
    }
  });
}

function testPromise3(resolve, rejcet) {
  let value = 2;
  if (value > 1) {
    console.log("more than one3");
    resolve("more than one3");
  } else {
    reject("less than one");
  }
}
const prs = new Promise(testPromise3);
prs.then(p1).then(p2); // one3  one1 one2
```

有时会我们还会觉得链式调用麻烦，这时候可以用 Promise.all([promise1, promise2, promise3]);

```js
const p1 = new Promise(function testPromise1(resolve, rejcet) {
  let value = 2;
  if (value > 1) {
    resolve("more than one1");
  } else {
    reject("less than one");
  }
});

const p2 = new Promise(function testPromise2(resolve, rejcet) {
  let value = 2;
  if (value > 1) {
    resolve("more than one2");
  } else {
    reject("less than one");
  }
});

const promiseAll = Promise.all([p1, p2]).then(value => {
  console.log(value); //[one1, one2]
});
```

而在实际工作中我们遇到 Promise.all 情况的时候一般会搭配 async

```js
function postData(props) {
  const { postFunc, dataArray, callback } = props;
  return async values => {
    const createTask = async id => {
      const result = await postFunc(id);
    };
    const tasks = dataArray.map(item => {
      return createTask(item.id);
    });
    await Promise.all(tasks);
  };
}
```

例如我们经常会遇到的`post`多个数据，这时候我们就可以利用`async, await, promise.all`,创建单个 task 的`promise`，在利用`promise.all`执行多个任务

### async await

async 放在函数前面表示一个异步函数，

```js
async function test() {
  const num = 100;
  return num;
}
const testAsync = test();
console.log(testAsync); //Promise {<resolved>: 100}
```

可以看到 async 返回是其实是一个 promise

```js
async function test() {
  await promiseFunc();
}
const testAsync = test();
```

附录
[https://ponyfoo.com/articles/understanding-javascript-async-await](https://ponyfoo.com/articles/understanding-javascript-async-await)
promise 源码

```js
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;
function Promise(callback) {
  this.status = PENDING;
  this.value = null;
  this.defferd = [];
  setTimeout(
    callback.bind(this, this.resolve.bind(this), this.reject.bind(this)),
    0
  );
}
Promise.prototype = {
  constructor: Promise,
  resolve: function(result) {
    this.status = FULFILLED;
    this.value = result;
    this.done();
  },
  reject: function(error) {
    this.status = REJECTED;
    this.value = error;
  },
  handle: function(fn) {
    if (!fn) {
      return;
    }
    var value = this.value;
    var t = this.status;
    var p;
    if (t == PENDING) {
      this.defferd.push(fn);
    } else {
      if (t == FULFILLED && typeof fn.onfulfiled == "function") {
        p = fn.onfulfiled(value);
      }
      if (t == REJECTED && typeof fn.onrejected == "function") {
        p = fn.onrejected(value);
      }
      var promise = fn.promise;
      if (promise) {
        if (p && p.constructor == Promise) {
          p.defferd = promise.defferd;
        } else {
          p = this;
          p.defferd = promise.defferd;
          this.done();
        }
      }
    }
  },
  done: function() {
    var status = this.status;
    if (status == PENDING) {
      return;
    }
    var defferd = this.defferd;
    for (var i = 0; i < defferd.length; i++) {
      this.handle(defferd[i]);
    }
  },
  then: function(success, fail) {
    var o = {
      onfulfiled: success,
      onrejected: fail
    };
    var status = this.status;
    o.promise = new this.constructor(function() {});
    if (status == PENDING) {
      this.defferd.push(o);
    } else if (status == FULFILLED || status == REJECTED) {
      this.handle(o);
    }
    return o.promise;
  }
};
```
