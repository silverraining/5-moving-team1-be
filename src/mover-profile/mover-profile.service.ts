import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMoverProfileDto } from './dto/create-mover-profile.dto';
import { UpdateMoverProfileDto } from './dto/update-mover-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MoverProfile } from './entities/mover-profile.entity';
import { GetMoverProfilesDto } from './dto/get-mover-profiles.dto';
import { CommonService, Service } from 'src/common/common.service';
import {
  MOVER_LIST_SELECT,
  MOVER_LIST_STATS_SELECT,
  MOVER_PROFILE_SELECT,
  MOVER_TABLE,
  MOVER_VIEW_TABLE,
} from '@/common/const/query-builder.const';
import { Role } from '@/user/entities/user.entity';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { MoverProfileHelper } from './mover-profile.helper';
import { MoverProfileView } from './view/mover-profile.view';
import { OrderField } from '@/common/validator/order.validator';

@Injectable()
export class MoverProfileService {
  constructor(
    @InjectRepository(MoverProfile)
    private readonly moverProfileRepository: Repository<MoverProfile>,

    private readonly commonService: CommonService,
    private readonly moverProfileHelper: MoverProfileHelper, // Helper로 분리하여 재사용 가능
  ) {}

  async create(userId: string, createMoverProfileDto: CreateMoverProfileDto) {
    const profileData = {
      user: { id: userId }, // 관계 설정, 외래 키 자동 매핑
      ...createMoverProfileDto,
    };

    await this.moverProfileRepository.save(profileData);

    return { message: '기사님의 프로필이 성공적으로 생성되었습니다.' };
  }

  async findAll(user: UserInfo, dto: GetMoverProfilesDto) {
    const { serviceType, serviceRegion, order } = dto;
    const { sub: userId, role } = user;
    const isCustomer = role === Role.CUSTOMER;

    if (!order) {
      throw new BadRequestException(
        "정렬 기준이 필요합니다. 'order' 필드를 포함해주세요.",
      );
    }

    // 1. MoverProfile 엔티티의 쿼리 빌더 생성 및 집계 필드 조인
    const qb = this.moverProfileRepository
      .createQueryBuilder(MOVER_TABLE)
      .select(MOVER_LIST_SELECT)
      .leftJoin(`${MOVER_TABLE}.stats`, 'stats')
      .addSelect(MOVER_LIST_STATS_SELECT);

    // 2. 서비스 필터링 적용 (MoverProfile 기준)
    this.commonService.applyServiceFilterToQb(
      qb,
      serviceType,
      Service.ServiceType,
      MOVER_TABLE,
    );

    this.commonService.applyServiceFilterToQb(
      qb,
      serviceRegion,
      Service.ServiceRegion,
      MOVER_TABLE,
    );

    // 3. 커서 기반 페이징 적용
    const { nextCursor, hasNext } =
      await this.commonService.applyCursorPaginationParamsToQb(qb, dto);

    const movers = await qb.getMany();

    // 4. 집계 필드와 함께 프로필 병합
    const moversWithAggregates = movers.map((mover) =>
      this.moverProfileHelper.mergeMoverProfileWithAggregates(mover),
    );

    // 5. 고객인 경우, 고객 ID를 가져온 뒤 관련 기사 정보 조회
    const { targetMoverIds, likedMoverIds } =
      await this.moverProfileHelper.getCustomerRelatedMoverIds(
        userId,
        isCustomer,
      );

    // 6. 각 기사에 고객 기준의 상태(isTargeted, isLiked)를 추가
    const moversWithCustomerStatus = moversWithAggregates.map((mover) => ({
      ...mover,
      isTargeted: targetMoverIds.includes(mover.id), // 고객이 이 기사에게 견적 요청을 보냈는가?
      isLiked: likedMoverIds.includes(mover.id), // 고객이 이 기사를 좋아요 했는가?
    }));

    return {
      movers: moversWithCustomerStatus,
      hasNext,
      nextCursor,
    };
  }

  async findMe(userId: string) {
    // 1. MoverProfile이 존재하는지 확인 후 id 조회
    const moverId = await this.moverProfileHelper.getMoverId(userId);

    // 2. MoverProfile 엔티티의 쿼리 빌더 생성 및 집계 필드 조인
    const qb = this.moverProfileRepository
      .createQueryBuilder(MOVER_TABLE)
      .select(MOVER_PROFILE_SELECT)
      .leftJoin(`${MOVER_TABLE}.stats`, 'stats')
      .addSelect(MOVER_LIST_STATS_SELECT)
      .where(`${MOVER_TABLE}.id = :moverId`, { moverId });

    const mover = await qb.getOne();

    // 3. 집계 필드와 함께 프로필 병합
    const moverWithAggregates =
      this.moverProfileHelper.mergeMoverProfileWithAggregates(mover);

    return moverWithAggregates;
  }

  async findOne(user: UserInfo, moverId: string) {
    const { sub: userId, role } = user;
    const isCustomer = role === Role.CUSTOMER;

    // 1. MoverProfile이 존재하는지 확인
    const profile = await this.moverProfileRepository.findOne({
      where: { id: moverId },
    });

    if (!profile) {
      throw new NotFoundException('기사님의 프로필을 찾을 수 없습니다.');
    }

    // 2. MoverProfile 엔티티의 쿼리 빌더 생성 및 집계 필드 조인
    const qb = this.moverProfileRepository
      .createQueryBuilder(MOVER_TABLE)
      .select(MOVER_PROFILE_SELECT)
      .leftJoin(`${MOVER_TABLE}.stats`, 'stats')
      .addSelect(MOVER_LIST_STATS_SELECT)
      .where(`${MOVER_TABLE}.id = :moverId`, { moverId });

    const mover = await qb.getOne();

    // 3. 집계 필드와 함께 프로필 병합
    const moverWithAggregates =
      this.moverProfileHelper.mergeMoverProfileWithAggregates(mover);

    // 4. 고객인 경우, 고객 ID를 가져온 뒤 관련 기사 ids 조회
    const { targetMoverIds, likedMoverIds } =
      await this.moverProfileHelper.getCustomerRelatedMoverIds(
        userId,
        isCustomer,
      );

    // 5. 각 기사에 고객 기준의 상태(isTargeted, isLiked)를 추가
    const moverWithCustomerStatus = {
      ...moverWithAggregates, // 집계 필드가 포함된 mover 프로필
      isTargeted: targetMoverIds.includes(moverWithAggregates.id), // 고객이 이 기사에게 견적 요청을 보냈는가?
      isLiked: likedMoverIds.includes(moverWithAggregates.id), // 고객이 이 기사를 좋아요 했는가?
    };

    return moverWithCustomerStatus;
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

    await this.moverProfileRepository.save(profile);

    return { message: '기사님의 프로필이 성공적으로 수정되었습니다.' };
  }

  public mergeEntityWithAggregates(
    entities: MoverProfile[],
    aggregates: MoverProfileView[],
  ) {
    return entities.map((entity, index) => ({
      ...entity,
      [OrderField.REVIEW_COUNT]:
        parseInt(
          aggregates[index][`${MOVER_VIEW_TABLE}_${OrderField.REVIEW_COUNT}`],
        ) || 0,
      [OrderField.AVERAGE_RATING]:
        parseFloat(
          aggregates[index][`${MOVER_VIEW_TABLE}_${OrderField.AVERAGE_RATING}`],
        ) || 0.0,
      [OrderField.CONFIRMED_ESTIMATE_COUNT]:
        parseInt(
          aggregates[index][
            `${MOVER_VIEW_TABLE}_${OrderField.CONFIRMED_ESTIMATE_COUNT}`
          ],
        ) || 0,
      likeCount:
        parseInt(aggregates[index][`${MOVER_VIEW_TABLE}_like_count`]) || 0,
    }));
  }
}
