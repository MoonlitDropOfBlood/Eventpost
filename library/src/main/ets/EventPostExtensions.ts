import { EventPost } from './EventPost'
import { hilog } from '@kit.PerformanceAnalysisKit'
import { EVENT_COMPONENT_EVENT_OFF_CACHE, EVENT_COMPONENT_EVENT_OFF_2_HANDLER } from './Constants'
import { EventOnInfo } from './EventOnInfo'

EventPost.getDefault().onFromComponent =
  function (TypeName: string, component: any, callback: Function, sticky: boolean = false) {
    if (!component.rerender) {
      hilog.warn(0x0000, 'EventPost', '%{public}s', 'onFormComponent component is not a component')
      return
    }
    this.dispatch.on(TypeName, callback, sticky, component)
    let offInfo: EventOnInfo = { typeName: TypeName, callBack: callback }
    if (!component[EVENT_COMPONENT_EVENT_OFF_CACHE]) {
      component[EVENT_COMPONENT_EVENT_OFF_CACHE] = new Array<EventOnInfo>();
      component[EVENT_COMPONENT_EVENT_OFF_CACHE].push(offInfo)
      let offs = function () {
        this[EVENT_COMPONENT_EVENT_OFF_CACHE].forEach((info: EventOnInfo) => {
          EventPost.getDefault().off(info.typeName, info.callBack);
        })
        delete this[EVENT_COMPONENT_EVENT_OFF_CACHE];
        delete this[EVENT_COMPONENT_EVENT_OFF_2_HANDLER];
      };
      component[EVENT_COMPONENT_EVENT_OFF_2_HANDLER] = offs;
      if (component.aboutToDisappear) {
        const oldFunction = component.aboutToDisappear;
        component.aboutToDisappear = function () {
          oldFunction.call(this);
          this[EVENT_COMPONENT_EVENT_OFF_2_HANDLER]()
        };
      } else {
        component.aboutToDisappear = function () {
          this[EVENT_COMPONENT_EVENT_OFF_2_HANDLER]()
        };
      }
    } else {
      component[EVENT_COMPONENT_EVENT_OFF_CACHE].push(offInfo)
    }
  }