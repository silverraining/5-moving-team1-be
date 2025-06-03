import { Module } from '@nestjs/common';
import { EstimateRequestService } from './estimate-request.service';
import { EstimateRequestController } from './estimate-request.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstimateRequest } from './entities/estimate-request.entity';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstimateRequest, CustomerProfile])],
  controllers: [EstimateRequestController],
  providers: [EstimateRequestService],
})
export class EstimateRequestModule {}
