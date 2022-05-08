import mongoose from "mongoose";
import { Message } from 'node-nats-streaming';
import { 
  OrderCancelledEvent, 
  OrderStatus 
} from "@henoktekatickets/common";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";

const setup = async ()=>{
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'dkfakdf',
    price: 100,
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'dfkadif',
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, order, data, msg };
};

it('replicates the order info', async()=>{
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const cancelledOrder = await Order.findById(data.id);
  
  expect(cancelledOrder!.id).toEqual(order.id);
  expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async()=>{
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});