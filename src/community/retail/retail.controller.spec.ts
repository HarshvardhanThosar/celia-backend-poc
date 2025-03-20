import { Test, TestingModule } from '@nestjs/testing';
import { RetailController } from './retail.controller';
import { RetailService } from './retail.service';

describe('RetailController', () => {
  let controller: RetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RetailController],
      providers: [RetailService],
    }).compile();

    controller = module.get<RetailController>(RetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
