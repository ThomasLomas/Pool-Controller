import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import * as gpio from 'rpi-gpio';
import { LoggerService } from 'src/logger/logger.service';
import { from, Observable, of } from 'rxjs';
import { flatMap } from 'rxjs/operators';

@Injectable()
export class GpioService implements OnApplicationBootstrap {
  constructor(
    private loggerService: LoggerService,
    private configService: ConfigService,
  ) {}
  private gpiop;

  onApplicationBootstrap() {
    this.loggerService.setContext(GpioService.name);
    this.loggerService.log('Setting up GPIO');
    this.gpiop = gpio.promise;
    this.setupPins();
  }

  private setupPins() {
    const gpioConfig = this.configService.getConfig().gpio;
    if (gpioConfig.mock) {
      this.loggerService.log('GPIO running in mock mode');
      return;
    } else {
      this.loggerService.log('GPIO running in LIVE mode');
    }

    gpio.setMode(gpioConfig.naming === 'BCM' ? gpio.MODE_BCM : gpio.MODE_RPI);
    const config = this.configService.getConfig();
    const pins: number[] = [];

    config.items.forEach((item) => {
      item.outputs.forEach((output) => {
        if (output.pin) {
          pins.push(output.pin);
        }
      });
    });

    from(pins)
      .pipe(
        flatMap((pin: number) => from(this.gpiop.write(pin, gpio.DIR_HIGH))),
      )
      .subscribe(() => {
        this.loggerService.log('All pins set up');
      });
  }

  on(pin: number): Observable<any> {
    if (this.configService.getConfig().gpio.mock) {
      return of(true);
    }

    return from(this.gpiop.write(pin, true));
  }

  off(pin: number): Observable<any> {
    if (this.configService.getConfig().gpio.mock) {
      return of(true);
    }

    return from(this.gpiop.write(pin, false));
  }
}
