import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EstimateStatusUpdateJob {
  private readonly logger = new Logger(EstimateStatusUpdateJob.name);

  constructor(
    @InjectRepository(EstimateRequest)
    private estimateRequestRepo: Repository<EstimateRequest>,
    @InjectRepository(EstimateOffer)
    private estimateOfferRepo: Repository<EstimateOffer>,
    private eventEmitter: EventEmitter2,
  ) {
    this.logger.log('EstimateStatusUpdateJob 초기화 완료');
  }

  private async expirePendingOffers(request: EstimateRequest) {
    const pendingOffers = request.estimateOffers?.filter(
      (offer) => offer.status === OfferStatus.PENDING,
    );

    for (const offer of pendingOffers || []) {
      await this.estimateOfferRepo.update(offer.id, {
        status: OfferStatus.EXPIRED,
      });
    }

    return pendingOffers?.length || 0;
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

    // 7일 전 날짜 (이사일 7일 지나도 고객이 완료 처리 안할경우 자동 처리용)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      // 1. 이사날이 지난 CONFIRMED 상태의 견적 요청들에 대해 완료 확인 알림 발송
      const confirmedRequests = await this.estimateRequestRepo.find({
        where: {
          moveDate: LessThan(today),
          status: RequestStatus.CONFIRMED,
        },
        relations: ['customer', 'customer.user', 'estimateOffers'],
      });

      let totalExpiredPendingOffers = 0;

      for (const request of confirmedRequests) {
        // 고객에게 이사 완료 확인 알림
        if (request.customer?.user) {
          // 이벤트 발생
          this.eventEmitter.emit('move.completion-check', {
            requestId: request.id,
            customerId: request.customer.user.id,
          });
          this.logger.log(`견적 요청 ${request.id}에 대한 완료 확인 알림 발송`);

          // 해당 요청의 (확정된 제안을 제외한) PENDING 상태 견적 제안들을 EXPIRED로 변경
          const expiredCount = await this.expirePendingOffers(request);
          totalExpiredPendingOffers += expiredCount;

          if (expiredCount > 0) {
            this.logger.log(
              `견적 요청 ${request.id}의 PENDING 상태 견적 제안 ${expiredCount}개 → EXPIRED`,
            );
          }
        }
      }

      // 2. 이사날이 7일 지난 CONFIRMED 상태의 견적 요청 상태를 COMPLETED로 변경
      const expiredConfirmedRequests = await this.estimateRequestRepo.find({
        where: {
          moveDate: LessThan(sevenDaysAgo),
          status: RequestStatus.CONFIRMED,
        },
        relations: ['estimateOffers'],
      });

      for (const request of expiredConfirmedRequests) {
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

        this.logger.log(
          `이사일 7일 경과 고객 완료 미확인 견적 요청 ${request.id} → COMPLETED`,
        );
      }

      // 3. 이사날이 지난 PENDING 상태의 견적 요청들을 EXPIRED로 변경
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
        const expiredCount = await this.expirePendingOffers(request);
        totalExpiredPendingOffers += expiredCount;

        this.logger.log(
          `견적 요청 ${request.id} → EXPIRED (관련 견적 제안 ${expiredCount}개)`,
        );
      }

      this.logger.log(
        `✅ 스케줄러 실행 완료 - 완료알림: ${confirmedRequests.length}건, 7일경과완료처리: ${expiredConfirmedRequests.length}건, EXPIRED로 변경된 견적 요청: ${pendingRequests.length}건`,
      );
    } catch (error) {
      this.logger.error('견적 상태 업데이트 중 오류 발생:', error);
    }
  }
}
