import { Test, TestingModule } from '@nestjs/testing';
import { HeaterService } from './heater.service';

describe('HeaterService', () => {
  let service: HeaterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HeaterService],
    }).compile();

    service = module.get<HeaterService>(HeaterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
