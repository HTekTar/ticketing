import mongoose from "mongoose";
import { TicketUpdatedEvent } from "@henoktekatickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { Ticket } from "../../../models/ticket";


const setup = async()=>{
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();


  const listener = new TicketUpdatedListener(natsWrapper.client);

  const data: TicketUpdatedEvent['data'] = {
    title: 'comedy show',
    price: 100,
    id: ticket.id,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: ticket.version + 1,
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg };
};

it('finds, updates, and saves a ticket', async()=>{
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.price).toEqual(data.price);
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.version).toEqual(data.version);
});

it('acks the message', async()=>{
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not processes an event with skipped version', async()=>{
  const { listener, data, msg } = await setup();
  data.version = 4;
  try {
    await listener.onMessage(data, msg)
  } catch (error) {
    
  }
  expect(msg.ack).not.toHaveBeenCalled();
});