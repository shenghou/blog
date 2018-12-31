# state
一个组件的显示形态是可以由它数据状态和配置参数决定的，一个组件可以拥有自己的状态，react中的state就是用来存储这种可变化的状态的

# setState
setState方法由父类component所提供，当我们调用这个函数时候，react会更新组件的状态state，并且重新调用render方法，然后再把render方法所渲染的最新的内容显示到页面上

### 注意
* 不能直接用this.state这种方式来修改，要用setState（{}）方法
* 当调用setState的时候，并不会马上修改state，而是把这个对象放到一个更新队列里，稍才才
