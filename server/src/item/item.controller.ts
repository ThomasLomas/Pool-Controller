import { Body, Controller, Put } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from 'src/config/config.service';
import { PoolItem } from 'src/interfaces/PoolConfig';
import { ItemUpdatedEvent } from './item.event';

@Controller('api/item')
export class ItemController {
  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Put()
  updateItem(@Body() item: PoolItem) {
    const config = this.configService.getConfig();
    const items = config.items;
    const itemIndex = items.findIndex(
      (innerItem: PoolItem) => innerItem.id === item.id,
    );

    if (itemIndex >= 0) {
      const oldItem = JSON.parse(JSON.stringify(items[itemIndex])) as PoolItem;
      items[itemIndex] = item;
      this.configService.updateConfig(config);
      this.eventEmitter.emit(
        `item.updated.${item.type}`,
        new ItemUpdatedEvent(item, oldItem, item.type),
      );
    }

    return this.configService.getConfig();
  }
}
