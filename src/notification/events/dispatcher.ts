import { EventEmitter2 } from '@nestjs/event-emitter';
import { TargetMoverUpdatedEvent } from './event';
import { Injectable } from '@nestjs/common';

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
