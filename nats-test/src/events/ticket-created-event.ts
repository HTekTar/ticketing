import { Subjects } from "./subjects";

export interface TicketCreatedEvent{
  subject: Subjects.TicketCreated;
  data: {
    title: string,
    price: number,
    id: string
  };
}