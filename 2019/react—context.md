# context通过组件树提供了一个传递数据的方法，从而避免了在每一个层级收到的传递props属性。

### eg:一般的传递——props
```jsx
  function ThemedButton(props) {
    return <Button theme={props.theme} />;
  }

  // 中间组件
  function Toolbar(props) {
    // Toolbar 组件必须添加一个额外的 theme 属性
    // 然后传递它给 ThemedButton 组件
    return (
      <div>
        <ThemedButton theme={props.theme} />
      </div>
    );
  }

  class App extends React.Component {
    render() {
      return <Toolbar theme="dark" />;
    }
  }
```

### eg:context传递
```jsx
  // 创建一个 theme Context,  默认 theme 的值为 light
const ThemeContext = React.createContext('light');

function ThemedButton(props) {
  // ThemedButton 组件从 context 接收 theme
  return (
    <ThemeContext.Consumer>
      {theme => <Button {...props} theme={theme} />}
    </ThemeContext.Consumer>
  );
}

// 中间组件
function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

class App extends React.Component {
  render() {
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}
```

## API
### React.createContext
  ```js
    const {Provider, Consumer} = React.createContext(defaultValue);
  ```
  创建一对{Provider, Consumer}，当React渲染context组件Consumer时，它将从组件树的上层中最接近的匹配的Provider读取当前的context值，
  如果上层的组件上没有一个匹配的Provider，而此时你需要渲染一个Consumer组件，那么你可以用到defaultValue
  
### Provider
  ```jsx
    <Provider value={/* some value */}>
  ```
  react 组件允许Consumers订阅context的改变
  接收一个value属性传递给Provider的后代Consumers，一个Provider可以联系到多个Consumers,Providers可以嵌套以覆盖组件树内更深层次的值。
### Consumer
  ```jsx
    <Consumer>
      {value => /* render something based on the context value */}
    </Consumer>
  ```
  一个可以订阅context变化的React组件
  接收一个函数作为子节点，函数接收当前context的值并返回一个React节点，传递给函数的value将等于组件树上层context的最近的Provider的value属性，如果context没有provider,
  那么value参数将等于被传递给createContext()的defaultValue
  
  ## 父子耦合
  经常需要从组件树中某个深度嵌套的组件中更新context，在这种情况下，可以通过context向下传递一个函数，以允许consumer更新context
  ```jsx
    theme-context.js

    // 确保默认值按类型传递
    // createContext() 匹配的属性是 Consumers 所期望的
    export const ThemeContext = React.createContext({
      theme: themes.dark,
      toggleTheme: () => {},
    });
  
    theme-toggler-button.js

    import {ThemeContext} from './theme-context';

    function ThemeTogglerButton() {
      // Theme Toggler 按钮不仅接收 theme 属性
      // 也接收了一个来自 context 的 toggleTheme 函数
      return (
        <ThemeContext.Consumer>
          {({theme, toggleTheme}) => (
            <button
              onClick={toggleTheme}
              style={{backgroundColor: theme.background}}>
              Toggle Theme
            </button>
          )}
        </ThemeContext.Consumer>
      );
    }
    export default ThemeTogglerButton
  
    app.js

    import {ThemeContext, themes} from './theme-context';
    import ThemeTogglerButton from './theme-toggler-button';

    class App extends React.Component {
      constructor(props) {
        super(props);

        this.toggleTheme = () => {
          this.setState(state => ({
            theme:
              state.theme === themes.dark
                ? themes.light
                : themes.dark,
          }));
        };
        // State 包含了 updater 函数 所以它可以传递给底层的 context Provider
        this.state = {
          theme: themes.light,
          toggleTheme: this.toggleTheme,
        };
      }

      render() {
        // 入口 state 传递给 provider
        return (
          <ThemeContext.Provider value={this.state}>
            <Content />
          </ThemeContext.Provider>
        );
      }
    }

    function Content() {
      return (
        <div>
          <ThemeTogglerButton />
        </div>
      );
    }

    ReactDOM.render(<App />, document.root);
  ```
  ## 在生命周期方法中访问conetext (将context作为一个props传递，然后像通常使用props一样去使用)
  ```jsx
    class Button extends React.Component {
      componentDidMount() {
        // ThemeContext value is this.props.theme
      }

      componentDidUpdate(prevProps, prevState) {
        // Previous ThemeContext value is prevProps.theme
        // New ThemeContext value is this.props.theme
      }

      render() {
        const {theme, children} = this.props;
        return (
          <button className={theme ? 'dark' : 'light'}>
            {children}
          </button>
        );
      }
    }

    export default props => (
      <ThemeContext.Consumer>
        {theme => <Button {...props} theme={theme} />}
      </ThemeContext.Consumer>
    );
  ```
  
  ## 在高阶组件中使用context
  ```jsx
    我们可以创建一个命名为 withTheme 高阶组件：
    const ThemeContext = React.createContext('light');
    // 在函数中引入组件
    export function withTheme(Component) {
      // 然后返回另一个组件
      return function ThemedComponent(props) {
        // 最后使用context theme渲染这个被封装组件
        // 注意我们照常引用了被添加的属性
        return (
          <ThemeContext.Consumer>
            {theme => <Component {...props} theme={theme} />}
          </ThemeContext.Consumer>
        );
      };
    }
    目前任何组件都依赖于主题 context，它们都可以很容易的使用我们创建的 withTheme 函数进行订阅。
    function Button({theme, ...rest}) {
      return <button className={theme} {...rest} />;
    }
    const ThemedButton = withTheme(Button);
  ```
  
  ## 转发 Refs  一个关于渲染属性API的问题是 refs 不会自动的传递给被封装的元素。为了解决这个问题，使用 React.forwardRef
  ```jsx
    fancy-button.js
    class FancyButton extends React.Component {
      focus() {
        // ...
      }

      // ...
    }

    // 使用 context 传递当前的 "theme" 给 FancyButton.
    // 使用 forwardRef 传递 refs 给 FancyButton 也是可以的.
    export default React.forwardRef((props, ref) => (
      <ThemeContext.Consumer>
        {theme => (
          <FancyButton {...props} theme={theme} ref={ref} />
        )}
      </ThemeContext.Consumer>
    ));
    
    app.js

    import FancyButton from './fancy-button';

    const ref = React.createRef();

    // ref属性将指向 FancyButton 组件,
    // ThemeContext.Consumer 没有包裹它
    // 这意味着我们可以调用 FancyButton 的方法就像这样 ref.current.focus()
    <FancyButton ref={ref} onClick={handleClick}>
      Click me!
    </FancyButton>;

  ```
  
  
