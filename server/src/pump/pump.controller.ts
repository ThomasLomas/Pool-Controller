import { Controller, Get, Param } from '@nestjs/common';
import { parse } from 'path';
import { Observable, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { LoggerService } from 'src/logger/logger.service';
import { SerialPortService } from 'src/serial-port/serial-port.service';
import { PentairService } from './pentair.service';

@Controller('pump')
export class PumpController {
  constructor(
    private pentairService: PentairService,
    private loggerService: LoggerService,
    private serialPortService: SerialPortService,
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
  status(): Observable<any> {
    this.loggerService.log('Got status request');

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
