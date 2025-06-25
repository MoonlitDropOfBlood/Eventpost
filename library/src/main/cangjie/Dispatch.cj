/**
 * Created on 2025/6/23
 */
package eventpost_native

import ohos.ark_interop.*
import ohos.ark_interop_macro.*
import std.collection.ArrayList
import std.collection.HashMap
import encoding.json.JsonObject
import encoding.json.ToJson
import encoding.json.JsonValue
import std.unittest.json
import encoding.json.JsonKind
import encoding.json.JsonArray
import encoding.json.JsonString
import encoding.json.JsonBool
import encoding.json.JsonFloat
import encoding.json.JsonNull
import std.sync.ReentrantMutex

public class Dispatch {
    private let list: ArrayList<EventObverser>
    private static let mIns: Dispatch
    private let mtx: ReentrantMutex

    static init() {
        mIns = Dispatch()
    }

    public static func getInstance(): Dispatch {
        return mIns
    }

    private init() {
        list = ArrayList()
        mtx = ReentrantMutex()
    }

    public func on(context: JSContext, callback: JSFunction, callThis: JSObject): Unit {
        mtx.lock()
        var isAdd = false
        for (it in list) {
            if (it.callThis.toJSValue().strictEqual(callThis.toJSValue())) {
                isAdd = true
            }
        }
        if (!isAdd) {
            this.list.append(EventObverser(context, callback, callThis))
        }
        mtx.unlock()
    }

    public func off(callThis: JSObject): Unit {
        mtx.lock()
        list.removeIf {it => it.callThis.toJSValue().strictEqual(callThis.toJSValue())}
        mtx.unlock()
    }

    public func emit(message:JSArray,currentObj:JSObject) {
        if(list.size <= 1){//大多数情况下只有主线程有注册，针对这种情况，就不进行序列化转发其他线程的操作减少内存消耗
            return
        }
    	let messageStr = serializable(message)
        for(it in list){
            if(it.callThis.toJSValue().strictEqual(currentObj.toJSValue())){
                continue
            }
            it.context.postJSTask{
                it.callback.call(deserializable(it.context,messageStr).toJSValue(), it.callThis.toJSValue())
            }
        }
    }

    private func serializable(jsValue: JSArray): String {
        let array = ArrayList<JsonValue>()
        let size = jsValue.size
        for (i in 0..size) {
            let it = jsValue[i]
            array.append(toJson(it))
        }
        return JsonArray(array).toJsonString()
    }

    private func toJson(jsValue: JSValue): JsonValue {
        let typeOf = jsValue.typeof()
        if (jsValue.isNumber()) {
            return JsonFloat(jsValue.toNumber())
        } else if (jsValue.isString()) {
            return JsonString(jsValue.toString())
        } else if (jsValue.isBoolean()) {
            return JsonBool(jsValue.toBoolean())
        } else if (jsValue.isObject()) {
            let obj = jsValue.asObject()
            let keys = obj.keys()
            let map = HashMap<String, JsonValue>()
            for (key in keys) {
                map.put(key, toJson(obj.getProperty(key)))
            }
            return JsonObject(map)
        } else if (jsValue.isArray()) {
            let array = ArrayList<JsonValue>()
            let jsArr: JSArray = jsValue.asArray()
            let size = jsArr.size
            for (i in 0..size) {
                let it = jsArr[i]
                array.append(toJson(it))
            }
            return JsonArray(array)
        }
        return JsonNull()
    }

    private func deserializable(context: JSContext, target: String): JSArray {
        let array: ArrayList<JSValue> = ArrayList()
        let json = JsonValue.fromStr(target).asArray()
        let size = json.size()
        for (i in 0..size) {
            let it = json.get(i).getOrThrow()
            array.append(this.toObj(context, it))
        }
        return context.array(array.toArray())
    }

    private func toObj(context: JSContext, json: JsonValue): JSValue {
        let kind: JsonKind = json.kind()
        match (kind) {
            case JsonKind.JsObject =>
                let jsonObject = json.asObject().getFields()
                let obj = context.object()
                for ((key, value) in jsonObject) {
                    obj.setProperty(key.toString(), this.toObj(context, value))
                }
                return obj.toJSValue()
            case JsonKind.JsArray =>
                let jsonArray = json.asArray()
                let array: ArrayList<JSValue> = ArrayList()
                let size = jsonArray.size()
                for (i in 0..size) {
                    let it = jsonArray.get(i).getOrThrow()
                    array.append(this.toObj(context, it))
                }
                return context.array(array.toArray()).toJSValue()
            case JsonKind.JsFloat => return json.asFloat().getValue().toJSValue(context)
            case JsonKind.JsString => return json.asString().getValue().toJSValue(context)
            case JsonKind.JsBool => return json.asBool().getValue().toJSValue(context)
            case JsonKind.JsNull => return context.null().toJSValue()
            case JsonKind.JsInt => return json.asInt().getValue().toJSValue(context)
        }
    }
}

public struct EventObverser {
    let context: JSContext
    let callback: JSFunction
    let callThis: JSObject

    init(context: JSContext, callback: JSFunction, callThis: JSObject) {
        this.context = context
        this.callback = callback
        this.callThis = callThis
    }
}
