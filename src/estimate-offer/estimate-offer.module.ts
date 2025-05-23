import { Module } from '@nestjs/common';
import { EstimateOfferService } from './estimate-offer.service';
import { EstimateOfferController } from './estimate-offer.controller';

@Module({
  controllers: [EstimateOfferController],
  providers: [EstimateOfferService],
})
export class EstimateOfferModule {}
