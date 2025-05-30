import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMoverProfileDto } from './dto/create-mover-profile.dto';
import { UpdateMoverProfileDto } from './dto/update-mover-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoverProfile } from './entities/mover-profile.entity';
import { Repository } from 'typeorm';
import { GetMoverProfilesDto } from './dto/get-mover-profiles.dto';
import { CommonService, Service } from 'src/common/common.service';
import {
  MOVER_PROFILE_QB_ALIAS,
  MOVER_PROFILE_VIEW_QB_ALIAS,
} from 'src/common/const/qb-alias';
import { OrderField } from 'src/common/dto/cursor-pagination.dto';

@Injectable()
export class MoverProfileService {
  constructor(
    @InjectRepository(MoverProfile)
    private readonly moverProfileRepository: Repository<MoverProfile>,
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

  async findAll(dto: GetMoverProfilesDto) {
    const { serviceType, serviceRegion, order } = dto;

    const isAggregateField =
      order &&
      [
        OrderField.REVIEW_COUNT,
        OrderField.AVERAGE_RATING,
        OrderField.CONFIRMED_ESTIMATE_COUNT,
      ].includes(order.field);

    if (isAggregateField) {
      // 집계 필드 정렬시: MoverProfile을 베이스로 하고 뷰와 조인
      const qb = this.moverProfileRepository.createQueryBuilder(
        MOVER_PROFILE_QB_ALIAS,
      );

      // 뷰와 조인해서 집계 데이터 가져오기
      qb.leftJoin(
        'mover_profile_view',
        MOVER_PROFILE_VIEW_QB_ALIAS,
        `${MOVER_PROFILE_QB_ALIAS}.id = ${MOVER_PROFILE_VIEW_QB_ALIAS}.id`,
      )
        .addSelect(`${MOVER_PROFILE_VIEW_QB_ALIAS}.review_count`)
        .addSelect(`${MOVER_PROFILE_VIEW_QB_ALIAS}.average_rating`)
        .addSelect(`${MOVER_PROFILE_VIEW_QB_ALIAS}.estimate_offer_count`);

      // 서비스 필터링 적용 (MoverProfile 기준)
      this.commonService.applyServiceFilterToQb(
        qb,
        serviceType,
        Service.ServiceType,
        MOVER_PROFILE_QB_ALIAS,
      );

      this.commonService.applyServiceFilterToQb(
        qb,
        serviceRegion,
        Service.ServiceRegion,
        MOVER_PROFILE_QB_ALIAS,
      );

      // 커서 기반 페이징 적용
      const { nextCursor } =
        await this.commonService.applyCursorPaginationParamsToQb(qb, dto);

      const { entities, raw: rawResults } = await qb.getRawAndEntities();

      // 엔티티와 뷰 데이터를 병합
      const moversWithAggregates = entities.map(
        (entity: MoverProfile, index: number) => ({
          ...entity,
          review_count:
            rawResults[index][`${MOVER_PROFILE_VIEW_QB_ALIAS}_review_count`] ||
            0,
          average_rating:
            parseFloat(
              rawResults[index][
                `${MOVER_PROFILE_VIEW_QB_ALIAS}_average_rating`
              ],
            ) || 0,
          estimate_offer_count:
            rawResults[index][
              `${MOVER_PROFILE_VIEW_QB_ALIAS}_estimate_offer_count`
            ] || 0,
        }),
      );

      const count = await qb.getCount();
      return { movers: moversWithAggregates, count, nextCursor };
    } else {
      // 일반 필드 정렬시: 기존 로직 사용
      const qb = this.moverProfileRepository.createQueryBuilder(
        MOVER_PROFILE_QB_ALIAS,
      );

      this.commonService.applyServiceFilterToQb(
        qb,
        serviceType,
        Service.ServiceType,
        MOVER_PROFILE_QB_ALIAS,
      );

      this.commonService.applyServiceFilterToQb(
        qb,
        serviceRegion,
        Service.ServiceRegion,
        MOVER_PROFILE_QB_ALIAS,
      );

      const { nextCursor } =
        await this.commonService.applyCursorPaginationParamsToQb(qb, dto);

      const [data, count] = await qb.getManyAndCount();
      return { movers: data, count, nextCursor };
    }
  }

  async findOne(userId: string) {
    const profile = await this.moverProfileRepository.findOneBy({
      user: { id: userId }, // user의 id로 프로필 찾기
    });

    if (!profile) {
      throw new NotFoundException('기사님의 프로필을 찾을 수 없습니다.');
    }

    return profile;
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
