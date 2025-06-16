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
import { OrderDirection } from '@/common/dto/cursor-pagination.dto';
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
  validStatuses = ['CONFIRMED', 'COMPLETED', 'CANCELED', 'EXPIRED'];

  async findAllRequestHistory(
    userId: string,
  ): Promise<EstimateRequestResponseDto[]> {
    const requests = await this.estimateRequestRepository.find({
      where: {
        status: In(this.validStatuses),
      },
      relations: [
        'customer',
        'customer.user',
        'estimateOffers',
        'estimateOffers.mover',
        'estimateOffers.estimateRequest',
        'estimateOffers.mover.reviews',
        'estimateOffers.mover.likedCustomers',
      ],
      order: {
        createdAt: 'DESC',
      },
    });

    const filtered = requests.filter(
      (request) => request.customer.user.id === userId,
    );

    const allOfferMoverIds = filtered.flatMap((req) =>
      req.estimateOffers.map((o) => o.moverId),
    );

    const moverViews = await this.dataSource
      .getRepository(MoverProfileView)
      .findBy({ id: In(allOfferMoverIds) });

    const moverViewMap = new Map(moverViews.map((v) => [v.id, v]));

    return Promise.all(
      filtered.map(async (request) => {
        const offers = request.estimateOffers.map((offer) => {
          const mover = offer.mover;
          const isLiked = mover.likedCustomers?.some(
            (like) => like?.customer?.user?.id === userId,
          );
          const moverView = moverViewMap.get(mover.id);

          return EstimateOfferResponseDto.from(offer, isLiked ?? false, {
            confirmedCount: moverView?.confirmed_estimate_count ?? 0,
            averageRating: moverView?.average_rating ?? 0,
            reviewCount: moverView?.review_count ?? 0,
            likeCount: moverView?.like_count ?? 0,
            includeFullAddress: true,
          });
        });

        return EstimateRequestResponseDto.from(request, offers);
      }),
    );
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
    moverId: string, // MoverProfile.id
    userId: string,
  ): Promise<{ message: string }> {
    const request = await this.estimateRequestRepository.findOne({
      where: { id: requestId },
      relations: ['customer', 'customer.user'],
    });

    if (!request) throw new NotFoundException('요청을 찾을 수 없습니다.');
    if (request.customer.user.id !== userId)
      throw new ForbiddenException('해당 요청에 접근할 수 없습니다.');

    const currentIds = request.targetMoverIds || [];

    if (currentIds.includes(moverId)) {
      throw new BadRequestException('이미 지정 기사로 추가된 기사입니다.');
    }

    if (currentIds.length >= 3) {
      throw new BadRequestException(
        '지정 기사는 최대 3명까지 추가할 수 있습니다.',
      );
    }

    const mover = await this.moverProfileRepository.findOne({
      where: { id: moverId },
    });

    if (!mover) {
      throw new NotFoundException('해당 기사님의 프로필을 찾을 수 없습니다.');
    }

    request.targetMoverIds = [...currentIds, moverId];
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
