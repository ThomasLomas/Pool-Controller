import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { LoggerService } from 'src/logger/logger.service';
import * as SerialPort from 'serialport';
import * as MockBinding from '@serialport/binding-mock';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { Message, MessageDirection } from './message';

@Injectable()
export class SerialPortService
  implements OnApplicationBootstrap, OnModuleDestroy {
  constructor(
    private loggerService: LoggerService,
    private configService: ConfigService,
  ) {
    this.loggerService.setContext('SerialPortService');
  }

  private outboundQueue: Subject<Message> = new Subject<Message>();
  private inboundQueue: Subject<Message> = new Subject<Message>();

  private serialPort: SerialPort;
  private isOpen = false;

  onApplicationBootstrap() {
    const config = this.configService.getConfig();
    this.loggerService.log('Setting up serial port');

    // Set up the connection
    if (config.serialPort.mock) {
      this.loggerService.log('Running in mock mode');

      // The dev typescript for this show it as readonly, but this contradicts the documentation.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      SerialPort.Binding = MockBinding;

      const portPath = 'FAKE_PORT';
      MockBinding.createPort(portPath, { echo: false, record: true });
      this.serialPort = new SerialPort(portPath, { autoOpen: false });
    } else {
      this.loggerService.log('Running in live mode');
      this.serialPort = new SerialPort(
        config.serialPort.rs485Port,
        config.serialPort.portSettings,
      );
    }

    // Basic events
    this.serialPort.on('open', () => this.onOpen());
    this.serialPort.on('data', (data) => this.onData(data));

    // Open up the connection
    this.serialPort.open((err) => {
      if (err) {
        this.loggerService.error('Error opening serial port', err.message);
        this.isOpen = false;
      } else {
        this.loggerService.log('Request to open serial port was successful');
      }
    });
  }

  /**
   * Write a new message - behind the scenes this is buffered due to half duplex connection
   */
  write(message: Message): Observable<Message> {
    this.loggerService.debug(
      `Write data event triggered: ${JSON.stringify(
        message.data,
      )} - Response required: ${message.requiresResponse}`,
    );

    this.outboundQueue.next(message);
    return message.response$.asObservable();
  }

  /**
   * Processes the queue sequentially
   */
  private processQueue(): void {
    this.outboundQueue
      .pipe(
        mergeMap(
          (message: Message) => {
            this.loggerService.debug(
              `Picked up message on oubound queue: ${JSON.stringify(
                message.data,
              )}`,
            );

            // If we require a response then subscribe to the inbound messages
            if (message.requiresResponse) {
              this.loggerService.debug('Message requires a response');

              const subscription: Subscription = this.inboundQueue.subscribe(
                (inboundMessage) => {
                  this.loggerService.log(
                    'Received message on the inbound queue',
                  );
                  message.response$.next(inboundMessage);
                  message.response$.complete();
                  subscription.unsubscribe();
                },
              );
            }

            this.serialPort.write(message.data, (err) => {
              this.loggerService.debug(
                `Message sent: ${JSON.stringify(message.data)}`,
              );

              if (err) {
                this.loggerService.error(
                  `Serial port completed with error: ${err.message}`,
                  err.stack,
                );
                message.response$.error(err);
                message.response$.complete();
              } else if (!message.requiresResponse) {
                message.response$.next(
                  new Message([], false, MessageDirection.INBOUND),
                );
                message.response$.complete();
              }
            });

            // Only move on when we have a response
            return message.response$.pipe(catchError(() => of({})));
          },
          null,
          1,
        ),
      )
      .subscribe();
  }

  /**
   * Close the connection
   */
  private close(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      this.serialPort.close((err) => {
        if (err) {
          subscriber.error(err);
        } else {
          subscriber.next(true);
          subscriber.complete();
        }
      });
    });
  }

  private onOpen() {
    this.loggerService.log('Serial port opened');
    this.isOpen = true;
    this.processQueue();
  }

  private onData(data: Buffer) {
    this.loggerService.debug(`Received data: ${JSON.stringify(data)}`);
    // this.inboundQueue.next(new Message(data, false, MessageDirection.INBOUND));
  }

  async onModuleDestroy() {
    this.loggerService.log('Module is destroying');
    await this.close().toPromise();
  }
}
