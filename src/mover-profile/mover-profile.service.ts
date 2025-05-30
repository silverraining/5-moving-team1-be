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
import { MoverProfileView } from './view/mover-profile.view';
import { OrderField } from 'src/common/dto/cursor-pagination.dto';

@Injectable()
export class MoverProfileService {
  constructor(
    @InjectRepository(MoverProfile)
    private readonly moverProfileRepository: Repository<MoverProfile>,
    @InjectRepository(MoverProfileView)
    private readonly moverProfileViewRepository: Repository<MoverProfileView>,
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
    const { serviceType, serviceRegion, order } = dto; // 필터 조건 추출

    // 정렬 필드가 집계 필드인지 확인
    const isAggregateField =
      order &&
      [
        OrderField.REVIEW_COUNT,
        OrderField.AVERAGE_RATING,
        OrderField.CONFIRMED_ESTIMATE_COUNT,
      ].includes(order.field);

    let qb;
    let alias;

    if (isAggregateField) {
      // 집계 필드 정렬시 뷰 사용
      qb = this.moverProfileViewRepository.createQueryBuilder(
        MOVER_PROFILE_VIEW_QB_ALIAS,
      );
      alias = MOVER_PROFILE_VIEW_QB_ALIAS;

      // 뷰는 집계 데이터만 있으므로, 실제 프로필 데이터를 가져오기 위해 조인
      qb.leftJoin(
        MoverProfile,
        MOVER_PROFILE_QB_ALIAS,
        `${MOVER_PROFILE_VIEW_QB_ALIAS}.id = ${MOVER_PROFILE_QB_ALIAS}.id`,
      ).addSelect(`${MOVER_PROFILE_QB_ALIAS}.*`);
    } else {
      // 일반 필드 정렬시 엔티티 사용
      qb = this.moverProfileRepository.createQueryBuilder(
        MOVER_PROFILE_QB_ALIAS,
      );
      alias = MOVER_PROFILE_QB_ALIAS;
    }

    // 1. 서비스 유형 필터링 적용
    this.commonService.applyServiceFilterToQb(
      qb,
      serviceType,
      Service.ServiceType,
      alias,
    );

    // 2. 서비스 지역 필터링 적용
    this.commonService.applyServiceFilterToQb(
      qb,
      serviceRegion,
      Service.ServiceRegion,
      alias,
    );

    // 3. 커서 기반 페이징 적용
    const { nextCursor } =
      await this.commonService.applyCursorPaginationParamsToQb(qb, dto);

    const [data, count] = await qb.getManyAndCount(); // 데이터와 총 개수 반환합니다.

    return { movers: data, count, nextCursor };
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
