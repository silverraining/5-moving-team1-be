import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEstimateRequestDto } from './dto/create-estimate-request.dto';
import { EstimateRequestResponseDto } from './dto/estimate-request-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EstimateRequest,
  RequestStatus,
} from './entities/estimate-request.entity';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import { DataSource, In, Repository } from 'typeorm';
import { UserInfo } from '@/user/decorator/user-info.decorator';

import { EstimateOfferDetailResponseDto } from '@/estimate-offer/dto/estimate-offer-detail.dto';
import { MoverProfileView } from '@/mover-profile/view/mover-profile.view';
@Injectable()
export class EstimateRequestService {
  constructor(
    @InjectRepository(EstimateRequest)
    private readonly estimateRequestRepository: Repository<EstimateRequest>,
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,

    private readonly dataSource: DataSource,
  ) {}

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

    // 4. 필요한 데이터만 조회하여 반환
    return {
      id: saved.id,
      message: '견적 요청 생성 성공',
    };
  }
  /**
   * 고객의 받았던 견적 내역 조회
   * @param userId 고객 ID
   * @returns EstimateRequestResponseDto[]
   */
  // COMPLETED, CANCELED, EXPIRED 상태만 조회 (대기, 진행 중인 요청 제외)
  validStatuses = ['CONFIRMED', 'COMPLETED', 'CANCELED', 'EXPIRED'];

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
        'estimateOffers.mover',
        'estimateOffers.estimateRequest',
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

    const allOfferMoverIds = filtered.flatMap((req) =>
      req.estimateOffers.map((o) => o.moverId),
    );

    const moverViews = await this.dataSource
      .getRepository(MoverProfileView)
      .findBy({ id: In(allOfferMoverIds) });

    const moverViewMap = new Map(moverViews.map((v) => [v.id, v]));

    return Promise.all(
      filtered.map(async (request) => {
        const offers = request.estimateOffers.map((offer) => {
          const mover = offer.mover;
          const isLiked = mover.likedCustomers?.some(
            (like) => like.customer.user.id === userId,
          );
          const moverView = moverViewMap.get(mover.id);

          return EstimateOfferDetailResponseDto.from(offer, isLiked ?? false, {
            confirmedCount: moverView?.confirmed_estimate_count ?? 0,
            averageRating: moverView?.average_rating ?? 0,
            reviewCount: moverView?.review_count ?? 0,
            likeCount: moverView?.like_count ?? 0,
            includeAddress: true,
          });
        });

        return EstimateRequestResponseDto.from(request, offers);
      }),
    );
  }

  // findAll() {
  //   return `This action returns all estimateRequest`;
  // }

  // update(id: number, updateEstimateRequestDto: UpdateEstimateRequestDto) {
  //   return `This action updates a #${id} estimateRequest`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} estimateRequest`;
  // }
}
