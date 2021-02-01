import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ConfigService } from 'src/config/config.service';
import { ItemOutputType, ItemState, PoolItem } from 'src/interfaces/PoolConfig';
import { ItemUpdatedEvent } from 'src/item/item.event';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class ScheduleService implements OnApplicationBootstrap {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private loggerService: LoggerService,
  ) {
    this.loggerService.setContext(ScheduleService.name);
  }

  onApplicationBootstrap() {
    this.loggerService.log('Setting up scheduler');
    const config = this.configService.getConfig().schedule;

    if (config.active) {
      this.loggerService.log(
        'Scheduler is activated, proceeding to load schedules',
      );

      config.schedules
        .filter((schedule) => schedule.active)
        .forEach((schedule) => {
          const job = new CronJob(schedule.time, () => {
            this.loggerService.debug(
              `Invoking ${schedule.action} with params: ${JSON.stringify(
                schedule.params,
              )}`,
            );
            this[schedule.action].call(this, ...schedule.params);
          });

          this.schedulerRegistry.addCronJob(schedule.name, job);
          job.start();

          this.loggerService.log(
            `Job ${schedule.name} was scheduled at time ${schedule.time}`,
          );
        });
    } else {
      this.loggerService.log('Scheduler is deactivated');
    }
  }

  changeOutputState(itemId: string, outputId: string, state: ItemState) {
    this.loggerService.log(
      `Changing ${itemId} -> ${outputId} state to ${state}`,
    );
    const config = this.configService.getConfig();
    const items = config.items;
    const itemIndex = items.findIndex((item) => item.id === itemId);
    const item = items[itemIndex];

    if (item && item.active) {
      const oldItem = JSON.parse(JSON.stringify(item)) as PoolItem;

      if (item.outputType === ItemOutputType.SINGLE) {
        item.outputs.forEach((output, index) => {
          item.outputs[index].state = ItemState.OFF;
        });
      }

      const outputIndex = item.outputs.findIndex(
        (output) => output.id === outputId,
      );

      if (outputIndex >= 0) {
        item.outputs[outputIndex].state = state;
      }

      console.log(item);

      config[itemIndex] = item;
      this.configService.updateConfig(config);

      this.eventEmitter.emit(
        `item.updated.${item.type}`,
        new ItemUpdatedEvent(item, oldItem, item.type),
      );
    }
  }
}
