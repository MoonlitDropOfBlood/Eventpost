import { HashMap, HashSet } from '@kit.ArkTS';

export class Dispatch {
  private map = new HashMap<string, HashSet<Function>>()
  private stickyEvent = new HashMap<string, Array<object>>()

  on(TypeName: string, callback: Function, sticky: boolean): void {
    const fn = this.map.get(TypeName) || new HashSet()
    fn.add(callback)
    this.map.set(TypeName, fn)
    if (sticky) {
      let event = this.stickyEvent.get(TypeName)
      if (event) {
        this.call(callback, event)
      }
    }
  }

  emit(TypeNam: string, args: any[]): void {
    // 判断是不是有emit的post这个对应的方法去执行
    const eventName = this.map.get(TypeNam)
    if (eventName) {
      eventName.forEach(fn => {
        this.call(fn, args)
      })
    }
    this.stickyEvent.set(TypeNam, args)
  }

  private async call(fn: Function, args: Array<any>) {
    fn.apply(this, args)
  }

  off(TypeName: string, callback: Function): void {
    const eventName = this.map.get(TypeName)
    if (eventName && callback) {
      eventName.remove(callback)
    }
  }

  once(TypeName: string, callback: Function): void {
    let decor = (...args: Array<any>) => {
      callback.apply(this, args) // 执行然后删除
      this.off(TypeName, decor) // 删除方法
    }
    // 使用on添加到，list中
    this.on(TypeName, decor, false);
  }
}