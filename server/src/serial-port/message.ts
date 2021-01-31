import { Subject } from 'rxjs';

export enum MessageDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export class Message {
  constructor(
    public data: Buffer | number[],
    public requiresResponse = false,
    public messageDirection = MessageDirection.OUTBOUND,
  ) {}

  public response$: Subject<Message> = new Subject<Message>();
}
