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

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client', 'dist', 'client')
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
  ],
  controllers: [ConfigController, ItemController],
  providers: [
    LoggerService,
    ConfigService,
    PumpService,
    ItemService,
    SerialPortService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
