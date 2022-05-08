import request from 'supertest';
import { app } from '../../app';

it('returns a status of 201 upon a successful signup request', async()=>{
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@email.com',
      password: 'password'
    })
    .expect(201);
});

it('returns a status of 400 if an invalid email is sent', async ()=>{
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'email.com',
      password: 'password'
    })
    .expect(400);
});

it('returns a status of 400 if an invalid password is sent', async ()=>{
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@email.com',
      password: ''
    })
    .expect(400);
});

it('returns a status of 400 if password or email is missing', async ()=>{
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@email.com'
    })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({
      password: 'password'
    })
    .expect(400);
});

it('disallows duplicate emails', async()=>{
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@email.com',
      password: 'password'
    })
    .expect(201);

    await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@email.com',
      password: 'password'
    })
    .expect(400);
});

it('sends back a cookie after successful signup', async ()=>{
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@email.com',
      password: 'password'
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});