import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEstimateRequestDto } from './dto/create-estimate-request.dto';
import { EstimateRequestResponseDto } from './dto/estimate-request-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EstimateRequest } from './entities/estimate-request.entity';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import { In, Repository } from 'typeorm';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { plainToInstance } from 'class-transformer';

import { CreateEstimateRequestResponseDto } from './dto/create-estimate-request.response.dto';
import { EstimateOfferResponseDto } from '@/estimate-offer/dto/estimate-offer-response.dto';
import { EstimateOffer } from '@/estimate-offer/entities/estimate-offer.entity';
@Injectable()
export class EstimateRequestService {
  constructor(
    @InjectRepository(EstimateRequest)
    private readonly estimateRequestRepository: Repository<EstimateRequest>,
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
    @InjectRepository(EstimateOffer)
    private readonly estimateOfferRepository: Repository<EstimateOffer>,
  ) {}
  private async getConfirmedCountByMover(moverId: string): Promise<number> {
    return this.estimateOfferRepository.count({
      where: {
        mover: { id: moverId },
        isConfirmed: true,
      },
    });
  }
  async create(dto: CreateEstimateRequestDto, user: UserInfo) {
    // 1. 로그인한 유저의 CustomerProfile 가져오기
    const customer = await this.customerProfileRepository.findOne({
      where: { user: { id: user.sub } },
      relations: ['user'],
    });

    if (!customer) {
      throw new NotFoundException('고객 프로필을 찾을 수 없습니다.');
    }
    // 2. 현재 고객이 진행 중인 견적 요청이 있는지 확인
    const activeRequest = await this.estimateRequestRepository.findOne({
      where: {
        customer: { id: customer.id },
        status: In([RequestStatus.PENDING, RequestStatus.CONFIRMED]),
      },
    });

    if (activeRequest) {
      throw new BadRequestException('진행 중인 견적 요청이 이미 존재합니다.');
    }

    // 3. EstimateRequest 인스턴스 생성
    const estimate = this.estimateRequestRepository.create({
      moveType: dto.moveType,
      moveDate: new Date(dto.moveDate),
      fromAddress: dto.fromAddress,
      toAddress: dto.toAddress,
      customer,
    });

    // 3. 저장
    const saved = await this.estimateRequestRepository.save(estimate);
    // const withRelations = await this.estimateRequestRepository.findOne({
    //   where: { id: saved.id },
    //   relations: ['customer', 'customer.user'],
    // });

    //   return plainToInstance(EstimateRequestResponseDto, withRelations, {
    //     excludeExtraneousValues: true,
    //   });
    // }
    return plainToInstance(
      CreateEstimateRequestResponseDto,
      {
        id: saved.id,
        message: '견적 요청 생성 성공',
      },
      { excludeExtraneousValues: true },
    );
  }
  /**
   * 고객의 받았던 견적 내역 조회
   * @param userId 고객 ID
   * @returns EstimateRequestResponseDto[]
   */
  // COMPLETED, CANCELED, EXPIRED 상태만 조회 (대기, 진행 중인 요청 제외)
  validStatuses = ['COMPLETED', 'CANCELED', 'EXPIRED'];

  async findAllRequestHistory(
    userId: string,
  ): Promise<EstimateRequestResponseDto[]> {
    const requests = await this.estimateRequestRepository.find({
      where: {
        status: In(this.validStatuses),
      },
      relations: [
        'customer',
        'customer.user',
        'estimateOffers',
        'estimateOffers.estimateRequest',
        'estimateOffers.mover',
        'estimateOffers.mover.reviews',
        'estimateOffers.mover.likedCustomers',
      ],
      order: {
        createdAt: 'DESC',
      },
    });

    const filtered = requests.filter(
      (request) => request.customer.user.id === userId,
    );

    return Promise.all(
      filtered.map(async (request) => {
        const offers = await Promise.all(
          request.estimateOffers.map(async (offer) => {
            const mover = offer.mover;
            const reviews = mover.reviews || [];

            const rating =
              reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;

            const isLiked = mover.likedCustomers?.some(
              (like) => like.customer.user.id === userId,
            );

            const confirmedCount = await this.getConfirmedCountByMover(
              mover.id,
            );

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
                fromAddressFull: {
                  fullAddress: offer.estimateRequest.fromAddress.fullAddress,
                },
                toAddressFull: {
                  fullAddress: offer.estimateRequest.toAddress.fullAddress,
                },
                confirmedCount,
                mover: {
                  nickname: mover.nickname,
                  imageUrl: mover.imageUrl,
                  experience: mover.experience,
                  serviceType: mover.serviceType,
                  intro: mover.intro,
                  rating: Number(rating.toFixed(1)),
                  reviewCount: reviews.length,
                  likeCount: mover.likedCustomers?.length || 0,
                  isLiked,
                },
              },
              { excludeExtraneousValues: true },
            );
          }),
        );

        return plainToInstance(
          EstimateRequestResponseDto,
          {
            id: request.id,
            createdAt: request.createdAt,
            moveType: request.moveType,
            moveDate: request.moveDate,
            fromAddressFull: {
              fullAddress: request.fromAddress.fullAddress,
            },
            toAddressFull: {
              fullAddress: request.toAddress.fullAddress,
            },
            estimateOffers: offers,
          },
          { excludeExtraneousValues: true },
        );
      }),
    );
  }

  findAll() {
    return `This action returns all estimateRequest`;
  }

  // update(id: number, updateEstimateRequestDto: UpdateEstimateRequestDto) {
  //   return `This action updates a #${id} estimateRequest`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} estimateRequest`;
  // }
}
