import { EventPost, Subscriber } from 'eventpost';

@Entry
@Component
struct NextPage {
  @State message: string = 'Hello World';

  build() {
    Row() {
      Column() {
        Text(this.message)
          .fontSize(50)
          .fontWeight(FontWeight.Bold)

        Button("发送消息")
          .margin({top:16})
          .onClick(()=>{
            EventPost.getDefault().post("test","ff333")
          })
      }
      .width('100%')
    }
    .height('100%')
  }

  @Subscriber("test1",true)
  onMessage(ff:string){
    console.log("test1"+ff)
  }

  @Subscriber("test2",true)
  onMessage1(ff:string){
    console.log("test12"+ff)
  }

  aboutToDisappear(): void {
    console.log("aboutToDisappearNext")
  }

  aboutToAppear(): void {
    console.log("1111")
    this.message = "fff"
    EventPost.getDefault().onFromComponent('test1',this,()=>{
      console.log("onFromComponent2222")
    },true)
  }
}