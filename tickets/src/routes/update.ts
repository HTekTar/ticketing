import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotAuthorizedError, NotFoundError, BadRequestError } from '@henoktekatickets/common';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';

const router = express.Router();

router.put('/api/tickets/:id', requireAuth,[
  body('title').not().isEmpty().withMessage('Title needs to be provided'),
  body('price').isFloat({ gt: 0 }).withMessage('Valid price needs to be provided')
], validateRequest, 
async(req: Request, res: Response)=>{
  const ticketId = req.params.id;
  const userId = req.currentUser!.id;

  const ticket = await Ticket.findById(req.params.id);
  if(!ticket){
    throw new NotFoundError();
  } else if(ticket.userId !== userId){
    throw new NotAuthorizedError();
  }

  if(ticket.orderId){
    throw new BadRequestError('Cannot edit a reserved ticket');
  }

  const { title, price } = req.body;
  ticket.set({
    title, price
  })
  await ticket.save();
  new TicketUpdatedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId,
    version: ticket.version,
  });
  res.status(200).send(ticket);
})

export { router as updateTicketRouter };