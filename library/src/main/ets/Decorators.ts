import {
  EVENT_COMPONENT_EVENT_CACHE
} from './Constants';
import { EventOnInfo } from './EventOnInfo';
import { EventPost } from './EventPost';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { Lifecycle,
  LifecycleEventObserver,
  LifecycleOwner,
  LifecycleState,
  LIFECYCLE_DEFAULT, LIFECYCLE_INIT } from '@duke/component-lifecycle';

export function Subscriber(TypeName: string, sticky: boolean = false) {
  return (target: any, name: string, propertyDescriptor: PropertyDescriptor) => {
    if (!target.rerender) {
      hilog.warn(0x0000, 'EventPost', '%{public}s', 'Subscriber current target is not a component');
      return;
    }
    if (!target[EVENT_COMPONENT_EVENT_CACHE]) {
      let cache = new Array<EventOnInfo>();
      target[EVENT_COMPONENT_EVENT_CACHE] = cache;
      cache.push({
        typeName: TypeName,
        methodName: name,
        sticky: sticky,
        callBack: propertyDescriptor.value
      });
    }
    else {
      let cache = target[EVENT_COMPONENT_EVENT_CACHE] as Array<EventOnInfo>;
      cache.push({
        typeName: TypeName,
        methodName: name,
        sticky: sticky,
        callBack: propertyDescriptor.value
      });
      //不要重复修改原型方向，减少调用堆栈深度
      return;
    }
    if (!target[LIFECYCLE_INIT]) {
      LifecycleOwner(target, LIFECYCLE_DEFAULT);
    }
    let oldFunction = target[LIFECYCLE_INIT];
    target[LIFECYCLE_INIT] = function () {
      let lifecycle: Lifecycle;
      if (!this[LIFECYCLE_DEFAULT]) {
        lifecycle = new Lifecycle();
        this[LIFECYCLE_DEFAULT] = lifecycle;
      }
      else {
        lifecycle = this[LIFECYCLE_DEFAULT];
      }
      let observer: LifecycleEventObserver = (source, state) => {
        if (state == LifecycleState.ON_APPEAR) {
          let cache = target[EVENT_COMPONENT_EVENT_CACHE] as Array<EventOnInfo>;
          cache.forEach(item => {
            source[item.methodName] = (...args) => {
              item.callBack.apply(source, args);
            };
            EventPost.getDefault().on(item.typeName, source[item.methodName], item.sticky, source);
          });
        }
        else if (state == LifecycleState.ON_DISAPPEAR) {
          let cache = target[EVENT_COMPONENT_EVENT_CACHE] as Array<EventOnInfo>;
          cache.forEach(item => {
            EventPost.getDefault().off(item.typeName, source[item.methodName]);
          });
        }
      };
      lifecycle.addObserver(observer);
      oldFunction.apply(this);
    };
  };
}