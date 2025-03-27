import { Test, TestingModule } from '@nestjs/testing';
import { RetailItemsCronService } from './retail-items-cron.service';

describe('RetailItemsCronService', () => {
  let service: RetailItemsCronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetailItemsCronService],
    }).compile();

    service = module.get<RetailItemsCronService>(RetailItemsCronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
