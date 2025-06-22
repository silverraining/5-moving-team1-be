// src/scheduler/jobs/estimate-move-date.job.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EstimateRequest,
  RequestStatus,
} from '@/estimate-request/entities/estimate-request.entity';
import { EstimateOffer } from '@/estimate-offer/entities/estimate-offer.entity';
import { NotificationService } from '@/notification/notification.service';
import { NotificationType } from '@/notification/entities/notification.entity';
import { CreateNotificationDto } from '@/notification/dto/create-notification.dto';

@Injectable()
export class EstimateMoveDateJob {
  private readonly logger = new Logger(EstimateMoveDateJob.name);

  constructor(
    @InjectRepository(EstimateRequest)
    private estimateRequestRepo: Repository<EstimateRequest>,
    @InjectRepository(EstimateOffer)
    private estimateOfferRepo: Repository<EstimateOffer>,
    private notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handle() {
    this.logger.log('이사 하루 전 스케줄 시작');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const estimateRequests = await this.estimateRequestRepo.find({
      where: {
        moveDate: tomorrow,
        status: RequestStatus.CONFIRMED,
      },
      relations: ['customer', 'customer.user'],
    });

    for (const request of estimateRequests) {
      const customerUser = request.customer?.user;
      if (customerUser) {
        const dto: CreateNotificationDto = {
          userId: customerUser.id,
          type: NotificationType.MOVE_DAY_REMINDER,
          message: '내일 이사 일정이 있습니다.',
          targetId: request.id,
        };
        await this.notificationService.create(dto);
      }

      if (request.confirmedOfferId) {
        const offer = await this.estimateOfferRepo.findOne({
          where: { id: request.confirmedOfferId },
          relations: ['moverProfile', 'moverProfile.user'],
        });

        const moverUser = offer?.moverId;
        if (moverUser) {
          const dto: CreateNotificationDto = {
            userId: customerUser.id,
            type: NotificationType.MOVE_DAY_REMINDER,
            message: '내일 배정된 이사 일정이 있습니다.',
            targetId: request.id,
          };
          await this.notificationService.create(dto);
        }
      }

      this.logger.log(`${estimateRequests.length}건 이사 알림 완료`);
    }
  }
}
