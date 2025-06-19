import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { EstimateOffer } from '@/estimate-offer/entities/estimate-offer.entity';
import {
  EstimateRequest,
  RequestStatus,
} from '@/estimate-request/entities/estimate-request.entity';
import { PagePaginationDto } from '@/common/dto/page-pagination.dto';
import { CommonService } from '@/common/common.service';
import { CustomerProfileHelper } from '@/customer-profile/customer-profile.helper';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(EstimateRequest)
    private readonly estimateRequestRepository: Repository<EstimateRequest>,
    @InjectRepository(EstimateOffer)
    private readonly estimateOfferRepository: Repository<EstimateOffer>,

    private readonly commonService: CommonService,
    private readonly customerProfileHelper: CustomerProfileHelper,
  ) {}

  /**
   *
   * 리뷰 작성 서비스
   *
   * @param userId
   * @param confirmedOfferId
   * @param createReviewDto
   * @returns { message: string }
   */

  async create(
    userId: string,
    confirmedOfferId: string,
    createReviewDto: CreateReviewDto,
  ) {
    // 1. 사용자 ID로 고객 ID를 추출
    const customerId = await this.customerProfileHelper.getCustomerId(userId);

    // 2. 견적 제안 ID로 해당 견적 제안을 조회
    const offer = await this.estimateOfferRepository.findOne({
      where: { id: confirmedOfferId },
      select: ['moverId'],
    });

    if (!offer) {
      throw new NotFoundException('해당 견적 제안을 찾을 수 없습니다.');
    }

    const { moverId } = offer; // 견적 제안에서 기사 ID 추출

    // 3. 이미 리뷰가 존재하는지 확인
    const existing = await this.reviewRepository.findOne({
      where: {
        estimateOfferId: confirmedOfferId,
        customerId,
      },
    });

    if (existing) {
      throw new ConflictException('이미 리뷰를 작성하셨습니다.');
    }

    // 4. 리뷰 데이터 생성
    const reviewData = {
      estimateOfferId: confirmedOfferId,
      customerId,
      moverId,
      ...createReviewDto,
    };

    await this.reviewRepository.save(reviewData); // 리뷰 저장

    return { message: '리뷰가 성공적으로 작성되었습니다.' };
  }

  /**
   *  작성 가능한 리뷰 목록 조회
   *
   *  페이지네이션
   *
   *  @param userId - 사용자 ID
   *  @returns reviewableOffers: 작성 가능한 리뷰 목록
   *  @returns total: 페이지네이션을 위한 총 개수
   */

  async findAllAvailable(userId: string, dto: PagePaginationDto) {
    const qb = this.estimateRequestRepository
      .createQueryBuilder('request')
      .leftJoin('request.customer', 'customer')
      .leftJoin('customer.user', 'user')
      .leftJoin(EstimateOffer, 'offer', 'offer.id = request.confirmedOfferId')
      .leftJoin('offer.mover', 'mover')
      .where('user.id = :userId', { userId }) // 사용자 ID로 필터링
      .andWhere('request.status = :status', { status: RequestStatus.COMPLETED }) // 완료 요청 상태 필터링
      .andWhere('request.confirmedOfferId IS NOT NULL') // confirmedOfferId가 있는 요청만 선택
      .andWhere('review.estimateOfferId IS NULL') // 리뷰가 없는 견적 제안만 선택
      .select([
        'offer.id AS confirmedOfferId',
        'request.moveType AS moveType',
        'request.moveDate AS moveDate',
        'offer.price AS price',
        'offer.isTargeted AS isTargeted',
        'mover.nickname AS moverNickname',
        'mover.imageUrl AS moverImageUrl',
      ]);

    this.commonService.applyPagePaginationParamsToQb(qb, dto); // 페이지네이션 적용

    const rawReviewableOffers = await qb.getRawMany();
    const total = await qb.getCount();

    const formattedReviewableOffers = rawReviewableOffers.map((row) => ({
      reviewableOfferId: row.confirmedOfferId, // 작성 가능한 리뷰 견적 제안 ID
      moveType: row.moveType, // 이사 종류
      moveDate: row.moveDate, // 이사일
      price: row.price, // 확정된 제안의 가격
      isTargeted: row.isTargeted, // 확정된 제안의 지정견적 여부
      mover: {
        nickname: row.moverNickname, // 기사의 닉네임
        imageUrl: row.moverImageUrl, // 기사의 이미지 URL
      },
    }));

    return {
      reviewableOffers: formattedReviewableOffers, // 작성 가능한 리뷰 목록
      total, // 페이지네이션을 위한 총 개수
    };
  }

  async findByCustomerId(customerId: string, dto: PagePaginationDto) {
    const qb = this.reviewRepository
      .createQueryBuilder('review') // Review 엔티티를 'review'라는 별칭으로 시작
      .leftJoin('review.estimateOffer', 'offer') // Review 엔티티의 estimateOffer 관계 조인
      .leftJoin('offer.mover', 'mover') // estimateOffer 엔티티의 mover 관계 조인
      .where('review.customerId = :customerId', { customerId }) // customerId로 필터링
      .select([
        'review.rating AS rating', // 리뷰 평점
        'review.comment AS comment', // 리뷰 내용
        'review.createdAt AS createdAt', // 리뷰 작성일
        'offer.isTargeted AS isTargeted', // 확정된 제안의 지정견적 여부
        'offer.price AS offerPrice', // 견적 제안 가격
        'offer.moveType AS moveType', // 이사 종류
        'offer.moveDate AS moveDate', // 이사 날짜
        'mover.nickname AS moverNickname', // 이사 업체 기사 닉네임
        'mover.imageUrl AS moverImageUrl', // 이사 업체 기사 이미지 URL
      ])
      .orderBy('review.createdAt', 'DESC'); // 최신 리뷰부터 정렬

    this.commonService.applyPagePaginationParamsToQb(qb, dto);

    const rawReviews = await qb.getRawMany(); // 결과 데이터 목록을 일반 객체 배열로 가져옴
    const total = await qb.getCount(); // 전체 결과 개수를 가져옴 (페이지네이션 적용 전의 총 개수)

    const formattedReviews = rawReviews.map((row) => ({
      moveType: row.moveType, // 이사 종류
      isTargeted: row.isTargeted, // 확정된 제안의 지정견적 여부
      createdAt: row.createdAt, // 작성일
      moveDate: row.moveDate, // 이사일
      price: row.offerPrice, // 제안 가격
      rating: row.rating, // 평점
      comment: row.comment, // 리뷰 내용
      mover: {
        nickname: row.moverNickname, // 기사 닉네임
        imageUrl: row.moverImageUrl, // 기사 이미지 URL
      },
    }));

    return {
      reviews: formattedReviews, // 고객이 작성한 리뷰 목록
      total, // 페이지네이션을 위한 총 개수
    };
  }

  findByMoverId(moverId: string) {
    return `This action returns a #${moverId} review`;
  }
}
