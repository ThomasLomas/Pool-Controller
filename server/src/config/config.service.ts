import { Injectable } from '@nestjs/common';
import { PoolConfig } from 'src/interfaces/PoolConfig';
import * as fs from 'fs';
import { LoggerService } from 'src/logger/logger.service';
import { join } from 'path';

@Injectable()
export class ConfigService {
  PATH = join(__dirname, '..', '..', 'state.json');

  constructor(private loggerService: LoggerService) {
    this.loggerService.setContext('ConfigService');
  }

  getConfig(): PoolConfig {
    return JSON.parse(
      fs.readFileSync(this.PATH).toString('ascii'),
    ) as PoolConfig;
  }

  updateConfig(poolConfig: PoolConfig): PoolConfig {
    this.loggerService.log('Writing new configuration');
    const encodedConfig: string = JSON.stringify(poolConfig, null, 2);
    fs.writeFileSync(this.PATH, encodedConfig);

    return poolConfig;
  }
}
