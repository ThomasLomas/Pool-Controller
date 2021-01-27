import { Test, TestingModule } from '@nestjs/testing';
import { SerialPortService } from './serial-port.service';

describe('SerialPortService', () => {
  let service: SerialPortService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SerialPortService],
    }).compile();

    service = module.get<SerialPortService>(SerialPortService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
