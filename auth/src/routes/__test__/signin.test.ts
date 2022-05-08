import request from 'supertest';
import { app } from '../../app';

it('fails with 400 status code when an email that does not exist is supplied', async ()=>{
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@email.com',
      password: 'password'
    })
    .expect(400);
});

it('fails when an incorrect password is supplied', async ()=>{
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@email.com',
      password: 'password'
    })
    .expect(201);
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@email.com',
      password: 'akdjfkdjc'
    })
    .expect(400);
});

it('it sends a 200 and responds with a cookie when a valid credential is supplied', async ()=>{
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@email.com',
      password: 'password'
    })
    .expect(201);
  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@email.com',
      password: 'password'
    })
    .expect(200);
  expect(response.get('Set-Cookie')).toBeDefined();
});