import { Controller, Get } from '@nestjs/common';
import { SystemService } from './system.service';

@Controller('api/system')
export class SystemController {
  constructor(private readonly systemService: SystemService) { }

  @Get('restart/app')
  restartApp() {
    this.systemService.restartApp();
  }

  @Get('restart/system')
  restartSystem() {
    return this.systemService.restartServer();
  }
}
