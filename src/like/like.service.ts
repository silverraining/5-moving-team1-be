import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import {
  LIKED_MOVER_LIST_SELECT,
  MOVER_PROFILE_TABLE,
  MOVER_PROFILE_VIEW_TABLE,
} from '@/common/const/query-builder.const';
import { MoverProfileView } from '@/mover-profile/view/mover-profile.view';
import { MoverProfile } from '@/mover-profile/entities/mover-profile.entity';
import { MoverProfileService } from '@/mover-profile/mover-profile.service';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(CustomerProfile)
    private readonly customerRepository: Repository<CustomerProfile>,
    @InjectRepository(MoverProfile)
    private readonly moverProfileRepository: Repository<MoverProfile>,
    private readonly moverProfileService: MoverProfileService,
  ) {}

  async create(userId: string, moverId: string) {
    const customerId = await this.getCustomerId(userId);

    await this.likeRepository.save({
      mover: { id: moverId },
      customer: { id: customerId },
    });

    return { message: `찜하기 성공!` };
  }

  async findAll(userId: string) {
    const customerId = await this.getCustomerId(userId);
    console.log('customerId: ', customerId);

    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
      relations: ['likedMovers'],
    });

    // 고객이 찜한 기사들의 ID를 추출
    const likedMoverIds = customer.likedMovers.map(
      (likeData) => likeData.mover,
    );

    const qb = this.moverProfileRepository
      .createQueryBuilder(MOVER_PROFILE_TABLE)
      .select(LIKED_MOVER_LIST_SELECT) // entity select
      .leftJoinAndSelect(
        MoverProfileView,
        MOVER_PROFILE_VIEW_TABLE,
        `${MOVER_PROFILE_TABLE}.id = ${MOVER_PROFILE_VIEW_TABLE}.id`,
      )
      .where(`${MOVER_PROFILE_TABLE}.id IN (:...ids)`, { ids: likedMoverIds })
      .orderBy(`${MOVER_PROFILE_VIEW_TABLE}.like_count`, 'DESC');

    const { entities, raw: aggregates } = await qb.getRawAndEntities();

    const moversWithAggregates =
      this.moverProfileService.mergeEntityWithAggregates(entities, aggregates);

    return moversWithAggregates;
  }

  async remove(userId: string, moverId: string) {
    const customerId = await this.getCustomerId(userId);

    await this.likeRepository.delete({
      customer: { id: customerId },
      mover: { id: moverId },
    });

    return { message: `찜하기 취소 성공!` };
  }

  private async getCustomerId(userId: string) {
    const customer = await this.customerRepository.findOne({
      where: { user: { id: userId } },
      select: ['id'],
    });

    if (!customer) {
      throw new NotFoundException(
        '고객님의 프로필을 찾을 수 없습니다, 프로필을 생성해주세요!',
      );
    }

    return customer.id;
  }
}
