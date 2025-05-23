import { Module } from '@nestjs/common';
import { EstimateRequestService } from './estimate-request.service';
import { EstimateRequestController } from './estimate-request.controller';

@Module({
  controllers: [EstimateRequestController],
  providers: [EstimateRequestService],
})
export class EstimateRequestModule {}
