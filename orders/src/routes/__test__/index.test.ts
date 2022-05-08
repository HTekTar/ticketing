import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

const createTicket = async()=>{
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: ticketId,
    title: 'concert',
    price: 30
  });
  await ticket.save();
  return ticket;
};

it('returns orders', async()=>{
  const user1 = global.signin();
  const user2 = global.signin();

  const ticket2 = await createTicket();
  const ticket3 = await createTicket();
  const ticket1 = await createTicket();

  await request(app)
    .post('/api/orders')
    .set('Cookie', user1)
    .send({
      ticketId: ticket1.id
    })
    .expect(201);

    const {body: order2} = await request(app)
    .post('/api/orders')
    .set('Cookie', user2)
    .send({
      ticketId: ticket2.id
    })
    .expect(201);
  const {body: order3} = await request(app)
    .post('/api/orders')
    .set('Cookie', user2)
    .send({
      ticketId: ticket3.id
    })
    .expect(201);

  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', user2)
    .send()
    .expect(200);
  
  // console.log(response.body);
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(order2.id);
  expect(response.body[1].id).toEqual(order3.id);
  expect(response.body[0].ticket.id).toEqual(ticket2.id);
  expect(response.body[1].ticket.id).toEqual(ticket3.id);

});