import { Publisher, PaymentCreatedEvent, Subjects } from "@henoktekatickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}