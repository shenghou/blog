
# Refs提供了一种方式，用于访问在render方法中 创建DOM节点或React元素。

在典型的React数据流中，props是父子组件交互的唯一方式，要修改子组件，一般是使用新的props重新渲染，但是在某些情况下你可能需要在典型数据流外强制修改子组件，而子组件既可以是React组件的实例，也可以是DOM元素。

一般适用于以下场景：
* 处理焦点、文本选择或者媒体控制
* 触发强制动画
* 第三方DOM库文件

如果可以通过声明的方式实现则尽量避免使用refs

### 创建：
refs通过createRef()的方式创建，通过ref属性来获得React元素，在构建组件的时候，refs通常被赋值给实例的一个属性，这样你可以在组件中任意一处使用
```jsx
  class RefComponent extendsd React.Compone {
    constructor(props) {
      super (props)
      this.myRef = React.createRef();
    }
    render() {
      return <div ref={this.myRef} />
    }
   }
```
### 访问：
当一个ref属性被传递给一个render 函数中的元素时，可以使用ref中的current属性对节点的引用进行访问
```js
  const node = this.myRef.current:
```
### 注意事项
* ref的值取决于节点的类型：
  当ref属性被用于一个普通的html元素之，则底层DOM元素将作为current属性以创建
  当ref属性被用于一个自定义类组件时候,组件已挂载的实例将作为它的current
* 注意函数式组件没有实例不能使用ref属性(不能再无状态组件中使用ref)
* 可以在函数值组件内部使用ref，只要ref指向的是一个DOM元素或者class组件

### eg：为DOM元素添加ref,在组件加载时候将DOM元素传入current属性，在卸载时则会改为null,ref的更新会发生在commponetDidMount 或 componentDidUpdata之前
```jsx
  class CustomTextInput extends React.Component {
  constructor(props) {
    super(props);
    // 创建 ref 存储 textInput DOM 元素
    this.textInput = React.createRef();
    this.focusTextInput = this.focusTextInput.bind(this);
  }

  focusTextInput() {
    // 直接使用原生 API 使 text 输入框获得焦点
    // 注意：通过 "current" 取得 DOM 节点
    this.textInput.current.focus();
  }

  render() {
    // 告诉 React 我们想把 <input> ref 关联到构造器里创建的 `textInput` 上
    return (
      <div>
        <input
          type="text"
          ref={this.textInput} />

          
        <input
          type="button"
          value="Focus the text input"
          onClick={this.focusTextInput}
        />
      </div>
    );
  }
}
```

### eg:为类组件添加ref
```jsx
class AutoFocusTextInput extends React.Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();
  }

  componentDidMount() {
    this.textInput.current.focusTextInput();
  }

  render() {
    return (
      <CustomTextInput ref={this.textInput} />
    );
  }
}
```

### eg:函数式组件（错误的实例）
```jsx
function MyFunctionalComponent() {
  return <input />;
}

class Parent extends React.Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();
  }
  render() {
    // 这将 *不会* 工作！MyFunctionalComponent是一个函数式组件
    return (
      <MyFunctionalComponent ref={this.textInput} />
    );
  }
}
  
```
### eg：函数式组件（正确示例=>内部使用）
```jsx
function CustomTextInput(props) {
  // 这里必须声明 textInput，这样 ref 回调才可以引用它
  let textInput = null;

  function handleClick() {
    textInput.focus();
  }

  return (
    <div>
      <input
        type="text"
        ref={(input) => { textInput = input; }} />

      <input
        type="button"
        value="Focus the text input"
        onClick={handleClick}
      />
    </div>
  );  
}
```

### 对父组件暴露DOM节点
在某些情况下，你可能希望从父组件访问子节点的DOM节点，通常不建议这样做，因为这样会破坏子组件的封装，但在一些触发焦点或者测量子DOM节点的大小或者位置时候会用到。

虽然可以向子组件添加ref属性，但是因为只能获取子组件实例而不是DOM节点，并且在函数式组件上是无效的。

在react16.3以上版本中，使用ref转发(`forward`)可以使组件可以像暴露自己的ref一样暴露子组件的ref

## 回调refs
ref也支持另一种设置ref的方式，称为回调ref,不同于createRef()创建ref属性，你会传递一个函数，这个函数接受React组件的实例或HTML DOM元素作为参数，以存储他们并使他们被其他地方访问。可以优雅在组件销毁时回收变量, ref中的回调函数会在对应的普通组件componentDidMount，ComponentDidUpdate之前; 或者componentWillUnmount之后执行，componentWillUnmount之后执行时，callback接收到的参数是null。

* 弊端
通常为了绑定一个组件（元素）实例到当前实例上需要写一个函数，代码结构上看起来很冗余，为了一个变量，使用一个函数去绑定，每一个绑定组件（元素）都需要一个方法处理，大材小用

eg:使用ref回调函数
```jsx
class CustomTextInput extends React.Component {
  constructor(props) {
    super(props);

    this.textInput = null;

    this.setTextInputRef = element => {
      this.textInput = element;
    };

    this.focusTextInput = () => {
      // 直接使用原生 API 使 text 输入框获得焦点
      if (this.textInput) this.textInput.focus();
    };
  }

  componentDidMount() {
    // 渲染后文本框自动获得焦点
    this.focusTextInput();
  }

  render() {
    // 使用 `ref` 的回调将 text 输入框的 DOM 节点存储到 React
    // 实例上（比如 this.textInput）
    return (
      <div>
        <input
          type="text"
          ref={this.setTextInputRef}
        />
        <input
          type="button"
          value="Focus the text input"
          onClick={this.focusTextInput}
        />
      </div>
    );
  }
}
```
### 问题一：input参数是哪里来的
当我们在DOM Element中使用ref时，回调函数将接收当前的DOM元素作为参数，然后存储一个指向这个DOM元素的引用。那么在示例代码中，我们已经把input元素存储在了this.textInput中，在focus函数中直接使用原生DOM API实现focus聚焦。
### 问题二：回调函数什么时候被调用：
组件挂载后和卸载后以及ref属性本身变化时候

可以在组件间传递回调形式的refs，就像你可以传递通过React.createRef()创建的对象refs一样。
```jsx
function CustomTextInput(props) {
  return (
    <div>
      <input ref={props.inputRef} />
    </div>
  );
}

class Parent extends React.Component {
  render() {
    return (
      <CustomTextInput
        inputRef={el => this.inputElement = el}
      />
    );
  }
}
  
```
在上面的例子中，parent传递给它的ref回调函数最为inputRef传递给CustomTextInput，然后CustomTextInput通过ref属性将其传递给<input>,最终Parent中的this.inputElement将被设置为与CustomTextInput中的Input元素相对应的DOM节点

### createRef vs callback ref
对比新的 createRef 与 callback ref，并没有压倒性的优势，只是希望成为一个便捷的特性，在性能上会会有微小的优势，callback ref 采用了组件 render 过程中在闭包函数中分配 ref 的模式，而 createRef 则采用了 object ref。
createRef 显得更加直观，类似于 string ref，避免了 callback ref 的一些理解问题，对于 callback ref 我们通常会使用内联函数的形式，那么每次渲染都会重新创建，由于 react 会清理旧的 ref 然后设置新的（见下图，commitDetachRef -> commitAttachRef），因此更新期间会调用两次，第一次为 null，如果在 callback 中带有业务逻辑的话，可能会出错，当然可以通过将 callback 定义成类成员函数并进行绑定的方式避免
```jsx
  class App extends React.Component {
  state = {
    a: 1,
  };
  
  componentDidMount() {
    this.setState({
      a: 2,
    });
  }
  
  render() {
    return (
      <div ref={(dom) => {
        // 输出 3 次
        // <div data-reactroot></div>
        // null
        // <div data-reactroot></div>
        console.log(dom);
      }}></div>
    );
  }
}

class App extends React.Component {
  state = {
    a: 1,
  };

  constructor(props) {
    super(props);
    this.refCallback = this.refCallback.bind(this);
  }
  
  componentDidMount() {
    this.setState({
      a: 2,
    });
  }

  refCallback(dom) {
    // 只输出 1 次
    // <div data-reactroot></div>
    console.log(dom);
  }
  
  render() {
    return (
      <div ref={this.refCallback}></div>
    );
  }
}

```


### Refs 传递：
* 额外参数传递 将父组件ref作为一个props传入，在子组件显示调用
```jsx
class Sub extends Component{
    render(){
        const {forwardRef} = this.props;
        return <div ref={forwardRef}/>
    }
}
class Sup extends Component{
    subRef = React.createRef();
    render(){
        return <Sub forwardRef={this.subRef}/>
    }
}
```


### `React.forwardRef`  这种方式对于使用组件者来说，ref是透明的，不需要额外定一个props传入，直接传递到了下级组件，作为高阶组件封装时，这样做更加友好.
```jsx
  class Sub extends Component{
    render(){
        const {forwardRef} = this.props;
        return <div ref={forwardRef}/>
    }
}

function forwardRef(props, ref){
    return <Sup {...props} forwardRef={ref}/>
}
// 为了devtool中展示有意义的组件名称
forwardRef.displayName=`forwardRef-${Component.displayName||Component.name}`

const XSub = React.forwardRef(forwardRef);

class Sup extends Component{
    _ref=(el)=>{this.subEl =el};
    render(){
        return <XSub ref={this._ref}/>
    }
}
```


## 分析：
### ref在何时被赋值
在源码中有两个方法commitAttachRef 挂载实例，commitDetachRef 卸载实例。commitAttachRef当组件渲染完毕(componentDidMount/comonentDidUpdate)后被执行； commitDetachRef 则在组件或元素被销毁前执行(componentWillUnmount之前)，清理引用 

### 挂载: 
如果是方法直接执行并传入实例，否则就是采用createRef创建的对象，作为挂在点

### 卸载
方法被传入null值，createRef方式就将current赋值null，因此我们在使用函数模式时要注意传入null时需要清理引用，有的场景我们会将多个实例绑定到一个同一个对象或数组上。


参考文章
* [https://react.docschina.org/docs/refs-and-the-dom.html#callback-refs](https://react.docschina.org/docs/refs-and-the-dom.html#callback-refs) 
* [https://imweb.io/topic/5b6136a06025939b125f45ff](https://imweb.io/topic/5b6136a06025939b125f45ff)
