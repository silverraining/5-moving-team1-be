import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { EstimateOffer } from '@/estimate-offer/entities/estimate-offer.entity';
import { EstimateRequest } from '@/estimate-request/entities/estimate-request.entity';
import { CommonModule } from '@/common/common.module';
import { CustomerProfileModule } from '@/customer-profile/customer-profile.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, EstimateRequest, EstimateOffer]),
    CommonModule,
    CustomerProfileModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
