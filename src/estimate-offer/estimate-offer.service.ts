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
import { EstimateRequest } from '@/estimate-request/entities/estimate-request.entity';

@Injectable()
export class EstimateOfferService {
  constructor(
    @InjectRepository(EstimateOffer)
    private readonly offerRepository: Repository<EstimateOffer>,
    @InjectRepository(EstimateRequest)
    private readonly requestRepository: Repository<EstimateRequest>,
  ) {}
  /**
   * 견적 요청 ID로 견적 목록 조회
   * @param estimateRequestId 견적 요청 ID
   * @param userId 현재 로그인한 유저 ID
   * @returns 해당 요청 ID에 대한 견적 제안 목록
   */
  async findByEstimateRequestId(
    estimateRequestId: string,
    userId?: string,
  ): Promise<EstimateOfferResponseDto[]> {
    // if (!estimateRequestId) return []; // estimateRequestId가 없으면 빈 배열 반환
    //개발중 예외처리 TODO: 추후에 수정
    if (!estimateRequestId) {
      throw new BadRequestException(
        '견적 요청 ID 파라미터(requestId)가 필요합니다.',
      );
    }
    // 견적 요청 조회 및 본인 여부 확인
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
    const offers = await this.offerRepository.find({
      where: { estimateRequestId },
      relations: ['mover', 'mover.likedCustomers', 'mover.reviews'],
      order: { createdAt: 'DESC' },
    });

    return offers.map((offer) => {
      const mover = offer.mover;
      const reviews = mover.reviews || [];

      const rating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

      const isLiked = userId
        ? mover.likedCustomers?.some((like) => like.customer.id === userId)
        : false;

      return {
        estimateRequestId: offer.estimateRequestId,
        moverId: offer.moverId,
        price: offer.price,
        comment: offer.comment,
        status: offer.status,
        isTargeted: offer.isTargeted,
        isConfirmed: offer.isConfirmed,
        confirmedAt: offer.confirmedAt,
        mover: {
          nickname: mover.nickname,
          imageUrl: mover.imageUrl,
          career: mover.experience,
          serviceType: mover.serviceType,
          serviceRegion: mover.serviceRegion as any as ServiceRegion,
          intro: mover.intro,
          rating: Number.isFinite(rating) ? Number(rating.toFixed(1)) : 0,
          reviewCount: reviews.length,
          likeCount: mover.likedCustomers?.length || 0,
          isLiked,
          experience: mover.experience,
        },
      };
    });
  }

  create(createEstimateOfferDto: CreateEstimateOfferDto) {
    return 'This action adds a new estimateOffer';
  }

  findAll() {
    return `This action returns all estimateOffer`;
  }

  findOne(id: number) {
    return `This action returns a #${id} estimateOffer`;
  }

  update(id: number, updateEstimateOfferDto: UpdateEstimateOfferDto) {
    return `This action updates a #${id} estimateOffer`;
  }

  remove(id: number) {
    return `This action removes a #${id} estimateOffer`;
  }
}
