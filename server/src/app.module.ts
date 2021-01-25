import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigController } from './config/config.controller';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { LoggerService } from './logger/logger.service';
import { ItemController } from './item/item.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client', 'dist', 'client')
    }),
  ],
  controllers: [ConfigController, ItemController],
  providers: [LoggerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
