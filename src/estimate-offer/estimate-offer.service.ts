import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateEstimateOfferDto } from './dto/create-estimate-offer.dto';
import { UpdateEstimateOfferDto } from './dto/update-estimate-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EstimateOffer } from './entities/estimate-offer.entity';
import { Repository } from 'typeorm';
import { EstimateOfferResponseDto } from './dto/estimate-offer-response.dto';
import { ServiceRegion } from '@/common/const/service.const';
import {
  EstimateRequest,
  RequestStatus,
} from '@/estimate-request/entities/estimate-request.entity';
import { plainToInstance } from 'class-transformer';
@Injectable()
export class EstimateOfferService {
  constructor(
    @InjectRepository(EstimateOffer)
    private readonly offerRepository: Repository<EstimateOffer>,
    @InjectRepository(EstimateRequest)
    private readonly requestRepository: Repository<EstimateRequest>,
  ) {}
  /**
   * 기사님의 확정 견적 수 계산
   */
  private async getConfirmedCountByMover(moverId: string): Promise<number> {
    return this.offerRepository
      .createQueryBuilder('offer')
      .where('offer.moverId = :moverId', { moverId })
      .andWhere('offer.isConfirmed = true')
      .getCount();
  }

  /**
   * 견적 요청 ID에 대한 오퍼 목록 조회
   */
  async getPendingOffersByRequestId(
    estimateRequestId: string,
    userId?: string,
  ): Promise<EstimateOfferResponseDto[]> {
    if (!estimateRequestId) {
      throw new BadRequestException(
        '견적 요청 ID 파라미터(requestId)가 필요합니다.',
      );
    }

    const request = await this.requestRepository.findOne({
      where: { id: estimateRequestId },
      relations: ['customer', 'customer.user'],
    });

    if (!request) {
      throw new BadRequestException('존재하지 않는 견적 요청입니다.');
    }

    if (request.customer.user.id !== userId) {
      throw new ForbiddenException();
    }

    // PENDING 상태의 오퍼만 조회
    const offers = await this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.mover', 'mover')
      .leftJoinAndSelect('mover.likedCustomers', 'likedCustomers')
      .leftJoinAndSelect('mover.reviews', 'reviews')
      .leftJoinAndSelect('offer.estimateRequest', 'estimateRequest')
      .where('offer.estimateRequestId = :estimateRequestId', {
        estimateRequestId,
      })
      .andWhere('estimateRequest.status = :status', {
        status: RequestStatus.PENDING,
      })
      .orderBy('offer.createdAt', 'DESC')
      .getMany();

    return await Promise.all(
      offers.map(async (offer) => {
        const mover = offer.mover;
        const reviews = mover.reviews || [];

        const rating =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        const isLiked = userId
          ? mover.likedCustomers?.some((like) => like.customer.id === userId)
          : false;

        const confirmedCount = await this.getConfirmedCountByMover(mover.id);

        return plainToInstance(
          EstimateOfferResponseDto,
          {
            estimateRequestId: offer.estimateRequestId,
            moverId: offer.moverId,
            price: offer.price,
            status: offer.status,
            requestStatus: offer.estimateRequest.status,
            isTargeted: offer.isTargeted,
            isConfirmed: offer.isConfirmed,
            confirmedAt: offer.confirmedAt,
            moveDate: offer.estimateRequest.moveDate,
            moveType: offer.estimateRequest.moveType,
            createdAt: offer.createdAt,
            fromAddress: offer.estimateRequest.fromAddress,
            toAddress: offer.estimateRequest.toAddress,
            confirmedCount: confirmedCount,
            mover: {
              nickname: mover.nickname,
              imageUrl: mover.imageUrl,
              experience: mover.experience,
              serviceType: mover.serviceType,
              intro: mover.intro,
              rating: Number.isFinite(rating) ? Number(rating.toFixed(1)) : 0,
              reviewCount: reviews.length,
              likeCount: mover.likedCustomers?.length || 0,
              isLiked,
            },
          },
          { excludeExtraneousValues: true },
        );
      }),
    );
  }

  /**
   * 견적 요청ID에 대한 오퍼 중 특정 기사 오퍼 상세 조회
   */
  async findOneByCompositeKey(
    requestId: string,
    moverId: string,
    userId?: string,
  ): Promise<EstimateOfferResponseDto> {
    const offer = await this.offerRepository.findOne({
      where: { estimateRequestId: requestId, moverId },
      relations: [
        'mover',
        'mover.likedCustomers',
        'mover.reviews',
        'estimateRequest',
        'estimateRequest.customer',
        'estimateRequest.customer.user',
      ],
    });

    if (!offer) {
      throw new BadRequestException('해당 견적 제안을 찾을 수 없습니다.');
    }

    if (offer.estimateRequest.customer.user.id !== userId) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    const mover = offer.mover;
    const reviews = mover.reviews || [];

    const rating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const isLiked = userId
      ? mover.likedCustomers?.some((like) => like.customer.id === userId)
      : false;

    const confirmedCount = await this.getConfirmedCountByMover(mover.id);

    return plainToInstance(
      EstimateOfferResponseDto,
      {
        estimateRequestId: offer.estimateRequestId,
        moverId: offer.moverId,
        price: offer.price,
        status: offer.status,
        isTargeted: offer.isTargeted,
        isConfirmed: offer.isConfirmed,
        confirmedAt: offer.confirmedAt,
        moveDate: offer.estimateRequest.moveDate,
        moveType: offer.estimateRequest.moveType,
        createdAt: offer.createdAt,
        fromAddress: offer.estimateRequest.fromAddress,
        toAddress: offer.estimateRequest.toAddress,
        confirmedCount: confirmedCount,
        mover: {
          nickname: mover.nickname,
          imageUrl: mover.imageUrl,
          experience: mover.experience,
          serviceType: mover.serviceType,
          intro: mover.intro,
          rating: Number.isFinite(rating) ? Number(rating.toFixed(1)) : 0,
          reviewCount: reviews.length,
          likeCount: mover.likedCustomers?.length || 0,
          isLiked,
        },
      },
      { excludeExtraneousValues: true },
    );
  }

  create(createEstimateOfferDto: CreateEstimateOfferDto) {
    return 'This action adds a new estimateOffer';
  }

  update(id: number, updateEstimateOfferDto: UpdateEstimateOfferDto) {
    return `This action updates a #${id} estimateOffer`;
  }

  remove(id: number) {
    return `This action removes a #${id} estimateOffer`;
  }
}
