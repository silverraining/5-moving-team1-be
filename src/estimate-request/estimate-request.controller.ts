import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEstimateRequestDto } from './dto/create-estimate-request.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { EstimateRequest } from './entities/estimate-request.entity';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import { Repository } from 'typeorm';
import { UserInfo } from '@/user/decorator/user-info.decorator';

@Injectable()
export class EstimateRequestService {
  constructor(
    @InjectRepository(EstimateRequest)
    private readonly estimateRequestRepository: Repository<EstimateRequest>,
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
  ) {}
  /**
   * 견적 요청 생성
   * @param dto - 견적 요청 정보
   * @param user - 현재 로그인한 유저 정보
   * @returns 생성된 견적 요청 정보
   * @throws NotFoundException - 고객 프로필을 찾을 수 없는 경우
   */
  async create(dto: CreateEstimateRequestDto, user: UserInfo) {
    // 1. 로그인한 유저의 CustomerProfile 가져오기
    const customer = await this.customerProfileRepository.findOne({
      where: { user: { id: user.sub } },
      relations: ['user'],
    });

    if (!customer) {
      throw new NotFoundException('고객 프로필을 찾을 수 없습니다.');
    }
    //TODO: 현재 유저가 진행 중인 견적 요청이 있는지 확인하는 로직 추가 필요
    //이미 PENDING, CONFIRMED, CANCELED 상태의 견적 요청을 가지고 있다면, 새로운 요청 생성 불가
    //COMPLETED 또는 EXPIRED 상태인 경우에만 새로운 요청 생성 가능

    // 2. EstimateRequest 인스턴스 생성
    const estimate = this.estimateRequestRepository.create({
      moveType: dto.moveType,
      moveDate: new Date(dto.moveDate),
      fromAddress: dto.fromAddress,
      toAddress: dto.toAddress,
      customer,
    });

    // 3. 저장
    const saved = await this.estimateRequestRepository.save(estimate);
    const withRelations = await this.estimateRequestRepository.findOne({
      where: { id: saved.id },
      relations: ['customer', 'customer.user'],
    });

    return {
      message: '견적 요청이 성공적으로 생성되었습니다.',
      id: saved.id,
    };
  }
}
