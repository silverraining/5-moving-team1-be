import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  NewReviewEvent,
  OfferComfirmUpdateEvent,
  TargetMoverUpdatedEvent,
  TargetOfferUpdateEvent,
  MoveCompletionEvent,
} from '../events/event';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from '../entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EstimateOffer } from 'src/estimate-offer/entities/estimate-offer.entity';
import { Repository } from 'typeorm';

/**
 * 지정 견적 생성 리스너
 * moverId : 지정한 mover의 id
 * ps.profile id여도 상관 없음
 * requestId : customer가 진행중인 request id
 */
@Injectable()
export class EstimateRequestListener {
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('estimate-request.target-mover-updated')
  async handleTargetMoverUpdated(event: TargetMoverUpdatedEvent) {
    const { moverId, requestId } = event;

    // 알림 저장
    await this.notificationService.create({
      userId: moverId,
      type: NotificationType.NEW_ESTIMATE_REQUEST,
      message: `새로운 견적 요청이 도착했습니다.`,
      targetId: requestId,
    });
  }
}

/**
 * 새로운 견적 생성 리스너
 * customerId : customer의 id profile id 여도 상관 없음
 * offerId : mover가 생성한 견적서의 id
 */
@Injectable()
export class NewEstimateOfferListener {
  constructor(
    private readonly notificationService: NotificationService,
    @InjectRepository(EstimateOffer)
    private readonly estimateOfferRepository: Repository<EstimateOffer>,
  ) {}

  @OnEvent('new-estimate-orffer.target-customer-updated')
  async handleTargetMoverUpdated(event: TargetOfferUpdateEvent) {
    const { customerId, offerId } = event;

    try {
      // EstimateOffer 조회 (mover 정보 포함)
      const estimateOffer = await this.estimateOfferRepository.findOne({
        where: { id: offerId },
        relations: ['mover'],
      });

      if (!estimateOffer) {
        throw new Error(`EstimateOffer not found for offerId: ${offerId}`);
      }

      if (!estimateOffer.mover) {
        throw new Error(`Mover not found for EstimateOffer: ${offerId}`);
      }

      // mover 닉네임을 포함한 개인화된 메시지 생성
      const moverNickname = estimateOffer.mover.nickname;
      const personalizedMessage = `${moverNickname} 기사님의 견적이 도착했어요`;

      // 알림 저장
      await this.notificationService.create({
        userId: customerId,
        type: NotificationType.NEW_OFFER,
        message: personalizedMessage,
        targetId: offerId,
      });
    } catch (error) {
      Logger.error(
        `Error creating personalized notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

/**
 * 견적 확정 알림
 * moverId : 무버 id
 * offerId : 견적서 id
 */

@Injectable()
export class OfferConfirmListener {
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('confirm-estimate-orffer.target-mover-updated')
  async handleTargetMoverUpdated(event: OfferComfirmUpdateEvent) {
    const { moverId, offerId } = event;

    // 알림 저장
    await this.notificationService.create({
      userId: moverId,
      type: NotificationType.ESTIMATE_CONFIRMED,
      message: `견적이 확정 되었습니다.`,
      targetId: offerId,
    });
  }
}
/**
 * 신규 리뷰 알림
 */
@Injectable()
export class NewReviewListener {
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('create-reveiw.target-mover-updated')
  async handleTargetMoverUpdated(event: NewReviewEvent) {
    const { moverId, reveiwId } = event;

    // 알림 저장
    await this.notificationService.create({
      userId: moverId,
      type: NotificationType.CREATE_REVIEW,
      message: `신규 리뷰가 있습니다.`,
      targetId: reveiwId,
    });
  }
}

/**
 * 이사 완료 확인 알림
 */
@Injectable()
export class MoveCompletionListener {
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('move.completion-check')
  async handleMoveCompletion(event: MoveCompletionEvent) {
    const { requestId, customerId } = event;

    // 알림 저장
    await this.notificationService.create({
      userId: customerId,
      type: NotificationType.COMPLETED_CHECK,
      message: `이사를 완료하셨나요? 리뷰를 작성해보세요`,
      targetId: requestId,
    });
  }
}
