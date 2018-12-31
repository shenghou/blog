
### Refs提供了一种方式，用于访问在render方法中 创建DOM节点或React元素。

在典型的React数据流中，props是父子组件交互的唯一方式，要修改子组件，一般是使用新的props重新渲染，但是在某些情况下你可能需要在典型数据流外强制修改子组件，而子组件既可以是React组件的实例，也可以是DOM元素。

一般适用于以下场景：
* 处理焦点、文本选择或者媒体控制
* 触发强制动画
* 第三方DOM库文件

如果可以通过声明的方式实现则尽量避免使用refs

创建：
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
访问：
当一个ref属性被传递给一个render 函数中的元素时，可以使用ref中的current属性对节点的引用进行访问
```js
  const node = this.myRef.current:
```
ref的值取决于节点的类型：
* 当ref属性被用于一个普通的html元素之，则底层DOM元素将作为current属性以创建
* 当ref属性被用于一个自定义类组件时候,组件已挂载的实例将作为它的current
* 注意函数式组件没有实例不能使用ref属性
* 可以在函数值组件内部使用ref，只要ref指向的是一个DOM元素或者class组件

eg：为DOM元素添加ref,在组件加载时候讲DOM元素传入current属性，在卸载时则会改为null,ref的更新会发生在commponetDidMount 或 componentDidUpdata之前
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

eg:为类组件添加ref
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

eg:函数式组件（错误的实例）
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
eg：函数式组件（正确示例=>内部使用）
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

## 对父组件暴露DOM节点
在某些情况下，你可能希望从父组件访问子节点的DOM节点，通常不建议这样做，因为这样会破坏租组件的封装，但在异乡触发焦点或者测量子DOM节点的大小或者位置时候会用到。

虽然可以向子组件添加ref属性，但是因为只能获取子组件实例而不是DOM节点，并且在函数式组件上是无效的。

在react16.3以上版本中，使用ref转发可以使组件可以像暴露自己的ref一样暴露子组件的ref

## 回调refs
ref也支持另一种设置ref的方式，称为回调ref,不同于createRef()创建ref属性，你会传递一个函数，这个函数接受React组件的实例或HTML DOM元素作为参数，以存储他们并使他们被其他地方范文。

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

可以在组件间传递回调形式的







