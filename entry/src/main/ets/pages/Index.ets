import { router } from '@kit.ArkUI';
import { EventPost, Subscriber } from 'EventPost/Index';
import { CustomView } from './CustView';

@Entry
@Component
struct Index {
  @State message: string = 'Hello World';

  build() {
    Row() {
      Column() {
        CustomView({name: "我是1"})
        CustomView({name: "我是2"})
        CustomView({name: "我是3"})
        CustomView({name: "我是4"})
        Text(this.message)
          .fontSize(50)
          .fontWeight(FontWeight.Bold)

        Button("下一页")
          .margin({ top: 16 })
          .onClick(() => {
            router.pushUrl({ url: "pages/NextPage" })
          })

        Button("发送消息")
          .margin({ top: 16 })
          .onClick(() => {
            EventPost.getDefault().post("test1","112233")
          })
      }
      .width('100%')
    }
    .height('100%')
  }

  @Subscriber("test",true)
  onMessage(args: string) {
    console.log("test"+args)
    this.message = args
  }
}