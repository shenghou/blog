render prop 是指一种在React组件之间使用一个值为函数的prop在react组件间共享代码的技术

* 带有render prop的组件带有一个返回一个ract元素的函数并调用该函数而不是实现自己的渲染逻辑
```jsx
  <DataProvider render={data => (
    <h1>Hello {data.target}</h1>
  )}/>
```

## 在交叉关注点使用render props
组件在React是主要的代码复用单元，但如何共享状态或一个组件的行为封装到其他需要相同状态的组件中并不是很明显

例如在web应用追踪鼠标位置的组件：
```jsx
  class MouseTracker extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.state = { x: 0, y: 0 };
  }

  handleMouseMove(event) {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  }

  render() {
    return (
      <div style={{ height: '100%' }} onMouseMove={this.handleMouseMove}>
        <h1>Move the mouse around!</h1>
        <p>The current mouse position is ({this.state.x}, {this.state.y})</p>
      </div>
    );
  }
}
```
如何在另一个组件中重用行为让其在组件间共享呢？

render prop可以提供一个带有函数prop的组件，它能够动态决定什么需要渲染，而不是硬编码塞进去，并有效地改变它的渲染结果。
```jsx
  class Cat extends React.Component {
  render() {
    const mouse = this.props.mouse;
    return (
      <img src="/cat.jpg" style={{ position: 'absolute', left: mouse.x, top: mouse.y }} />
    );
  }
}

class Mouse extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.state = { x: 0, y: 0 };
  }

  handleMouseMove(event) {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  }

  render() {
    return (
      <div style={{ height: '100%' }} onMouseMove={this.handleMouseMove}>

        {/*
          Instead of providing a static representation of what <Mouse> renders,
          use the `render` prop to dynamically determine what to render.
        */}
        {this.props.render(this.state)}
      </div>
    );
  }
}

class MouseTracker extends React.Component {
  render() {
    return (
      <div>
        <h1>Move the mouse around!</h1>
        <Mouse render={mouse => (
          <Cat mouse={mouse} />
        )}/>
      </div>
    );
  }
}
```
现在，我们提供了一个 render prop 以让 <Mouse> 能够动态决定什么需要渲染，而不是克隆 <Mouse> 组件并硬编码来解决特定的用例。

更具体地说，*render prop 是一个组件用来了解要渲染什么内容的函数 prop*。

关于 render props 一个有趣的事情是你可以使用一个带有 render props 的常规组件来实现大量的 高阶组件 (HOC)。例如，如果你更偏向于使用一个 withMouse 的高阶组件而不是一个 <Mouse> 组件，你可以轻松的创建一个带有 render prop 的常规 <Mouse> 组件的高阶组件。
```jsx
  // If you really want a HOC for some reason, you can easily
// create one using a regular component with a render prop!
function withMouse(Component) {
  return class extends React.Component {
    render() {
      return (
        <Mouse render={mouse => (
          <Component {...this.props} mouse={mouse} />
        )}/>
      );
    }
  }
}
```

相关文章：
* [rende prop](https://react.docschina.org/docs/render-props.html)
* [可代替HOC角度](https://juejin.im/post/5a3087746fb9a0450c4963a5)
* [可代替HOC角度](https://zhuanlan.zhihu.com/p/31267131)
* [设计模式角度](https://imweb.io/topic/5b46e85e16519c67408b06a3)
* [设计模式角度](https://www.jianshu.com/p/ff6b3008820a)
