import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { LoggerService } from 'src/logger/logger.service';
import * as SerialPort from 'serialport';
import * as MockBinding from '@serialport/binding-mock';
import { Observable } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SerialPortService
  implements OnApplicationBootstrap, OnModuleDestroy {
  constructor(
    private loggerService: LoggerService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    this.loggerService.setContext('SerialPortService');
  }

  serialPort: SerialPort;
  isOpen = false;

  onApplicationBootstrap() {
    const config = this.configService.getConfig();
    this.loggerService.log('Setting up serial port');

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

    this.serialPort.on('open', () => this.onOpen());
    this.serialPort.on('data', (data) => this.onData(data));

    this.serialPort.open((err) => {
      if (err) {
        this.loggerService.error('Error opening serial port', err.message);
        this.isOpen = false;
      } else {
        this.loggerService.log('Request to open serial port was successful');
      }
    });
  }

  writeData(data: Buffer | number[]): Observable<number> {
    this.loggerService.debug('Write data event triggered');

    return new Observable<number>((subscriber) => {
      this.serialPort.write(data, (err, bytesWritten) => {
        if (err) {
          subscriber.error(err);
        } else {
          subscriber.next(bytesWritten);
          subscriber.complete();
        }
      });
    });
  }

  close(): Observable<boolean> {
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

  onOpen() {
    this.loggerService.log('Serial port opened');
    this.isOpen = true;
  }

  onData(data) {
    this.loggerService.debug('Received data', JSON.stringify(data));
    this.eventEmitter.emit('serialport.data', data);
  }

  async onModuleDestroy() {
    this.loggerService.log('Module is destroying');
    await this.close().toPromise();
  }
}
