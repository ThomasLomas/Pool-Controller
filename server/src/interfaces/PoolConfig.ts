export enum ItemState {
  ON = 'on',
  OFF = 'off',
}

export interface ItemOutput {
  name: string;
  id: string;
  state: ItemState;
  states: ItemState[];
  pin?: number;
  pumpMode?: number;
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
  active: boolean;
  mock: boolean;
  name: string;
  type: 'spi';
  beta: number;
  adcMax: number;
  speed: number;
  interval: number;
  channel: number;
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

export interface GpioConfig {
  mock: boolean;
  naming: 'BCM' | 'RPI';
}

export interface ScheduleConfig {
  active: boolean;
  schedules: Schedule[];
}

export interface Schedule {
  name: string;
  time: string;
  actions: ScheduleAction[];
  active: boolean;
}

export interface ScheduleAction {
  action: string;
  params: string[];
}

export interface PoolConfig {
  schedule: ScheduleConfig;
  gpio: GpioConfig;
  serialPort: SerialPort;
  temps: PoolTemp[];
  items: PoolItem[];
}
