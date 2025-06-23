import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstimateRequest } from '@/estimate-request/entities/estimate-request.entity';
import { EstimateOffer } from '@/estimate-offer/entities/estimate-offer.entity';
import { EstimateMoveDateJob } from '../jobs/estimate-move-date.job';
import { EstimateStatusUpdateJob } from '../jobs/estimate-status-update.job';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EstimateRequest, EstimateOffer]),
    NotificationModule,
  ],
  providers: [EstimateMoveDateJob, EstimateStatusUpdateJob],
})
export class EstimateReminderModule {}
