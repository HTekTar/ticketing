import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@henoktekatickets/common"
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListner extends Listener<OrderCreatedEvent>{
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: { id: string; version: number; status: OrderStatus; userId: string; expiresAt: string; tikcet: { id: string; price: number; }; }, msg: Message){
    const ticket = await Ticket.findById(data.tikcet.id);
    if(!ticket){
      throw new Error('Ticket not found');
    }
    ticket.set({ orderId: data.id })
    await ticket.save();
    new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title ,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });
    msg.ack();
  }
}