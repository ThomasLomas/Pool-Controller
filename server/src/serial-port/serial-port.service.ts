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
import { PentairService } from 'src/pump/pentair.service';
import { PoolConfig } from 'src/interfaces/PoolConfig';

@Injectable()
export class SerialPortService implements OnApplicationBootstrap, OnModuleDestroy {
  constructor(private loggerService: LoggerService, private configService: ConfigService, private pentairService: PentairService) {
    this.loggerService.setContext(SerialPortService.name);
  }

  private outboundQueue: Subject<Message> = new Subject<Message>();
  private inboundQueue: Subject<Message> = new Subject<Message>();
  private inboundBytes: number[] = [];
  private expectingData = false; // Will send random bytes that we dont care about

  private config: PoolConfig;
  private serialPort: SerialPort;

  onApplicationBootstrap() {
    this.config = this.configService.getConfig();
    this.loggerService.log('Setting up serial port');

    // Set up the connection
    if (this.config.serialPort.mock) {
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
        this.config.serialPort.rs485Port,
        this.config.serialPort.portSettings,
      );
    }

    // Basic events
    this.serialPort.on('open', () => this.onOpen());
    this.serialPort.on('data', (data) => this.onData(data));

    // Open up the connection
    this.serialPort.open((err) => {
      if (err) {
        this.loggerService.error('Error opening serial port', err.message);
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
      `Write data event triggered: ${JSON.stringify(message.data)} - Response required: ${message.requiresResponse}`,
    );

    this.outboundQueue.next(message);
    return message.response$.asObservable();
  }

  /**
   * Processes the queue sequentially
   */
  private processQueue(): void {
    this.outboundQueue.pipe(
      mergeMap((message: Message) => {
        this.loggerService.debug(
          `Picked up message on oubound queue: ${JSON.stringify(message.data)}`,
        );

        let responseSubscription: Subscription;

        const writeMessage = () => {
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

              if (responseSubscription) {
                responseSubscription.unsubscribe();
              }
            } else if (!message.requiresResponse) {
              message.response$.next(
                new Message([], false, MessageDirection.INBOUND),
              );
              message.response$.complete();
            }
          });
        };

        // If we require a response then subscribe to the inbound messages
        if (message.requiresResponse) {
          this.expectingData = true;
          let timeout: NodeJS.Timeout;
          this.loggerService.debug('Message requires a response');

          const handleTimeout = () => {
            message.retries += 1;
            if (message.retries > message.maxTries) {
              this.loggerService.error('Did not receive a response in time. Giving up');
              message.response$.error('No message response received');
              message.response$.complete();
              responseSubscription.unsubscribe();
            } else {
              this.loggerService.error(
                `Did not receive a response in time. Retrying ${message.retries}/${message.maxTries} times.`,
              );
              writeMessage();
              timeout = setTimeout(() => {
                handleTimeout();
              }, message.retryInterval);
            }
          };

          // After 5 seconds then try again
          timeout = setTimeout(() => {
            handleTimeout();
          }, message.retryInterval);

          responseSubscription = this.inboundQueue.subscribe(
            (inboundMessage) => {
              this.loggerService.log('Received message on the inbound queue');
              clearTimeout(timeout);
              message.response$.next(inboundMessage);
              message.response$.complete();
              responseSubscription.unsubscribe();
            },
          );

          // For now in mock mode force a message back
          if (this.config.serialPort.mock) {
            setTimeout(() => {
              this.inboundQueue.next(
                new Message(
                  [255, 0, 255, 165, 0, 33, 96, 7, 15, 10, 0, 0, 2, 62, 7, 208, 0, 0, 0, 0, 2, 49, 15, 11, 2, 170],
                  false,
                  MessageDirection.INBOUND,
                ),
              );
            }, 50);
          }
        }

        writeMessage();

        // Only move on when we have a response
        return message.response$.pipe(catchError(() => of({})));
      }, null, 1),
    ).subscribe();
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
    this.processQueue();
  }

  private onData(data: Buffer) {
    const parsedData = data.toJSON().data;

    if (!this.expectingData) {
      this.loggerService.debug(`Received unexpected data: ${parsedData}`);
      return;
    }

    this.inboundBytes = this.inboundBytes.concat(parsedData);

    this.loggerService.debug(
      `Received data: ${JSON.stringify(
        parsedData,
      )}; Response so far: ${JSON.stringify(this.inboundBytes)}`,
    );

    // Bigger than the first 3 (payload header), 1 data byte, and 2 checksum bytes
    if (this.inboundBytes.length > 6) {
      // Copy to a local version so we dont accidentally screw up the main one
      const inboundBytes: number[] = JSON.parse(
        JSON.stringify(this.inboundBytes),
      );
      // Remove first 3 (payload header)
      inboundBytes.splice(0, 3);

      // remove last 2 (checksum)
      inboundBytes.splice(-2, 2);

      const [bigChecksum, littleChecksum] = this.pentairService.getChecksum(
        inboundBytes,
      );

      const bufferBigChecksum = this.inboundBytes[this.inboundBytes.length - 2];
      const bufferLittleChecksum = this.inboundBytes[this.inboundBytes.length - 1];

      this.loggerService.debug(
        `Calculated checksum: ${bigChecksum}/${bufferBigChecksum} ${littleChecksum}/${bufferLittleChecksum}`,
      );

      if (
        bigChecksum === bufferBigChecksum &&
        littleChecksum === bufferLittleChecksum
      ) {
        this.loggerService.debug(
          `Completed full response: ${JSON.stringify(this.inboundBytes)}`,
        );
        this.expectingData = false;
        this.inboundQueue.next(
          new Message(this.inboundBytes, false, MessageDirection.INBOUND),
        );
        this.inboundBytes = [];
      }
    }
  }

  async onModuleDestroy() {
    this.loggerService.log('Module is destroying');
    await this.close().toPromise();
  }
}
