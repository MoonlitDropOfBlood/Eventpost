
#include "napi/native_api.h"
#include "napi/StickyEvent.h"
#include <hilog/log.h>
#include <iterator>
#include <string>

EXTERN_C_START
namespace EventPost {
const unsigned int LOG_PRINT_DOMAIN = 0XFF10;

void StickyEventInit(napi_env env, napi_value exports)
{
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_PRINT_DOMAIN, "Init", "Init begins");
    if ((env == nullptr) || (exports == nullptr)) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "Init", "env or exports is null");
        return;
    }
    
    napi_property_descriptor classFileProp[] = {
        {"set", nullptr, StickyEvent::set, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"get", nullptr, StickyEvent::get, nullptr, nullptr, nullptr, napi_default, nullptr},
    };
    napi_value stickyEvent = nullptr;
    const char *classFileBindName = "StickyEvent";
    int methodFileSize = std::end(classFileProp) - std::begin(classFileProp);
    if (napi_define_class(env, classFileBindName, strlen(classFileBindName), StickyEvent::JsConstructor, nullptr,
        methodFileSize, classFileProp, &stickyEvent) != napi_ok) {
        return;
    }
    if (napi_create_reference(env, stickyEvent, 1, &StickyEvent::sJSConstructor_) != napi_ok) {
        return;
    }
    if (napi_set_named_property(env, exports, "StickyEvent", stickyEvent) != napi_ok) {
        return;
    }
    napi_define_properties(env, exports, sizeof(classFileProp) / sizeof(classFileProp[0]), classFileProp);
}

static napi_value Init(napi_env env, napi_value exports)
{
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_PRINT_DOMAIN, "Init", "Init begins");
    if ((env == nullptr) || (exports == nullptr)) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "Init", "env or exports is null");
        return nullptr;
    }
    StickyEventInit(env, exports);
    // XComponent的映射
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_PRINT_DOMAIN, "Init", "Init begins");
    if ((env == nullptr) || (exports == nullptr)) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "Init", "env or exports is null");
        return nullptr;
    }
    return exports;
}
EXTERN_C_END
static napi_module eventPostModule = {
    .nm_version = 1,
    .nm_flags = 0,
    .nm_filename = nullptr,
    .nm_register_func = EventPost::Init,
    .nm_modname = "native_event_post",
    .nm_priv = ((void *)0),
    .reserved = {0},
};

extern "C" __attribute__((constructor)) void RegisterModule(void) { napi_module_register(&eventPostModule); }
} // namespace EventPost