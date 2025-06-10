import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EstimateOffer } from './entities/estimate-offer.entity';
import { In, Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import {
  EstimateRequest,
  RequestStatus,
} from '@/estimate-request/entities/estimate-request.entity';
import { MoverProfileView } from '@/mover-profile/view/mover-profile.view';
import { OrderField } from '@/common/dto/cursor-pagination.dto';
import { EstimateOfferResponseDto } from './dto/estimate-offer-response.dto';
@Injectable()
export class EstimateOfferService {
  constructor(
    @InjectRepository(EstimateOffer)
    private readonly offerRepository: Repository<EstimateOffer>,
    @InjectRepository(EstimateRequest)
    private readonly requestRepository: Repository<EstimateRequest>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 견적 요청 ID에 대한 오퍼 목록 조회
   */
  async getPendingOffersByRequestId(
    estimateRequestId: string,
    userId?: string,
  ): Promise<EstimateOfferResponseDto[]> {
    if (!estimateRequestId) {
      throw new BadRequestException('견적 요청 ID 파라미터가 필요합니다.');
    }

    const request = await this.requestRepository.findOne({
      where: { id: estimateRequestId },
      relations: ['customer', 'customer.user'],
    });

    if (!request) {
      throw new BadRequestException('존재하지 않는 견적 요청입니다.');
    }

    if (request.customer.user.id !== userId) {
      throw new ForbiddenException();
    }

    if (
      [
        RequestStatus.COMPLETED,
        RequestStatus.CANCELED,
        RequestStatus.EXPIRED,
      ].includes(request.status)
    ) {
      throw new BadRequestException('이미 완료되었거나 취소된 요청입니다.');
    }

    const offers = await this.offerRepository.find({
      where: {
        estimateRequest: {
          id: estimateRequestId,
          status: RequestStatus.PENDING,
        },
      },
      relations: ['mover', 'mover.likedCustomers', 'estimateRequest'],
      order: { createdAt: 'DESC' },
    });

    const moverViews = await this.dataSource
      .getRepository(MoverProfileView)
      .find({
        where: { id: In(offers.map((o) => o.moverId)) },
        select: [
          'id',
          OrderField.CONFIRMED_ESTIMATE_COUNT,
          OrderField.REVIEW_COUNT,
          OrderField.AVERAGE_RATING,
          'like_count',
        ],
      });

    const moverViewMap = new Map(moverViews.map((view) => [view.id, view]));

    return offers.map((offer) => {
      const isLiked = offer.mover.likedCustomers?.some(
        (like) => like.customer.id === userId,
      );
      const view = moverViewMap.get(offer.moverId);

      const dto = EstimateOfferResponseDto.from(offer, isLiked ?? false, {
        confirmedCount: view?.[OrderField.CONFIRMED_ESTIMATE_COUNT] ?? 0,
        averageRating: view?.[OrderField.AVERAGE_RATING] ?? 0,
        reviewCount: view?.[OrderField.REVIEW_COUNT] ?? 0,
        likeCount: view?.like_count ?? 0,
        includeFullAddress: false,
        includeMinimalAddress: true,
      });

      return {
        ...dto,
        fromAddressMinimal: dto.fromAddressMinimal ?? '',
      } as EstimateOfferResponseDto;
    });
  }

  /**
   * 견적 요청ID에 대한 오퍼 중 특정 기사 오퍼 상세 조회
   */
  async findOneByCompositeKey(
    requestId: string,
    moverId: string,
    userId?: string,
  ): Promise<EstimateOfferResponseDto> {
    const offer = await this.offerRepository.findOne({
      where: { estimateRequestId: requestId, moverId },
      relations: [
        'mover',
        'mover.likedCustomers',
        'estimateRequest',
        'estimateRequest.customer',
        'estimateRequest.customer.user',
      ],
    });

    if (!offer) {
      throw new BadRequestException('해당 견적 제안을 찾을 수 없습니다.');
    }

    if (offer.estimateRequest.customer.user.id !== userId) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    const view = await this.dataSource.getRepository(MoverProfileView).findOne({
      where: { id: moverId },
      select: [
        'id',
        OrderField.CONFIRMED_ESTIMATE_COUNT,
        OrderField.REVIEW_COUNT,
        OrderField.AVERAGE_RATING,
        'like_count',
      ],
    });

    const isLiked = offer.mover.likedCustomers?.some(
      (like) => like.customer.id === userId,
    );

    const dto = EstimateOfferResponseDto.from(offer, isLiked ?? false, {
      confirmedCount: view?.[OrderField.CONFIRMED_ESTIMATE_COUNT] ?? 0,
      averageRating: view?.[OrderField.AVERAGE_RATING] ?? 0,
      reviewCount: view?.[OrderField.REVIEW_COUNT] ?? 0,
      likeCount: view?.like_count ?? 0,
      includeFullAddress: true,
      includeMinimalAddress: true,
    });

    return {
      ...dto,
      fromAddressMinimal: dto.fromAddressMinimal ?? '',
    } as EstimateOfferResponseDto;
  }
}
