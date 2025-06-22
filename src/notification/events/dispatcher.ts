import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  NewReviewEvent,
  OfferComfirmUpdateEvent,
  TargetMoverUpdatedEvent,
  TargetOfferUpdateEvent,
} from './event';
import { Injectable } from '@nestjs/common';

/**
 * 지정 견적 생성 리스너
 * moverId : 지정한 mover의 id
 * ps.profile id여도 상관 없음
 * requestId : customer가 진행중인 request id
 */

@Injectable()
export class EstimateRequestEventDispatcher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  targetMoverAssigned(requestId: string, moverId: string) {
    this.eventEmitter.emit(
      'estimate-request.target-mover-updated',
      new TargetMoverUpdatedEvent(requestId, moverId),
    );
  }
}

/**
 * 새로운 견적 생성 리스너
 * customerId : customer의 id profile id 여도 상관 없음
 * offerId : mover가 생성한 견적서의 id
 */
@Injectable()
export class NewEstimateOfferEventDispatcher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  targetMoverAssigned(customerId: string, offerId: string) {
    this.eventEmitter.emit(
      'new-estimate-orffer.target-customer-updated',
      new TargetOfferUpdateEvent(customerId, offerId),
    );
  }
}

/**
 * 견적 확정 알림
 * moverId : 무버 id
 * offerId : 견적서 id
 */
@Injectable()
export class OfferConfirmEventDispatcher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  targetMoverAssigned(moverId: string, offerId: string) {
    this.eventEmitter.emit(
      'confirm-estimate-orffer.target-mover-updated',
      new OfferComfirmUpdateEvent(moverId, offerId),
    );
  }
}
/**
 * 신규 리뷰 등록 이벤트
 */

@Injectable()
export class NewReviewEventDispatcher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  targetMoverAssigned(moverId: string, reviewId: string) {
    this.eventEmitter.emit(
      'new-review.target-mover-updated',
      new NewReviewEvent(moverId, reviewId),
    );
  }
}
