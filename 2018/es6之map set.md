## Set 
Es6提供了新的数据结构Set,它类似于数组，但是成员都是唯一的，没有重复的值，其本身就是一个构造函数，用来生成Set数据结构。
```js
    const s = new Set();

    [2, 3, 5, 4, 5, 2, 2].forEach(x => s.add(x));

    for (let i of s) {
        console.log(i); //2,3,5,4
    }

    //Set 函数可以接受一个数组（或类似数组的对象）作为参数，用来初始化。
    const set = new Set([1, 2, 3, 4, 4]);

    console.log(set)  //Set(4){1, 2, 3, 4}   __proto__:Set
    console.log(set.proty)  //Set(4){1, 2, 3, 4}   __proto__:Set
```
> set 操作方法：
* add(value)：添加某个值，返回Set结构本身。
* delete(value)：删除某个值，返回一个布尔值，表示删除是否成功。
* has(value)：返回一个布尔值，表示该值是否为Set的成员。
* clear()：清除所有成员，没有返回值。

```js
    const set = new Set([1, 2, 3, 4, 4]);
    var infoDel = set.delete(3);
    var infosDel = set.delete(8);
    console.log(infoDel);  // true
    console.log(infosDel); // false
    var infoAdd = set.add(10);
    console.log(infoAdd);  //{1, 2, 4, 10}
    var infoHas = set.has(1);
    var infosHas = set.has(0);
    console.log(infoHas); //true
    console.log(infosHas);//false
    var infoCle = set.clear();
    console.log(infoCle); //undefined
```


> 遍历方法
* keys()：返回键名的遍历器
* values()：返回键值的遍历器
* entries()：返回键值对的遍历器
* forEach()：使用回调函数遍历每个成员

因此使用Set可以很容易实现并集，交集和差集
```js
    let a = new Set([1, 2, 3]);
    let b = new Set([4, 3, 2]);

    // 并集
    let union = new Set([...a, ...b]);
    console.log(union) // Set {1, 2, 3, 4}

    // 交集
    let intersect = new Set([...a].filter(x => b.has(x)));
    console.log(intersect) // set {2, 3}

    // 差集
    let difference = new Set([...a].filter(x => !b.has(x)));
    console.log(difference)
    // Set {1}
```


由于 Set 结构没有键名，只有键值（或者说键名和键值是同一个值），所以keys方法和values方法的行为完全一致。
entries方法返回的遍历器，同时包括键名和键值，所以每次输出一个数组，它的两个成员完全相等。
可用for...of循环遍历Set。

扩展运算符(...)内部使用for  of 循环，所以也可以用于Set结构；
```js
    let set = new Set(['red', 'green', 'blue']);
    let arr = [...set];
    console.log(arr) //["red", "green", "blue"]
```



## map
JavaScript 的对象（Object），本质上是键值对的集合（Hash 结构），但是传统上只能用字符串当作键。这给它的使用带来了很大的限制。

为了解决这个问题，ES6 提供了 Map 数据结构。它类似于对象，也是键值对的集合，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。也就是说，Object 结构提供了“字符串—值”的对应，Map结构提供了“值—值”的对应，是一种更完善的 Hash 结构实现。如果你需要“键值对”的数据结构，Map 比 Object 更合适

```js
    var m = new Map([[{a:1}, 1], ["aa", 2]]);
    console.log(m); //{a:1 => 1, "aa" => 2}
```
>  操作方法
* size属性	size属性返回 Map 结构的成员总数。
* set(key, value)	 set方法设置键名key对应的键值为value，然后返回整个 Map 结构。如果key已经有值，则键值会被更新，否则就新生成该键。set方法返回的是当前的Map对象，因此可以采用链式写法。
* get(key)	get方法读取key对应的键值，如果找不到key，返回undefined。
* has(key)	has方法返回一个布尔值，表示某个键是否在当前 Map 对象之中。
* delete(key)	delete方法删除某个键，返回true。如果删除失败，返回false。
* clear()	clear方法清除所有成员，没有返回值。

> 遍历方法
* keys()：返回键名的遍历器。
* values()：返回键值的遍历器。
* entries()：返回所有成员的遍历器。
* forEach()：遍历 Map 的所有成员。
