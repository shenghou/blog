# js 深拷贝与浅拷贝

## 数据类型  

js中分为基本数据类型 [`String`, `Number`, `boolean`, `Null`, `Undefined`,`Symbol(es6)`]和复杂数据类型[`object`, `array`]，其中基本类型数据直接放在栈内存中，复杂类型数据则实际放在堆内存中，栈内存只是放引用的指针。


## 浅拷贝与深拷贝

> 深拷贝与浅拷贝只是针对复杂数据类型的。

* 基本示意图如下所示



`浅拷贝只是复制某个对象的指针，而不是复制对象本身，新旧对象还是共享同一块内存。而深拷贝则会创造一个一模一样的对象，新对象和原来的对象不共享内存，修改新对象不会改旧对象。`


## 浅拷贝的实现

### object

1.直接赋值一个变量
```js
    var objA = {
        name: "wang",
        age: 12,
        sex: "female"
    };
    var objB = objA;
    console.log(objB);   // {name: "wang", age: 12, sex: "female"}
    objB.sex = "male";
    console.log(objA)    // {name: "wang", age: 12, sex: "male"}
```
2.`Object.assign()`执行的也是浅拷贝，拷贝到的是对这个对象的引用，
```js
    var objA = {
        a: {b:1}
    }
    var objB = Object.assign({}, objA);
    console.log(objB);  // {a: {b:1}}
    objB.a.b = 9;
    console.log(objA); // {a: {b:9}}
```
### array

1.`Array.prototype.concat()`
```js
    var arrA = ["beijing", "shenzhen", {city:"shanghai"}];
    var arrB = arrA.concat();
    console.log(arrB)  // ["beijing", "shenzhen", {city:"shanghai"}]
    arrB[1] = "wuhan";
    console.log(arrA); // ["beijing", "shenzhen", {city:"shanghai"}]
    arrB[2].city="wuhan";
    console.log(arrA); // ["beijing", "shenzhen", {city:"wuhan"}]
```
说明修改新`对象`会更改原对象

2.`Array.prototype.slice()`
```js
    var arrA = ["beijing", "shenzhen", {city:"shanghai"}];
    var arrB = arrA.slice();
    console.log(arrB)  // ["beijing", "shenzhen", {city:"shanghai"}]
    arrB[1] = "wuhan";
    console.log(arrA); // ["beijing", "shenzhen", {city:"shanghai"}]
    arrB[2].city="wuhan";
    console.log(arrA); // ["beijing", "shenzhen", {city:"wuhan"}]
```
`Array的slice和concat方法不修改原数组，只会返回一个浅复制了原数组中的元素的一个新数组。`
* 如果该元素是个对象引用(不是实际的对象)，slice 会拷贝这个对象引用到新的数组里。两个对象引用都引用了同一个对象。如果被引用的对象发生改变，则新的和原来的数组中的这个元素也会发生改变。
* 对于字符串、数字及布尔值来说（不是 String、Number 或者 Boolean 对象），slice 会拷贝这些值到新的数组里。在别的数组里修改这些字符串或数字或是布尔值，将不会影响另一个数组。

## 深拷贝的实现
1.`JSON.parse(JSON.stringify())` 将对象转成JSON字符串，再用JSON.parse()把字符串解析成对象，一去一来，新的对象产生了，而且对象会开辟新的栈，实现深拷贝。
```js
    var arrA = ["beijing", "shenzhen", {city:"shanghai"}];
    var arrB = JSON.parse(JSON.stringify(arrA));
    console.log(arrB) //["beijing", "shenzhen", {city:"shanghai"}]
    arrB[1] = "wuhan";
    console.log(arrA); // ["beijing", "shenzhen", {city:"shanghai"}]
    arrB[2].city="wuhan";
    console.log(arrA); // ["beijing", "shenzhen", {city:"shanghai"}]
    console.log(arrB); // ["beijing", "shenzhen", {city:"wuhan"}]
```
2.递归实现(`实现原理是遍历对象、数组直到里边都是基本数据类型，然后再去复制，就是深度拷贝`)
```js
        //定义检测数据类型的功能函数
    function checkedType(target) {
        return Object.prototype.toString.call(target).slice(8, -1)
    }
        //实现深度克隆---对象/数组
    function clone(target) {
        //判断拷贝的数据类型
        //初始化变量result 成为最终克隆的数据
        var result, targetType = checkedType(target)
        if (targetType === 'object') {
            result = {}
        } else if (targetType === 'Array') {
            result = []
        } else {
            return target
        }
        //遍历目标数据
        for (var i in target) {
            //获取遍历数据结构的每一项值。
            var value = target[i]
            //判断目标结构里的每一值是否存在对象/数组
            if (checkedType(value) === 'Object' ||checkedType(value) === 'Array') { //对象/数组里嵌套了对象/数组
            //继续遍历获取到value值
                result[i] = clone(value)
            } else { //获取到value值是基本的数据类型或者是函数。
                result[i] = value;
            }
        }
        return result
    }

```
### 参考
* [https://juejin.im/post/5b0b7d9ef265da091f10530a](https://juejin.im/post/5b0b7d9ef265da091f10530a)
* [https://juejin.im/entry/57bd3817a34131005b21cbdb](https://juejin.im/entry/57bd3817a34131005b21cbdb)
* [https://juejin.im/post/5ab23769f265da237506c845](https://juejin.im/post/5ab23769f265da237506c845)
* [https://juejin.im/post/5ad6b72f6fb9a028d375ecf6](https://juejin.im/post/5ad6b72f6fb9a028d375ecf6)
* [https://juejin.im/post/5ab75dde5188255579189f2d]{https://juejin.im/post/5ab75dde5188255579189f2d}
