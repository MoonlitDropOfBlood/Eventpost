import {
  EVENT_COMPONENT_EVENT_CACHE,
  EVENT_COMPONENT_EVENT_OFF_HANDLER,
  EVENT_COMPONENT_EVENT_ON_HANDLER
} from './Constants';
import { EventOnInfo } from './EventOnInfo';
import { EventPost } from './EventPost';
import { hilog } from '@kit.PerformanceAnalysisKit';

export function Subscriber(TypeName: string, sticky: boolean = false) {
  return (target: any, name: string, propertyDescriptor: PropertyDescriptor) => {
    if (!target.rerender) {
      hilog.warn(0x0000, 'EventPost', '%{public}s', 'Subscriber current target is not a component')
      return
    }
    let onInfo:EventOnInfo  = { typeName: TypeName, sticky: sticky ,callBack:propertyDescriptor.value };
    if (target[EVENT_COMPONENT_EVENT_CACHE]) {
      target[EVENT_COMPONENT_EVENT_CACHE].set(name, onInfo)
      return
    }
    target[EVENT_COMPONENT_EVENT_CACHE] = new Map<string, EventOnInfo>();
    target[EVENT_COMPONENT_EVENT_CACHE].set(name, onInfo)
    let offs = function () {
      this[EVENT_COMPONENT_EVENT_CACHE].forEach((info: EventOnInfo, name: string) => {
        EventPost.getDefault().off(info.typeName, this[name]);
      })
      delete this[EVENT_COMPONENT_EVENT_OFF_HANDLER];
      delete this[EVENT_COMPONENT_EVENT_ON_HANDLER];
      delete this[EVENT_COMPONENT_EVENT_CACHE];
    };
    let ons = function () {
      this[EVENT_COMPONENT_EVENT_CACHE].forEach((info: EventOnInfo, name: string) => {
        this[name] = function (...args:any[]) {
          info.callBack.apply(this, args);
        };
        EventPost.getDefault().on(info.typeName, this[name], info.sticky, this);
      })
    };
    if (target.aboutToDisappear) {
      const oldFunction = target.aboutToDisappear;
      target.aboutToDisappear = function () {
        this[EVENT_COMPONENT_EVENT_OFF_HANDLER]()
        oldFunction.call(this);
      };
    } else {
      target.aboutToDisappear = function () {
        this[EVENT_COMPONENT_EVENT_OFF_HANDLER]()
      };
    }
    if (target.aboutToAppear) {
      const oldFunction = target.aboutToAppear;
      target.aboutToAppear = function () {
        this[EVENT_COMPONENT_EVENT_ON_HANDLER] = ons;
        this[EVENT_COMPONENT_EVENT_OFF_HANDLER] = offs;
        this[EVENT_COMPONENT_EVENT_ON_HANDLER]()
        oldFunction.call(this);
      };
    } else {
      target.aboutToAppear = function () {
        this[EVENT_COMPONENT_EVENT_ON_HANDLER] = ons;
        this[EVENT_COMPONENT_EVENT_OFF_HANDLER] = offs;
        this[EVENT_COMPONENT_EVENT_ON_HANDLER]()
      };
    }

  };
}