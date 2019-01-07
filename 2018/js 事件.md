# js事件机制 #
我们知道js中事件传播有冒泡和捕获之分，曾经NetScape珠宝捕获方式，微软主张冒泡方式，后来W3C指定了统一的标准————先捕获再冒泡。
> 事件的触发有三个阶段
1.document往事件触发地点时候，捕获前进，遇到相同注册事件则立即触发执行；
2.到达事件位置时候，触发事件(`如果该出同时注册了两种事件则按照注册顺序执行`)；
3.事件往document方向，冒泡前进，遇到相同注册事件立即触发；

例如常用的事件函数  `addEventListener`;
```js
    obj.addEventListener("click", func, true); // 捕获方式
    obj.addEventListener("click", func, false); // 冒泡方式
```

### 如图所示
![img](src/eventInput.png)



* eg1 事件捕获;
```html
     <div class="col-lg-12">
        <div id="fn1">fn1
            <div id="fn2">
                fn2
            </div> 
        </div>
    </div>
```
```js
    document.getElementById("fn1").addEventListener("click", function(){
            console.log("fn1");
        },true);
    document.getElementById("fn2").addEventListener("click", function(){
        console.log("fn2");
    },true);
```
> 当点击fn2时候依次打印出`fn1, fn2`;其原因是因为这里采取的是捕获模式，当document往fn2时候，发现了fn1,和fn2都注册了捕获事件，所以会先打印`fn1`,后打印`fn2`;

* eg2 事件冒泡;
```js
    document.getElementById("fn1").addEventListener("click", function(){
            console.log("fn1");
        },false);
    document.getElementById("fn2").addEventListener("click", function(){
        console.log("fn2");
    },false);
```
> 当点击fn2时候其结果刚好与`eg1`相反，说明在冒泡模式下事件由里往外触发；

* eg3 混合事件
```html
    <div class="col-lg-12">
        <div id="fn1">fn1
            <div id="fn2">fn2
                <div id="fn3">
                    fn3
                </div>
            </div> 
        </div>
    </div>
```

```js
    document.getElementById("fn1").addEventListener("click", function(){
        console.log("fn1 捕获");
    },true);
    document.getElementById("fn2").addEventListener("click", function(){
        console.log("fn2 捕获");
    },true);
    document.getElementById("fn3").addEventListener("click", function(){
        console.log("fn3 捕获");
    },true);

    document.getElementById("fn1").addEventListener("click", function(){
        console.log("fn1 冒泡");
    },false);
    document.getElementById("fn2").addEventListener("click", function(){
        console.log("fn2 冒泡");
    },false);
    document.getElementById("fn3").addEventListener("click", function(){
        console.log("fn3 冒泡");
    },false);
```
> 当点击fn2时候，依次打印出` fn1 捕获, fn2 捕获, fn2 冒泡， fn1 冒泡`
> 当点击fn3时候，依次打印出` fn1 捕获, fn2 捕获, fn3 捕获,fn3 冒泡, fn2 冒泡， fn1 冒泡`

* eg4 两个事件同时注册
```html
    <div class="col-lg-12">
        <div id="fn1">fn1
            <div id="fn2">fn2
            </div> 
        </div>
    </div>
```
```js
    document.getElementById("fn2").addEventListener("click", function(){
            console.log("fn2 捕获");
    },true);
    document.getElementById("fn2").addEventListener("click", function(){
        console.log("fn2 冒泡");
    },false);
```
> 当点击fn2时候，依次打印出`fn2 捕获, fn2 冒泡`

当交换捕获和冒泡注册顺序事件
```js
    document.getElementById("fn2").addEventListener("click", function(){
        console.log("fn2 冒泡");
    },false);
    document.getElementById("fn2").addEventListener("click", function(){
            console.log("fn2 捕获");
    },true);
```
> 当点击fn2时候，依次打印出`fn2 捕获, fn2 冒泡` 说明当同时注册了冒泡和捕获事件时候执行顺序按照有可能按照注册顺序执行

* eg5 阻止事件传播 `stopPropagation()`
```html
    <div class="col-lg-12">
        <div id="fn1">fn1
            <div id="fn2">fn2
            </div> 
        </div>
    </div>
```
```js
    document.getElementById("fn1").addEventListener("click", function(evnt){
        console.log("fn1 捕获");
        evnt.stopPropagation();
    },true);
    document.getElementById("fn2").addEventListener("click", function(evnt){
        console.log("fn2 捕获");
    },true);
```
> 当点击fn1时候，打印出`fn1 捕获`

```js
    document.getElementById("fn1").addEventListener("click", function(evnt){
        console.log("fn1 冒泡");
    },false);
    document.getElementById("fn2").addEventListener("click", function(evnt){
        console.log("fn2 冒泡");
        evnt.stopPropagation();
    },false);
```
> 当点击fn2时候，打印出`fn2 冒泡`
* 说明`stopPropagation()`不仅可以阻止事件的传播还可以阻止事件的冒泡

* eg6 阻止同级事件事件传播 `stopImmediatePropagation()`
```html
    <div class="col-lg-12">
        <div id="fn1">fn1
            <div id="fn2">fn2
            </div> 
        </div>
    </div>
```
```js
    document.getElementById("fn2").addEventListener("click", function(evnt){
        console.log("fn2 捕获A");
    },true);
    document.getElementById("fn2").addEventListener("click", function(evnt){
        console.log("fn2 捕获B");
    },true);
```

> 当点击fn2时候，依次打印出`fn2 捕获A, fn2 捕获B` 说明

```js
    document.getElementById("fn2").addEventListener("click", function(evnt){
        console.log("fn2 捕获A");
        evnt.stopImmediatePropagation();
    },true);
    document.getElementById("fn2").addEventListener("click", function(evnt){
        console.log("fn2 捕获B");
    },true);
```

> 当点击fn2时候，依次打印出`fn2 捕获A` 说明`stopImmediatePropagation()`阻止同级事件的传播

 ### 事件机制
* [https://www.cnblogs.com/hustskyking/p/problem-javascript-event.html](https://www.cnblogs.com/hustskyking/p/problem-javascript-event.html)

### event对象封装
* [https://www.cnblogs.com/chaoyuehedy/p/5692899.html](https://www.cnblogs.com/chaoyuehedy/p/5692899.html)
* [https://blog.csdn.net/qq_29882585/article/details/52336112](https://blog.csdn.net/qq_29882585/article/details/52336112)
* [http://www.jb51.net/article/19724.htm](http://www.jb51.net/article/19724.htm)
* [http://www.jb51.net/article/28248.htm](http://www.jb51.net/article/28248.htm)

### input事件传播
* [https://www.cnblogs.com/angleStudy/p/input.html](https://www.cnblogs.com/angleStudy/p/input.html)
* [http://www.jb51.net/article/53438.htm](http://www.jb51.net/article/53438.htm)

### 事件委托、事件冒泡
* [https://www.cnblogs.com/liugang-vip/p/5616484.html](https://www.cnblogs.com/liugang-vip/p/5616484.html)
* [https://blog.csdn.net/zhouziyu2011/article/details/60955951](https://blog.csdn.net/zhouziyu2011/article/details/60955951)
* [https://www.cnblogs.com/Chen-XiaoJun/p/6210987.html](https://www.cnblogs.com/Chen-XiaoJun/p/6210987.html)
* [https://blog.csdn.net/qq_27446907/article/details/68951259](https://blog.csdn.net/qq_27446907/article/details/68951259)
* [https://blog.csdn.net/leonhuangjiajun/article/details/75577247](https://blog.csdn.net/leonhuangjiajun/article/details/75577247)
* [https://www.jb51.net/article/82099.htm](https://www.jb51.net/article/82099.htm)
* [https://www.cnblogs.com/Nomand/p/4236356.html](https://www.cnblogs.com/Nomand/p/4236356.html)
* [https://www.tuicool.com/articles/jQZj6zB](https://www.tuicool.com/articles/jQZj6zB)

### 事件循环
* [https://blog.csdn.net/qq_31628337/article/details/71056294](https://blog.csdn.net/qq_31628337/article/details/71056294)
* [https://segmentfault.com/a/1190000004322358](https://segmentfault.com/a/1190000004322358)
* [https://www.cnblogs.com/hity-tt/p/6733062.html](https://www.cnblogs.com/hity-tt/p/6733062.html)
* [https://www.cnblogs.com/cangqinglang/p/8967268.html](https://www.cnblogs.com/cangqinglang/p/8967268.html)
* [https://www.cnblogs.com/dong-xu/p/7000163.html](https://www.cnblogs.com/dong-xu/p/7000163.html)
* [https://cnodejs.org/topic/50462f51329c5139760bff98](https://cnodejs.org/topic/50462f51329c5139760bff98)
