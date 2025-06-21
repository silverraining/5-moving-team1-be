import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TargetMoverUpdatedEvent } from '../events/event';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class EstimateRequestListener {
  private readonly logger = new Logger(EstimateRequestListener.name);

  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('estimate-request.target-mover-updated')
  async handleTargetMoverUpdated(event: TargetMoverUpdatedEvent) {
    const { moverId, requestId } = event;

    this.logger.log(
      `기사 ID: ${moverId} 가 요청 ID: ${requestId} 에 지정되었습니다.`,
    );

    // 알림 저장
    await this.notificationService.create({
      userId: moverId,
      type: NotificationType.NEW_ESTIMATE_REQUEST,
      message: `새로운 견적 요청이 도착했습니다.`,
      targetId: requestId,
    });
  }
}
