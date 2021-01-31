import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { GpioService } from 'src/gpio/gpio.service';
import { ItemState } from 'src/interfaces/PoolConfig';
import { OutputDeletedEvent, OutputUpdatedEvent } from 'src/item/item.event';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class ActuatorService {
  constructor(
    private loggerService: LoggerService,
    private gpioService: GpioService,
  ) {}

  @OnEvent('output.deleted.actuator')
  handleOutputDeleted(payload: OutputDeletedEvent): void {
    if (payload.output.state === ItemState.OFF) {
      this.loggerService.log(
        `Actuator ${payload.output.name} was deleted - already turned off`,
      );
    } else if (payload.output.state === ItemState.ON) {
      this.loggerService.log(
        `Actuator ${payload.output.name} was deleted - turning off`,
      );

      this.gpioService.off(payload.output.pin);
    }
  }

  @OnEvent('output.updated.actuator')
  handleOutputUpdated(payload: OutputUpdatedEvent): void {
    this.loggerService.log(
      `Actuator ${payload.newOutput.name} now ${payload.newOutput.state} (was ${payload.oldOutput.state})`,
    );

    if (payload.newOutput.state === ItemState.OFF) {
      this.gpioService.off(payload.newOutput.pin);
    } else if (payload.newOutput.state === ItemState.ON) {
      this.gpioService.on(payload.newOutput.pin);
    }
  }
}
