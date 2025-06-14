import { Module } from '@nestjs/common';
import { EstimateOfferService } from './estimate-offer.service';
import { EstimateOfferController } from './estimate-offer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstimateOffer } from './entities/estimate-offer.entity';
import { EstimateRequest } from '@/estimate-request/entities/estimate-request.entity';
import { MoverProfile } from '@/mover-profile/entities/mover-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EstimateOffer, EstimateRequest, MoverProfile]),
  ],
  controllers: [EstimateOfferController],
  providers: [EstimateOfferService],
  exports: [EstimateOfferService],
})
export class EstimateOfferModule {}
