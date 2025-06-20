import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
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
import {
  CUSTOMER_REVIEW_SELECT,
  MOVER_REVIEW_SELECT,
  REVIEWABLE_MOVER_SELECT,
} from '@/common/const/query-builder.const';
import { MoverProfileView } from '@/mover-profile/view/mover-profile.view';
import { OrderField } from '@/common/validator/order.validator';
import { ReviewHelper } from './review.helper';
import { formatDateToKst } from '@/common/utils/utc2ktc.util';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(EstimateRequest)
    private readonly estimateRequestRepository: Repository<EstimateRequest>,
    @InjectRepository(EstimateOffer)
    private readonly estimateOfferRepository: Repository<EstimateOffer>,
    @InjectRepository(MoverProfileView)
    private readonly moverProfileView: Repository<MoverProfileView>,

    private readonly commonService: CommonService,
    private readonly customerProfileHelper: CustomerProfileHelper,
    private readonly reviewHelper: ReviewHelper,
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
    completedOfferId: string,
    createReviewDto: CreateReviewDto,
  ) {
    // 1. 사용자 ID로 고객 ID를 추출
    const customerId = await this.customerProfileHelper.getCustomerId(userId);

    // 2. 견적 제안 ID로 해당 견적 제안을 조회
    const offer = await this.estimateOfferRepository.findOneBy({
      id: completedOfferId,
    });

    if (!offer) {
      throw new NotFoundException('해당 견적 제안을 찾을 수 없습니다.');
    }

    const { moverId, estimateRequestId } = offer; // 견적 제안에서 기사 ID, 요청 견적 ID 추출

    // 3. 제안 견적의 요청 견적이 고객이 맞는지 확인
    const estimateRequest = await this.estimateRequestRepository.findOne({
      where: {
        id: estimateRequestId,
      },
      relations: ['customer'], // 요청 견적의 고객 정보도 함께 조회
    });

    if (estimateRequest.customer.id !== customerId) {
      throw new ForbiddenException(
        '해당 견적 제안은 고객님께서 리뷰를 작성할 수 없습니다.',
      );
    }

    // 4. 이미 리뷰가 존재하는지 확인
    const existingReview = await this.reviewRepository.findOne({
      where: {
        estimateOfferId: completedOfferId,
        customerId,
      },
    });

    if (existingReview) {
      throw new ConflictException('이미 리뷰를 작성하셨습니다.');
    }

    // 5. 리뷰 데이터 생성
    const reviewData = {
      estimateOfferId: completedOfferId,
      customerId,
      moverId,
      ...createReviewDto,
    };

    try {
      await this.reviewRepository.save(reviewData); // 리뷰 저장
    } catch (error) {
      console.error('Error saving review:', error);
      throw new InternalServerErrorException(
        '리뷰 작성 중 오류가 발생했습니다.',
      );
    }

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
    const customerId = await this.customerProfileHelper.getCustomerId(userId);

    const qb = this.estimateRequestRepository
      .createQueryBuilder('request')
      .leftJoin('request.customer', 'customer')
      .leftJoin(EstimateOffer, 'offer', 'offer.id = request.confirmedOfferId')
      .leftJoin('offer.mover', 'mover')
      .where('customer.id = :customerId', { customerId }) // 사용자 ID로 필터링
      .andWhere('request.status = :status', { status: RequestStatus.COMPLETED }) // 완료 요청 상태 필터링
      .select(REVIEWABLE_MOVER_SELECT); // 작성 가능한 리뷰 목록을 위한 SELECT 문

    const total = await qb.getCount(); // 전체 결과 개수를 가져옴 (페이지네이션 적용 전의 총 개수)

    this.commonService.applyPagePaginationParamsToQb(qb, dto); // 페이지네이션 적용

    const rawReviewableOffers = await qb.getRawMany();
    console.log('rawReviewableOffers: ', rawReviewableOffers);

    const formattedReviewableOffers = rawReviewableOffers.map((row) => ({
      reviewableOfferId: row.reviewableOfferId, // 작성 가능한 리뷰 견적 제안 ID
      moveType: row.moveType, // 이사 종류
      moveDate: formatDateToKst(new Date(row.moveDate)), // 이사일
      offerPrice: row.offerPrice, // 견적가
      isTargeted: row.isTargeted, // 지정견적 여부
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

  /**
   *  고객이 작성한 리뷰 조회 서비스
   *  @param customerId - 고객 프로필 ID
   *  @param dto - 페이지네이션 DTO
   *  @returns reviews: 리뷰 목록
   *  @returns total: 페이지네이션을 위한 총 개수
   */
  async findByCustomerId(customerId: string, dto: PagePaginationDto) {
    const qb = this.reviewRepository
      .createQueryBuilder('review') // Review 엔티티를 'review'라는 별칭으로 시작
      .leftJoin('review.estimateOffer', 'offer') // Review 엔티티의 estimateOffer 관계 조인
      .leftJoin('offer.estimateRequest', 'request') // estimateOffer 엔티티의 estimateRequest 관계 조인
      .leftJoin('offer.mover', 'mover') // estimateOffer 엔티티의 mover 관계 조인
      .where('review.customerId = :customerId', { customerId }) // customerId로 필터링
      .select(CUSTOMER_REVIEW_SELECT) // 고객이 작성한 리뷰 목록을 위한 SELECT 문
      .orderBy('review.createdAt', 'DESC'); // 최신 리뷰부터 정렬

    const total = await qb.getCount(); // 전체 결과 개수를 가져옴 (페이지네이션 적용 전의 총 개수)

    this.commonService.applyPagePaginationParamsToQb(qb, dto);

    const rawReviews = await qb.getRawMany(); // 결과 데이터 목록을 일반 객체 배열로 가져옴

    const formattedReviews = rawReviews.map((row) => ({
      moveType: row.move_type, // 이사 종류
      isTargeted: row.is_targeted, // 확정된 제안의 지정견적 여부
      createdAt: row.created_at, // 작성일
      moveDate: row.move_date, // 이사일
      price: row.offer_price, // 제안 가격
      rating: row.rating, // 평점
      comment: row.comment, // 리뷰 내용
      mover: {
        nickname: row.mover_nickname, // 기사 닉네임
        imageUrl: row.mover_image_url, // 기사 이미지 URL
      },
    }));

    return {
      reviews: formattedReviews, // 고객이 작성한 리뷰 목록
      total, // 페이지네이션을 위한 총 개수
    };
  }

  /**
   *  기사가 받은 리뷰 조회 서비스
   *  @param moverId - 기사 프로필 ID
   *  @param dto - 페이지네이션 DTO
   *  @returns reviews: 리뷰 목록
   *  @returns total: 페이지네이션을 위한 총 개수
   */
  async findByMoverId(moverId: string, dto: PagePaginationDto) {
    const qb = this.reviewRepository
      .createQueryBuilder('review') // Review 엔티티를 'review'라는 별칭으로 시작
      .leftJoin('review.customer', 'customer') // review.customerId → customer 엔티티 조인
      .leftJoin('customer.user', 'user') // customer.user 관계 조인
      .where('review.moverId = :moverId', { moverId }) // moverId로 필터링
      .select(MOVER_REVIEW_SELECT) // 기사가 받은 리뷰 목록을 위한 SELECT 문
      .orderBy('review.createdAt', 'DESC'); // 최신 리뷰부터 정렬

    const total = await qb.getCount(); // 전체 결과 개수를 가져옴 (페이지네이션 적용 전의 총 개수)

    this.commonService.applyPagePaginationParamsToQb(qb, dto); // 페이지네이션 적용

    const rawReviews = await qb.getRawMany(); // 결과 데이터 목록을 일반 객체 배열로 가져옴
    console.log('rawReviews: ', rawReviews);

    const formattedReviews = rawReviews.map((row) => ({
      rating: row.rating, // 평점
      comment: row.comment, // 리뷰 내용
      createdAt: formatDateToKst(new Date(row.created_at)), // 작성일
      customerName: row.user_name, // 사용자 이름
    }));

    // 모든 평점들의 개수 구하기
    /**
     * const ratingsCount = {
     *  1: 0,
     *  2: 0,
     *  3: 0,
     *  4: 0,
     *  5: 0,
     * }
     */
    const ratingsCount =
      await this.reviewHelper.getRatingsCountByMoverId(moverId);

    // 기사 집계 정보 조회
    const moverAggregates = await this.moverProfileView.findOneBy({
      id: moverId,
    });
    const moverAverageRating =
      moverAggregates?.[OrderField.AVERAGE_RATING] || 0;

    return {
      reviews: formattedReviews, // 고객이 작성한 리뷰 목록
      rating: {
        average: Math.round(Number(moverAverageRating) * 10) / 10, // 기사의 평균 평점
        count: ratingsCount, // 기사가 받은 평점 개수
      },
      total, // 페이지네이션을 위한 총 개수
    };
  }
}
