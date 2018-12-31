* protals提供了一种很好的将子节点渲染到父组件以外的DOM节点的方式
```js
  ReactDOM.createPortal(child, container)
```
第一个参数`child`是任何可渲染的React子元素，例如一个元素，字符串或碎片，第二参数`container`则是一个DOM元素

## 用法
当你从组件的`render`方法返回一个元素，该元素仅能装配DOM节点中离其最近的父元素
```jsx
  render() {
    // React mounts a new div and renders the children into it
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
```

然而，有时候将其插入DOM节点的不同位置也是有用的：
```jsx
  render() {
    // React does *not* create a new div. It renders the children into `domNode`.
    // `domNode` is any valid DOM node, regardless of its location in the DOM.
    return ReactDOM.createPortal(
      this.props.children,
      domNode,
    );
  }
```

对于portal的一个典型用例是当父组件有overflow:hidden或者z-index样式，但你需要自组件能够在视觉山跳出容器，例如对话框，hovercards以及提示框

## 通过Portals进行事件冒泡
尽管portal可以被放置在DOM树的任何地方，但在其他方面其行为和普通的React子节点行为一致，如上下文特性依然能够如之前一样正确的工作，无论其子节点是否是portal，由于portal仍存在于React树种，而不用考虑其在DOM树中的位置

一个从portal内部会触发的事件会一直冒泡至包含React树的祖先
```html
  <html>
    <body>
      <div id="app-root"></div>
      <div id="modal-root"></div>
    </body>
  </html>
```
在 #app-root 里的 Parent 组件能够捕获到未被捕获的从兄弟节点 #modal-root 冒泡上来的事件。
```jsx
  // These two containers are siblings in the DOM
  const appRoot = document.getElementById('app-root');
  const modalRoot = document.getElementById('modal-root');

  class Modal extends React.Component {
    constructor(props) {
      super(props);
      this.el = document.createElement('div');
    }

    componentDidMount() {
      modalRoot.appendChild(this.el);
    }

    componentWillUnmount() {
      modalRoot.removeChild(this.el);
    }

    render() {
      return ReactDOM.createPortal(
        this.props.children,
        this.el,
      );
    }
  }

  class Parent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {clicks: 0};
      this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
      // This will fire when the button in Child is clicked,
      // updating Parent's state, even though button
      // is not direct descendant in the DOM.
      this.setState(prevState => ({
        clicks: prevState.clicks + 1
      }));
    }

    render() {
      return (
        <div onClick={this.handleClick}>
          <p>Number of clicks: {this.state.clicks}</p>
          <p>
            Open up the browser DevTools
            to observe that the button
            is not a child of the div
            with the onClick handler.
          </p>
          <Modal>
            <Child />
          </Modal>
        </div>
      );
    }
  }

  function Child() {
    // The click event on this button will bubble up to parent,
    // because there is no 'onClick' attribute defined
    return (
      <div className="modal">
        <button>Click</button>
      </div>
    );
  }

  ReactDOM.render(<Parent />, appRoot);
```

eg：    直接把D插入到A中
  <div A />                         <div A />
    <div B />                         <div D />
      <div C />
        <div D />
