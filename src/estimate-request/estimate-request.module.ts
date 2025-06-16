import { Module } from '@nestjs/common';
import { EstimateRequestService } from './estimate-request.service';
import { EstimateRequestController } from './estimate-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstimateRequest } from './entities/estimate-request.entity';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import { EstimateOffer } from '@/estimate-offer/entities/estimate-offer.entity';
import { MoverProfile } from '@/mover-profile/entities/mover-profile.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      EstimateRequest,
      CustomerProfile,
      MoverProfile,
      EstimateOffer,
    ]),
  ],
  controllers: [EstimateRequestController],
  providers: [EstimateRequestService],
})
export class EstimateRequestModule {}
