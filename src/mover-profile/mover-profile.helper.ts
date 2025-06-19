import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoverProfile } from './entities/mover-profile.entity';
import { Repository } from 'typeorm';
import { camelCase } from 'lodash';
import { OrderField } from '@/common/validator/order.validator';
// import { MoverProfileView } from './view/mover-profile.view';
// import { MOVER_VIEW_TABLE } from '@/common/const/query-builder.const';
import { EstimateRequestService } from '@/estimate-request/estimate-request.service';
import { CustomerProfileHelper } from '@/customer-profile/customer-profile.helper';

@Injectable()
export class MoverProfileHelper {
  constructor(
    @InjectRepository(MoverProfile)
    private readonly moverProfileRepository: Repository<MoverProfile>,

    private readonly customerProfileHelper: CustomerProfileHelper,
    private readonly estimateRequestService: EstimateRequestService,
  ) {}

  public async getMoverId(userId: string) {
    const mover = await this.moverProfileRepository.findOne({
      where: { user: { id: userId } },
      select: ['id'],
    });

    if (!mover) {
      throw new NotFoundException(
        '기사님의 프로필을 찾을 수 없습니다, 프로필을 생성해주세요!',
      );
    }

    return mover.id;
  }

  public mergeMoverProfileWithAggregates(profile: MoverProfile) {
    const { stats, ...rest } = profile;

    return {
      ...rest,
      [camelCase(OrderField.REVIEW_COUNT)]: Number(stats.review_count),
      [camelCase(OrderField.AVERAGE_RATING)]:
        Math.round(Number(stats.average_rating) * 10) / 10,
      [camelCase(OrderField.CONFIRMED_ESTIMATE_COUNT)]: Number(
        stats.confirmed_estimate_count,
      ),
      [camelCase(OrderField.LIKE_COUNT)]: Number(stats.like_count),
    };
  }

  public async getCustomerRelatedMoverIds(userId: string, isCustomer: boolean) {
    // 고객이 아닌 경우, 빈 배열 반환
    if (!isCustomer) {
      return { targetMoverIds: [], likedMoverIds: [] };
    }

    // 고객인 경우
    const customerId = await this.customerProfileHelper.getCustomerId(userId);

    const targetMoverIds =
      await this.estimateRequestService.getTargetMoverIds(customerId); // 견적 요청 대상 기사 IDs
    const likedMoverIds =
      await this.customerProfileHelper.getLikedMoverIds(customerId); // 좋아요한 기사 IDs

    return { targetMoverIds, likedMoverIds };
  }
}
