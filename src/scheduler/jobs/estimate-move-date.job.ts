// src/scheduler/jobs/estimate-move-date.job.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
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

  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_1AM)
  async handle() {
    this.logger.log('이사 하루 전 스케줄 시작');

    const tomorrowStart = new Date();
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const estimateRequests = await this.estimateRequestRepo.find({
      where: {
        moveDate: Between(tomorrowStart, tomorrowEnd),
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
          relations: ['mover', 'mover.user'],
        });

        const moverUser = offer?.mover?.user?.id;
        if (moverUser) {
          const dto: CreateNotificationDto = {
            userId: moverUser,
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
