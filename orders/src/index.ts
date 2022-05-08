import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

const start = async()=>{
  console.log('Starting ...');
  if(!process.env.JWT_KEY){
    throw new Error('JWT key not defined');
  }
  if(!process.env.MONGO_URI){
    throw new Error('MONGO_URI key not defined');
  }
  if(!process.env.NATS_URL){
    throw new Error('NATS_URL key not defined');
  }
  if(!process.env.NATS_CLUSTER_ID){
    throw new Error('NATS_CLUSTER_ID key not defined');
  }
  if(!process.env.NATS_CLIENT_ID){
    throw new Error('NATS_CLIENT_ID key not defined');
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('connected to mongoDB');
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID, 
      process.env.NATS_CLIENT_ID, 
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', ()=>{
      console.log('NATS connection closed');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();
    
    app.listen(3000, ()=>{
      console.log('orders listening on port 3000!!');
    });
  } catch (error) {
    console.log(error);
  }
  
};

start();