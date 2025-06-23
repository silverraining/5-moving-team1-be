import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import {
  EstimateRequest,
  RequestStatus,
} from '@/estimate-request/entities/estimate-request.entity';
import {
  EstimateOffer,
  OfferStatus,
} from '@/estimate-offer/entities/estimate-offer.entity';
import { NotificationService } from '@/notification/notification.service';
import { NotificationType } from '@/notification/entities/notification.entity';
import { CreateNotificationDto } from '@/notification/dto/create-notification.dto';

@Injectable()
export class EstimateStatusUpdateJob {
  private readonly logger = new Logger(EstimateStatusUpdateJob.name);

  constructor(
    @InjectRepository(EstimateRequest)
    private estimateRequestRepo: Repository<EstimateRequest>,
    @InjectRepository(EstimateOffer)
    private estimateOfferRepo: Repository<EstimateOffer>,
    private notificationService: NotificationService,
  ) {
    this.logger.log('EstimateStatusUpdateJob 초기화 완료');
  }

  // 매일 자정에 실행
  @Cron('0 0 * * *', { timeZone: 'Asia/Seoul' })
  async handleExpiredEstimates() {
    this.logger.log('🚀 스케줄러 실행 시작 - 이사날 지난 견적 상태 업데이트');

    // 한국 시간 기준으로 오늘 자정 계산
    const now = new Date();
    const kstOffset = 9 * 60; // KST는 UTC+9
    const kstTime = new Date(now.getTime() + kstOffset * 60 * 1000);

    const today = new Date(
      kstTime.getFullYear(),
      kstTime.getMonth(),
      kstTime.getDate(),
    );

    try {
      // 1. 이사날이 지난 CONFIRMED 상태의 견적 요청들을 COMPLETED로 변경
      const confirmedRequests = await this.estimateRequestRepo.find({
        where: {
          moveDate: LessThan(today),
          status: RequestStatus.CONFIRMED,
        },
        relations: ['customer', 'customer.user'],
      });

      for (const request of confirmedRequests) {
        // 견적 요청을 COMPLETED로 변경
        await this.estimateRequestRepo.update(request.id, {
          status: RequestStatus.COMPLETED,
        });

        // 확정된 견적 제안도 COMPLETED로 변경
        if (request.confirmedOfferId) {
          await this.estimateOfferRepo.update(request.confirmedOfferId, {
            status: OfferStatus.COMPLETED,
          });
        }

        // 고객에게 알림
        if (request.customer?.user) {
          const customerNotification: CreateNotificationDto = {
            userId: request.customer.user.id,
            type: NotificationType.WRITE_REVIEW,
            message: '이사가 완료되었습니다. 리뷰를 작성해보세요.',
            targetId: request.id,
          };
          await this.notificationService.create(customerNotification);
        }

        this.logger.log(`견적 요청 ${request.id} → COMPLETED`);
      }

      // 2. 이사날이 지난 PENDING 상태의 견적 요청들을 EXPIRED로 변경
      const pendingRequests = await this.estimateRequestRepo.find({
        where: {
          moveDate: LessThan(today),
          status: RequestStatus.PENDING,
        },
        relations: ['estimateOffers'],
      });

      for (const request of pendingRequests) {
        // 견적 요청을 EXPIRED로 변경
        await this.estimateRequestRepo.update(request.id, {
          status: RequestStatus.EXPIRED,
        });

        // 해당 요청의 모든 PENDING 상태 견적 제안들을 EXPIRED로 변경
        const pendingOffers = request.estimateOffers?.filter(
          (offer) => offer.status === OfferStatus.PENDING,
        );

        for (const offer of pendingOffers || []) {
          await this.estimateOfferRepo.update(offer.id, {
            status: OfferStatus.EXPIRED,
          });
        }

        this.logger.log(
          `견적 요청 ${request.id} → EXPIRED (관련 견적 제안 ${pendingOffers?.length || 0}개)`,
        );
      }

      this.logger.log(
        `✅ 스케줄러 실행 완료 - COMPLETED: ${confirmedRequests.length}건, EXPIRED: ${pendingRequests.length}건`,
      );
    } catch (error) {
      this.logger.error('견적 상태 업데이트 중 오류 발생:', error);
    }
  }
}
