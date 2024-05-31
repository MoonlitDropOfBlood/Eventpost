import { Dispatch } from './Dispatch'

export class EventPost {
  private dispatch: Dispatch = new Dispatch()

  private constructor() {
  }

  public static getDefault(): EventPost {
    if (!globalThis.eventPost) {
      globalThis.eventPost = {}
    }
    if (!globalThis.eventPost.default) {
      let that = new EventPost()
      globalThis.eventPost.default = that
    }
    return globalThis.eventPost.default
  }

  post(TypeNam: string, ...args: any[]) {
    this.dispatch.emit(TypeNam, args)
  }

  on(TypeName: string, callback: Function, sticky: boolean = false, callThis?: any) {
    this.dispatch.on(TypeName, callback, callThis, sticky)
  }

  off(TypeName: string, callback: Function) {
    this.dispatch.off(TypeName, callback)
  }

  once(TypeName: string, callback: Function, callThis?: any) {
    this.dispatch.once(TypeName, callback, callThis)
  }
}