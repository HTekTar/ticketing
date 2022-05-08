import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('fetches a specific order', async()=>{
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: ticketId,
    title: 'concert',
    price: 20
  });
  await ticket.save();
  const user = global.signin();
  const {body:order} = await request(app)
    .post('/api/orders/')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id
    })
    .expect(201);
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);
  expect(fetchedOrder.id).toEqual(order.id);
  expect(fetchedOrder.ticket.id).toEqual(ticket.id);
})

it('returns 401 if a wron user tries to fetch order', async()=>{
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: ticketId,
    title: 'concert',
    price: 20
  });
  await ticket.save();
  const user = global.signin();
  const {body:order} = await request(app)
    .post('/api/orders/')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id
    })
    .expect(201);
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401);
})