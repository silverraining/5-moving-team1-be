import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstimateRequest } from '@/estimate-request/entities/estimate-request.entity';
import { EstimateOffer } from '@/estimate-offer/entities/estimate-offer.entity';
import { Notification } from '@/notification/entities/notification.entity';
import { NotificationService } from '@/notification/notification.service';
import { EstimateMoveDateJob } from '../jobs/estimate-move-date.job';

@Module({
  imports: [
    TypeOrmModule.forFeature([EstimateRequest, EstimateOffer, Notification]),
  ],
  providers: [EstimateMoveDateJob, NotificationService],
})
export class EstimateReminderModule {}
