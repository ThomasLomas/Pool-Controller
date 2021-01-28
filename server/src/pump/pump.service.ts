import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
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

    // Handle output being deleted
  }

  @OnEvent('output.updated.pump')
  handleOutputUpdated(payload: OutputUpdatedEvent): void {
    this.loggerService.log(
      `Output ${payload.newOutput.name} now ${payload.newOutput.state} (was ${payload.oldOutput.state})`,
    );

    this.pentairService.remoteControl(false);
    // Handle output being updated
  }

  enableRemoteControl() {
    // eslint-disable-next-line prettier/prettier
    return this.serialPortService.writeData([255, 0, 255, 165, 0, 96, 33, 4, 1, 255, 2, 42]);
  }

  sendPumpData() {
    this.serialPortService.writeData([]).subscribe((resp) => {
      console.log(resp);
    });
  }

  @OnEvent('serialport.data')
  handlePumpData(data: any) {
    console.log(data);
  }
}
