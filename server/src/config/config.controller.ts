import { Controller, Get } from '@nestjs/common';
import {
  PoolConfig,
  ItemState,
  ItemOutputType,
  ItemType,
} from '../interfaces/PoolConfig';

@Controller('api/config')
export class ConfigController {
  @Get()
  getConfig(): PoolConfig {
    return {
      items: [
        {
          name: 'Salt',
          type: ItemType.SALT,
          active: false,
          outputType: ItemOutputType.SINGLE,
          outputs: [],
        },
        {
          name: 'Pump',
          active: true,
          type: ItemType.PUMP,
          outputType: ItemOutputType.SINGLE,
          outputs: [
            {
              name: 'Pump 1 (Pool Mode)',
              state: ItemState.OFF,
              states: [ItemState.OFF, ItemState.ON],
            },
            {
              name: 'Pump 2 (Spa Mode Heating)',
              state: ItemState.OFF,
              states: [ItemState.OFF, ItemState.ON],
            },
            {
              name: 'Pump 3 (Spa Mode Hot)',
              state: ItemState.OFF,
              states: [ItemState.OFF, ItemState.ON],
            },
            {
              name: 'Pump 4 (Not Used)',
              state: ItemState.OFF,
              states: [ItemState.OFF, ItemState.ON],
            },
          ],
        },
        {
          name: 'Actuators',
          type: ItemType.ACTUATOR,
          active: true,
          outputType: ItemOutputType.MULTI,
          outputs: [
            {
              name: 'Suction',
              state: ItemState.OFF,
              states: [ItemState.OFF, ItemState.ON],
            },
            {
              name: 'Pressure',
              state: ItemState.OFF,
              states: [ItemState.OFF, ItemState.ON],
            },
          ],
        },
        {
          name: 'Heater',
          type: ItemType.HEATER,
          active: true,
          outputType: ItemOutputType.SINGLE,
          outputs: [
            {
              name: 'Pool',
              state: ItemState.OFF,
              states: [ItemState.OFF, ItemState.ON],
            },
            {
              name: 'Spa',
              state: ItemState.OFF,
              states: [ItemState.OFF, ItemState.ON],
            },
          ],
        },
      ],
    };
  }
}
