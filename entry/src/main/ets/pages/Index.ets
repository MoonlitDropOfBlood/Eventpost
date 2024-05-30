import { router } from '@kit.ArkUI';
import { EventPost, Subscriber } from 'EventPost/Index';

@Entry
@Component
struct Index {
  @State message: string = 'Hello World';

  build() {
    Row() {
      Column() {
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
  onMessage(args: object) {
    console.log("test"+args)
  }
}