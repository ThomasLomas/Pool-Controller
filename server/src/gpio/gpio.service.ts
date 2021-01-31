import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import * as gpio from 'rpi-gpio';
import { LoggerService } from 'src/logger/logger.service';
import { from, Observable, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

@Injectable()
export class GpioService implements OnApplicationBootstrap, OnModuleDestroy {
  constructor(
    private loggerService: LoggerService,
    private configService: ConfigService,
  ) {}
  private gpiop: typeof gpio.promise;

  onApplicationBootstrap(): void {
    this.loggerService.setContext(GpioService.name);
    this.loggerService.log('Setting up GPIO');
    this.gpiop = gpio.promise;
    this.setupPins();
  }

  onModuleDestroy(): void {
    if (!this.configService.getConfig().gpio.mock) {
      this.gpiop.destroy();
    }
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
        concatMap((pin: number) => from(this.gpiop.setup(pin, gpio.DIR_LOW))),
      )
      .subscribe(() => {
        this.loggerService.log('All pins set up');
      });
  }
}
