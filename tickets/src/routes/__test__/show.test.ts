import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if a ticket is not found', async()=>{
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(404);
});

it('returns a ticket if it is found', async()=>{
  const title = 'test';
  const price = 10;
  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price})
    .expect(201);
  const response = await request(app)
    .get(`/api/tickets/${ticket.body.id}`)
    .send();
  expect(response.status).toEqual(200);
  expect(response.body.price).toEqual(price);
  expect(response.body.title).toEqual(title);
});