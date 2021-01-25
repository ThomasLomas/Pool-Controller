export enum ItemState {
  ON = 'on',
  OFF = 'off',
}

export interface ItemOutput {
  name: string;
  state: ItemState;
  states: ItemState[];
}

export enum ItemOutputType {
  MULTI = 'multi', // Multi output
  SINGLE = 'single', // Single output
}

export enum ItemType {
  PUMP = 'pump',
  SALT = 'salt',
  HEATER = 'heater',
  ACTUATOR = 'actuator',
}

export interface PoolItem {
  name: string;
  type: ItemType;
  active: boolean;
  outputs: ItemOutput[];
  outputType: ItemOutputType;
}

export interface PoolConfig {
  items: PoolItem[];
}
