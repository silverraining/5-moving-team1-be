import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import {
  LIKED_MOVER_LIST_SELECT,
  MOVER_TABLE,
  MOVER_VIEW_TABLE,
} from '@/common/const/query-builder.const';
import { MoverProfileView } from '@/mover-profile/view/mover-profile.view';
import { MoverProfile } from '@/mover-profile/entities/mover-profile.entity';
import { MoverProfileService } from '@/mover-profile/mover-profile.service';
import { handleError } from '@/common/utils/handle-error.util';
import { CustomerProfileService } from '@/customer-profile/customer-profile.service';

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
    private readonly customerProfileService: CustomerProfileService,
  ) {}

  async create(userId: string, moverId: string) {
    const customerId = await this.customerProfileService.getCustomerId(userId); // 고객 ID 가져오기
    const moverNickname = await this.checkMoverExists(moverId); // 기사 존재 여부 확인 후 별명 가져오기

    await handleError(
      () => this.likeRepository.save({ moverId, customerId }), // 찜하기 저장
      `${moverNickname} 기사님 찜하기 중 서버 오류`,
    );

    return { message: '찜하기 성공!' };
  }

  async findAll(userId: string) {
    const customerId = await this.customerProfileService.getCustomerId(userId);

    const customer = await this.customerProfileRepository.findOne({
      where: { id: customerId },
      relations: ['likedMovers'],
    });

    // 고객이 찜한 기사들의 ID를 추출
    const likedMoverIds = (customer.likedMovers ?? []).map(
      (likeData) => likeData.moverId,
    );

    // 찜한 기사님이 없는 경우
    if (!likedMoverIds.length) {
      return []; // 빈 배열 반환
    }

    // 찜한 기사님이 있는 경우
    const qb = this.moverProfileRepository
      .createQueryBuilder(MOVER_TABLE)
      .select(LIKED_MOVER_LIST_SELECT) // entity select
      .leftJoinAndSelect(
        MoverProfileView,
        MOVER_VIEW_TABLE,
        `${MOVER_TABLE}.id = ${MOVER_VIEW_TABLE}.id`,
      )
      .where(`${MOVER_TABLE}.id IN (:...ids)`, { ids: likedMoverIds })
      .orderBy(`${MOVER_TABLE}.like_count`, 'DESC');

    const { entities, raw: aggregates } = await qb.getRawAndEntities();

    const moversWithAggregates =
      this.moverProfileService.mergeEntityWithAggregates(entities, aggregates);

    return moversWithAggregates;
  }

  async remove(userId: string, moverId: string) {
    const customerId = await this.customerProfileService.getCustomerId(userId); // 고객 ID 가져오기
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
