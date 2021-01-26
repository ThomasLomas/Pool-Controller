export enum ItemState {
  ON = 'on',
  OFF = 'off',
}

export interface ItemOutput {
  name: string;
  id: string;
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
  id: string;
  name: string;
  type: ItemType;
  active: boolean;
  outputs: ItemOutput[];
  outputType: ItemOutputType;
}

export interface PoolTemp {
  id: string;
  description: string;
  value: number;
}

export interface PoolConfig {
  temps: PoolTemp[];
  items: PoolItem[];
}
