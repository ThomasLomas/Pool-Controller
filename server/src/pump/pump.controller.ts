import { Controller, Get, Param } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from 'src/config/config.service';
import { LoggerService } from 'src/logger/logger.service';
import { SerialPortService } from 'src/serial-port/serial-port.service';
import { PentairStatus } from './pentair.enum';
import { PentairService } from './pentair.service';

@Controller('api/pump')
export class PumpController {
  constructor(
    private pentairService: PentairService,
    private loggerService: LoggerService,
    private serialPortService: SerialPortService,
    private configService: ConfigService,
  ) {}

  @Get('remote/:state')
  remote(@Param('state') state: string): Observable<any> {
    this.loggerService.log(`Setting remote ${state}`);

    return this.serialPortService
      .write(this.pentairService.remoteControl(state === 'on'))
      .pipe(
        map((response) => {
          this.loggerService.debug(
            'Got remote response',
            JSON.stringify(response.data),
          );

          return response.data;
        }),
      );
  }

  @Get('status')
  status(): Observable<PentairStatus> {
    this.loggerService.log('Got status request');

    if (this.configService.getConfig().serialPort.mock) {
      return of({
        isRunning: true,
        watts: 100,
        rpm: 1700,
        timerHour: 0,
        timerMin: 0,
        clockHour: 17,
        clockMin: 55,
      });
    }

    return this.serialPortService.write(this.pentairService.getStatus()).pipe(
      map((status) => {
        const parsedStatus = this.pentairService.parseStatus(status);
        this.loggerService.debug(
          'Got status response',
          JSON.stringify(parsedStatus),
        );

        return parsedStatus;
      }),
    );
  }
}
