# EventPost

## 简介

EventPost是一款消息总线，具有生命周期感知能力，支持Sticky。

- 支持Sticky消息；
- 支持组件销毁时自动注销，防止内存泄漏；

## 下载安装

````
ohpm install eventpost
````

OpenHarmony ohpm
环境配置等更多内容，请参考[如何安装 OpenHarmony ohpm 包](https://gitee.com/openharmony-tpc/docs/blob/master/OpenHarmony_har_usage.md)

## 使用说明

### 注册订阅者

```typescript
import { EventPost } from "eventpost";

EventPost.getDefault().on("msgId", (arg1:object, arg2:object) => {
})
```

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

- 目前仅在使用装饰器的情况下能够感知组件生命周期
- 使用on的方法注册的话，需要自行off防止内存泄漏

### 发送消息

```typescript
import { EventPost } from "eventpost";

EventPost.getDefault().post("msgId", "arg1", { params1: "bbb" })

```

## 接口说明

### EventPost

| 方法名  | 入参                     | 接口描述             |
|:-----|:-----------------------|:-----------------|
| on   | string,function,sticky | 注册订阅方法，并配置是否支持粘性 |
| off  | string,function        | 反注册订阅方法          |
| once | string,function        | 注册一次性订阅方法        |
| post | string,...args:any[]   | 发送消息             |

### Subscriber 装饰器

|   接口名    | 功能描述描述 |
|:--------:|:------:|
| TypeName |  消息ID  |
|  sticky  | 是否支持粘性 |

## 约束与限制

在下述版本验证通过：

DevEco Studio: 4.1.3.700, SDK: API11 DP2 (B.0.73)

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