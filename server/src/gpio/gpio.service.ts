import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import * as gpio from 'rpi-gpio';
import { LoggerService } from 'src/logger/logger.service';
import { from, Observable, of } from 'rxjs';
import { flatMap, toArray } from 'rxjs/operators';

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
    this.loggerService.debug(`Turning pin ${pin} on`);

    if (this.configService.getConfig().gpio.mock) {
      return of(false);
    }

    return from(this.gpiop.write(pin, false));
  }

  off(pin: number): Observable<any> {
    this.loggerService.debug(`Turning pin ${pin} off`);

    if (this.configService.getConfig().gpio.mock) {
      return of(true);
    }

    return from(this.gpiop.write(pin, true));
  }

  setup(pin: number): Observable<any> {
    this.loggerService.debug(`Turning pin ${pin} to low`);

    if (this.configService.getConfig().gpio.mock) {
      return of(true);
    }

    return from(this.gpiop.setup(pin, gpio.DIR_HIGH));
  }

  private setupPins() {
    const gpioConfig = this.configService.getConfig().gpio;
    if (gpioConfig.mock) {
      this.loggerService.log('GPIO running in mock mode');
    } else {
      this.loggerService.log(
        `GPIO running in LIVE mode (naming=${gpioConfig.naming})`,
      );
      gpio.setMode(gpioConfig.naming === 'BCM' ? gpio.MODE_BCM : gpio.MODE_RPI);
    }

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
        flatMap((pin: number) => this.setup(pin), 1),
        toArray(),
      )
      .subscribe(() => {
        this.loggerService.log('All pins set up');
      });
  }
}
