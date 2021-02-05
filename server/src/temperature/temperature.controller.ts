import { Controller, Get } from '@nestjs/common';
import { TemperatureService } from './temperature.service';

@Controller('api/temperature')
export class TemperatureController {
  constructor(private temperatureService: TemperatureService) {}

  @Get()
  getTemperatures() {
    return this.temperatureService.getTemperatures();
  }
}
