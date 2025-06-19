import { Review } from '@/review/entities/review.entity';
import {
  DataSource,
  JoinColumn,
  OneToOne,
  ViewColumn,
  ViewEntity,
} from 'typeorm';
import { MoverProfile } from '../entities/mover-profile.entity';
import { EstimateOffer } from '@/estimate-offer/entities/estimate-offer.entity';
import { Like } from '@/like/entities/like.entity';
import { OrderField } from '@/common/validator/order.validator';

@ViewEntity({
  name: 'mover_profile_view', // 뷰의 이름을 'mover_profile_view'로 설정
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select('mover.id', 'id')
      .addSelect('COUNT(review.moverId)', OrderField.REVIEW_COUNT)
      .addSelect('COALESCE(AVG(review.rating), 0.0)', OrderField.AVERAGE_RATING)
      .addSelect(
        `COUNT(DISTINCT CASE WHEN estimate_offer.status = 'CONFIRMED' THEN estimate_offer.id ELSE NULL END)`,
        OrderField.CONFIRMED_ESTIMATE_COUNT,
      )
      .addSelect('COUNT(DISTINCT like.moverId)', OrderField.LIKE_COUNT)
      .from(MoverProfile, 'mover')
      .leftJoin(Review, 'review', 'review.moverId = mover.id')
      .leftJoin(
        EstimateOffer,
        'estimate_offer',
        'estimate_offer.moverId = mover.id',
      )
      .leftJoin(Like, 'like', 'like.moverId = mover.id')
      .groupBy('mover.id'),
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
