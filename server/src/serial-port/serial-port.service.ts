import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { LoggerService } from 'src/logger/logger.service';
import * as SerialPort from 'serialport';
import * as MockBinding from '@serialport/binding-mock';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SerialPortService implements OnApplicationBootstrap {
  constructor(
    private loggerService: LoggerService,
    private configService: ConfigService,
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

  @OnEvent('serialbus.write')
  writeData(data) {
    this.loggerService.debug('Write data event triggered');
  }

  onOpen() {
    this.loggerService.log('Serial port opened');
    this.isOpen = true;
  }

  onData(data) {
    this.loggerService.debug('Received data', JSON.stringify(data));
  }
}
