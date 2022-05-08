import { Subjects, Publisher, OrderCreatedEvent } from '@henoktekatickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}