import { Publisher, ExpirationCompleteEvent, Subjects } from "@henoktekatickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}