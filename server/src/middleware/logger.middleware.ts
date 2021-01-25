import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private loggerService: LoggerService) {}
  use(req: Request, res: Response, next: NextFunction) {
    if (req.params[0]) {
      this.loggerService.info(`Request Received for /${req.params[0]}`);
    }

    next();
  }
}
