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

export interface SerialPort {
  mock: boolean;
  rs485Port: string;
  portSettings: SerialPortSettings;
}

export interface SerialPortSettings {
  baudRate:
    | 115200
    | 57600
    | 38400
    | 19200
    | 9600
    | 4800
    | 2400
    | 1800
    | 1200
    | 600
    | 300
    | 200
    | 150
    | 134
    | 110
    | 75
    | 50
    | number;
  dataBits: 8 | 7 | 6 | 5;
  parity: 'none' | 'even' | 'mark' | 'odd' | 'space';
  stopBits: 1 | 2;
  flowControl: boolean;
  autoOpen: boolean;
  lock: boolean;
}

export interface PoolConfig {
  serialPort: SerialPort;
  temps: PoolTemp[];
  items: PoolItem[];
}
