import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { LoggerService } from 'src/logger/logger.service';
import { InfluxDB, Point, HttpError, WriteApi } from '@influxdata/influxdb-client';

@Injectable()
export class InfluxService implements OnApplicationBootstrap {
  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService,
  ) {
    this.loggerService.setContext(InfluxService.name);
  }

  private influx: InfluxDB;
  private writeApi: WriteApi;

  write(measurement: string, fields: Record<string, unknown>, tags: Record<string, unknown>) {
    if (!this.influx) return;

    const point = new Point(measurement);

    Object.keys(tags).forEach((tagName) => {
      point.tag(tagName, tags[tagName] as string);
    });

    Object.keys(fields).forEach((fieldName) => {
      point.floatField(fieldName, fields[fieldName]);
    });

    this.writeApi.writePoint(point);

    return this.writeApi.flush();
  }

  onApplicationBootstrap() {
    const config = this.configService.getConfig().influx;

    if (config.active) {
      this.loggerService.log(
        `InfluxDB is active (url=${config.url}) (bucket=${config.bucket})`
      );

      this.influx = new InfluxDB({
        url: config.url,
        token: config.token
      });

      this.writeApi = this.influx.getWriteApi(config.org, config.bucket, 'ms');
    }
  }
}
