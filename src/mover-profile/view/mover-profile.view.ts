import { Review } from '@/review/entities/review.entity';
import { DataSource, ViewColumn, ViewEntity } from 'typeorm';
import { MoverProfile } from '../entities/mover-profile.entity';
import { EstimateOffer } from '@/estimate-offer/entities/estimate-offer.entity';
import { MOVER_PROFILE_VIEW_TABLE } from '@/common/const/query-builder.const';
import { OrderField } from '@/common/dto/cursor-pagination.dto';
import { Like } from '@/like/entities/like.entity';

@ViewEntity({
  name: MOVER_PROFILE_VIEW_TABLE,
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select('mover.id', 'id')
      .addSelect('COUNT(DISTINCT review.moverId)', OrderField.REVIEW_COUNT)
      .addSelect('AVG(review.rating)', OrderField.AVERAGE_RATING)
      .addSelect(
        'COUNT(DISTINCT estimate_offer.moverId)',
        OrderField.CONFIRMED_ESTIMATE_COUNT,
      )
      .addSelect('COUNT(DISTINCT like.moverId)', 'like_count')
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
  like_count: number;
}
