import { Test, TestingModule } from '@nestjs/testing';
import { EstimateRequestService } from './estimate-request.service';

describe('EstimateRequestService', () => {
  let service: EstimateRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstimateRequestService],
    }).compile();

    service = module.get<EstimateRequestService>(EstimateRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
