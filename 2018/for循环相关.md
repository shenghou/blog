# for in, for of,  forEach循环

从javaSript诞生以来，我们一直使用for in来循环一个数组，例如：

```js
    for( var i = 0, l = arr.lenght; i < l; i++  ){
        console.log(arr[i]);
    }
```
然而for in 循环在低版本浏览器上运行时候循环出现的值不一定是按顺序的

eg:
```js
    var b = {3:1,42:2,11:3}
    for( var key in b ){
        alert( b[key] )
    }
```
> 在低版本浏览器弹窗的顺序为1 2 3   而现代浏览器则是1 3 2
> 所以for in 一般用于循环带有字符串key的对象

---

为此我们可以使用forEach 代替for in 来遍历：

```js
    var arr = ["first", "second", "third", "four"];
    arr.forEach(function(value, index, array){
        console.log(value);
        console.log(index);
    });

```
我们也可以用原生方法来实现foreach

```js
    var each =  function(object, callback){
        var type = (function(){
                switch (object.constructor){
                    case Object:
                        return 'Object';
                        break;
                    case Array:
                        return 'Array';
                        break;
                    case NodeList:
                        return 'NodeList';
                        break;
                    default:
                        return 'null';
                        break;
                }
            })();
            // 为数组或类数组时, 返回: index, value
            if(type === 'Array' || type === 'NodeList'){
                // 由于存在类数组NodeList, 所以不能直接调用every方法
                [].every.call(object, function(v, i){
                    return callback.call(v, i, v) === false ? false : true;
                });
            }
            // 为对象格式时,返回:key, value
            else if(type === 'Object'){
                for(var i in object){
                    if(callback.call(object[i], i, object[i]) === false){
                        break;
                    }
                }
            }
        }

```

然而forEach 循环在回调函数内部无法使用break来跳出循环，也不能使用return来返回外层函数，为此我们可以通过for of循环来遍历数组、字符串、Maps、 Sets等具有遍历器（Interator）接口的数据结构

```js
    let obj = {
        data: [ 'hello', 'world' ],
        [Symbol.iterator]() {
            const self = this;
            let index = 0;
            return {
                next() {
                    if (index < self.data.length) {
                    return {
                        value: self.data[index++],
                        done: false
                    };
                    } else {
                    return { value: undefined, done: true };
                    }
                }
            };
        }
    };
```

还可以用于循环一个字符串
```js
    var str = "string";
    for( let i of str ) {
        console.log(i)
    }
```

maps
```js
    var interable = new Map([ ["first", 1] , ["secod", 2],  ["third", 3]])
    for( let [key, value] of interable){
        console.log(key  + ":" + value);
    }

    for( let int of interable ){
        console.log(int);
    }

```
set 
```js
    var sets = new Set([ 1, 2, 3, 4, 5 ]);
    for( let value of sets) {
        console.log(value)
    }
```
