import { Test, TestingModule } from '@nestjs/testing';
import { EstimateOfferService } from './estimate-offer.service';

describe('EstimateOfferService', () => {
  let service: EstimateOfferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstimateOfferService],
    }).compile();

    service = module.get<EstimateOfferService>(EstimateOfferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
