import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import {
  LIKED_MOVER_LIST_SELECT,
  MOVER_LIST_STATS_SELECT,
  MOVER_TABLE,
} from '@/common/const/query-builder.const';
import { MoverProfile } from '@/mover-profile/entities/mover-profile.entity';
import { MoverProfileService } from '@/mover-profile/mover-profile.service';
import { handleError } from '@/common/utils/handle-error.util';
import { CustomerProfileHelper } from '@/customer-profile/customer-profile.helper';
import { OrderField } from '@/common/validator/order.validator';
import { statsAlias } from '@/common/common.service';
import { MoverProfileHelper } from '@/mover-profile/mover-profile.helper';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
    @InjectRepository(MoverProfile)
    private readonly moverProfileRepository: Repository<MoverProfile>,

    private readonly moverProfileService: MoverProfileService,
    private readonly customerProfileHelper: CustomerProfileHelper,
    private readonly moverProfileHelper: MoverProfileHelper,
  ) {}

  async create(userId: string, moverId: string) {
    const customerId = await this.customerProfileHelper.getCustomerId(userId); // 고객 프로필 ID 가져오기
    const moverNickname = await this.checkMoverExists(moverId); // 기사 존재 여부 확인 후 별명 가져오기

    // 1. 찜한 기사인지 확인
    const isLiked = await this.likeRepository.findOneBy({
      moverId,
      customerId,
    });

    if (isLiked) {
      throw new ConflictException(
        `${moverNickname} 기사님은 이미 찜한 기사입니다.`,
      );
    }

    // 2. 찜하기 저장
    await handleError(
      () => this.likeRepository.save({ moverId, customerId }), // 찜하기 저장
      `${moverNickname} 기사님 찜하기 중 서버 오류`,
    );

    return { message: '찜하기 성공!' };
  }

  async findAll(userId: string) {
    // 1. 고객 ID 가져오기
    const customerId = await this.customerProfileHelper.getCustomerId(userId);

    // 2. 고객이 찜한 기사들의 ID를 추출
    const likedMoverIds =
      await this.customerProfileHelper.getLikedMoverIds(customerId);

    // 3. 찜한 기사님이 없는 경우
    if (!likedMoverIds.length) {
      return []; // 빈 배열 반환
    }

    // 4. 찜한 기사님이 있는 경우
    const qb = this.moverProfileRepository
      .createQueryBuilder(MOVER_TABLE)
      .select(LIKED_MOVER_LIST_SELECT)
      .leftJoin(`${MOVER_TABLE}.stats`, 'stats')
      .addSelect(MOVER_LIST_STATS_SELECT)
      .where(`${MOVER_TABLE}.id IN (:...ids)`, { ids: likedMoverIds })
      .orderBy(
        `CAST(${statsAlias}.${OrderField.LIKE_COUNT} AS INTEGER)`,
        'DESC',
      );

    const likedMovers = await qb.getMany();

    // 4. 집계 필드와 함께 프로필 병합
    const likedMoversWithAggregates = likedMovers.map((mover) =>
      this.moverProfileHelper.mergeMoverProfileWithAggregates(mover),
    );

    return likedMoversWithAggregates;
  }

  async remove(userId: string, moverId: string) {
    const customerId = await this.customerProfileHelper.getCustomerId(userId); // 고객 ID 가져오기
    const moverNickname = await this.checkMoverExists(moverId); // 기사 존재 여부 확인 후 별명 가져오기

    await handleError(
      () => this.likeRepository.delete({ moverId, customerId }),
      `${moverNickname} 기사님 찜하기 취소 중 서버 오류.`,
    );

    return { message: `찜하기 취소 성공!` };
  }

  private async checkMoverExists(moverId: string) {
    const mover = await this.moverProfileRepository.findOne({
      where: { id: moverId },
    });

    if (!mover) {
      throw new NotFoundException('기사님을 찾을 수 없습니다.');
    }

    return mover.nickname; // 기사님의 닉네임 반환
  }
}
