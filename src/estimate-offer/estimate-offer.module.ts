import { Module } from '@nestjs/common';
import { EstimateOfferService } from './estimate-offer.service';
import { EstimateOfferController } from './estimate-offer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstimateOffer } from './entities/estimate-offer.entity';
import { EstimateRequest } from '@/estimate-request/entities/estimate-request.entity';
import { MoverProfile } from '@/mover-profile/entities/mover-profile.entity';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import {
  NewEstimateOfferEventDispatcher,
  OfferConfirmEventDispatcher,
} from '@/notification/events/dispatcher';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EstimateOffer,
      EstimateRequest,
      MoverProfile,
      CustomerProfile,
    ]),
    NotificationModule,
  ],
  controllers: [EstimateOfferController],
  providers: [
    EstimateOfferService,
    //알림에서 사용 하는 dispatcher만 등록 (listener는 NotificationModule에서 관리)
    OfferConfirmEventDispatcher,
    NewEstimateOfferEventDispatcher,
  ],
  exports: [EstimateOfferService],
})
export class EstimateOfferModule {}
