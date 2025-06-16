import { Test, TestingModule } from '@nestjs/testing';
import { MoverProfileService } from './mover-profile.service';

describe('MoverProfileService', () => {
  let service: MoverProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoverProfileService],
    }).compile();

    service = module.get<MoverProfileService>(MoverProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
