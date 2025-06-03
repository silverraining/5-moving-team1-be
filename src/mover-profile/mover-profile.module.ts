import { Module } from '@nestjs/common';
import { MoverProfileService } from './mover-profile.service';
import { MoverProfileController } from './mover-profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoverProfile } from './entities/mover-profile.entity';
import { MoverProfileView } from './view/mover-profile.view';
import { CommonModule } from 'src/common/common.module';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import { EstimateRequest } from '@/estimate-request/entities/estimate-request.entity';
import { Review } from '@/review/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MoverProfile,
      MoverProfileView,
      CustomerProfile,
      EstimateRequest,
      Review,
    ]),
    CommonModule,
  ],
  controllers: [MoverProfileController],
  providers: [MoverProfileService],
  exports: [MoverProfileService],
})
export class MoverProfileModule {}
