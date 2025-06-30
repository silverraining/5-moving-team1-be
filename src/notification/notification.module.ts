import { User } from '@/user/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { MoverProfile } from '@/mover-profile/entities/mover-profile.entity';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import { EstimateOffer } from '@/estimate-offer/entities/estimate-offer.entity';
import {
  EstimateRequestListener,
  NewEstimateOfferListener,
  OfferConfirmListener,
  NewReviewListener,
  MoveCompletionListener,
} from './listeners/listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      User,
      MoverProfile,
      CustomerProfile,
      EstimateOffer,
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    EstimateRequestListener,
    NewEstimateOfferListener,
    OfferConfirmListener,
    NewReviewListener,
    MoveCompletionListener,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
