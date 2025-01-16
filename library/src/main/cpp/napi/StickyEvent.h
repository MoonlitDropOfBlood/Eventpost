#include "napi/native_api.h"
#include <string>

namespace EventPost {
class StickyEvent {
public:
    StickyEvent(napi_env pEnv);
    StickyEvent(napi_env pEnv, napi_ref pRef);
    ~StickyEvent();
    static napi_value JsConstructor(napi_env env, napi_callback_info info);
    static napi_value set(napi_env env, napi_callback_info info);
    static napi_value get(napi_env env, napi_callback_info info);
    static napi_ref sJSConstructor_;                                      // 生命周期变量
    static void Destructor(napi_env env, void *nativeObject, void *finalize); // 释放资源的函数(类似类的析构函数)

private:
    static std::string _msg; // 设置和获取数据的变量
    napi_env mEnv = nullptr; // 记录环境变量
    napi_ref mRef = nullptr; // 记录生命周期变量
};
}