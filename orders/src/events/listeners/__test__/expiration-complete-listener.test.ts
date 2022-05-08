import mongoose from "mongoose";
import { Message } from 'node-nats-streaming';
import { ExpirationCompleteEvent, OrderStatus } from "@henoktekatickets/common";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { Order } from "../../../models/order";

const setup = async()=>{
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    ticket,
    expiresAt: new Date(),
  });
  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, ticket, order, data, msg }
};

it('updates orders status to cancelled', async()=>{
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const cancelledOrder = await Order.findById(data.orderId);

  expect(cancelledOrder!.id).toEqual(order.id);
  expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits order cancelled event', async()=>{
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(((natsWrapper.client.publish) as jest.Mock).mock.calls[0][1]);

  expect(eventData.id).toEqual(order.id);
});

it('acks the message', async()=>{
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const cancelledOrder = await Order.findById(data.orderId);

  expect(msg.ack).toHaveBeenCalled();
});