# es6 之 symbol
ES6 引入了一种新的原始数据类型Symbol，表示独一无二的值。它是 JavaScript 语言的第七种数据类型，前六种是：undefined、null、布尔值（Boolean）、字符串（String）、数值（Number）、对象（Object）。

##  symbol 特征

> `symbol` 是原始类型不是对象，通过 `Symbol()`函数生成， 不能用`new` 生成
```js
    let s = Symbol();
    typeof s   // "symbol"
```

```js
    let s = Symbol();  //Uncaught TypeError: Symbol is not a constructor
    
```

> Symbol函数可以接受一个字符串作为参数，表示对 Symbol 实例的描述，主要是为了在控制台显示，或者转为字符串时，比较容易区分。
```js
    let s1 = Symbol('foo');
    let s2 = Symbol('bar');

    s1 // Symbol(foo)
    s2 // Symbol(bar)

    s1.toString() // "Symbol(foo)"
    s2.toString() // "Symbol(bar)"
```

> 如果 Symbol 的参数是一个对象，就会调用该对象的toString方法，将其转为字符串，然后才生成一个 Symbol 值。
```js 
    const obj = {
        toString() {
            return 'abc';
        }
    };
    const sym = Symbol(obj);
    sym // Symbol(abc)
```
> Symbol函数的参数只是表示对当前 Symbol 值的描述，因此相同参数的Symbol函数的返回值是不相等的。
```js
    // 没有参数的情况
    let s1 = Symbol();
    let s2 = Symbol();

    s1 === s2 // false

    // 有参数的情况
    let s1 = Symbol('foo');
    let s2 = Symbol('foo');

    s1 === s2 // false
```

> Symbol 值不能与其他类型的值进行运算，会报错。
```js 
    let sym = Symbol('My symbol');
    "your symbol is " + sym
    // TypeError: can't convert symbol to string
    `your symbol is ${sym}`
    // TypeError: can't convert symbol to string

```
> Symbol 值可以显式转为字符串
```js
    let sym = Symbol('My symbol');
    String(sym) // 'Symbol(My symbol)'
    sym.toString() // 'Symbol(My symbol)'
```
> Symbol 值也可以转为布尔值，但是不能转为数值
```js 
    let sym = Symbol();
    Boolean(sym) // true
    !sym  // false

    if (sym) {
    // ...
    }

    Number(sym) // TypeError
    sym + 2 // TypeError

```

## 作为属性名的symbol

> 由于每一个 Symbol 值都是不相等的，这意味着 Symbol 值可以作为标识符，用于对象的属性名，就能保证不会出现同名的属性
```js
    let mySymbol = Symbol();
    // 第一种写法
    let a = {};
    a[mySymbol] = 'Hello!';

    // 第二种写法
    let a = {
        [mySymbol]: 'Hello!';
    };

    // 第三种写法
    let a = {};
    Object.defineProperty(a, mySymbol, { value: 'Hello!' });
    // 以上写法都得到同样结果
    a[mySymbol] // "Hello!"

```
> Symbol 值作为对象属性名时，不能用点运算符
```js
    const mySymbol = Symbol();
    const a = {};

    a.mySymbol = 'Hello!';
    a[mySymbol] // undefined
    a['mySymbol'] // "Hello!"

```
> 同理，在对象的内部，使用 Symbol 值定义属性时，Symbol 值必须放在方括号之中。
```js
    let s = Symbol();
    let obj = {
        [s]: function (arg) { ... }
    };
    obj[s](123);
```
> Symbol 类型还可以用于定义一组常量，保证这组常量的值都是不相等的
```js
    const log = {};
    log.levels = {
    DEBUG: Symbol('debug'),
    INFO: Symbol('info'),
    WARN: Symbol('warn')
    };
    console.log(log.levels.DEBUG, 'debug message');
    console.log(log.levels.INFO, 'info message');
```
```js
    const COLOR_RED    = Symbol();
    const COLOR_GREEN  = Symbol();

    function getComplement(color) {
    switch (color) {
        case COLOR_RED:
        return COLOR_GREEN;
        case COLOR_GREEN:
        return COLOR_RED;
        default:
        throw new Error('Undefined color');
        }
    }
```
## Symbol.for()  Symbol.key();
> Symbol.for()  用同样参数生成的值相等
```js
    let s1 = Symbol.for('foo');
    let s2 = Symbol.for('foo');
    s1 === s2 // true
```

* Symbol.for()不会每次调用就返回一个新的 Symbol 类型的值，而是会先检查给定的key是否已经存在，如果不存在才会新建一个值 *
```js 
    Symbol.for("bar") === Symbol.for("bar")
    // true
    Symbol("bar") === Symbol("bar")
    // false
```

> Symbol.keyFor方法返回一个已登记的 Symbol 类型值的key
```js 
    let s1 = Symbol.for("foo");
    Symbol.keyFor(s1) // "foo"
    let s2 = Symbol("foo");
    Symbol.keyFor(s2) // undefined
```

*  Symbol.for为 Symbol 值登记的名字，是全局环境的，可以在不同的 iframe 或 service worker 中取到同一个值 *
```js
    iframe = document.createElement('iframe');
    iframe.src = String(window.location);
    document.body.appendChild(iframe);
    iframe.contentWindow.Symbol.for('foo') === Symbol.for('foo')
    // true
```

### Symbol 内置值
> 对象的Symbol.hasInstance 指向一个内部方法。当其他对象使用instanceof运算符，判断是否为该对象的实例时，会调用这个方法
```js
    class MyClass {
        [Symbol.hasInstance](foo) {
            return foo instanceof Array;
        }
    }
    [1, 2, 3] instanceof new MyClass() // true
```

> 对象的Symbol.isConcatSpreadable属性等于一个布尔值，表示该对象用于Array.prototype.concat()时，是否可以展开
```js
    let arr1 = ['c', 'd'];
    ['a', 'b'].concat(arr1, 'e') // ['a', 'b', 'c', 'd', 'e']
    arr1[Symbol.isConcatSpreadable] // undefined

    let arr2 = ['c', 'd'];
    arr2[Symbol.isConcatSpreadable] = false;
    ['a', 'b'].concat(arr2, 'e') // ['a', 'b', ['c','d'], 'e']
```
上面代码说明，数组的默认行为是可以展开，Symbol.isConcatSpreadable默认等于undefined。该属性等于true时，也有展开的效果。
类似数组的对象正好相反，默认不展开。它的Symbol.isConcatSpreadable属性设为true，才可以展开。

> 对象的Symbol.iterator属性，指向该对象的默认遍历器方法。
```js
    const myIterable = {};
    myIterable[Symbol.iterator] = function* () {
    yield 1;
    yield 2;
    yield 3;
    };
    [...myIterable] // [1, 2, 3]
```

```js
    class Collection {
        *[Symbol.iterator]() {
            let i = 0;
            while(this[i] !== undefined) {
            yield this[i];
            ++i;
            }
        }
    }

    let myCollection = new Collection();
    myCollection[0] = 1;
    myCollection[1] = 2;

    for(let value of myCollection) {
        console.log(value);
    }
    // 1
    // 2
```
> 对象的Symbol.toPrimitive属性，指向一个方法。该对象被转为原始类型的值时，会调用这个方法，返回该对象对应的原始类型值。

Symbol.toPrimitive被调用时，会接受一个字符串参数，表示当前运算的模式，一共有三种模式。

Number：该场合需要转成数值
String：该场合需要转成字符串
Default：该场合可以转成数值，也可以转成字符串
```js
    let obj = {
        [Symbol.toPrimitive](hint) {
            switch (hint) {
            case 'number':
                return 123;
            case 'string':
                return 'str';
            case 'default':
                return 'default';
            default:
                throw new Error();
            }
        }
    };

    2 * obj // 246
    3 + obj // '3default'
    obj == 'default' // true
    String(obj) // 'str'
```
> 对象的Symbol.toStringTag属性，指向一个方法
在该对象上面调用Object.prototype.toString方法时，如果这个属性存在，它的返回值会出现在toString方法返回的字符串之中，表示对象的类型。也就是说，这个属性可以用来定制[object Object]或[object Array]中object后面的那个字符串。

```js
    // 例一
    ({[Symbol.toStringTag]: 'Foo'}.toString())
    // "[object Foo]"

    // 例二
    class Collection {
    get [Symbol.toStringTag]() {
        return 'xxx';
    }
    }
    let x = new Collection();
    Object.prototype.toString.call(x) // "[object xxx]

```
