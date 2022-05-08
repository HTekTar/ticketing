import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns a 404 if a ticket is not found', async()=>{
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'test',
      price: 10
    })
    .expect(404);
});

it('returns a 401 if user is not signed in', async()=>{
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'test',
      price: 10
    })
    .expect(401);

});

it('returns 401 if the user does not own the ticket', async()=>{
  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ 
      title: 'x',
      price: 10 })
    .expect(201);

  const response = await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', global.signin())
    .send({ 
      title: 'y', 
      price: 20 
    })
    .expect(401);
})

it('return 400 if the user sends an invalid price or title', async()=>{
  const cookie = global.signin();
  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ 
      title: 'x',
      price: 10 })
    .expect(201);
  
  //empty string for a title
  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20
    })
    .expect(400);

  //no title at all
  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', cookie)
    .send({
      price: 20
    })
    .expect(400);
  
  //negative price
  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'x',
      price: -1
    })
    .expect(400);
  
  //non numeric price
  await request(app)
      .put(`/api/tickets/${ticket.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'x',
        price: 'dkfaij'
      })
      .expect(400);

  //no price at all
  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'x'
    })
    .expect(400);
})

it('updates the ticket provided valid inputs', async()=>{
  const id = new mongoose.Types.ObjectId().toHexString();
  const price = 10;
  const title = 'x';

  const cookie = global.signin();

  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201);

  const newTitle = 'y';
  const newPrice = 20;

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', cookie)
    .send({ title: newTitle, price: newPrice })
    .expect(200);

  const response = await request(app)
    .get(`/api/tickets/${ticket.body.id}`)
    .send()
    .expect(200);

  expect(response.body.price).toEqual(newPrice);
  expect(response.body.title).toEqual(newTitle);
})

it('publishes ticket updated event', async()=>{
  const id = new mongoose.Types.ObjectId().toHexString();
  const price = 10;
  const title = 'x';

  const cookie = global.signin();

  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201);

  const newTitle = 'y';
  const newPrice = 20;

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', cookie)
    .send({ title: newTitle, price: newPrice })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects an update to a reserved ticket', async()=>{
  const id = new mongoose.Types.ObjectId().toHexString();
  const price = 10;
  const title = 'x';

  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201);

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString()});
  await ticket!.save();

  const newTitle = 'y';
  const newPrice = 20;

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: newTitle, price: newPrice })
    .expect(400);
});