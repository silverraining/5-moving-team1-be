import {
  DataSource,
  JoinColumn,
  OneToOne,
  ViewColumn,
  ViewEntity,
} from 'typeorm';
import { MoverProfile } from '../entities/mover-profile.entity';
import { OrderField } from '@/common/validator/order.validator';

@ViewEntity({
  name: 'mover_profile_view', // 뷰의 이름을 'mover_profile_view'로 설정
  expression: (dataSource: DataSource) => {
    const reviewCountSubQuery = dataSource
      .createQueryBuilder()
      .select('COUNT(*)')
      .from((subQuery) => {
        return subQuery
          .select('1')
          .from('review', 'r')
          .where('r."moverId" = mover.id')
          .groupBy('r."estimateOfferId", r."customerId"');
      }, 'review_group');

    const avgRatingSubQuery = dataSource
      .createQueryBuilder()
      .select('COALESCE(AVG(r.rating), 0.0)')
      .from('review', 'r')
      .where('r."moverId" = mover.id');

    const confirmedEstimateCountSubQuery = dataSource
      .createQueryBuilder()
      .select('COUNT(*)')
      .from('estimate_offer', 'offer')
      .where('offer."moverId" = mover.id')
      .andWhere(`offer.status IN ('CONFIRMED', 'COMPLETED')`);

    const likeCountSubQuery = dataSource
      .createQueryBuilder()
      .select('COUNT(*)')
      .from('like', 'l')
      .where('l."moverId" = mover.id');

    return dataSource
      .createQueryBuilder()
      .select('mover.id', 'id')
      .addSelect(`(${reviewCountSubQuery.getQuery()})`, OrderField.REVIEW_COUNT)
      .addSelect(`(${avgRatingSubQuery.getQuery()})`, OrderField.AVERAGE_RATING)
      .addSelect(
        `(${confirmedEstimateCountSubQuery.getQuery()})`,
        OrderField.CONFIRMED_ESTIMATE_COUNT,
      )
      .addSelect(`(${likeCountSubQuery.getQuery()})`, OrderField.LIKE_COUNT)
      .from(MoverProfile, 'mover');
  },
})
export class MoverProfileView {
  @ViewColumn()
  id: string;

  @ViewColumn()
  [OrderField.REVIEW_COUNT]: number;

  @ViewColumn()
  [OrderField.AVERAGE_RATING]: number;

  @ViewColumn()
  [OrderField.CONFIRMED_ESTIMATE_COUNT]: number;

  @ViewColumn()
  [OrderField.LIKE_COUNT]: number;

  // MoverProfile : MoverProfileView <-> 1:1 관계
  @OneToOne(() => MoverProfile, (profile) => profile.stats)
  @JoinColumn({ name: 'id' })
  moverProfile: MoverProfile;
}
