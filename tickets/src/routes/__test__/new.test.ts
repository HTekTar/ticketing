import request from "supertest";
import { app } from "../../app";
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('listens for post requests on /api/tickets', async()=>{
  const response = await request(app)
    .post('/api/tickets')
    .send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async()=>{
  await request(app)
    .post('/api/tickets')
    .send({})
    .expect(401);
});

it('it does not return 401 errer if user is signed in', async()=>{
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns error if an invalid title is provided', async()=>{
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 20
    })
    .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      price: 20
    })
    .expect(400);
});

it('returns an error if an invalid price is provided', async()=>{
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'x',
      price: -1
    })
    .expect(400);
  await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: 'x',
        price: 'dkfaij'
      })
      .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'x'
    })
    .expect(400);
});

it('creates tickets with valid parameters', async()=>{
  
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);
  const title = 'test';
  const price = 25;
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({title, price})  
    .expect(201);

  tickets = await Ticket.find({});

  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(price);
  expect(tickets[0].title).toEqual(title);
});

it('publishes an event', async()=>{
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);
  const title = 'test';
  const price = 25;
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({title, price})  
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});