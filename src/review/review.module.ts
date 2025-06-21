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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      EstimateRequest,
      EstimateOffer,
      MoverProfileView,
    ]),
    CommonModule,
    CustomerProfileModule,
    MoverProfileModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewHelper],
})
export class ReviewModule {}
