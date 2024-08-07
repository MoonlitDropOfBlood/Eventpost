import { Subscriber } from 'EventPost'

@Component
export struct CustomView {
  @State name: string = "CustView"

  build() {
    Text(this.name)
  }

  @Subscriber("test1")
  onReceived(event: object) {
    console.error("收到 test1 " + JSON.stringify(event))
    this.name = '收到 test1: ' + event
  }
}