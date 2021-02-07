import { Subject } from 'rxjs';

export enum MessageDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export class Message {
  constructor(
    public data: number[],
    public requiresResponse = false,
    public messageDirection = MessageDirection.OUTBOUND,
    public maxTries = 5,
    public retryInterval = 5000,
    public retries = 0,
  ) {}

  public response$: Subject<Message> = new Subject<Message>();
}
