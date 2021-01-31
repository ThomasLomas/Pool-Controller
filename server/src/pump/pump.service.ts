import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { flatMap } from 'rxjs/operators';
import { ItemState } from 'src/interfaces/PoolConfig';
import { OutputDeletedEvent, OutputUpdatedEvent } from 'src/item/item.event';
import { LoggerService } from 'src/logger/logger.service';
import { SerialPortService } from 'src/serial-port/serial-port.service';
import { PentairService } from './pentair.service';

@Injectable()
export class PumpService {
  constructor(
    private loggerService: LoggerService,
    private serialPortService: SerialPortService,
    private pentairService: PentairService,
  ) {}

  @OnEvent('output.deleted.pump')
  handleOutputDeleted(payload: OutputDeletedEvent): void {
    if (payload.output.state === ItemState.OFF) {
      this.loggerService.log(
        `Output ${payload.output.name} was already turned off`,
      );
      return;
    }

    // @todo Handle output being deleted
  }

  @OnEvent('output.updated.pump')
  handleOutputUpdated(payload: OutputUpdatedEvent): void {
    this.loggerService.log(
      `Output ${payload.newOutput.name} now ${payload.newOutput.state} (was ${payload.oldOutput.state})`,
    );

    this.serialPortService
      .write(this.pentairService.remoteControl(true))
      .pipe(
        flatMap(() =>
          this.serialPortService.write(this.pentairService.getStatus()),
        ),
      )
      .subscribe((message) => {
        console.log('Status message back: ', message);
      });

    // @todo Handle output being updated
  }
}
