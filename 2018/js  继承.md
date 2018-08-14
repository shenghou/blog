# js继承
  js作为面向对象的若语言，继承也是其非常大的特性

## 1.原形链继承  核心是将父类的实例作为子类的原型
```js
     function Parent(){
            this.name = "wang";
        }

        function Son(){
            this.age = 12;
        }

        Son.prototype = new Parent();
        var son = new Son();
        console.log(son);   // Son{age:12}
        console.log(son.age); // 12
        console.log(son.name); // wang 
    }
```
* 特点
1.非常纯粹的继承关系，实例是子类的实例，也是父类的实例
2.父类新增原型方法/原型属性，子类都能访问到
3.简单，易于实现
* 缺点
1.要想为子类新增属性和方法，必须要在`new Parent()`这样的语句之后执行，不能放到构造器中
2.无法实现多继承
3.来自原型对象的引用属性是所有实例共享的
4.创建子类实例时，无法向父类构造函数传参

## 2.构造函数继承  核心是用父类的构造函数来增强子类实例，等于是复制父类的实例属性给子类
```js
    function Parent(){
        this.country = "shenzhen";
    }

    Parent.prototype.class = "huo";

    function Son(name, age){
        Parent.apply(this, arguments);
        this.name = name;
        this.age = age;
    }
    
    var test = new Son("li", 15);
    var parent = new Parent();
    console.log(parent.class);  //huo
    console.log(test.name);     // li
    console.log(test.age);      // 15
    console.log(test.country);  //shenzhen
    console.log(test.class);    //undefined
```
* 特点
1.解决了1中，子类实例共享父类引用属性的问题
2.创建子类实例时，可以向父类传递参数
3.可以实现多继承（call多个父类对象）

* 缺点：
1.实例并不是父类的实例，只是子类的实例
2.只能继承父类的实例属性和方法，不能继承原型属性/方法
3.无法实现函数复用，每个子类都有父类实例函数的副本，影响性能

## 3.组合继承 核心是通过调用父类构造，继承父类的属性并保留传参的特点，然后通过父类实例作为子类原形，实现函数复用
```js
    function Parent(name, age){
        this.name = name;
        this.age = age;
    }

    Parent.prototype.say = function(){

    };

    function Son(name, age, country){
        Parent.call(this, name, age);
        this.country = country;
    }

    Son.prototype = new Parent();

    var son = new Son("wang", 15, "shenzhen");
    console.log(son.name);      //wang
    console.log(son.age);       //15
    console.log(son.country);   //shenzhen
```
* 特点
1.弥补了方式2的缺陷，可以继承实例属性/方法，也可以继承原型属性/方法
2.既是子类的实例，也是父类的实例
3.不存在引用属性共享问题
4.可传参
5.函数可复用

## 4.寄生组合式继承  核心通过寄生方式，砍掉父类的实例属性，这样，在调用两次父类的构造的时候，就不会初始化两次实例方法/属性，避免的组合继承的缺点
```js
    function inheritProtype(subType, superType ){
        var prototype = Object(superType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    }

    function Person( name ){
        this.name = name;
    }

    Person.prototype.say = function(){

    };

    function Student( name, type ){
        Person.call(this, name);
        this.type = type;
    }

    inheritProtype(Student, Person);
    var wang = new Student("wang", "male");
    console.log(wang.name); //wang
    console.log(wang.type); //male
```


## 5.实例继承 核心是为父类实例添加新特性，作为子类实例返回
```js
     function Parent(){

    }

    function Son() {
        var parent = new Parent();
        parent.name = "wang";
        parent.age = 15;
        return parent;
    }
    
    var son = new Son();
    console.log(son.name); //wang
    console.log(son.age);  // 15
```
* 特点：
1.不限制调用方式，不管是`new` 子类()还是子类(),返回的对象具有相同的效果
* 缺点：
1.实例是父类的实例，不是子类的实例
2.不支持多继承

## 6.拷贝继承 
```js
     var  person = {
        name: "wang"
    };

    var son ={
        age : 15
    };

    function extend( p ){
        var c = {};
        for( var i in p){
            c[i] = p[i];
        }
        c.uber = p;
        return c;
    }

    var son = extend(person);
    console.log(son.name); //wang
```



### 参考：


* [https://www.cnblogs.com/humin/p/4556820.html](https://www.cnblogs.com/humin/p/4556820.html)
* [https://www.cnblogs.com/luqin/p/5199643.html](https://www.cnblogs.com/luqin/p/5199643.html)
* [http://www.w3school.com.cn/js/pro_js_inheritance_implementing.asp](http://www.w3school.com.cn/js/pro_js_inheritance_implementing.asp)
