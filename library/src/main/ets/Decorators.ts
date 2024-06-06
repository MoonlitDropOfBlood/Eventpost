import { EventPost } from './EventPost'

export function Subscriber(TypeName: string, sticky: boolean = false) {
  return (target: any, _: string, propertyDescriptor: PropertyDescriptor) => {
    if (target.rerender) {
      if (target.aboutToDisappear) {
        let oldFunction = target.aboutToDisappear
        function disappear(){
          EventPost.getDefault().off(TypeName, propertyDescriptor.value)
          oldFunction.call(this)
        }
        target.aboutToDisappear = disappear
      } else {
        target.aboutToDisappear = () => {
          EventPost.getDefault().off(TypeName, propertyDescriptor.value)
        }
      }

      if (target.aboutToAppear) {
        let oldFunction = target.aboutToAppear
        function appear(){
          EventPost.getDefault().on(TypeName, propertyDescriptor.value, sticky, this)
          oldFunction.call(this)
        }
        target.aboutToAppear = appear
      } else {
        function appear(){
          EventPost.getDefault().on(TypeName, propertyDescriptor.value, sticky, this)
        }
        target.aboutToAppear = appear
      }
    }
  }
}