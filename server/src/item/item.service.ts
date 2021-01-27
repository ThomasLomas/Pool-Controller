import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PoolItem } from 'src/interfaces/PoolConfig';
import { LoggerService } from 'src/logger/logger.service';
import {
  ItemUpdatedEvent,
  OutputCreatedEvent,
  OutputDeletedEvent,
  OutputUpdatedEvent,
} from './item.event';

@Injectable()
export class ItemService {
  constructor(
    private loggerService: LoggerService,
    private eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('item.updated.*')
  handleEventUpdates(payload: ItemUpdatedEvent): void {
    const newItem: PoolItem = payload.newItem;
    const oldItem: PoolItem = payload.oldItem;

    this.loggerService.log(
      `Got ${payload.type} update for ${newItem.id} ${newItem.name}`,
    );

    const deletedOutputs = oldItem.outputs.filter(
      (output) =>
        newItem.outputs.findIndex((newOutput) => newOutput.id === output.id) ===
        -1,
    );

    const newOutputs = newItem.outputs.filter(
      (output) =>
        oldItem.outputs.findIndex((newOutput) => newOutput.id === output.id) ===
        -1,
    );

    const changedOutputsStates = newItem.outputs.filter((output) => {
      const correspondingOldItem = oldItem.outputs.find(
        (oldOutput) => oldOutput.id === output.id,
      );

      return (
        correspondingOldItem && correspondingOldItem.state !== output.state
      );
    });

    this.loggerService.log(`Found ${deletedOutputs.length} deleted output(s)`);
    this.loggerService.log(`Found ${newOutputs.length} new output(s)`);
    this.loggerService.log(
      `Found ${changedOutputsStates.length} changed output states`,
    );

    deletedOutputs.forEach((output) => {
      this.eventEmitter.emit(
        `output.deleted.${payload.type}`,
        new OutputDeletedEvent(output, payload.type),
      );
    });

    newOutputs.forEach((output) => {
      this.eventEmitter.emit(
        `output.created.${payload.type}`,
        new OutputCreatedEvent(output, payload.type),
      );
    });

    changedOutputsStates.forEach((output) => {
      this.eventEmitter.emit(
        `output.updated.${payload.type}`,
        new OutputUpdatedEvent(
          output,
          oldItem.outputs.find((oldOutput) => oldOutput.id === output.id),
          payload.type,
        ),
      );
    });
  }
}
