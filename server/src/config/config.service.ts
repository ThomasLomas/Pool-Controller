import { Injectable } from '@nestjs/common';
import { PoolConfig } from 'src/interfaces/PoolConfig';
import * as fs from 'fs';
import { LoggerService } from 'src/logger/logger.service';
import { join } from 'path';

@Injectable()
export class ConfigService {
  PATH = join(__dirname, '..', '..', 'state.json');

  constructor(private loggerService: LoggerService) {}

  getConfig(): PoolConfig {
    return require(this.PATH);
  }

  updateConfig(poolConfig: PoolConfig): PoolConfig {
    this.loggerService.info('Writing new configuration');
    const encodedConfig: string = JSON.stringify(poolConfig, null, 4);
    fs.writeFileSync(this.PATH, encodedConfig);

    return poolConfig;
  }
}
