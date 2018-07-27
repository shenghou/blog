# es6 之 let const

es6 新增了 `let` 和 `const` 来声明变量，其用法类似于 `var`，只是变量的作用域有所区别：

## let

> `let` 声明的变量只能在代码块内有效

```js
    {
        let a = 10;
        var b = 11;
        console.log(a)  //10
    }
    console.log(b);  //  11
    console.log(a);  // ReferenceError: a is not defined 
```
上面的结果表明`let`声明的变量只在它所声明的代码块内有效

所以再`for`循环内的计数器内就很适合用`let`
```js
    for( let i = 0; i < 20; i++){
        console.log(i)
    }
    console.log(i)   //ReferenceError: a is not defined 
```
上面声明的代码只有在循环体内有效，在循环体外就会报错

如果用`var`声明变量则是未定义
```js
    for( let i = 0; i < 20; i++){
        console.log(i)
    }
    console.log(i)  // undefined
```

在看一个`let`的应用

```js
    function timeCount() {
    for (var i = 0; i < 5; i++) {
        setTimeout(function(){
                console.log(i)   // 5, 5, 5, 5, 5
            },1000)
        }
    }
    timeCount()
```
由于`setTimeout`是异步任务不会马上执行，会被推到一个异步任务队列中等待执行，直到js线程任务执行完后才会去执行这个队列中的任务，
而我们想法是依次打印 0, 1, 2, 3, 4 可事实是一秒之后依次打印出  5, 5, 5, 5, 5，由于`var`声明的变量在全局范围内都有效，
所以每次循环完新的i值会覆盖旧值，let声明的仅在块级作用域内有效

```js
    function timeCount() {
    for (let i = 0; i < 5; i++) {
        setTimeout(function(){
                console.log(i)   // 0, 1, 2, 3, 4
            },1000)
        }
    }
    timeCount()
```
由于块级作用域的出现也不需要立即执行函数

```js
    function timeCount() {
        for (var i = 0; i < 5; i++) {
            (function(i){
                setTimeout(function(){
                        console.log(i)   //  0, 1, 2, 3, 4
                    },1000)
            })(i)
        }
    }
    timeCount()
```

---

> `let` 变量不存在变量提升

```js
    console.log(a);   // undefined
    var a = 100;

    console.log(b);   // error
    let b = 200;
```
上面的代码中变量 `a` 发生变量提升，当脚本开始运行时候 `a` 已经存在了值为 `undefined`, 而`b`不存在变量提升，故会报错

> 暂时性死区
只要块级作用域内存在`let`命令，它所声明的变量就“绑定”（binding）这个区域，不再受外部的影响

``` js
    var tmp = 123;
    if (true) {
        let tmp;
        tmp = 'abc';    
    }
```

``` js
    var tmp = 123;
    if (true) {
        tmp = 'abc'; // ReferenceError
        let tmp;
    }
```
上面代码中，存在全局变量`tmp`，但是块级作用域内`let`又声明了一个局部变量`tmp`，导致后者绑定这个块级作用域，所以在`let`声明变量前，对`tmp`赋值会报错。

ES6 明确规定，如果区块中存在`let`和`const`命令，这个区块对这些命令声明的变量，从一开始就形成了封闭作用域。凡是在声明之前就使用这些变量，就会报错。

> let不允许在相同作用域内，重复声明同一个变量
```js
    // 报错
    function func() {
        let a = 10;
        var a = 20;
    }
    
    // 报错
    function func() {
        let a = 10;
        let a = 20;
    }
```
所以函数作用域内也不能声明同一个变量

```js
    function func(arg) {
        let arg; // 报错
    }

    function func(arg) {
        {
            let arg; // 不报错
        }
    }
```

## const
`const`用来声明一个只读是常亮，一旦声明就不能修改

```js
    const PI = 3.1415;
    PI = 3;   // Uncaught TypeError: Assignment to constant variable.
```

> `const`一旦声明变量，就必须立即初始化
```js
    const aaaaa;  // Uncaught SyntaxError: Missing initializer in const declaration
```

> `const` 本质

`const`实际上保证的，并不是变量的值不得改动，而是变量指向的那个内存地址所保存的数据不得改动。对于简单类型的数据（数值、字符串、布尔值），
值就保存在变量指向的那个内存地址，因此等同于常量。但对于复合类型的数据（主要是对象和数组），变量指向的内存地址，保存的只是一个指向实际数据的指针，
const只能保证这个指针是固定的（即总是指向另一个固定的地址），至于它指向的数据结构是不是可变的，就完全不能控制了

```js
    const foo = {};
    // 为 foo 添加一个属性，可以成功
    foo.prop = 123;
    foo.prop // 123
    // 将 foo 指向另一个对象，就会报错
    foo = {}; // TypeError: "foo" is read-only
```
上面代码中，常量`foo`储存的是一个`地址`，这个地址指向一个对象。不可变的只是这个地址，即不能把`foo`指向另一个`地址`，但对象本身是可变的，所以依然可以为其添加新属性。






