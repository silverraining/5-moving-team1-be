import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { EstimateOffer } from '@/estimate-offer/entities/estimate-offer.entity';
import { EstimateRequest } from '@/estimate-request/entities/estimate-request.entity';
import { CommonModule } from '@/common/common.module';
import { CustomerProfileModule } from '@/customer-profile/customer-profile.module';
import { MoverProfileModule } from '@/mover-profile/mover-profile.module';
import { MoverProfileView } from '@/mover-profile/view/mover-profile.view';
import { ReviewHelper } from './review.helper';
import { NewReviewListener } from '@/notification/listeners/listener';
import { NewReviewEventDispatcher } from '@/notification/events/dispatcher';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      EstimateRequest,
      EstimateOffer,
      MoverProfileView,
      NotificationModule,
    ]),
    NotificationModule,
    CommonModule,
    CustomerProfileModule,
    MoverProfileModule,
  ],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    ReviewHelper,
    NewReviewListener,
    NewReviewEventDispatcher,
  ],
})
export class ReviewModule {}
