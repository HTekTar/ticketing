import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global{
  var signin: ()=>string[];
}

jest.mock('../nats-wrapper');

let mongo: any;

beforeAll(async()=>{
  process.env.JWT_KEY = 'asdfasdf';
  mongo =  await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async ()=>{
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for(let collection of collections){
    await collection.deleteMany({});
  }
});

afterAll(async ()=>{
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = ()=>{
  //create a JWT payload
  const payload = { 
    email: 'test@email.com', 
    id: new mongoose.Types.ObjectId().toHexString()
  }
  //create JWT
  const user_jwt = jwt.sign(payload, process.env.JWT_KEY!);
  //create session object
  const sessionObject = { jwt:user_jwt};
  //turn the session object into json
  const json_sess = JSON.stringify(sessionObject);
  //encode the json-session object as base64
  const base64 = Buffer.from(json_sess).toString('base64');
  //build a string that is the cookie and return
  return [`session=${base64}`];
}

