import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEstimateRequestDto } from './dto/create-estimate-request.dto';
import { EstimateRequestResponseDto } from './dto/estimate-request-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EstimateRequest,
  RequestStatus,
} from './entities/estimate-request.entity';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import { Brackets, DataSource, In, Repository } from 'typeorm';
import { UserInfo } from '@/user/decorator/user-info.decorator';

import { EstimateOfferResponseDto } from '@/estimate-offer/dto/estimate-offer-response.dto';
import { MoverProfileView } from '@/mover-profile/view/mover-profile.view';
import { MoverProfile } from '@/mover-profile/entities/mover-profile.entity';

import { EstimateRequestPaginationDto } from './dto/estimate-request-pagination.dto';
import { GenericPaginatedDto } from '@/common/dto/paginated-response.dto';
import { EstimateOffer } from '@/estimate-offer/entities/estimate-offer.entity';
import { CreatedAtCursorPaginationDto } from '@/common/dto/created-at-pagination.dto';
import { EstimateRequestEventDispatcher } from '@/notification/events/dispatcher';

@Injectable()
export class EstimateRequestService {
  commonService: any;
  constructor(
    @InjectRepository(EstimateRequest)
    private readonly estimateRequestRepository: Repository<EstimateRequest>,
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
    @InjectRepository(MoverProfile)
    private readonly moverProfileRepository: Repository<MoverProfile>,
    private readonly dataSource: DataSource,
    //알림 생성부분
    private readonly dispatcher: EstimateRequestEventDispatcher,
  ) {}

  /**
   * 고객의 pending 상태의 견적 요청 ID 조회 - //TODO: 개발용이므로 추후 삭제 예정
   * @param userId 고객 ID
   * @returns { estimateRequestId: string }[]
   */
  async findActiveEstimateRequestIds(
    userId: string,
  ): Promise<{ message: string } | { estimateRequestId: string }[]> {
    const requests = await this.estimateRequestRepository.find({
      where: {
        customer: { user: { id: userId } },
        status: RequestStatus.PENDING,
      },
      select: { id: true },
    });

    if (requests.length === 0) {
      return { message: '현재 진행중인 견적 요청이 없습니다.' };
    }

    return requests.map((req) => ({ estimateRequestId: req.id }));
  }
  /**
   * 견적 요청 생성
   * @param dto CreateEstimateRequestDto
   * @param user UserInfo
   * @returns { id: string, message: string }
   */
  async create(dto: CreateEstimateRequestDto, user: UserInfo) {
    // 1. 로그인한 유저의 CustomerProfile 가져오기
    const customer = await this.customerProfileRepository.findOne({
      where: { user: { id: user.sub } },
    });

    if (!customer) {
      throw new NotFoundException('고객 프로필을 찾을 수 없습니다.');
    }
    // 2. 현재 고객이 진행 중인 견적 요청이 있는지 확인
    const activeRequest = await this.estimateRequestRepository.findOne({
      where: {
        customer: { id: customer.id },
        status: RequestStatus.PENDING,
      },
    });

    if (activeRequest) {
      throw new BadRequestException('진행 중인 견적 요청이 이미 존재합니다.');
    }

    // 3. EstimateRequest 인스턴스 생성
    const estimate = this.estimateRequestRepository.create({
      moveType: dto.moveType,
      moveDate: new Date(dto.moveDate),
      fromAddress: dto.fromAddress,
      toAddress: dto.toAddress,
      targetMoverIds: dto.targetMoverIds,
      customer,
    });

    // 3. 저장
    const saved = await this.estimateRequestRepository.save(estimate);

    // 4. 필요한 데이터만 조회하여 반환
    return {
      id: saved.id,
      message: '견적 요청 생성 성공',
    };
  }

  /**
   * 고객의 받았던 견적 내역 조회
   * @param userId 고객 ID
   * @returns EstimateRequestResponseDto[]
   */
  // CONFIRMED, COMPLETED, EXPIRED 상태만 조회 (대기중인 요청 제외)
  validStatuses = ['CONFIRMED', 'COMPLETED', 'EXPIRED'];
  async findAllRequestHistoryWithPagination(
    userId: string,
    { cursor, take = 5 }: CreatedAtCursorPaginationDto,
  ): Promise<GenericPaginatedDto<EstimateRequestResponseDto>> {
    const [cursorDatePart, cursorIdPart] = cursor?.split('|') ?? [];
    const cursorValue = cursorDatePart ? new Date(cursorDatePart) : undefined;
    if (cursorValue && isNaN(cursorValue.getTime())) {
      throw new BadRequestException('유효하지 않은 커서 값입니다.');
    }

    const qb = this.estimateRequestRepository
      .createQueryBuilder('request')
      .addSelect('request.status')
      .leftJoinAndSelect('request.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'user')
      .leftJoinAndSelect('request.estimateOffers', 'offer')
      .leftJoinAndSelect('offer.mover', 'mover')
      .leftJoinAndSelect('offer.estimateRequest', 'backRequest') // offer의 estimateRequest를 backRequest(alias임)로 조인
      //TypeORM에서 양방향 관계일지라도, leftJoinAndSelect()를 통해 명시적으로 로드하지 않으면 undefined가 나올 수 있음
      .leftJoinAndSelect('mover.reviews', 'reviews')
      .leftJoinAndSelect('mover.likedCustomers', 'likedCustomers')
      .where('user.id = :userId', { userId })
      .andWhere('request.status IN (:...statuses)', {
        statuses: this.validStatuses,
      })
      .orderBy('request.createdAt', 'DESC')
      .addOrderBy('request.id', 'DESC')
      .take(take + 1);

    if (cursorValue) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('request.createdAt < :cursorValue', { cursorValue });
          if (cursorIdPart) {
            qb.orWhere(
              new Brackets((qb2) => {
                qb2
                  .where('request.createdAt = :cursorValue', { cursorValue })
                  .andWhere('request.id < :cursorId', {
                    cursorId: cursorIdPart,
                  });
              }),
            );
          }
        }),
      );
    }

    const requests = await qb.getMany();
    const hasNext = requests.length > take;
    const sliced = requests.slice(0, take);

    const allMoverIds = sliced.flatMap((req) =>
      req.estimateOffers.map((o) => o.moverId),
    );
    const moverViews = await this.dataSource
      .getRepository(MoverProfileView)
      .findBy({ id: In(allMoverIds) });

    const moverViewMap = new Map(moverViews.map((v) => [v.id, v]));

    const mapOffers = (
      offers: EstimateOffer[],
      viewMap: Map<string, MoverProfileView>,
    ): EstimateOfferResponseDto[] => {
      return offers.map((offer) => {
        const mover = offer.mover;
        const isLiked = mover.likedCustomers?.some(
          (like) => like?.customer?.user?.id === userId,
        );
        const stats = viewMap.get(mover.id);

        return EstimateOfferResponseDto.from(offer, isLiked ?? false, {
          confirmedCount: stats?.confirmed_estimate_count ?? 0,
          averageRating: stats?.average_rating ?? 0,
          reviewCount: stats?.review_count ?? 0,
          likeCount: stats?.like_count ?? 0,
          includeFullAddress: true,
        });
      });
    };

    const items = sliced.map((request) => {
      const offers = mapOffers(request.estimateOffers, moverViewMap);
      return EstimateRequestResponseDto.from(request, offers);
    });

    const last = sliced[sliced.length - 1];
    const nextCursor =
      hasNext && last ? `${last.createdAt.toISOString()}|${last.id}` : null;

    const totalCount = await this.estimateRequestRepository
      .createQueryBuilder('request')
      .where('request.status = :status', { status: RequestStatus.PENDING })
      .getCount();

    return {
      items,
      hasNext,
      nextCursor,
      totalCount,
    };
  }

  /**
   * 고객이 특정 견적 요청에 대해 기사를 지정
   * @param requestId 견적 요청 ID
   * @param moverId 지정할 기사 ID
   * @param userId 고객 ID
   * @returns 성공 메시지
   */
  async addTargetMover(
    requestId: string,
    moverProfileId: string, // MoverProfile.id
    userId: string,
  ): Promise<{ message: string }> {
    const request = await this.estimateRequestRepository.findOne({
      where: { id: requestId },
      relations: ['customer', 'customer.user'],
    });

    if (!request) throw new NotFoundException('요청을 찾을 수 없습니다.');
    if (request.customer.user.id !== userId)
      throw new ForbiddenException('해당 요청에 접근할 수 없습니다.');

    const currentIds =
      request.targetMoverIds?.filter((id): id is string => !!id) || [];

    if (currentIds.includes(moverProfileId)) {
      throw new BadRequestException('이미 지정 기사로 추가된 기사입니다.');
    }

    if (currentIds.length >= 3) {
      throw new BadRequestException(
        '지정 기사는 최대 3명까지 추가할 수 있습니다.',
      );
    }

    const mover = await this.moverProfileRepository.findOne({
      where: { id: moverProfileId },
    });

    if (!mover) {
      throw new NotFoundException('해당 기사님의 프로필을 찾을 수 없습니다.');
    }

    request.targetMoverIds = [...currentIds, moverProfileId];
    await this.estimateRequestRepository.save(request);
    //모든 로직이 종료된 후 이벤트 리스너 동작
    this.dispatcher.targetMoverAssigned(request.id, moverProfileId);
    return {
      message: `🧑‍🔧 ${mover.nickname} 기사님이 지정 견적 기사로 추가되었습니다.`,
    };
  }

  /**
   * 기사가 진행 중인(제안할 수 있는) 견적 요청 목록 조회
   * - PENDING 상태인 견적 요청만
   * - 이미 제안했거나 반려한 견적은 제외 (해당 기사가 offer를 생성한 경우 모두 제외)
   * - tartgetedMoverIds에 본인 ID가 포함된 경우, isTargeted=true 리턴
   * @param userId 기사 ID
   * @returns EstimateRequestResponseDto[]
   */
  async findRequestListForMover(
    userId: string,
    pagination: EstimateRequestPaginationDto,
  ): Promise<GenericPaginatedDto<EstimateRequestResponseDto>> {
    const { orderField, cursor, take = 5 } = pagination;

    const dbFieldMap = {
      move_date: 'moveDate',
      created_at: 'createdAt',
    };
    const orderByField = dbFieldMap[orderField] ?? orderField;

    const mover = await this.moverProfileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!mover) {
      throw new NotFoundException('기사 프로필을 찾을 수 없습니다.');
    }

    const [cursorDatePart, cursorIdPart] = cursor?.split('|') ?? [];
    const cursorValue = cursorDatePart ? new Date(cursorDatePart) : undefined;
    if (cursorValue && isNaN(cursorValue.getTime())) {
      throw new BadRequestException('유효하지 않은 커서 값입니다.');
    }

    // 기사가 제안할 수 있는 견적 요청 조회
    const qb = this.estimateRequestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'user')
      .leftJoin('request.estimateOffers', 'offer', 'offer.moverId = :moverId')
      .where('request.status = :status', { status: RequestStatus.PENDING })
      .andWhere('offer.id IS NULL') // 이미 제안했거나 반려한 견적 제외 (어떤 상태든 해당 기사가 offer를 생성한 경우 제외)
      .setParameter('moverId', mover.id)
      .orderBy(`request.${orderByField}`, 'ASC')
      .addOrderBy('request.id', 'ASC')
      .take(take + 1);

    if (cursorValue) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where(`request.${orderByField} > :cursorValue`, { cursorValue });
          if (cursorIdPart) {
            qb.orWhere(
              new Brackets((qb2) => {
                qb2
                  .where(`request.${orderByField} = :cursorValue`, {
                    cursorValue,
                  })
                  .andWhere('request.id > :cursorId', {
                    cursorId: cursorIdPart,
                  });
              }),
            );
          }
        }),
      );
    }

    const requests = await qb.getMany();
    const hasNext = requests.length > take;
    const sliced = requests.slice(0, take);

    const items = sliced.map((request) =>
      EstimateRequestResponseDto.from(
        request,
        [],
        {
          includeMinimalAddress: true,
        },
        request.targetMoverIds?.includes(mover.id) ?? false,
      ),
    );

    const last = sliced[sliced.length - 1];
    const nextCursor =
      hasNext && last ? `${last[orderByField].toISOString()}|${last.id}` : null;

    const totalCount = await this.estimateRequestRepository
      .createQueryBuilder('request')
      .leftJoin('request.estimateOffers', 'offer', 'offer.moverId = :moverId')
      .where('request.status = :status', { status: RequestStatus.PENDING })
      .andWhere('offer.id IS NULL')
      .setParameter('moverId', mover.id)
      .getCount();

    return {
      items,
      nextCursor,
      hasNext,
      totalCount,
    };
  }

  public async getTargetMoverIds(customerId: string) {
    const estimateRequest = await this.estimateRequestRepository.findOneBy({
      customer: { id: customerId },
      status: RequestStatus.PENDING,
    });

    return estimateRequest?.targetMoverIds ?? [];
  }
}
