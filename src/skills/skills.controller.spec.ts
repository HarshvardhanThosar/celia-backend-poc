import { Test, TestingModule } from '@nestjs/testing';
import { SkillController } from './skills.controller';
import { SkillService } from './skills.service';

describe('SkillsController', () => {
  let controller: SkillController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillController],
      providers: [SkillService],
    }).compile();

    controller = module.get<SkillController>(SkillController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
