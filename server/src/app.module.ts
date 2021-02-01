import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigController } from './config/config.controller';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { LoggerService } from './logger/logger.service';
import { ItemController } from './item/item.controller';
import { ConfigService } from './config/config.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PumpService } from './pump/pump.service';
import { ItemService } from './item/item.service';
import { SerialPortService } from './serial-port/serial-port.service';
import { PentairService } from './pump/pentair.service';
import { GpioService } from './gpio/gpio.service';
import { ActuatorService } from './actuator/actuator.service';
import { HeaterService } from './heater/heater.service';
import { PumpController } from './pump/pump.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ScheduleController } from './schedule/schedule.controller';
import { ScheduleService } from './schedule/schedule.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client', 'dist', 'client')
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    ConfigController,
    ItemController,
    PumpController,
    ScheduleController,
  ],
  providers: [
    LoggerService,
    ConfigService,
    PumpService,
    ItemService,
    SerialPortService,
    PentairService,
    GpioService,
    ActuatorService,
    HeaterService,
    ScheduleService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
