* hoc是react中对组件逻辑进行重用的高级技术，但高阶组件本身并不是ReactAPI.它只是一种模式，这种模式是由react自身的组合性质必然产生的。

## hoc就是一个函数，且该函数接受一个组件作为参数，并返回一个新的组件
```js
  const EnhancedComponent = higherOrderComponent(WrappedComponent);
```
对比组件将props属性转变成UI，高阶组件则是将一个组件转换成另一个新组件。
例如有两个组件 `CommentList`和`BlogPost`组件，虽然并不相同，但大部分逻辑都是基于数据获取内容，即可以创建一个高阶组件来包裹这两个组件
```js
  const CommentListWithSubscription = withSubscription(
    CommentList,
    (DataSource) => DataSource.getComments()
  );
  const BlogPostWithSubscription = withSubscription(
    BlogPost,
    (DataSource, props) => DataSource.getBlogPost(props.id)
  );
```
第一个参数是包裹组件（wrapped component），第二个参数会从DataSource和当前props属性中检索应用需要的数据
当 CommentListWithSubscription 和 BlogPostWithSubscription 渲染时, 会向CommentList 和 BlogPost 传递一个 data props属性，该 data属性的数据包含了从 DataSource 检索的最新数据：

### 注意 不要在高阶组件内部修改（或以其它方式修改）原组件的原型属性
```jsx
  function logProps(InputComponent) {
    InputComponent.prototype.componentWillReceiveProps(nextProps) {
      console.log('Current props: ', this.props);
      console.log('Next props: ', nextProps);
    }
    // 我们返回的原始组件实际上已经
    // 被修改了。
    return InputComponent;
  }

  // EnhancedComponent会记录下所有的props属性
  const EnhancedComponent = logProps(InputComponent);
```
上面的示例有一些问题。首先就是，input组件不能够脱离增强型组件（enhanced component）被重用。更关键的一点是，如果你用另一个高阶组件来转变 EnhancedComponent ，同样的也去改变 componentWillReceiveProps 函数时，第一个高阶组件（即EnhancedComponent）转换的功能就会被覆盖。这样的高阶组件（修改原型的高阶组件）对没有生命周期函数的无状态函数式组件也是无效的。

### 约定
* 将不相关的props属性传递给包裹组件
高阶组件给组件添加新特性。他们不应该大幅修改原组件的接口（译者注：应该就是props属性）。预期，从高阶组件返回的组件应该与原包裹的组件具有类似的接口。

高阶组件应该传递与它要实现的功能点无关的props属性。大多数高阶组件都包含一个如下的render函数：
```jsx
  render() {
    // 过滤掉与高阶函数功能相关的props属性，
    // 不再传递
    const { extraProp, ...passThroughProps } = this.props;

    // 向包裹组件注入props属性，一般都是高阶组件的state状态
    // 或实例方法
    const injectedProp = someStateOrInstanceMethod;

    // 向包裹组件传递props属性
    return (
      <WrappedComponent
        injectedProp={injectedProp}
        {...passThroughProps}
      />
    );
  }
```
* 最大化使用组合
并不是所有的高阶组件看起来都是一样的。有时，它们仅仅接收一个参数，即包裹组件：
```jsx
  const NavbarWithRouter = withRouter(Navbar);
```
一般而言，高阶组件会接收额外的参数。在下面这个来自Relay的示例中，可配置对象用于指定组件的数据依赖关系：
```jsx
  const CommentWithRelay = Relay.createContainer(Comment, config);
```

大部分常见高阶组件的函数签名如下所示：
```jsx
  // React Redux's `connect`
  const ConnectedComment = connect(commentSelector, commentActions)(Comment);
```

这是什么？！ 如果你把它剥开，你就很容易看明白到底是怎么回事了。
```jsx
  // connect是一个返回函数的函数（译者注：就是个高阶函数）
  const enhance = connect(commentListSelector, commentListActions);
  // 返回的函数就是一个高阶组件，该高阶组件返回一个与Redux store
  // 关联起来的新组件
  const ConnectedComment = enhance(CommentList);
```
换句话说，connect 是一个返回高阶组件的高阶函数！

这种形式有点让人迷惑，有点多余，但是它有一个有用的属性。那就是，类似 connect 函数返回的单参数的高阶组件有着这样的签名格式， Component => Component.输入和输出类型相同的函数是很容易组合在一起。
```jsx
  // 不要这样做……
  const EnhancedComponent = withRouter(connect(commentSelector)(WrappedComponent))
  // ……你可以使用一个功能组合工具
  // compose(f, g, h) 和 (...args) => f(g(h(...args)))是一样的
  const enhance = compose(
    // 这些都是单参数的高阶组件
    withRouter,
    connect(commentSelector)
  )
  const EnhancedComponent = enhance(WrappedComponent)
  （connect函数产生的高阶组件和其它增强型高阶组件具有同样的被用作装饰器的能力。）
```
* 不要在render函数中使用高阶组件
```jsx 
  render() {
    // 每一次render函数调用都会创建一个新的EnhancedComponent实例
    // EnhancedComponent1 !== EnhancedComponent2
    const EnhancedComponent = enhance(MyComponent);
    // 每一次都会使子对象树完全被卸载或移除
    return <EnhancedComponent />;
  }
```
这里产生的问题不仅仅是性能问题 —— 还有，重新加载一个组件会引起原有组件的所有状态和子组件丢失。

相反，在组件定义外使用高阶组件，可以使新组件只出现一次定义。在渲染的整个过程中，保证都是同一个组件。无论在任何情况下，这都是最好的使用方式。

在很少的情况下，你可能需要动态的调用高阶组件。那么你就可以在组件的构造函数或生命周期函数中调用。

* 必须将静态方法做拷贝


* refs属性不能传递
一般来说，高阶组件可以传递所有的props属性给包裹的组件，但是不能传递refs引用。因为并不是像key一样，refs是一个伪属性，React对它进行了特殊处理。如果你向一个由高阶组件创建的组件的元素添加ref应用，那么ref指向的是最外层容器组件实例的，而不是包裹组件。

如果你碰到了这样的问题，最理想的处理方案就是搞清楚如何避免使用 ref。有时候，没有看过React示例的新用户在某种场景下使用prop属性要好过使用ref。

现在我们提供一个名为 React.forwardRef 的 API 来解决这一问题

相关文章
* [属性代理和反向继承角度](https://juejin.im/post/5914fb4a0ce4630069d1f3f6)
* [属性代理和反向继承角度](https://zhuanlan.zhihu.com/p/24776678)
* [实现角度](https://imweb.io/topic/5907038a2739bbed32f60dad)

