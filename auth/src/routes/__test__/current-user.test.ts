import request from 'supertest';
import { app } from '../../app';

it('responds with user details', async()=>{
  const cookie = await global.signin();
  expect(cookie).toBeDefined();
  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual('test@email.com');
  expect(response.body.currentUser.id).toBeDefined();
});

it('responds with null if unauthenticated', async()=>{
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);
  expect(response.body.currentUser).toEqual(null);
})