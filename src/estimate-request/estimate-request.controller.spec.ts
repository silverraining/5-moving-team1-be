import { Test, TestingModule } from '@nestjs/testing';
import { EstimateRequestController } from './estimate-request.controller';
import { EstimateRequestService } from './estimate-request.service';

describe('EstimateRequestController', () => {
  let controller: EstimateRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstimateRequestController],
      providers: [EstimateRequestService],
    }).compile();

    controller = module.get<EstimateRequestController>(
      EstimateRequestController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
