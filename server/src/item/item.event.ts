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
  type: string;

  constructor(newOutput: ItemOutput, oldOutput: ItemOutput, type: string) {
    this.oldOutput = oldOutput;
    this.type = type;
    this.newOutput = newOutput;
  }
}

export class OutputCreatedEvent {
  output: ItemOutput;
  type: string;

  constructor(output: ItemOutput, type: string) {
    this.output = output;
    this.type = type;
  }
}

export class OutputDeletedEvent {
  output: ItemOutput;
  type: string;

  constructor(output: ItemOutput, type: string) {
    this.output = output;
    this.type = type;
  }
}
