import { Review } from '@/review/entities/review.entity';
import { DataSource, ViewColumn, ViewEntity } from 'typeorm';
import { MoverProfile } from '../entities/mover-profile.entity';
import { EstimateOffer } from '@/estimate-offer/entities/estimate-offer.entity';

@ViewEntity({
  name: 'mover_profile_view',
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select('mover.id', 'id')
      .addSelect('COUNT(DISTINCT review.estimateOfferId)', 'review_count')
      .addSelect('AVG(review.rating)', 'average_rating')
      .addSelect(
        'COUNT(DISTINCT estimate_offer.estimateRequestId)',
        'estimate_offer_count',
      )
      .from(MoverProfile, 'mover')
      .leftJoin(Review, 'review', 'review.moverId = mover.id')
      .leftJoin(
        EstimateOffer,
        'estimate_offer',
        'estimate_offer.moverId = mover.id',
      )
      .groupBy('mover.id'),
})
export class MoverProfileView {
  @ViewColumn()
  id: string;

  @ViewColumn()
  review_count: number;

  @ViewColumn()
  average_rating: number;

  @ViewColumn()
  estimate_offer_count: number;
}
