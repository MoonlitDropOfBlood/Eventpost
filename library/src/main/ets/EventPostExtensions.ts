import { EventPost } from './EventPost'
import { hilog } from '@kit.PerformanceAnalysisKit'
import { Lifecycle, LifecycleOwner, LifecycleState, LIFECYCLE_DEFAULT, LIFECYCLE_INIT } from '@duke/component-lifecycle'
import { EVENT_COMPONENT_EVENT_CACHE } from './Constants'
import { EventOnInfo } from './EventOnInfo'
import { systemDateTime } from '@kit.BasicServicesKit'
import { FrameNode, UIContext, uiObserver } from '@kit.ArkUI'

EventPost.getDefault().onFromComponent =
  function (TypeName: string, component: any, callback: Function, sticky: boolean = false) {
    if (!component.rerender) {
      hilog.warn(0x0000, 'EventPost', '%{public}s', 'onFormComponent component is not a component')
      return
    }
    let methodName = `_${systemDateTime.getTime(true)}_${Math.random().toString(36).slice(-8)}`
    component[methodName] = callback
    if (component[EVENT_COMPONENT_EVENT_CACHE]) { //已经注入过生命周期了
      let cache = component[EVENT_COMPONENT_EVENT_CACHE] as Array<EventOnInfo>
      cache.push({
        typeName: TypeName,
        methodName: methodName,
        sticky,
        callBack: callback
      })
      let uiContext: UIContext = component.getUIContext()
      let uniqueId: number = component.getUniqueId();
      let frameNode: FrameNode = uiContext.getFrameNodeByUniqueId(uniqueId)
      if (frameNode) { //aboutToAppear 已经执行完成，加缓存不会自动注册了，需要手动注册
        this.dispatch.on(TypeName, callback, sticky, component)
      }
    } else {
      this.dispatch.on(TypeName, callback, sticky, component)
      let cache = new  Array<EventOnInfo>()
      component[EVENT_COMPONENT_EVENT_CACHE] = cache
      cache.push({
        typeName: TypeName,
        methodName: methodName,
        sticky,
        callBack: callback
      })
      if (component[LIFECYCLE_INIT]) { //有生命周期注入，但是没有缓存，则添加缓存
        let keys = Object.keys(component)
        for (let i = 0; i < keys.length; i++) {
          let property = component[keys[i]]
          if (property instanceof Lifecycle) {
            property.addObserver((_, state) => {
              if (state == LifecycleState.ON_DISAPPEAR) {
                let cache = component[EVENT_COMPONENT_EVENT_CACHE] as Array<EventOnInfo>
                cache.forEach(item => {
                  EventPost.getDefault().off(item.typeName, component[item.methodName]);
                })
              }
            })
            break
          }
        }
      } else { //没有生命周期注入，则添加生命周期
        let lifecycle = new Lifecycle()
        lifecycle.addObserver((_, state) => {
          if (state == LifecycleState.ON_DISAPPEAR) {
            let cache = component[EVENT_COMPONENT_EVENT_CACHE] as Array<EventOnInfo>
            cache.forEach(item => {
              EventPost.getDefault().off(item.typeName, component[item.methodName]);
            })
          }
        })
        component[LIFECYCLE_DEFAULT] = lifecycle
        let oldAppear = component.aboutToAppear
        let oldDidBuild = component.onDidBuild
        LifecycleOwner(component, LIFECYCLE_DEFAULT)
        //已经错误时机，需要恢复，同时手动注入
        component.aboutToAppear = oldAppear
        component[LIFECYCLE_INIT].call(component)
        let uiContext: UIContext = component.getUIContext()
        let uniqueId: number = component.getUniqueId();
        let frameNode: FrameNode = uiContext.getFrameNodeByUniqueId(uniqueId)
        if (frameNode) { //获取到frameNode 已经错过注册事件，需要把didBuild还原
          component.onDidBuild = oldDidBuild
          component.lifecycleRegister.call(component)
          //需要补充错过的生命周期
          if (lifecycle.isPage) {
            let pageInfo = uiContext.getPageInfoByUniqueId(uniqueId)
            if (lifecycle.isRouterPage) {
              let pageState = pageInfo.routerPageInfo.state
              if (pageState == uiObserver.RouterPageState.ON_PAGE_SHOW ||
                pageState == uiObserver.RouterPageState.ON_BACK_PRESS) {
                lifecycle['handler'](LifecycleState.ON_SHOWED)
              } else if (pageState == uiObserver.RouterPageState.ON_PAGE_HIDE) {
                lifecycle['handler'](LifecycleState.ON_DISAPPEAR)
              }
            } else if (lifecycle.isNavigation) {
              let pageState = pageInfo.navDestinationInfo.state
              if (pageState == uiObserver.NavDestinationState.ON_SHOWN ||
                pageState == uiObserver.NavDestinationState.ON_BACKPRESS) {
                lifecycle['handler'](LifecycleState.ON_SHOWED)
              } else if (pageState == uiObserver.NavDestinationState.ON_HIDDEN) {
                lifecycle['handler'](LifecycleState.ON_DISAPPEAR)
              } else if (pageState == uiObserver.NavDestinationState.ON_WILL_SHOW) {
                lifecycle['handler'](LifecycleState.ON_WILL_SHOW)
              } else if (pageState == uiObserver.NavDestinationState.ON_WILL_HIDE) {
                lifecycle['handler'](LifecycleState.ON_WILL_HIDE)
              } else if (pageState == uiObserver.NavDestinationState.ON_ACTIVE) {
                lifecycle['handler'](LifecycleState.ON_ACTIVE)
              } else if (pageState == uiObserver.NavDestinationState.ON_INACTIVE) {
                lifecycle['handler'](LifecycleState.ON_INACTIVE)
              }
            }
          } else {
            if (frameNode.isVisible()) {
              lifecycle['handler'](LifecycleState.ON_SHOWED)
            } else {
              lifecycle['handler'](LifecycleState.ON_HIDDEN)
            }
          }
        }
      }
    }
  }