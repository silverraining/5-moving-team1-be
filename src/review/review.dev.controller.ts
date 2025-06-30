import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { Dev } from '@/auth/decorator/dev.decorator';
import { DevGuard } from '@/auth/guard/dev.guard';
import {
  EstimateRequest,
  RequestStatus,
} from '@/estimate-request/entities/estimate-request.entity';
import {
  EstimateOffer,
  OfferStatus,
} from '@/estimate-offer/entities/estimate-offer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('review/dev')
@UseGuards(DevGuard)
export class ReviewDevController {
  constructor(
    private readonly reviewService: ReviewService,
    @InjectRepository(EstimateRequest)
    private readonly estimateRequestRepository: Repository<EstimateRequest>,
    @InjectRepository(EstimateOffer)
    private readonly estimateOfferRepository: Repository<EstimateOffer>,
  ) {}

  @Post('complete-estimate')
  @Dev()
  async completeEstimate(
    @Body() body: { estimateRequestId: string; estimateOfferId: string },
  ) {
    const { estimateRequestId, estimateOfferId } = body;

    // 견적 요청을 COMPLETED 상태로 변경
    await this.estimateRequestRepository.update(
      { id: estimateRequestId },
      { status: RequestStatus.COMPLETED },
    );

    // 견적 제안을 COMPLETED 상태로 변경
    await this.estimateOfferRepository.update(
      { id: estimateOfferId },
      { status: OfferStatus.COMPLETED },
    );

    return {
      message: 'Estimate request and offer marked as completed',
      estimateRequestId,
      estimateOfferId,
    };
  }
}
