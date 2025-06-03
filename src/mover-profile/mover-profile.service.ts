import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMoverProfileDto } from './dto/create-mover-profile.dto';
import { UpdateMoverProfileDto } from './dto/update-mover-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MoverProfile } from './entities/mover-profile.entity';
import { MoverProfileView } from './view/mover-profile.view';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import {
  EstimateRequest,
  RequestStatus,
} from '@/estimate-request/entities/estimate-request.entity';
import { GetMoverProfilesDto } from './dto/get-mover-profiles.dto';
import { OrderField } from '@/common/dto/cursor-pagination.dto';
import { CommonService, Service } from 'src/common/common.service';
import {
  MOVER_PROFILE_LIST_SELECT,
  MOVER_PROFILE_TABLE,
  MOVER_PROFILE_VIEW_TABLE,
} from '@/common/const/query-builder.const';
import { Role } from '@/user/entities/user.entity';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { Review } from '@/review/entities/review.entity';

@Injectable()
export class MoverProfileService {
  constructor(
    @InjectRepository(MoverProfile)
    private readonly moverProfileRepository: Repository<MoverProfile>,
    @InjectRepository(MoverProfileView)
    private readonly moverProfileViewRepository: Repository<MoverProfileView>,
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
    @InjectRepository(EstimateRequest)
    private readonly estimateRequestRepository: Repository<EstimateRequest>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly commonService: CommonService,
  ) {}

  async create(userId: string, createMoverProfileDto: CreateMoverProfileDto) {
    const profileData = {
      user: { id: userId }, // 관계 설정, 외래 키 자동 매핑
      ...createMoverProfileDto,
    };

    const newProfile = await this.moverProfileRepository.save(profileData);

    if (!newProfile) {
      throw new InternalServerErrorException(
        '기사님의 프로필 생성에 실패했습니다!',
      );
    }

    return newProfile;
  }

  async findAll(user: UserInfo, dto: GetMoverProfilesDto) {
    const { serviceType, serviceRegion } = dto;
    const { sub: userId, role } = user;
    const isCustomer = role === Role.CUSTOMER;
    let targetMoverIds: string[] = [];

    // 집계 필드 정렬시: MoverProfile을 베이스로 하고 뷰와 조인
    const qb = this.moverProfileRepository
      .createQueryBuilder(MOVER_PROFILE_TABLE)
      .select(MOVER_PROFILE_LIST_SELECT);

    // 뷰와 조인해서 집계 데이터 가져오기
    qb.leftJoinAndSelect(
      MoverProfileView,
      MOVER_PROFILE_VIEW_TABLE,
      `${MOVER_PROFILE_TABLE}.id = ${MOVER_PROFILE_VIEW_TABLE}.id`,
    );

    // 서비스 필터링 적용 (MoverProfile 기준)
    this.commonService.applyServiceFilterToQb(
      qb,
      serviceType,
      Service.ServiceType,
      MOVER_PROFILE_TABLE,
    );

    this.commonService.applyServiceFilterToQb(
      qb,
      serviceRegion,
      Service.ServiceRegion,
      MOVER_PROFILE_TABLE,
    );

    // 커서 기반 페이징 적용
    const { nextCursor } =
      await this.commonService.applyCursorPaginationParamsToQb(qb, dto);

    const { entities, raw: aggregates } = await qb.getRawAndEntities();

    // 엔티티와 뷰 데이터를 병합
    const moversWithAggregates = this.mergeEntityWithAggregates(
      entities,
      aggregates,
    );

    // 고객일 경우, 해당 기사에게 지정 견적 요청을 했는지
    if (isCustomer) {
      const customer = await this.customerProfileRepository.findOne({
        where: { user: { id: userId } },
        select: ['id'], // 필요한 필드만 가져오기
      });

      const estimateRequest = await this.estimateRequestRepository.findOne({
        where: {
          customer: { id: customer.id },
          status: RequestStatus.PENDING,
        },
        select: ['targetMoverIds'], // 필요한 필드만 가져오기
      });

      targetMoverIds = estimateRequest.targetMoverIds; // 지정 견적 요청을 한 기사 ID 목록
    }

    const count = await qb.getCount();
    return { movers: moversWithAggregates, count, nextCursor, targetMoverIds };
  }

  private mergeEntityWithAggregates(
    entities: MoverProfile[],
    aggregates: MoverProfileView[],
  ) {
    return entities.map((entity, index) => ({
      ...entity,
      [OrderField.REVIEW_COUNT]:
        parseInt(
          aggregates[index][
            `${MOVER_PROFILE_VIEW_TABLE}_${OrderField.REVIEW_COUNT}`
          ],
        ) || 0,
      [OrderField.AVERAGE_RATING]:
        parseFloat(
          aggregates[index][
            `${MOVER_PROFILE_VIEW_TABLE}_${OrderField.AVERAGE_RATING}`
          ],
        ) || 0.0,
      [OrderField.CONFIRMED_ESTIMATE_COUNT]:
        parseInt(
          aggregates[index][
            `${MOVER_PROFILE_VIEW_TABLE}_${OrderField.CONFIRMED_ESTIMATE_COUNT}`
          ],
        ) || 0,
      likeCount:
        parseInt(aggregates[index][`${MOVER_PROFILE_VIEW_TABLE}_like_count`]) ||
        0,
    }));
  }

  async findMe(userId: string) {
    const profile = await this.moverProfileRepository.findOneBy({
      user: { id: userId },
    });

    if (!profile) {
      throw new NotFoundException('기사님의 프로필을 찾을 수 없습니다.');
    }

    const aggregate = await this.moverProfileViewRepository.findOne({
      where: { id: profile.id },
      select: [
        OrderField.REVIEW_COUNT, // 리뷰 개수
        OrderField.AVERAGE_RATING, // 평균 평점
        OrderField.CONFIRMED_ESTIMATE_COUNT, // 확정된 견적 요청 개수
        'like_count', // 좋아요 개수
      ],
    });

    const mover = this.mergeEntityWithAggregates([profile], [aggregate])[0];

    const reviews = await this.reviewRepository.find({
      where: { mover: { id: profile.id } },
      relations: ['customer', 'customer.user'],
      select: {
        rating: true, // 리뷰 평점
        comment: true, // 리뷰 내용
        createdAt: true, // 리뷰 작성일
        customer: {
          user: {
            email: true, // 고객 이메일
          },
        },
      },
    });

    return { ...mover, reviews };
  }

  async findOne(moverId: string) {
    const profile = await this.moverProfileRepository.findOneBy({
      id: moverId,
    });

    if (!profile) {
      throw new NotFoundException('기사님의 프로필을 찾을 수 없습니다.');
    }

    const aggregate = await this.moverProfileViewRepository.findOne({
      where: { id: moverId },
      select: [
        OrderField.REVIEW_COUNT, // 리뷰 개수
        OrderField.AVERAGE_RATING, // 평균 평점
        OrderField.CONFIRMED_ESTIMATE_COUNT, // 확정된 견적 요청 개수
        'like_count', // 좋아요 개수
      ],
    });

    const mover = this.mergeEntityWithAggregates([profile], [aggregate])[0];

    const reviews = await this.reviewRepository.find({
      where: { mover: { id: moverId } },
      relations: ['customer', 'customer.user'],
      select: {
        rating: true, // 리뷰 평점
        comment: true, // 리뷰 내용
        createdAt: true, // 리뷰 작성일
        customer: {
          user: {
            email: true, // 고객 이메일
          },
        },
      },
    });

    return { ...mover, reviews };
  }

  async update(userId: string, updateMoverProfileDto: UpdateMoverProfileDto) {
    const profile = await this.moverProfileRepository.findOneBy({
      user: { id: userId }, // user의 id로 프로필 찾기
    });

    if (!profile) {
      throw new NotFoundException('기사님의 프로필을 찾을 수 없습니다.');
    }

    // DTO 객체의 값들을 profile 객체에 덮어씌움
    Object.assign(profile, updateMoverProfileDto);

    const updatedProfile = await this.moverProfileRepository.save(profile);

    if (!updatedProfile) {
      throw new InternalServerErrorException(
        '기사님의 프로필 업데이트에 실패했습니다!',
      );
    }

    return updatedProfile;
  }
}
