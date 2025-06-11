import { router } from '@kit.ArkUI';
import { EventPost, Subscriber } from 'EventPost/Index';
import { CustomView } from './CustView';
import { ErrorEvent, MessageEvents, worker } from '@kit.ArkTS';

@Entry
@Component
struct Index {
  @State message: string = 'Hello World';
  @State showCustom: boolean = true

  build() {
    Row() {
      Column() {
        if (this.showCustom) {
          CustomView({ name: "我是1" })
          CustomView({ name: "我是2" })
          CustomView({ name: "我是3" })
          CustomView({ name: "我是4" })
        }
        Text(this.message)
          .fontSize(50)
          .fontWeight(FontWeight.Bold)

        Button("销毁测试")
          .margin({ top: 16 })
          .onClick(() => {
            this.showCustom = false
          })

        Button("下一页")
          .margin({ top: 16 })
          .onClick(() => {
            router.pushUrl({ url: "pages/NextPage" })
          })

        Button("启动线程")
          .margin({ top: 16 })
          .onClick(() => {
            let workerInstance = new worker.ThreadWorker("entry/ets/workers/Worker.ets");

            // 注册onmessage回调，当宿主线程接收到来自其创建的Worker通过workerPort.postMessage接口发送的消息时被调用，在宿主线程执行
            workerInstance.onmessage = (e: MessageEvents) => {
              let data: string = e.data;
              console.info("workerInstance onmessage is: ", data);
            }

            // 注册onerror回调，当Worker在执行过程中发生异常时被调用，在宿主线程执行
            workerInstance.onerror = (err: ErrorEvent) => {
              console.info("workerInstance onerror message is: " + err.message);
            }

            // 注册onmessageerror回调，当Worker对象接收到一条无法被序列化的消息时被调用，在宿主线程执行
            workerInstance.onmessageerror = () => {
              console.info('workerInstance onmessageerror');
            }

            // 注册onexit回调，当Worker销毁时被调用，在宿主线程执行
            workerInstance.onexit = (e: number) => {
              // 当Worker正常退出时code为0，异常退出时code为1
              console.info("workerInstance onexit code is: ", e);
            }

            // 向Worker线程发送消息
            workerInstance.postMessage('1');
          })

        Button("发送消息")
          .margin({ top: 16 })
          .onClick(() => {
            EventPost.getDefault().post("test1", "112233")
          })
      }
      .width('100%')
    }
    .height('100%')
  }

  @Subscriber("test",true)
  onMessage(args: string) {
    console.log("test" + args)
    this.message = args
  }
}