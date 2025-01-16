import { HashMap, HashSet } from '@kit.ArkTS';
import emitter from '@ohos.events.emitter';
import { StickyEvent } from 'libnative_event_post.so';

export class Dispatch {
  private map = new HashMap<string, HashSet<Function>>()
  private callThis = new HashMap<Function, any>()
  private stickyEvent = new StickyEvent()

  private static readonly DISPATCH_KEY = 'EVENT_POST_DISPATCH_KEY'

  constructor() {
    emitter.on(Dispatch.DISPATCH_KEY,(message)=>{
      let typeName:string = message.data['typeName']
      let messageData = message.data['messageData']
      const eventName = this.map.get(typeName)
      if (eventName) {
        eventName.forEach(fn => {
          this.call(fn, this.callThis.get(fn), messageData)
        })
      }
    })
  }

  on(TypeName: string, callback: Function, callThis: any, sticky: boolean): void {
    const fn = this.map.get(TypeName) || new HashSet()
    if (fn.add(callback)) {
      this.callThis.set(callback, callThis)
    }
    this.map.set(TypeName, fn)
    if (sticky) {
      let event = this.stickyEvent.get(TypeName)
      if (event) {
        this.call(callback, callThis, JSON.parse(event))
      }
    }
  }

  emit(TypeName: string, args: any[],isStickyEvent:boolean): void {
    let eventData: emitter.EventData = {
      data: {
        'typeName': TypeName,
        'messageData':args
      }
    };
    emitter.emit(Dispatch.DISPATCH_KEY, eventData)
    if(isStickyEvent) {
      this.stickyEvent.set(TypeName, JSON.stringify(args))
    }
  }

  private async call(fn: Function, callThis: any, args: Array<any>) {
    fn.call(callThis, ...args)
  }

  off(TypeName: string, callback: Function): void {
    const eventName = this.map.get(TypeName)
    if (eventName && callback) {
      eventName.remove(callback)
    }
    this.callThis.remove(callback)
  }

  once(TypeName: string, callback: Function, callThis: any): void {
    let decor = (...args: Array<any>) => {
      callback.apply(this, args) // 执行然后删除
      this.off(TypeName, decor) // 删除方法
    }
    // 使用on添加到，list中
    this.on(TypeName, decor, callThis, false);
  }

  getTypeValue(TypeName: string): any[] | undefined {
    let result = this.stickyEvent.get(TypeName)
    if(result){
      return JSON.parse(result)
    }else {
      return undefined
    }
  }
}