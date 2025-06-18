import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EstimateOffer, OfferStatus } from './entities/estimate-offer.entity';
import { In, QueryRunner, Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import {
  EstimateRequest,
  RequestStatus,
} from '@/estimate-request/entities/estimate-request.entity';
import { MoverProfileView } from '@/mover-profile/view/mover-profile.view';
import {
  EstimateOfferResponseDto,
  GetEstimateOffersByMoverResponseDto,
  GetEstimateOfferDetailByMoverResponseDto,
} from './dto/estimate-offer-response.dto';
import { CreateEstimateOfferDto } from './dto/create-estimate-offer.dto';
import { UpdateEstimateOfferDto } from './dto/update-estimate-offer.dto';
import { MoverProfile } from '@/mover-profile/entities/mover-profile.entity';
import { OrderField } from '@/common/validator/order.validator';
import { GenericPaginatedDto } from '@/common/dto/paginated-response.dto';
import { CreatedAtCursorPaginationDto } from '../common/dto/created-at-pagination.dto';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';

@Injectable()
export class EstimateOfferService {
  constructor(
    @InjectRepository(EstimateOffer)
    private readonly offerRepository: Repository<EstimateOffer>,
    @InjectRepository(EstimateRequest)
    private readonly requestRepository: Repository<EstimateRequest>,
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
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
    if (!request.targetMoverIds?.includes(mover.id)) {
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
   * 고객이 받은 견적 상세 조회
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
        'mover.likedCustomers.customer',
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
        OrderField.CONFIRMED_ESTIMATE_COUNT as keyof MoverProfileView,
        OrderField.REVIEW_COUNT as keyof MoverProfileView,
        OrderField.AVERAGE_RATING as keyof MoverProfileView,
        'like_count' as keyof MoverProfileView,
      ],
    });

    const customerProfileId = (
      await this.customerProfileRepository.findOne({
        where: { user: { id: userId } },
      })
    )?.id;

    const isLiked = offer.mover.likedCustomers?.some(
      (like) => like.customer?.id === customerProfileId,
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

  /**
   * 기사가 보낸 견적 목록 조회
   */
  async getMoverEstimateOffers(
    userId: string,
  ): Promise<GetEstimateOffersByMoverResponseDto[]> {
    // 1. 기사 프로필 조회
    const mover = await this.moverRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!mover) {
      throw new BadRequestException('기사 프로필을 찾을 수 없습니다.');
    }

    // 2. 기사가 보낸 견적 목록 조회
    const offers = await this.offerRepository.find({
      where: {
        moverId: mover.id,
        status: In([
          OfferStatus.PENDING,
          OfferStatus.CONFIRMED,
          OfferStatus.CANCELED,
          OfferStatus.COMPLETED,
        ]),
      },
      relations: [
        'estimateRequest',
        'estimateRequest.customer',
        'estimateRequest.customer.user',
      ],
      order: { createdAt: 'DESC' },
    });

    // 3. 응답 DTO로 변환
    return offers.map((offer) => ({
      offerId: offer.id,
      status: offer.status,
      isConfirmed: offer.isConfirmed,
      moveType: offer.estimateRequest.moveType,
      moveDate: offer.estimateRequest.moveDate,
      isTargeted: offer.isTargeted,
      customerName: offer.estimateRequest.customer.user.name,
      fromAddressMinimal: {
        sido: offer.estimateRequest.fromAddress.sido,
        sigungu: offer.estimateRequest.fromAddress.sigungu,
      },
      toAddressMinimal: {
        sido: offer.estimateRequest.toAddress.sido,
        sigungu: offer.estimateRequest.toAddress.sigungu,
      },
      price: offer.price,
      estimateRequestId: offer.estimateRequestId,
      createdAt: offer.createdAt,
    }));
  }

  /**
   * 기사가 반려한 견적 목록 조회
   */
  async getRejectedEstimateOffers(
    userId: string,
  ): Promise<GetEstimateOffersByMoverResponseDto[]> {
    // 1. 기사 프로필 조회
    const mover = await this.moverRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!mover) {
      throw new BadRequestException('기사 프로필을 찾을 수 없습니다.');
    }

    // 2. 기사가 반려한 견적 목록 조회
    const offers = await this.offerRepository.find({
      where: { moverId: mover.id, status: OfferStatus.REJECTED },
      relations: [
        'estimateRequest',
        'estimateRequest.customer',
        'estimateRequest.customer.user',
      ],
      order: { createdAt: 'DESC' },
    });

    return offers.map((offer) => ({
      offerId: offer.id,
      status: offer.status,
      isConfirmed: offer.isConfirmed,
      moveType: offer.estimateRequest.moveType,
      moveDate: offer.estimateRequest.moveDate,
      isTargeted: offer.isTargeted,
      customerName: offer.estimateRequest.customer.user.name,
      fromAddressMinimal: {
        sido: offer.estimateRequest.fromAddress.sido,
        sigungu: offer.estimateRequest.fromAddress.sigungu,
      },
      toAddressMinimal: {
        sido: offer.estimateRequest.toAddress.sido,
        sigungu: offer.estimateRequest.toAddress.sigungu,
      },
      estimateRequestId: offer.estimateRequestId,
      createdAt: offer.createdAt,
    }));
  }

  /**
   * 고객이 특정 기사님의 제안 견적을 수락
   */
  async confirm(
    requestId: string,
    moverId: string,
    userId: string,
    qr: QueryRunner,
  ) {
    const manager = qr.manager; // QueryRunner를 사용하여 트랜잭션을 관리

    // 1. 견적 요청 조회
    const request = await manager.findOne(EstimateRequest, {
      where: { id: requestId },
      relations: ['customer', 'customer.user'],
    });

    if (!request) {
      throw new NotFoundException('견적 요청을 찾을 수 없습니다.');
    }

    // 2. 요청한 고객이 본인인지 확인
    const isMyRequestEstimate = request.customer.user.id === userId;
    if (!isMyRequestEstimate) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    // 3. 요청 상태 확인
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('이미 처리된 견적 요청입니다.');
    }

    // 4. 견적 제안 조회
    const offer = await manager.findOneBy(EstimateOffer, {
      estimateRequestId: requestId,
      moverId,
    });

    if (!offer) {
      throw new NotFoundException('해당 견적 제안을 찾을 수 없습니다.');
    }

    // 5. 제안 상태 확인
    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('이미 처리된 견적 제안입니다.');
    }

    // 4. 제안 상태 업데이트
    offer.status = OfferStatus.CONFIRMED;
    offer.isConfirmed = true;
    offer.confirmedAt = new Date();
    await manager.save(offer);

    // 5. 견적 요청 상태 업데이트
    request.status = RequestStatus.CONFIRMED;
    request.confirmedOfferId = offer.id;
    await manager.save(request);

    // 6. 성공 메시지
    return {
      message: '견적 제안이 성공적으로 확정되었습니다.',
    };
  }

  /**
   * 기사가 보낸 견적 상세 조회
   */
  async getEstimateOfferDetailByMover(
    offerId: string,
    userId: string,
  ): Promise<GetEstimateOfferDetailByMoverResponseDto> {
    // 1. 기사 프로필 조회
    const moverProfile = await this.moverRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!moverProfile) {
      throw new BadRequestException('기사 프로필을 찾을 수 없습니다.');
    }

    // 2. 견적 제안 상세 조회
    const offer = await this.offerRepository.findOne({
      where: { id: offerId, moverId: moverProfile.id },
      relations: [
        'estimateRequest',
        'estimateRequest.customer',
        'estimateRequest.customer.user',
      ],
    });

    if (!offer) {
      throw new NotFoundException('견적 제안을 찾을 수 없습니다.');
    }

    // 3. 응답 DTO 변환 및 반환
    return {
      moveType: offer.estimateRequest.moveType,
      isTargeted: offer.isTargeted,
      customerName: offer.estimateRequest.customer.user.name,
      moveDate: offer.estimateRequest.moveDate,
      fromAddressMinimal: {
        sido: offer.estimateRequest.fromAddress.sido,
        sigungu: offer.estimateRequest.fromAddress.sigungu,
      },
      toAddressMinimal: {
        sido: offer.estimateRequest.toAddress.sido,
        sigungu: offer.estimateRequest.toAddress.sigungu,
      },
      price: offer.price,
      estimateRequestCreatedAt: offer.estimateRequest.createdAt,
      fromAddress: offer.estimateRequest.fromAddress,
      toAddress: offer.estimateRequest.toAddress,
    };
  }
}
