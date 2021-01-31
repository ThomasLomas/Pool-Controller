import { ItemOutput, PoolItem } from 'src/interfaces/PoolConfig';

export class ItemUpdatedEvent {
  oldItem: PoolItem;
  newItem: PoolItem;
  type: string;

  constructor(newItem: PoolItem, oldItem: PoolItem, type: string) {
    this.oldItem = oldItem;
    this.newItem = newItem;
    this.type = type;
  }
}

export class OutputUpdatedEvent {
  oldOutput: ItemOutput;
  newOutput: ItemOutput;
  item: PoolItem;

  constructor(newOutput: ItemOutput, oldOutput: ItemOutput, item: PoolItem) {
    this.oldOutput = oldOutput;
    this.item = item;
    this.newOutput = newOutput;
  }
}

export class OutputCreatedEvent {
  output: ItemOutput;
  item: PoolItem;

  constructor(output: ItemOutput, item: PoolItem) {
    this.output = output;
    this.item = item;
  }
}

export class OutputDeletedEvent {
  output: ItemOutput;
  item: PoolItem;

  constructor(output: ItemOutput, item: PoolItem) {
    this.output = output;
    this.item = item;
  }
}
