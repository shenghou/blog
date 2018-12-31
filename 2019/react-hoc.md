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
* 将
