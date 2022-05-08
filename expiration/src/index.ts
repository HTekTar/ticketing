import { natsWrapper } from './nats-wrapper';
import { OrderCancelledListner } from './events/listeners/order-created-listener';

const start = async()=>{
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
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID, 
      process.env.NATS_CLIENT_ID, 
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', ()=>{
      console.log('NATS connection closed');
      process.exit();
    })

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new OrderCancelledListner(natsWrapper.client).listen();
  } catch (error) {
    console.log(error);
  }
};

start();