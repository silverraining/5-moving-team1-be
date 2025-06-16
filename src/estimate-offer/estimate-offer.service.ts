import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EstimateOffer, OfferStatus } from './entities/estimate-offer.entity';
import { In, Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import {
  EstimateRequest,
  RequestStatus,
} from '@/estimate-request/entities/estimate-request.entity';
import { MoverProfileView } from '@/mover-profile/view/mover-profile.view';
import {
  CursorPaginationDto,
  OrderField,
} from '@/common/dto/cursor-pagination.dto';
import { EstimateOfferResponseDto } from './dto/estimate-offer-response.dto';
import { CreateEstimateOfferDto } from './dto/create-estimate-offer.dto';
import { UpdateEstimateOfferDto } from './dto/update-estimate-offer.dto';
import { MoverProfile } from '@/mover-profile/entities/mover-profile.entity';
import { GenericPaginatedDto } from '@/common/dto/paginated-response.dto';
import { CreatedAtCursorPaginationDto } from '../common/dto/created-at-pagination.dto';

@Injectable()
export class EstimateOfferService {
  constructor(
    @InjectRepository(EstimateOffer)
    private readonly offerRepository: Repository<EstimateOffer>,
    @InjectRepository(EstimateRequest)
    private readonly requestRepository: Repository<EstimateRequest>,
    @InjectRepository(MoverProfile)
    private readonly moverRepository: Repository<MoverProfile>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 견적 제안 생성
   */
  async create(
    estimateRequestId: string,
    createEstimateOfferDto: CreateEstimateOfferDto,
    userId: string,
  ): Promise<void> {
    // 1. 견적 요청 존재 여부 및 상태 확인
    const estimateRequest = await this.requestRepository.findOne({
      where: { id: estimateRequestId },
      select: ['id', 'status'],
    });

    if (!estimateRequest) {
      throw new BadRequestException('존재하지 않는 견적 요청입니다.');
    }

    if (estimateRequest.status !== RequestStatus.PENDING) {
      throw new BadRequestException('견적 제안을 받을 수 없는 상태입니다.');
    }

    // 2. 기사 프로필 조회
    const mover = await this.moverRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!mover) {
      throw new BadRequestException('기사 프로필을 찾을 수 없습니다.');
    }

    // 3. 중복 제안 확인
    const existingOffer = await this.offerRepository.findOne({
      where: {
        estimateRequestId: estimateRequestId,
        moverId: mover.id,
      },
    });

    if (existingOffer) {
      throw new BadRequestException('이미 해당 견적 요청에 제안을 하셨습니다.');
    }

    // 4. 견적 제안 생성
    const estimateOffer = this.offerRepository.create({
      estimateRequestId: estimateRequestId,
      moverId: mover.id,
      price: createEstimateOfferDto.price,
      comment: createEstimateOfferDto.comment,
      status: OfferStatus.PENDING,
      isTargeted: false,
      isConfirmed: false,
    });

    await this.offerRepository.save(estimateOffer);
  }

  /**
   * 견적 요청 반려
   */
  async reject(
    estimateRequestId: string,
    updateEstimateOfferDto: UpdateEstimateOfferDto,
    userId: string,
  ): Promise<void> {
    // 1. 견적 요청 조회
    const request = await this.requestRepository.findOne({
      where: { id: estimateRequestId },
    });

    if (!request) {
      throw new NotFoundException('견적 요청을 찾을 수 없습니다.');
    }

    // 2. 기사 프로필 조회
    const mover = await this.moverRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!mover) {
      throw new BadRequestException('기사 프로필을 찾을 수 없습니다.');
    }

    // 3. 지정된 기사인지 확인
    if (!request.targetMoverIds?.includes(userId)) {
      throw new ForbiddenException('해당 견적 요청에 대한 권한이 없습니다.');
    }

    // 4. 요청 상태 확인
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('이미 처리된 견적 요청입니다.');
    }

    // 5. 요청 상태 업데이트
    request.status = RequestStatus.REJECTED;

    await this.requestRepository.save(request);

    // 6. 견적 제안 생성 (거절 사유 포함)
    const estimateOffer = this.offerRepository.create({
      estimateRequestId: estimateRequestId,
      moverId: mover.id,
      status: OfferStatus.REJECTED,
      comment: updateEstimateOfferDto.comment,
      isTargeted: true,
      isConfirmed: false,
    });

    await this.offerRepository.save(estimateOffer);
  }

  /**
   * 대기중인 견적 요청 ID에 대한 오퍼 목록 조회
   */
  async getPendingOffersByRequestId(
    estimateRequestId: string,
    userId: string,
    query: CreatedAtCursorPaginationDto,
  ): Promise<GenericPaginatedDto<EstimateOfferResponseDto>> {
    const { cursor, take = 5 } = query;

    const request = await this.requestRepository.findOne({
      where: { id: estimateRequestId },
      relations: ['customer', 'customer.user'],
    });
    if (!request)
      throw new BadRequestException('존재하지 않는 견적 요청입니다.');
    if (request.customer.user.id !== userId) throw new ForbiddenException();

    const queryBuilder = this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.mover', 'mover')
      .leftJoinAndSelect('mover.likedCustomers', 'likedCustomers')
      .leftJoinAndSelect('offer.estimateRequest', 'estimateRequest')
      .where('offer.estimateRequestId = :requestId', {
        requestId: estimateRequestId,
      })
      .andWhere('estimateRequest.status = :status', {
        status: RequestStatus.PENDING,
      });

    if (cursor) {
      queryBuilder.andWhere('offer.createdAt < :cursor', {
        cursor: new Date(cursor), // 커서가 ISO 문자열로 들어오므로 Date로 변환해서 비교
      });
    }

    queryBuilder.orderBy('offer.createdAt', 'DESC');

    // offers에서 take+1개 가져오기
    const offers = await queryBuilder.limit(take + 1).getMany();

    // 실제 응답에 사용할 slice
    const hasNext = offers.length > take;
    const sliced = hasNext ? offers.slice(0, take) : offers;

    //  nextCursor
    const nextCursor = hasNext
      ? sliced[sliced.length - 1].createdAt.toISOString()
      : null;
    const moverViews = await this.dataSource
      .getRepository(MoverProfileView)
      .find({
        where: { id: In(sliced.map((o) => o.moverId)) },
        select: [
          'id',
          OrderField.CONFIRMED_ESTIMATE_COUNT,
          OrderField.REVIEW_COUNT,
          OrderField.AVERAGE_RATING,
          'like_count',
        ],
      });
    const moverViewMap = new Map(moverViews.map((view) => [view.id, view])); // 빠르게 해당 moverId의 view 데이터를 찾기 위해서

    const items = sliced.map((offer) => {
      const isLiked = offer.mover.likedCustomers?.some(
        (like) => like.customer?.id === userId,
      );
      const view = moverViewMap.get(offer.moverId);

      return EstimateOfferResponseDto.from(offer, isLiked ?? false, {
        confirmedCount: view?.confirmed_estimate_count ?? 0,
        averageRating: view?.average_rating ?? 0,
        reviewCount: view?.review_count ?? 0,
        likeCount: view?.like_count ?? 0,
        includeFullAddress: false,
        includeMinimalAddress: true,
      });
    });

    // totalCount 쿼리 재사용
    const totalCount = await this.offerRepository.count({
      where: {
        estimateRequest: {
          id: estimateRequestId,
          status: RequestStatus.PENDING,
        },
      },
    });

    return { items, nextCursor, hasNext, totalCount };
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
      includeMinimalAddress: false,
    });

    return {
      ...dto,
      fromAddressMinimal: dto.fromAddressMinimal ?? '',
    } as EstimateOfferResponseDto;
  }
}
