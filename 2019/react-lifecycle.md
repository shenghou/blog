# react组件的生命周期函数分为两类：挂载或卸载过程/组件更新时。

### 挂载：
    * componentWillMount————组件即将挂载
      初始渲染之前执行一次，前后端都有，如果在该方法中调用setState,render()将接受到更新后的数据，并且只会执行一次（即使状态已经改变）
      
    * componnetDidMount ————组件挂载完成
      初始渲染完成后立即执行一次，只在客户端执行（服务器端没有）
      子组件的componentDidMount方法先于父组件之前执行，此时可以操作子组件的任何引用（比如操作子组件DOM）
### 渲染
    * render() 必须是一个纯函数，不能在这里面修改组件的状态或执行有副作用的操作。

### 组件更新 更新会在react组件初始渲染之后、卸载之前多次发生，属性、状态改变都会触发更新
    * componentWillReceiveProps ——-组件即将接受新属性之前执行，初始渲染不执行
      该方法用于比较当前属性（this.props）和新属性(nextProps)，以便决定是否通过this.setState()进行状态转换，此方法中调用this.setState()不会触发额外的渲染
      ```js
        componentWillReceiveProps: function(nextProps) {
          this.setState({
            likesIncreasing: nextProps.likeCount > this.props.likeCount
          });
        }
      ```
    * shouldComponentUpdate————判断组件是否需要更新
      组件接收到新属性或状态时执行，初始渲染及调用forceUpate时不执行
      通过比较this.props与nextProps 及this.state与nextState，如果确定新属性、状态无需更新组件，则可以返回false。
      ```js
        componentWillReceiveProps: function(nextProps) {
          this.setState({
            likesIncreasing: nextProps.likeCount > this.props.likeCount
          });
        }
      ```
      如果shouldComponentUpdate返回false，此次更新的将跳过render，此外，componentWillUpdate和componentDidUpdate默认返回true,以保证组件渲染和状态同步
    
    * componentWiilUpdate ————组件即将更新
      不能再此方法里使用this.setState()，如果需要更新状态以响应属性变化，使用componentWillReceiveProps代替
    
    * componentDidUpate ————组件更新完成

### 组件卸载
    * componnetUnMount ——-组件即将卸载
    
 总结：可能会造成重复渲染的地方就不要使用setState
     1. didMount：此处执行setState会导致组件在初始化的时候就触发更新，渲染两遍，应该尽量避免
     2. shoudlUpate 和 willUpdate 此处执行setState会造成循环调用， 禁止使用
     3. didUpate 此处执行setState同样会导致更新完又要在更新，进入死循环，应该尽量避免
     4. willReceive 由于只有props变化才会触发，故可以使用

### 相关文档
    * [16.3之后生命周期](https://zhuanlan.zhihu.com/p/38030418)
