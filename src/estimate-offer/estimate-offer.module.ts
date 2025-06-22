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
import {
  NewEstimateOfferListener,
  OfferConfirmListener,
} from '@/notification/listeners/listener';
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
    //알림에서 사용 하는 dispatcher, listener 모듈
    OfferConfirmListener,
    NewEstimateOfferListener,
    OfferConfirmEventDispatcher,
    NewEstimateOfferEventDispatcher,
  ],
  exports: [EstimateOfferService],
})
export class EstimateOfferModule {}
