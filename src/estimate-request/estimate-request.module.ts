import { Module } from '@nestjs/common';
import { EstimateRequestService } from './estimate-request.service';
import { EstimateRequestController } from './estimate-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstimateRequest } from './entities/estimate-request.entity';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import { EstimateOffer } from '@/estimate-offer/entities/estimate-offer.entity';
import { MoverProfile } from '@/mover-profile/entities/mover-profile.entity';
import { EstimateRequestEventDispatcher } from '@/notification/events/dispatcher';
import { EstimateRequestListener } from '@/notification/listeners/listener';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EstimateRequest,
      CustomerProfile,
      MoverProfile,
      EstimateOffer,
    ]),
    //listner에서 알림생성을 위해 모듈 추가
    NotificationModule,
  ],
  controllers: [EstimateRequestController],
  providers: [
    EstimateRequestService,
    //알림에서 사용 하는 dispatcher, listener 모듈
    EstimateRequestListener,
    EstimateRequestEventDispatcher,
  ],
  exports: [EstimateRequestService],
})
export class EstimateRequestModule {}
