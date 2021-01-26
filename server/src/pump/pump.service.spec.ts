import { Test, TestingModule } from '@nestjs/testing';
import { PumpService } from './pump.service';

describe('PumpService', () => {
  let service: PumpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PumpService],
    }).compile();

    service = module.get<PumpService>(PumpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
