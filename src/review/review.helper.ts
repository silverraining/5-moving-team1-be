import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewHelper {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async getRatingsCountByMoverId(moverId: string) {
    const ratingsCountRaw = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(review.moverId)', 'count')
      .where('review.moverId = :moverId', { moverId })
      .groupBy('review.rating')
      .getRawMany();

    /*
     * getRawMany()의 결과 예시:
     * [
     *   { rating: 5, count: '12' }, // count는 DB 드라이버에 따라 문자열일 수 있습니다.
     *   { rating: 4, count: '8' },
     *   { rating: 3, count: '1' }
     * ]
     * (2점, 1점짜리 리뷰가 없으면 결과에 포함되지 않습니다.)
     */

    const ratingsCount = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const row of ratingsCountRaw) {
      ratingsCount[row.rating] = parseInt(row.count, 10);
    }

    return ratingsCount;
  }
}
