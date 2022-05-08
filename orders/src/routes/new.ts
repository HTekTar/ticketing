import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { body } from 'express-validator';
import { 
  requireAuth, 
  validateRequest, 
  NotFoundError, 
  OrderStatus, 
  BadRequestError } from '@henoktekatickets/common';
import { natsWrapper } from '../nats-wrapper';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post('/api/orders', requireAuth, [
  body('ticketId')
    .not()
    .isEmpty()
    .custom((input:string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('A valid ticket id needs to be provided')
], validateRequest, async (req: Request, res: Response)=>{
  const { ticketId } = req.body;

  const ticket = await Ticket.findById(ticketId);

  if(!ticket){
    throw new NotFoundError();
  }

  //check if the ticket is not reserved
  const isReserved = await ticket.isReserved();
  if(isReserved){
    throw new BadRequestError('Ticket is already reserved');
  }

  //set expiration date
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

  //build up an order
  const order = Order.build({
    userId: req.currentUser!.id,
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket
  });
  await order.save();

  new OrderCreatedPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    status: order.status,
    userId: order.userId,
    expiresAt: order.expiresAt.toISOString(),
    tikcet: {
      id: ticket.id,
      price: ticket.price,
    },
  });

  res.status(201).send(order);
});

export { router as newOrderRouter };