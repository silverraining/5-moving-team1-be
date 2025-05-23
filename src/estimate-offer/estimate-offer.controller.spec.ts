import { Test, TestingModule } from '@nestjs/testing';
import { EstimateOfferController } from './estimate-offer.controller';
import { EstimateOfferService } from './estimate-offer.service';

describe('EstimateOfferController', () => {
  let controller: EstimateOfferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstimateOfferController],
      providers: [EstimateOfferService],
    }).compile();

    controller = module.get<EstimateOfferController>(EstimateOfferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
