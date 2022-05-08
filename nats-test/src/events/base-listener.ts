import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from './subjects'

interface Event{
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event>{
  abstract subject: T["subject"];
  abstract queueGroupName: string;
  abstract onMessage(data: T["data"], msg: Message ): void;
  ackWait = 5 * 1000;

  constructor(private client: Stan){}

  private subscriptionOption(){
    return this.client
      .subscriptionOptions()
      .setManualAckMode(true)
      .setDeliverAllAvailable()
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName)
  }

  private parseMessage(msg: Message){
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8'));
  }

  listen(){
    //create subscription
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOption()
    );

    

    //define on message method
    subscription.on('message', (msg: Message)=>{
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);
      const data = this.parseMessage(msg);
      this.onMessage(data, msg);
    })
  }
}