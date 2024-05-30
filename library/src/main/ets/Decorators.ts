import { EventPost } from './EventPost'

export function Subscriber(TypeName: string, sticky: boolean = false) {
  return (target: any, _: string, propertyDescriptor: PropertyDescriptor) => {
    if(target.rerender) {
      if (target.aboutToDisappear) {
        let oldFunction = target.aboutToDisappear
        target.aboutToDisappear = () => {
          EventPost.getDefault().off(TypeName, propertyDescriptor.value)
          oldFunction()
        }
      } else {
        target.aboutToDisappear = () => {
          EventPost.getDefault().off(TypeName, propertyDescriptor.value)
        }
      }
    }
    EventPost.getDefault().on(TypeName, propertyDescriptor.value, sticky)
  }
}