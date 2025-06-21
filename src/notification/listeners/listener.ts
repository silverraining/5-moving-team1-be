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
      type: NotificationType.ESTIMATE_CONFIRMED,
      message: `새로운 이사 요청이 할당되었습니다. (요청 ID: ${requestId})`,
      targetId: requestId,
    });
  }
}
