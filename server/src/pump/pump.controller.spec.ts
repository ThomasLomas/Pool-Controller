import { Test, TestingModule } from '@nestjs/testing';
import { PumpController } from './pump.controller';

describe('PumpController', () => {
  let controller: PumpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PumpController],
    }).compile();

    controller = module.get<PumpController>(PumpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
