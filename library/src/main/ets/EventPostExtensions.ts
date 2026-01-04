import { EventPost } from './EventPost'
import { hilog } from '@kit.PerformanceAnalysisKit'
import {
  getCurrentLifecycle, LifecycleState } from '@duke/component-lifecycle'
import { EventOnInfo } from './EventOnInfo'
import { ViewModel } from '@duke/view-model'

EventPost.getDefault().onFromComponent =
  function (TypeName: string, component: any, callback: Function, sticky: boolean = false) {
    let lifecycle = getCurrentLifecycle(component)
    if (!lifecycle) {
      hilog.warn(0x0000, 'EventPost', '%{public}s', 'onFormComponent component is not a lifecycle owner')
      return
    }
    EventPost.getDefault().on(TypeName, callback, sticky,component)
    lifecycle.addObserver((_,event)=>{
        if (event === LifecycleState.ON_DISAPPEAR) {
          EventPost.getDefault().off(TypeName, callback)
        }
    })
  }

EventPost.getDefault().onFromViewModel = function (TypeName: string, viewModel: ViewModel, callback: Function, sticky: boolean = false) {
  let cache:Array<EventOnInfo> | undefined = viewModel['_registerEventPost']
  if(!cache){
    cache = viewModel['_registerEventPost'] = new Array<EventOnInfo>()
    let oldFunction = viewModel.clean
    viewModel.clean = function () {
      cache?.forEach(item => {
        EventPost.getDefault().off(item.typeName, item.callBack)
      })
      oldFunction.call(ViewModel)
    }
  }
  cache.push({
    typeName: TypeName,
    methodName: '',
    sticky,
    callBack: callback
  })
  EventPost.getDefault().on(TypeName, callback, sticky,viewModel)
}