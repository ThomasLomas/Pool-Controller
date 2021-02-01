import { Controller, Get } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from 'src/config/config.service';

@Controller('api/schedule')
export class ScheduleController {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private configService: ConfigService,
  ) {}

  @Get()
  getSchedule() {
    return this.configService.getConfig().schedule;
  }
}
