

### 代码结构
```json
/Asset
/Bin
/Build
/Docker
/Modules
/Public
/Scripts
/Src
	/Actions              //redux action
	/Basics               //详情右侧信息字段
	/Charts-v2            //图表  hightchart
	/Charts-v2s
	/Components           //基础组件
	/Config               //前端产品配置
	/Constans             //通常常量
	/Containers           //页面级别组件
		/~~~
		/Dashboard          //主操作页面入口
		/ReaourcePage       //主要页面
		/~~~
	/Customize            //产品不同
	/Details              //产品详情页左侧，多个字段外加（日志、告警）
	/Fields               //表单组件，基本无业务逻辑
	/Forms	              //具体业务相关表单，会引用fields里表单组件
	/Forms-v2	            //
	/Hocs                 //高阶组件
	/Images              
	/Lamb                 //ui 组件库
	/Locale               //i18
	/Reducers             //reducer
	/Redux-demon	        //demon api 相关
	/Routes	              //页面路由相关
	/Selectors	          //license sku
	/Statistics	          
	/Store	              //store
	/Style	              
	/Toolbars	            //core  默认表格页面表头，pushModal
	/Utils	              //工具函数
	/Index.js             //mainPage
/Stories                
/Test                   
```
/Index.js             //mainPage操作
整个项目数据流向图如下

当有用户行为时会产生数据的改变，此类改变变会通过dispatch发起action，最终通过reducer改变数据，connect作为中间桥梁作用，连接store与react，
将 store 中的数据及action作为 props 绑定到组件上。

细化到具体项目中如下所示
在index作为页面的入口文件，包裹Root组件，Root组件利用redux提供的store来存放整个页面的数据，页面通过Router来跳转至各个页面；

从 src/containers/app中可看出，页面主体由主体、通知、modal三部分组成，主要页面包括左侧导航navigation，头部topbar，页面主体（表格或部分特殊页面），
表格可进一步进去详情页，详情页进一步可以划分为面包屑导航、详情、右侧信息栏，页面主体展示信息为表格和表格详情页，头部一般用户按钮点击来push不同的modal；

modal表单包括按业务划分为form表单（src/forms），与业务逻辑不相关的组件级表单（src/fields）及重构的表单（src/forms-v2）和引用的redux表单

权限：
由于wizard属于付费产品，所以项目中针对不同的用户设置了多种产品及使用权限，在src.config中可见不同的设置，src/routes也针对性的进行使用条件控制
auth https://github.com/mjrussell/redux-auth-wrapper/tree/1.x
sku+license http://wiki.xsky.com/pages/viewpage.action?pageId=26712241

socket
在页面操作时大多会与demon进行交互，为了能实时反映到页面上添加notice进行实时通知，hoc/socket中引入PubSub.subscribe来做事件订阅处理，
pubsub https://github.com/mroderick/PubSubJS


	
