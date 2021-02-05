import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { LoggerService } from 'src/logger/logger.service';
import * as Influx from 'influx';

@Injectable()
export class InfluxService implements OnApplicationBootstrap {
  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService,
  ) {
    this.loggerService.setContext(InfluxService.name);
  }

  private influx: Influx.InfluxDB;

  write(measurement: string, fields: any, tags: any) {
    if (!this.influx) return;

    return this.influx.writePoints([
      {
        measurement,
        tags,
        fields,
      },
    ]);
  }

  onApplicationBootstrap() {
    const config = this.configService.getConfig().influx;

    if (config.active) {
      this.loggerService.log(
        `InfluxDB is active (host=${config.host}) (db=${config.db})`
      );

      this.influx = new Influx.InfluxDB({
        host: config.host,
        database: config.db,
        schema: [
          {
            measurement: 'temperatures',
            fields: { temp: Influx.FieldType.FLOAT },
            tags: ['hostname', 'id'],
          },
        ],
      });
    }
  }
}
