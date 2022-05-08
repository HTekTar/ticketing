import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent } from "@henoktekatickets/common";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListner } from "../order-cancelled-listener";

const setup = async ()=>{
  const listener = new OrderCancelledListner(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'akdfjdkjf'
  });
  ticket.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
        id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, ticket, data, msg };
};

it('sets ticket order id to undefined', async()=>{
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const cancelledTicket = await Ticket.findById(data.ticket.id);
  
  expect(cancelledTicket!.orderId).not.toBeDefined();
});

it('acks the message', async()=>{
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes ticketUpdated event', async()=>{
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});