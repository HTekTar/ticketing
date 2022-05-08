import { Publisher, OrderCancelledEvent, Subjects } from '@henoktekatickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}