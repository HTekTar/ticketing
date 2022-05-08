import mongoose from 'mongoose';
import { app } from './app';

const start = async()=>{
  console.log('Starting up ... ');

  if(!process.env.JWT_KEY){
    throw new Error('JWT key not defined');
  }
  if(!process.env.MONGO_URI){
    throw new Error('MONGO_URI key not defined');
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('connected to mongoDB');
    
    app.listen(3000, ()=>{
      console.log('auth listening on port 3000!!');
    });
  } catch (error) {
    console.log(error);
  }
};

start();