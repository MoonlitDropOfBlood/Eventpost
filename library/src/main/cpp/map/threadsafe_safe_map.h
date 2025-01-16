#include <map>
#include <mutex>


class SingletonThreadSafeMap {
private:
    std::map<std::string, std::string> internalMap;
    std::mutex mtx;

    // 私有构造函数，防止外部创建对象
    SingletonThreadSafeMap() = default;

    // 禁止拷贝构造函数和赋值操作符
    SingletonThreadSafeMap(const SingletonThreadSafeMap &) = delete;
    SingletonThreadSafeMap &operator=(const SingletonThreadSafeMap &) = delete;


public:
    // 静态成员函数，用于获取唯一实例
    static SingletonThreadSafeMap &getInstance() {
        static SingletonThreadSafeMap inst;
        return inst;
    }

    // 插入元素
    void insert(const std::string &key, const std::string &value) {
        std::lock_guard<std::mutex> lock(mtx);
        internalMap[key] = value;
    }

    // 查找元素，如果找到返回 true，并将值存储在 value 中，否则返回 false
    std::string find(const std::string &key) {
        auto it = internalMap.find(key);
        if (it != internalMap.end()) {
            return it->second;
        }
        return "";
    }
};