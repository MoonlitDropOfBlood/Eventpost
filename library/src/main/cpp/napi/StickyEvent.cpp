//
// Created on 2025/1/14.
//
// Node APIs are not fully supported. To solve the compilation error of the interface cannot be found,
// please include "napi/native_api.h".
#include "napi/StickyEvent.h"
#include "map/threadsafe_safe_map.h"

namespace EventPost {
const int32_t STR_DEFAULT_SIZE = 2048;
const int32_t INDEX_0 = 0;
const int32_t INDEX_1 = 1;
const int32_t INDEX_2 = 2;

const int32_t PARAM_COUNT_1 = 1;
const int32_t PARAM_COUNT_2 = 2;

napi_ref StickyEvent::sJSConstructor_ = nullptr;
const unsigned int LOG_PRINT_DOMAIN = 0XFF10;

StickyEvent::~StickyEvent() {
    if (mRef != nullptr) {
        napi_delete_reference(mEnv, mRef);
    }
};

StickyEvent::StickyEvent(napi_env pEnv) { mEnv = pEnv; };

StickyEvent::StickyEvent(napi_env pEnv, napi_ref pRef) {
    mEnv = pEnv;
    mRef = pRef;
};

napi_value StickyEvent::JsConstructor(napi_env env, napi_callback_info info) {
    napi_value undefineVar = nullptr;
    napi_value thisVar = nullptr;
    napi_get_undefined(env, &undefineVar);

    if (napi_get_cb_info(env, info, nullptr, nullptr, &thisVar, nullptr) == napi_ok && thisVar != nullptr) {
        // 创建NapiTest 实例
        StickyEvent *reference = new StickyEvent(env);
        // 绑定实例类创建NapiTest到导出的对象result
        if (napi_wrap(env, thisVar, reinterpret_cast<void *>(reference), StickyEvent::Destructor, nullptr,
                      &(reference->mRef)) == napi_ok) {
            return thisVar;
        }
        return thisVar;
    }
    return undefineVar;
}

void StickyEvent::Destructor(napi_env env, void *nativeObject, void *finalize) {
    StickyEvent *stickyEvent = reinterpret_cast<StickyEvent *>(nativeObject);
    stickyEvent->StickyEvent::~StickyEvent();
}

napi_value StickyEvent::set(napi_env env, napi_callback_info info) {
    size_t argc = PARAM_COUNT_2;
    napi_value args[INDEX_2] = {nullptr, nullptr};
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
    char key[1024] = {0};
    size_t charLen = 0;
    napi_get_value_string_utf8(env, args[0], key, STR_DEFAULT_SIZE, &charLen);
    std::string TypeName = key;

    char value[1024] = {0};
    size_t charValueLen = 0;
    napi_get_value_string_utf8(env, args[1], value, STR_DEFAULT_SIZE, &charValueLen);
    std::string data = value;

    SingletonThreadSafeMap::getInstance().insert(TypeName, data);
    return nullptr;
}

napi_value StickyEvent::get(napi_env env, napi_callback_info info) {
    size_t argc = PARAM_COUNT_1;
    napi_value args[INDEX_1] = {nullptr};
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    char key[1024] = {0};
    size_t charLen = 0;
    napi_get_value_string_utf8(env, args[0], key, STR_DEFAULT_SIZE, &charLen);

    std::string TypeName = key;
    std::string data = SingletonThreadSafeMap::getInstance().find(TypeName);
    if (data.empty()) {
        return nullptr;
    }
    napi_value result;
    napi_create_string_utf8(env, data.c_str(), strlen(data.c_str()), &result);
    return result;
}

} // namespace EventPost
