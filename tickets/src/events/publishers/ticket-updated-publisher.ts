import { Publisher, TicketUpdatedEvent, Subjects } from '@henoktekatickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
  subject: Subjects.TikcetUpdated = Subjects.TikcetUpdated;
}