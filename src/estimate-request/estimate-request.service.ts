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
import { DataSource, In, Repository } from 'typeorm';
import { UserInfo } from '@/user/decorator/user-info.decorator';

import { EstimateOfferResponseDto } from '@/estimate-offer/dto/estimate-offer-response.dto';
import { MoverProfileView } from '@/mover-profile/view/mover-profile.view';
import { MoverProfile } from '@/mover-profile/entities/mover-profile.entity';

import { EstimateRequestPaginationDto } from './dto/estimate-request-pagination.dto';
import { GenericPaginatedDto } from '@/common/dto/paginated-response.dto';
import { EstimateOffer } from '@/estimate-offer/entities/estimate-offer.entity';
import { CreatedAtCursorPaginationDto } from '@/common/dto/created-at-pagination.dto';

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
  ) {}

  /**
   * 고객의 진행중인(pending, confirmed) 견적 요청 ID 조회 - //TODO: 개발용이므로 추후 삭제 예정
   * @param userId 고객 ID
   * @returns { estimateRequestId: string }[]
   */
  async findActiveEstimateRequestIds(
    userId: string,
  ): Promise<{ estimateRequestId: string }[]> {
    return this.estimateRequestRepository
      .find({
        where: {
          customer: { user: { id: userId } },
          status: In([RequestStatus.PENDING, RequestStatus.CONFIRMED]),
        },
        select: { id: true }, // `id`만 반환
      })
      .then((requests) =>
        requests.map((req) => ({ estimateRequestId: req.id })),
      );
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
        status: In([RequestStatus.PENDING, RequestStatus.CONFIRMED]),
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
  // COMPLETED, CANCELED, EXPIRED 상태만 조회 (대기, 진행 중인 요청 제외)
  validStatuses = ['CONFIRMED', 'COMPLETED', 'EXPIRED'];

  async findAllRequestHistoryWithPagination(
    userId: string,
    { cursor, take = 5 }: CreatedAtCursorPaginationDto,
  ): Promise<GenericPaginatedDto<EstimateRequestResponseDto>> {
    //기본 쿼리 빌더 구성: 고객이 생성한 견적 요청 + 관련 정보 join
    const qb = this.estimateRequestRepository
      .createQueryBuilder('request')
      .addSelect('request.status') // dto에서 requestStatus 사용 시 명시적 select 필요
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
      .take(take + 1); // hasNext 확인용 +1
    // 커서 기반 페이지네이션 처리
    // 클라이언트는 마지막 항목의 createdAt을 cursor로 전달함
    // cursor 이전(createdAt < cursor)의 데이터만 조회하여 중복 없이 다음 페이지 구성
    if (cursor) {
      qb.andWhere('request.createdAt < :cursor', {
        cursor: new Date(cursor),
      });
    }
    // 데이터 조회 및 커서 페이징 처리
    const requests = await qb.getMany();
    const hasNext = requests.length > take;
    const sliced = requests.slice(0, take);

    const allMoverIds = sliced.flatMap((req) =>
      req.estimateOffers.map((o) => o.moverId),
    );
    // offer에 대응하는 moverView 조회
    const moverViews = await this.dataSource
      .getRepository(MoverProfileView)
      .findBy({ id: In(allMoverIds) });

    const moverViewMap = new Map(moverViews.map((v) => [v.id, v]));

    //  각 request에 포함된 offer 리스트 변환
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

    //  커서 생성
    const nextCursor = hasNext
      ? sliced[sliced.length - 1].createdAt.toISOString()
      : null;

    const totalCount = await this.estimateRequestRepository
      .createQueryBuilder('request')
      .leftJoin('request.customer', 'customer')
      .leftJoin('customer.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('request.status IN (:...statuses)', {
        statuses: this.validStatuses,
      })
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

    return {
      message: `🧑‍🔧 ${mover.nickname} 기사님이 지정 견적 기사로 추가되었습니다.`,
    };
  }

  /**
   * 기사가 진행 중인 견적 요청 목록 조회 - tartgetedMoverIds에 본인 ID가 포함된 경우, isTargeted=true 리턴
   * @param userId 기사 ID
   * @returns EstimateRequestResponseDto[]
   */

  async findRequestListForMover(
    userId: string,
    pagination: EstimateRequestPaginationDto,
  ): Promise<GenericPaginatedDto<EstimateRequestResponseDto>> {
    const { orderField, cursor, take = 5 } = pagination;

    //  mover 프로필 조회
    const mover = await this.moverProfileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!mover) {
      throw new NotFoundException('기사 프로필을 찾을 수 없습니다.');
    }

    // 견적 요청 쿼리 빌더
    const qb = this.estimateRequestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'user')
      .where('request.status = :status', { status: RequestStatus.PENDING })
      .orderBy(`request.${orderField}`, 'ASC')
      .addOrderBy('request.createdAt', 'ASC') //이사일이 같으면 생성일로 정렬
      .take(take + 1); // hasNext 판단용으로 실제데이터 take +1 가져옴

    // 커서 페이징 조건 추가
    if (cursor) {
      const cursorValue =
        ['move_date', 'created_at'].includes(orderField) &&
        typeof cursor === 'string'
          ? new Date(cursor) //cursor는 ISO 문자열로 들어오므로 Date 타입 변환
          : cursor;
      qb.andWhere(`request.${orderField} > :cursor`, { cursor: cursorValue });
    }

    // 데이터 조회
    const requests = await qb.getMany();
    const hasNext = requests.length > take; //hasNext 판단 후 슬라이스
    const sliced = requests.slice(0, take);

    // 응답 DTO 변환
    const items = sliced.map((request) =>
      EstimateRequestResponseDto.from(
        request,
        undefined,
        { includeMinimalAddress: true },
        request.targetMoverIds?.includes(mover.id) ?? false,
      ),
    );

    // nextCursor를 마지막 요소의 정렬 기준 값으로 설정
    const nextCursor = hasNext ? sliced[sliced.length - 1]?.[orderField] : null;

    // totalCount (필터 없이)
    const totalCount = await this.estimateRequestRepository
      .createQueryBuilder('request')
      .where('request.status = :status', { status: RequestStatus.PENDING })
      .getCount();

    return {
      items,
      nextCursor,
      hasNext,
      totalCount,
    };
  }

  // remove(id: number) {
  //   return `This action removes a #${id} estimateRequest`;
  // }
}
