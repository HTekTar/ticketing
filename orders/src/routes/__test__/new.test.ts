import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if the ticket does not exist', async()=>{
  const ticketId = new mongoose.Types.ObjectId();
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async()=>{
  const userId= new mongoose.Types.ObjectId().toHexString();
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: ticketId,
    title: 'concert',
    price: 10
  });
  await ticket.save();
  const date = new Date();
  date.setSeconds(date.getSeconds() + 60);
  const order = Order.build({
    userId, 
    status: OrderStatus.AwaitingPayment, 
    expiresAt: date,
    ticket
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(400);
});

it('reserves a ticket', async()=>{
  const userId= new mongoose.Types.ObjectId().toHexString();
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: ticketId,
    title: 'concert',
    price: 10
  });
  await ticket.save();
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(201);

});

it('emits an order created event', async()=>{
  const userId= new mongoose.Types.ObjectId().toHexString();
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: ticketId,
    title: 'concert',
    price: 10
  });
  await ticket.save();
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});