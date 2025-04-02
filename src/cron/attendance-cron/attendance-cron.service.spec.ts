import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance-cron.service';

describe('AttendanceCronService', () => {
  let service: AttendanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttendanceService],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
