import { OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { LoggerService } from 'src/logger/logger.service';
import { PoolTemp } from 'src/interfaces/PoolConfig';
import { InfluxService } from 'src/influx/influx.service';
import * as os from 'os';

@Injectable()
export class TemperatureService
  implements OnApplicationBootstrap, OnModuleDestroy {
  constructor(
    private loggerService: LoggerService,
    private configService: ConfigService,
    private influxService: InfluxService,
  ) {
    this.loggerService.setContext(TemperatureService.name);
  }

  private spiHandles = {};
  private temperatures = {};

  onApplicationBootstrap() {
    const tempConfig = this.configService.getConfig().temps;
    this.loggerService.log(
      `Setting up ${tempConfig.length} temperature sensor(s)`,
    );

    tempConfig
      .filter((temp) => temp.active)
      .forEach((temperature) => {
        if (temperature.mock) {
          setInterval(() => {
            this.temperatures[temperature.id] = Math.round(
              Math.random() * 400 + 700,
            );

            if (temperature.influx) {
              this.updateInflux(temperature.id);
            }
          }, temperature.interval);
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        this.spiHandles[temperature.id] = require('mcp-spi-adc').open(
          temperature.channel,
          { speedHz: temperature.speed },
          () => {
            setInterval(() => {
              this.spiHandles[temperature.id].read((_err, reading) => {
                this.temperatures[temperature.id] = this.calcTemperature(
                  temperature,
                  reading.rawValue,
                );

                if (temperature.influx) {
                  this.updateInflux(temperature.id);
                }
              });
            }, temperature.interval);
          },
        );
      });
  }

  updateInflux(temperatureId: string) {
    this.influxService.write(
      'temperatures',
      { temp: this.temperatures[temperatureId] },
      { hostname: os.hostname, id: temperatureId },
    ).catch((err) => {
      this.loggerService.error(
        `Error writing to influx: ${JSON.stringify(err)}`,
      );
    });
  }

  getTemperature(id: string) {
    return this.temperatures[id];
  }

  getTemperatures() {
    return this.configService.getConfig().temps.map((temp) => ({
      ...temp,
      temperature: this.getTemperature(temp.id),
    }));
  }

  calcTemperature(config: PoolTemp, adc: number): number {
    const invBeta = 1 / config.beta;
    const invT0 = 1.0 / 298.15; // 25c temp in Kelvin

    // Get average...
    const adcVal = config.adcMax - adc;

    const kelvin =
      1.0 / (invT0 + invBeta * Math.log(config.adcMax / adcVal - 1.0));
    const celcius = kelvin - 273.15; // convert to Celsius
    const fahrenheit = (9.0 * celcius) / 5.0 + 32.0; // convert to Fahrenheit

    // this.loggerService.debug(
    //   `Calculating Temperature: ${adc} to ${fahrenheit} F`,
    // );

    return fahrenheit;
  }

  onModuleDestroy() {
    Object.keys(this.spiHandles).forEach((spiHandleKey) => {
      this.spiHandles[spiHandleKey].close(() => {
        this.loggerService.log(`${spiHandleKey} now closed`);
      });
    });
  }
}
