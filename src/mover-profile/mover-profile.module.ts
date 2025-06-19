import { Module } from '@nestjs/common';
import { MoverProfileService } from './mover-profile.service';
import { MoverProfileController } from './mover-profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoverProfile } from './entities/mover-profile.entity';
import { CommonModule } from 'src/common/common.module';
import { CustomerProfileModule } from '@/customer-profile/customer-profile.module';
import { EstimateRequestModule } from '@/estimate-request/estimate-request.module';
import { MoverProfileHelper } from './mover-profile.helper';

@Module({
  imports: [
    TypeOrmModule.forFeature([MoverProfile]),
    CommonModule,
    CustomerProfileModule,
    EstimateRequestModule,
  ],
  controllers: [MoverProfileController],
  providers: [MoverProfileService, MoverProfileHelper],
  exports: [MoverProfileService, MoverProfileHelper, TypeOrmModule],
})
export class MoverProfileModule {}
