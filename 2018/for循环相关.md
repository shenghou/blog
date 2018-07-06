# for in, for of,  forEach循环

从javaSript诞生以来，我们一直使用for in来循环一个数组，例如：

```js
    for( var i = 0, l = arr.lenght; i < l; i++  ){
        console.log(arr[i]);
    }
```



然而从Es5开始，我们开始可以使用内置的forEach方便来遍历：

```js
    var arr = ["first", "second", "third", "four"];
    arr.forEach(function(value, index, array){
        console.log(value);
        console.log(index);
    });

```


到了Es6之后，我们还可以通过for of循环来遍历数组、字符串、Maps、 Sets等具有遍历器（Interator）接口的数据结构

```js
    var arr = ["first", "second", "third", "four"];
    for( let v of arr ){
        console.log(v);
    }
```

还可以用个循环一个字符串
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
