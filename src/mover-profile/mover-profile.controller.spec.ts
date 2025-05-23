import { Test, TestingModule } from '@nestjs/testing';
import { MoverProfileController } from './mover-profile.controller';
import { MoverProfileService } from './mover-profile.service';

describe('MoverProfileController', () => {
  let controller: MoverProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoverProfileController],
      providers: [MoverProfileService],
    }).compile();

    controller = module.get<MoverProfileController>(MoverProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
