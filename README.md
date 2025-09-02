# EventPost

## 简介
[![openHarmony](https://img.shields.io/badge/openharmony-v2.1.2-brightgreen)](https://gitee.com/Duke_Bit/eventpost/releases/tag/v2.1.2)

EventPost是一款消息总线，具有生命周期感知能力，支持Sticky。

- 支持Sticky消息；
- 支持在组件初始化完成时自动注册
- 支持组件销毁时自动注销，防止内存泄漏；

## 下载安装

````
ohpm install eventpost
````

OpenHarmony ohpm
环境配置等更多内容，请参考[如何安装 OpenHarmony ohpm 包](https://gitee.com/openharmony-tpc/docs/blob/master/OpenHarmony_har_usage.md)

## 使用说明

### 可选初始化

```typescript
import { EventPost } from "eventpost";

EventPost.setAllSticky(true | false)

```

### 注册订阅者

```typescript
import { EventPost } from "eventpost";

EventPost.getDefault().on("msgId", (arg1:object, arg2:object) => {
})
```

- 使用限制，不添加callThis 则this指向 undefined 添加callThis,则this指向callThis

```
import {Subscriber} from "eventpost";

@Component
struct NextPage {
  
  build(){
    ...
  }
  
  @Subscriber("msgId")
  onMsg(arg1:object,arg2:object){
  }
}
```

在组件中使用onFromComponent

```typescript
import { EventPost } from "eventpost";

EventPost.getDefault().onFromComponent("msgId", this, (arg1:object, arg2:object) => {
})
```

- 三种注册方式任性其一，onFromComponent 和装饰器均能感知组件生命周期
- 使用on的方法注册的话，需要自行off防止内存泄漏

### 发送消息

```typescript
import { EventPost } from "eventpost";

EventPost.getDefault().post("msgId", "arg1", { params1: "bbb" })

```

## 接口说明

### EventPost

| 方法名             | 入参                               | 接口描述                                     |
|:----------------|:---------------------------------|:-----------------------------------------|
| setAllSticky    | boolean                          | 配置基础消息发送是否为粘性事假，默认为粘性，跨线配置非粘性，则每个线程均要初始化 |
| on              | string,function,sticky,callThis  | 注册订阅方法，并配置是否支持粘性                         |
| onFromComponent | string,component,function,sticky | 注册订阅方法，并配置是否支持粘性，仅支持组件内注册，能够自动反注册        |           |
| off             | string,function                  | 反注册订阅方法                                  |
| once            | string,function,callThis         | 注册一次性订阅方法                                |
| post            | string,...args:any[]             | 发送消息（受配置影响）                              |
| postStick       | string,...args:any[]             | 发送粘性消息                                   |
| postNormal      | string,...args:any[]             | 发送非粘性消息                                  |
| getTypeValue    | string                           | 获取当前粘性事件                                 |

### Subscriber 装饰器

|   接口名    | 功能描述描述 |
|:--------:|:------:|
| TypeName |  消息ID  |
|  sticky  | 是否支持粘性 |

## 约束与限制

在下述版本验证通过：

DevEco Studio: 5.0.5.315, SDK: HarmonyOS 5.0.1 Release Ohos_sdk_public 5.0.1.115 (API Version 13 Release)

## 目录结构

````
|---- eventpost
|     |---- AppScrope  # 示例代码文件夹
|     |---- entry  # 示例代码文件夹
|     |---- examples # 示例代码文件夹  
|     |---- library # eventpost库文件夹  
|           |---- build  # eventpost模块打包后的文件
|           |---- src/main/ets/eventpost # EventPost主入口
|           |---- index.ets  # 对外接口     
|     |---- README.md  # 安装使用方法
|     |---- CHANGELOG.md  # 更新日志
````

## 贡献代码

使用过程中发现任何问题都可以提 [Issue](https://gitee.com/Duke_Bit/eventpost/issues)
给我，当然，我也非常欢迎你给我发 [PR](https://gitee.com/Duke_Bit/eventpost) 。

## 开源协议

本项目基于 [MIT license](https://gitee.com/Duke_Bit/eventpost/blob/master/LICENSE) ，请自由地享受和参与开源。

## 其他库

- [@duke/logan-ext](https://ohpm.openharmony.cn/#/cn/detail/@duke%2Flogan-ext) Logan扩展库，方便开箱即用: [https://gitee.com/Duke_Bit/logan](https://gitee.com/Duke_Bit/logan)
- [@duke/logan](https://ohpm.openharmony.cn/#/cn/detail/@duke%2Flogan) Logan是一个为OpenHarmony开发的日志库，对美团技术团队的Logan的鸿蒙化移植版本: [https://gitee.com/Duke_Bit/logan](https://gitee.com/Duke_Bit/logan)
- [@duke/websocket-client](https://ohpm.openharmony.cn/#/cn/detail/@duke%2Fwebsocket-client)
  WebSocket库解决官方API的一些bug问题: [https://gitee.com/Duke_Bit/websocket](https://gitee.com/Duke_Bit/websocket)
- [@duke/component-lifecycle](https://ohpm.openharmony.cn/#/cn/detail/@duke%2Fcomponent-lifecycle) 鸿蒙版本的Lifecycle库，支持组件、Router和Navigation: [https://gitee.com/Duke_Bit/component-lifecycle](https://gitee.com/Duke_Bit/component-lifecycle)
- [@duke/elf-dialog](https://ohpm.openharmony.cn/#/cn/detail/@duke%2Felf-dialog) CustomDialog黑魔法 不依赖promptAction 实现的函数级弹窗，省去复杂的模版代码，让你专注于你的业务，一行代码搞定弹窗: [https://gitee.com/Duke_Bit/elf-dialog](https://gitee.com/Duke_Bit/elf-dialog)
- [@duke/elf-refresh](https://ohpm.openharmony.cn/#/cn/detail/@duke%2Felf-refresh) OpenHarmony 刷新组件，支持下拉刷新和上拉加载更多，支持各种组件，List、Grid，支持header，footer，目标打造HarmonyOS的SmartRefreshLayout: [https://gitee.com/Duke_Bit/ElfRefresh](https://gitee.com/Duke_Bit/ElfRefresh)