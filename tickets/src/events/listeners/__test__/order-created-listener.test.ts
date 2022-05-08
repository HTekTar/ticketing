import mongoose from "mongoose";
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from "@henoktekatickets/common";
import { Ticket } from "../../../models/ticket";
import { OrderCreatedListner } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";

const setup = async ()=>{
  const listener = new OrderCreatedListner(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();
  
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'dfadnakda',
    tikcet: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, ticket, data, msg };
};

it('reserves a ticket by setting userId ', async()=>{
  //create listener, data, and a message
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(data.tikcet.id);

  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.orderId).toEqual(data.id);
  expect(updatedTicket!.version).toEqual(ticket.version + 1);
});

it('acks the message', async()=>{
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes ticket updated event', async()=>{
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});