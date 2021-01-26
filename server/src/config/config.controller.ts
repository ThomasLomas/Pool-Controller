import { Controller, Get } from '@nestjs/common';
import { PoolConfig } from '../interfaces/PoolConfig';
import { ConfigService } from './config.service';

@Controller('api/config')
export class ConfigController {
  constructor(private configService: ConfigService) {}
  @Get()
  getConfig(): PoolConfig {
    return this.configService.getConfig();
  }
}
