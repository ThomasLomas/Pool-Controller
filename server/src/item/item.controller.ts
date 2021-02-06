import { Controller, Get, Param } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from 'src/config/config.service';
import { ItemOutput, ItemState, PoolItem } from 'src/interfaces/PoolConfig';
import { ItemUpdatedEvent } from './item.event';

@Controller('api/item')
export class ItemController {
  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Get(':itemid/:outputid/:state')
  updateStatus(
    @Param('itemid') itemId: string,
    @Param('outputid') outputId: string,
    @Param('state') state: ItemState,
  ) {
    const config = this.configService.getConfig();
    const items = config.items;

    const itemIndex = items.findIndex(
      (innerItem: PoolItem) => innerItem.id === itemId,
    );

    if (itemIndex >= 0) {
      const oldItem = JSON.parse(JSON.stringify(items[itemIndex])) as PoolItem;

      const outputIndex = items[itemIndex].outputs.findIndex(
        (innerOutput: ItemOutput) => innerOutput.id === outputId,
      );

      if (outputIndex >= 0) {
        items[itemIndex].outputs[outputIndex].state = state;
        this.configService.updateConfig(config);

        const item = items[itemIndex];

        this.eventEmitter.emit(
          `item.updated.${item.type}`,
          new ItemUpdatedEvent(item, oldItem, item.type),
        );
      }
    }
  }
}
