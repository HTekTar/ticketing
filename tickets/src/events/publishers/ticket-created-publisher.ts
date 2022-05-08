import { Publisher, TicketCreatedEvent, Subjects } from '@henoktekatickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}