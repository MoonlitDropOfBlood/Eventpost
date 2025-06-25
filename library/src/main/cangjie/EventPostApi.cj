/**
 * Created on 2025/6/25
 */
package eventpost_native

import ohos.ark_interop.*
import ohos.ark_interop_macro.*

@Interop[ArkTS]
public func set(eventName: String, eventData: String): Unit {
    StickyEvent.getInstance().map.put(eventName, eventData)
}

@Interop[ArkTS]
public func get(eventName: String): Option<String> {
    return StickyEvent.getInstance().map.get(eventName)
}

// 定义互操作函数，该函数参数类型必须为(JSContext,JSCallInfo)，返回值类型必须为JSValue
func register(context: JSContext, callInfo: JSCallInfo): JSValue {
    // 从JSCallInfo获取参数列表
    let arg0: JSValue = callInfo[0]
    let arg1: JSValue = callInfo[1]
    Dispatch.getInstance().on(context, arg0.asFunction(), arg1.asObject())
    // 返回 JSValue
    return context.undefined().toJSValue()
}

func unRegister(context: JSContext, callInfo: JSCallInfo):JSValue {
    let arg0: JSValue = callInfo[0]
    Dispatch.getInstance().off(arg0.asObject())
    // 返回 JSValue
    return context.undefined().toJSValue()
}

func emit(context:JSContext,callInfo:JSCallInfo):JSValue {
    let arg0: JSValue = callInfo[0]
    let arg1: JSValue = callInfo[1]
    Dispatch.getInstance().emit(arg0.asArray(), arg1.asObject())
	 // 返回 JSValue
    return context.undefined().toJSValue()
}

// 必须注册该函数到JSModule中
let EXPORT_MODULE = JSModule.registerModule {
    runtime, exports => exports["register"] = runtime.function(register).toJSValue()
    exports["unRegister"] = runtime.function(unRegister).toJSValue()
    exports["emit"] = runtime.function(emit).toJSValue()
}
