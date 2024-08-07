import { EventPost } from './EventPost';

export function Subscriber(TypeName: string, sticky: boolean = false) {
  return (target: any, _: string, propertyDescriptor: PropertyDescriptor) => {
    if (target.rerender) {
      const originalMethod = propertyDescriptor.value;

      if (target.aboutToDisappear) {
        const oldFunction = target.aboutToDisappear;
        target.aboutToDisappear = function() {
          EventPost.getDefault().off(TypeName, this._subscriberCallback);
          oldFunction.call(this);
        };
      } else {
        target.aboutToDisappear = function() {
          EventPost.getDefault().off(TypeName, this._subscriberCallback);
        };
      }

      if (target.aboutToAppear) {
        const oldFunction = target.aboutToAppear;
        target.aboutToAppear = function() {
          this._subscriberCallback = (...args: any[]) => {
            originalMethod.apply(this, args);
          };
          EventPost.getDefault().on(TypeName, this._subscriberCallback, sticky, this);
          oldFunction.call(this);
        };
      } else {
        target.aboutToAppear = function() {
          this._subscriberCallback = (...args: any[]) => {
            originalMethod.apply(this, args);
          };
          EventPost.getDefault().on(TypeName, this._subscriberCallback, sticky, this);
        };
      }
    }
  };
}