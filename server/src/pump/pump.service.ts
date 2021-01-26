import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ItemState } from 'src/interfaces/PoolConfig';
import { OutputDeletedEvent, OutputUpdatedEvent } from 'src/item/item.event';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class PumpService {
  constructor(private loggerService: LoggerService) {}

  @OnEvent('output.deleted.pump')
  handleOutputDeleted(payload: OutputDeletedEvent): void {
    if (payload.output.state === ItemState.OFF) {
      this.loggerService.info(
        `Output ${payload.output.name} was already turned off`,
      );
      return;
    }
    // Handle output being deleted
  }

  @OnEvent('output.updated.pump')
  handleOutputUpdated(payload: OutputUpdatedEvent): void {
    this.loggerService.info(
      `Output ${payload.newOutput.name} now ${payload.newOutput.state} (was ${payload.oldOutput.state})`,
    );
    // Handle output being updated
  }
}
