import mongoose from "mongoose";
import { Ticket } from "../ticket";

it('implements optimistic concurrency', async()=>{
  const userId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId
  });
  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInstance!.set({ title: 'comedy show'});
  secondInstance!.set({ title: 'football game'});

  await firstInstance!.save();

  
  try {
    await secondInstance!.save();
  } catch (error) {
    return;
  }

  throw new Error('should not reach this point');
})

it('increaments version number by one on save', async()=>{
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123'
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
})