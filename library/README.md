# EventPost

## 简介

HRouter 路由解决方案 解决HSP路由跳转负责的问题 可以在各个page中进行跳转
参考了
[Arouter](https://gitee.com/openharmony-tpc/arouter-api-onActivityResult)及
[ARouter](https://github.com/alibaba/ARouter)的实现方案，在此特地感谢。

- 支持页面间路由跳转；
- 支持带参数跳转及回调；
- 支持配置跳转拦截器；
- 支持预处理跳转与否。

## 下载安装

````
ohpm install hrouter
````

OpenHarmony ohpm
环境配置等更多内容，请参考[如何安装 OpenHarmony ohpm 包](https://gitee.com/openharmony-tpc/docs/blob/master/OpenHarmony_har_usage.md)

## 使用说明

### 基础配置

#### 注册插件

hvigor/hvigor-config.json5 中添加插件依赖

```
"dependencies": {
    "@ohos/hvigor-ohos-plugin": "4.1.2",
    "hrouter-compiler": "1.1.0"
},
```

entry/hvigorfile.ts 注册插件

```
import { hapTasks } from '@ohos/hvigor-ohos-plugin';
import { hRouterPlugin } from "hrouter-compiler";

export default {
system: hapTasks,  /* Built-in plugin of Hvigor. It cannot be modified. */
plugins:[hRouterPlugin()]         /* Custom plugin to extend the functionality of Hvigor. */
}
```

#### 初始化SDK

建议在AbilityStage中进行初始化

```
import { AbilityStage } from '@kit.AbilityKit';
import { HRouter } from 'hrouter';


export default class MyAbilityStage extends AbilityStage{


  onCreate(): void {
    HRouter.getInstance().init(this.context)
  }

}
```

### 注册路由

正常创建page页面 然后如下所示，添加routerName 如下所示

```
@Entry({routeName:"index"})
```

- 目前版本不支持路由是单引号
- 目前版本不支持正则路由

### 路由跳转

#### 1.不传参跳转

HRouter.getInstance()创建路由对象，使用链式调用方法 build('')配置跳转的页面，navigation() 方法进行页面跳转。

```
import {HRouter} from "hrouter";
HRouter.getInstance()
    .build("--/--")  //需要跳转的地址
    .navigation()
```

#### 2.传参跳转

在不传参跳转的基础上，跳转之前通过withParams()进行参数配置。

```
import {HRouter} from "hrouter";
HRouter.getInstance()
    .build("--/--")  //需要跳转的地址
    .withParams({index:"--"})
    .navigation()
```

#### 3.路由回调

路由回调需要配合NavigationCallback接口进行，在路由前的页面实现NavigationCallback接口

```
import {NavigationCallback} from 'hrouter'
var callback:NavigationCallback = {
    onInterrupt(postcard){},
    onArrival(postcard){},
    onLast: (postcard){},
    onFound: (postcard){}
}
```

然后将callback传入 .navigationWithCallback()中进行跳转

```
import {HRouter} from "hrouter";
HRouter.getInstance()
    .build("--")//需要跳转的地址
    .navigationWithCallback(callback)
```

在目标页面的onPageShow()生命周期中调用getPostcard()方法获取到指定的postcard

```
import router from '@ohos.router';
if (postcard == null) {
    postcard = HRouter.getInstance().getPostcard(router.getState().path + router.getState().name);
}
```

使用 postcard.getNavigationCallback() 方法调用对应的回调方法,即可回调源页面实现的方法

```
postcard.getNavigationCallback().onActivityResult(params)
```

### 路由拦截

#### 1.配置拦截器

在拦截器中的process()方法中实现页面的拦截，通过interceptorCallback.onInterrupt()中断跳转，interceptorCallback.onContinue()
继续跳转。

```
import {Postcard,IInterceptor,InterceptorCallback} from 'hrouter';
var iInterceptor:IInterceptor= {
    process(postcard:Postcard, interceptorCallback:InterceptorCallback) {
        // 选择拦截的页面,若跳转时有该路径则进行拦截提示，若没有则直接跳转
        if (Postcard.getUri() == 'pages/transit') {
            // 选择弹框
            AlertDialog.show(
                {
                    message: '被拦截了，点击继续跳转',
                    primaryButton: {
                        value: '取消',
                        action: () => {
                            // 中断跳转
                            interceptorCallback.onInterrupt(postcard)
                        }
                    },
                    secondaryButton: {
                        value: '继续',
                        action: () => {
                            // 继续跳转
                            interceptorCallback.onContinue(postcard);
                        }
                    },
                }
            )
        } else {
            // 继续跳转
            interceptorCallback.onContinue(postcard);
        }
    }
}
```

#### 2.注册拦截器

```
import {registerInterceptor} from 'hrouter';
registerInterceptor(iInterceptor);
```

#### 3.移除拦截器

```
import {unregisterInterceptor} from 'hrouter';
unregisterInterceptor()
```

#### 4.配置绿色通道

在跳转前使用.setGreenChannel()方法跳过拦截(true:跳过拦截)。

```
HRouter.getInstance()
    .build("--/--")//需要跳转的地址
    .setGreenChannel(true)
    .navigation()
```

#### 5.配置预处理跳转与否

预处理:实现 PretreatmentService 接口中 onPretreatment 方法，并返回一个Boolean值(true:继续跳转,false:不跳转)。

```
import {PretreatmentService} from 'hrouter';
var pretreatmentService:PretreatmentService = {
  onPretreatment(postcard:Postcard):boolean{
    return true
  }
}
```

在跳转前调用.setPretreatmentService() 方法，将 pretreatmentService传入 setPretreatmentService()方法中完成预处理功能。

```
HRouter.getInstance()
    .build(this.router)
    .setPretreatmentService(pretreatmentService)
    .navigationWithCallback(callback)
```

#### 6.返回到指定页面

```
HRouter.getInstance()
    .build("--")
    .back()
```

## 接口说明

### HRouter

| 方法名                    | 入参                  | 接口描述          |
|:-----------------------|:--------------------|:--------------|
| build                  | string              | 配置页面跳转路径      |
| withParams             | { }                 | 传入另一页面的参数     |
| navigation             |                     | 正常跳转          |
| navigationWithCallback | NavigationCallback  | 带回调跳转         |
| setGreenChannel        | boolean             | 配置是否为绿色通道     |
| registerInterceptor    | iInterceptor        | 注册拦截器         |
| unregisterInterceptor  |                     | 移除拦截器         |
| getNavigationCallback  |                     | 获取状态回调方法      |
| setUri                 | string              | 设置页面跳转路径      |
| getUri                 |                     | 获取跳转的页面路径     |
| getParams              |                     | 获取跳转传递的参数     |
| getTag                 |                     | 获取标签          |
| setTag                 | { }                 | 设置标签          |
| withFlags              | boolean-number      | 设置flags       |
| addFlags               | number              | 添加flags       |
| getFlags               | number              | 获得flags       |
| back                   |                     | 返回页面          |
| toString               |                     | 导出字符串         |
| setPretreatmentService | PretreatmentService | 预处理           |
| getPostcard            | 页面路径                | 找到指定的postcard |

### Flags 枚举功能

|   接口名   | 功能描述描述 |
|:-------:|:------:|
| REPLACE | 替换当前页面 |
| SINGLE  | 单实例模式  |

### 回调接口

|                接口名                 |              入参              |   接口描述   |
|:----------------------------------:|:----------------------------:|:--------:|
|    NavigationCallback.onArrival    |           Postcard           |  到达回调地   |
|   NavigationCallback.onInterrupt   |           Postcard           |   回调中断   |
|     NavigationCallback.onLast      |           Postcard           |   跳转失败   |
|     NavigationCallback.onFound     |           Postcard           | 找到路由真实地址 |
|        IInterceptor.process        | Postcard,InterceptorCallback |   拦截过程   |
|   InterceptorCallback.onContinue   |           Postcard           | 拦截器回调继续  |
|  InterceptorCallback.onInterrupt   |           Postcard           | 拦截器回调暂停  |
| PretreatmentService.onPretreatment |           Postcard           |  预处理实现   |

## 约束与限制

在下述版本验证通过：

DevEco Studio: 4.1.3.700, SDK: API11 DP2 (B.0.73)

## 目录结构

````
|---- hrouter
|     |---- AppScrope  # 示例代码文件夹
|     |---- entry  # 示例代码文件夹
|     |---- examples # 示例代码文件夹  
|     |---- library # hrouter库文件夹  
|           |---- build  # hrouter模块打包后的文件
|           |---- src/main/ets/hrouter # 路由跳转实现逻辑
|           |---- index.ets  # 对外接口    
|     |---- plugin  # 插件代码
|           |---- index.ets  # 对外接口    
|     |---- README.md  # 安装使用方法
|     |---- CHANGELOG.md  # 更新日志
````

## 贡献代码

使用过程中发现任何问题都可以提 [Issue](https://gitee.com/Duke_Bit/hrouter/issues)
给我，当然，我们也非常欢迎你给我发 [PR](https://gitee.com/Duke_Bit/hrouter) 。

## 开源协议

本项目基于 [MIT license](https://gitee.com/Duke_Bit/hrouter/blob/master/LICENSE) ，请自由地享受和参与开源。