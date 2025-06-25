package eventpost_native

// 导入互操作库 ark_interop 和互操作宏
import std.collection.concurrent.ConcurrentHashMap

public class StickyEvent {
    let map: ConcurrentHashMap<String, String>
    private static let mIns: StickyEvent

    public static func getInstance(): StickyEvent {
        return mIns
    }

    static init() {
        mIns = StickyEvent()
    }

    private init() {
        map = ConcurrentHashMap()
    }
}