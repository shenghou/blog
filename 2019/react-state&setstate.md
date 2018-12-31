# state
一个组件的显示形态是可以由它数据状态和配置参数决定的，一个组件可以拥有自己的状态，react中的state就是用来存储这种可变化的状态的

### 官方建议把state当做是不可变对象，即当state中的某个状态发生变化时候，我们应该重新创建这个状态对象；
* 不可变类型（数字，字符串，布尔值，unll，undefined）————直接赋新值即可
```js
  this.setState({
    count: 1,
    title: 'Redux',
    success: true
  })
```
* 状态类型是数组————使用数组的concat slice或者es6数组扩展语法 (不要使用push、pop、shift、unshift、splice等方法修改数组类型的状态)
```js
  var books = this.state.books; 
  this.setState({
    books: books.concat(['React Guide']);
  })

  this.setState(preState => ({
    books: preState.books.concat(['React Guide']);
  }))
  
  this.setState(preState => ({
    books: preState.books.slice(1,3);
  }))
  
  this.setState(preState => ({
    books: [...preState.books, 'React Guide'];
  }))
  
  this.setState(preState => ({
    books: preState.books.filter(item => {
      return item != 'React'; 
    });
  }))
  
```
* 状态的类型是普通对象（不包括字符串，数组）使用es6 Objcet.assing或者对象扩展语法
```js
    var owner = this.setState.owner;
    this.setState({
      owner: Object.assign({}, owner, {name: 'Jason'});
    })
    
    this.setState(preState => ({
      owner: Object.assign({}, preState.owner, {name: 'Jason'});
    }))
    
    var owner = this.setState.owner;
    this.setState({
      owner: {...owner, {name: 'Jason'}};
    })
  
    this.setState(preState => ({
      owner: {...preState.owner, {name: 'Jason'}};
    }))
  
```






# setState
setState方法由父类component所提供，当我们调用这个函数时候，react会更新组件的状态state，并且重新调用render方法，然后再把render方法所渲染的最新的内容显示到页面上

### 注意
* 不能直接用this.state这种方式来修改，要用setState（{}）方法
* 当调用setState的时候，并不会马上修改state，而是把这个对象放到一个更新队列里，稍后才从队列当中把新的状态提取出来合并到state中，然后在触发组件更新
* 由于setState并不会立马更新，古可以使用第二方式将一个函数作为参数，react会把这个steState的结果传入这个函数，这样就可以使用该结果进行运算、操作
  ```js
    handleClickButton() {
      this.steState( prevState => {
        return {count:0} 
      })
    }
  ```
 * 不能依赖当前的props计算下一个状态，因为porps一般也是从父组件的state中获取，依然无法确定在组件更新时的值
 * setState会合并：当进行多次setState时候，实际上组件只会重新渲染一次，这是因为react内部会把js事件循环中的消息队列的痛一个小时中的setState都进行合并以后再重新渲染组件
 * state的更新是一个浅合并的过程，
 ```js
  this.state = {
    title : 'React',
    content : 'React is an wonderful JS library!'
  }
  修改title状态
  this.setState({title: 'Reactjs'});
  
  state =  {
    title : 'Reactjs',
    content : 'React is an wonderful JS library!'
   }
 ```
 * `与传入对象更新state的方式不同，我们传入函数来更新state的时候，react会把更新state的函数加入到一个队列里面，然后按照函数的顺序依次调用，同时，为每个函数传入state的前一个状态，这样就能更合理的来更新我们的state了`
 
 ## setState流程
  1.enqueueSetState将state放入队列中，并调用enqueUpdate处理更新的component
  2.如果组件当前正处于update事务中，则想将Component存入dirtyComponent中，否则调用batchedUpdates处理
  3.batchedUpdates发起一次transaction.perform()事务
  4.开始执行事务初始化，运行，结束三个阶段
   * 初始化：事务初始化阶段没有注册方法，故无方法要执行
   * 运行：执行setState时传入的callback方法，一般不会传callback参数
   * 结束：更新isBatchingUpdates为false，并执行FLUSH_BATCHED_UPDATES这个wrapper中的close方法
  5.FLUSH_BATCHED_UPDATES在close阶段，会循环遍历所有的dirtyComponentes，调用updateComponet刷新组件，并执行他的pendingCallbacks，也就是steState中设置的callback.
 
 # state vs props
 * state是可变的，是组件内部维护的一组用于反映组件ui变化的状态集合
 * props对于使用它的组件来说是只读的，要想修改props，只能通过该组件的父组件修改
 

参考文章：
[https://zhuanlan.zhihu.com/p/25882602](https://zhuanlan.zhihu.com/p/25882602)
